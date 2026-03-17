/**
 * useBlockchain — AgriShield on-chain crop event hook
 *
 * ─── SETUP BEFORE USE ────────────────────────────────────────────────────────
 * 1. Install ethers in the root project:
 *      npm install ethers
 *
 * 2. Deploy the AgriShield contract (from the blockchain/ folder):
 *      npx hardhat run scripts/deploy.ts
 *
 * 3. Add the deployed address to your root .env:
 *      VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
 *
 * 4. Get free Sepolia ETH for testing:
 *      https://sepoliafaucet.com
 *
 * 5. Get a free Sepolia RPC URL:
 *      https://alchemy.com
 *
 * ─── SECURITY REMINDERS ──────────────────────────────────────────────────────
 * ⚠️  Add blockchain/.env to .gitignore — NEVER commit it
 * ⚠️  NEVER commit your PRIVATE_KEY to any file
 * ⚠️  VITE_ env vars are bundled into the frontend — CONTRACT_ADDRESS is public,
 *     which is fine (contracts are public on-chain anyway)
 */

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

// ── Provider type with multi-wallet support ───────────────────────────────────
interface MetaMaskProvider extends ethers.Eip1193Provider {
  isMetaMask?: boolean;
  /**
   * When multiple wallet extensions are installed (e.g. MetaMask + Temple),
   * the browser populates this array with each wallet's provider.
   * We use it to find MetaMask specifically by its isMetaMask flag.
   */
  providers?: MetaMaskProvider[];
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider;
  }
}

/**
 * Returns the MetaMask provider specifically, even when other wallets
 * (Temple, Coinbase, Phantom, etc.) are also installed.
 *
 * Resolution order:
 *   1. window.ethereum.providers[] — populated when multiple wallets coexist;
 *      find the one with isMetaMask === true
 *   2. window.ethereum — single wallet; verify it is MetaMask via isMetaMask
 *   3. Throw a descriptive error so the UI can guide the user
 */
function getMetaMaskProvider(): MetaMaskProvider {
  const eth = window.ethereum;

  if (!eth) {
    throw new Error(
      'MetaMask is not installed. Please install it from https://metamask.io'
    );
  }

  // Multi-wallet scenario — browsers create a .providers array
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const mm = eth.providers.find(p => p.isMetaMask === true);
    if (mm) return mm;
    throw new Error(
      'MetaMask not found among installed wallets. ' +
      'Please install MetaMask (https://metamask.io) or enable it in your browser extensions.'
    );
  }

  // Single wallet scenario — confirm it is MetaMask, not Temple or another wallet
  if (eth.isMetaMask) return eth;

  throw new Error(
    'MetaMask is not your active wallet. ' +
    'If you have MetaMask installed, open your browser extensions and set MetaMask as default, ' +
    'or disable other wallet extensions (e.g. Temple) and refresh the page.'
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** The two valid event types as enforced by the smart contract */
export type EventType = 'planted' | 'harvested';

/** Mirrors the AgriShield.sol CropEvent struct */
export interface CropEventRecord {
  farmer:    string;
  cropName:  string;
  eventType: string;
  timestamp: bigint;   // block.timestamp — convert to Date via: new Date(Number(timestamp) * 1000)
  location:  string;
}

export interface UseBlockchainReturn {
  /** Connected MetaMask wallet address, or null if not connected */
  account:       string | null;
  /** True while waiting for MetaMask to return accounts */
  isConnecting:  boolean;
  /** Transaction hash of the most recent logCropEvent call */
  txHash:        string | null;
  /** Sepolia Etherscan link for the most recent transaction */
  etherscanUrl:  string | null;
  /** Last error message, or null if no error */
  error:         string | null;
  /** Request MetaMask account access */
  connectWallet:  () => Promise<void>;
  /** Write a crop event on-chain (requires connected wallet + Sepolia ETH). Returns tx hash. */
  logCropEvent:   (cropName: string, eventType: EventType, location: string) => Promise<string>;
  /** Read all crop events for any farmer address (no wallet needed) */
  getCropHistory: (farmerAddress: string) => Promise<CropEventRecord[]>;
}

// ─── Contract Configuration ───────────────────────────────────────────────────

/**
 * Set VITE_CONTRACT_ADDRESS in your root .env after deploying.
 * Example:  VITE_CONTRACT_ADDRESS=0x1234...abcd
 */
const CONTRACT_ADDRESS: string = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

/**
 * Minimal Human-Readable ABI — only the 2 functions and 1 event we use.
 * Full ABI is not needed; ethers v6 accepts this string array format.
 */
const ABI: string[] = [
  // Write function — logs a crop event (requires signer)
  'function logCropEvent(string cropName, string eventType, string location)',

  // Read function — returns all events for a farmer address (no signer needed)
  'function getCropEvents(address farmer) view returns (tuple(address farmer, string cropName, string eventType, uint256 timestamp, string location)[])',

  // Event — emitted by logCropEvent, indexed by farmer address
  'event CropLogged(address indexed farmer, string cropName, string eventType, uint256 timestamp)',
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useBlockchain(): UseBlockchainReturn {
  const [account,      setAccount]      = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [txHash,       setTxHash]       = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  /** Full Sepolia Etherscan link, or null if no tx has been submitted yet */
  const etherscanUrl = txHash
    ? `https://sepolia.etherscan.io/tx/${txHash}`
    : null;

  // ── connectWallet ────────────────────────────────────────────────────────
  /**
   * Requests MetaMask account access and sets the connected `account` state.
   * Throws if MetaMask is not installed.
   */
  const connectWallet = useCallback(async (): Promise<void> => {
    setError(null);
    setIsConnecting(true);
    try {
      // getMetaMaskProvider() throws if MetaMask is not installed or not active,
      // correctly rejecting Temple Wallet and other injected providers
      const provider = new ethers.BrowserProvider(getMetaMaskProvider());
      const accounts = await provider.send('eth_requestAccounts', []) as string[];
      setAccount(accounts[0] ?? null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet.';
      setError(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── logCropEvent ─────────────────────────────────────────────────────────
  /**
   * Calls `AgriShield.logCropEvent()` on-chain.
   * - Requires MetaMask to be installed and connected to Sepolia.
   * - The transaction must be confirmed before `txHash` is set.
   * - Farmer address is taken from the connected MetaMask signer automatically.
   */
  const logCropEvent = useCallback(async (
    cropName:  string,
    eventType: EventType,
    location:  string,
  ): Promise<string> => {
    setError(null);

    if (!CONTRACT_ADDRESS) {
      const msg = 'Contract address is not configured. Add VITE_CONTRACT_ADDRESS to your root .env file.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const provider = new ethers.BrowserProvider(getMetaMaskProvider());
      const signer   = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // Call the contract — MetaMask will prompt the user to confirm the tx
      const tx = await contract.logCropEvent(cropName, eventType, location) as ethers.TransactionResponse;

      // Wait for the transaction to be mined (1 confirmation)
      await tx.wait(1);

      setTxHash(tx.hash);
      return tx.hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed.';
      setError(msg);
      throw err;
    }
  }, []);

  // ── getCropHistory ───────────────────────────────────────────────────────
  /**
   * Calls `AgriShield.getCropEvents(farmerAddress)` — a read-only call.
   * Does NOT require a connected wallet or any ETH.
   *
   * @param farmerAddress  Checksum or lowercase Ethereum address
   * @returns Array of CropEventRecord — timestamps are BigInt (Unix seconds)
   *
   * Usage example:
   *   const events = await getCropHistory('0x123...');
   *   events.map(e => ({
   *     ...e,
   *     date: new Date(Number(e.timestamp) * 1000).toLocaleDateString()
   *   }));
   */
  const getCropHistory = useCallback(async (
    farmerAddress: string,
  ): Promise<CropEventRecord[]> => {
    setError(null);

    if (!CONTRACT_ADDRESS) {
      const msg = 'Contract address is not configured. Add VITE_CONTRACT_ADDRESS to your root .env file.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const provider = new ethers.BrowserProvider(getMetaMaskProvider());
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const raw = await contract.getCropEvents(farmerAddress) as CropEventRecord[];

      // ethers v6 returns Result objects — spread into plain objects
      return raw.map((e) => ({
        farmer:    e.farmer,
        cropName:  e.cropName,
        eventType: e.eventType,
        timestamp: e.timestamp,
        location:  e.location,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch crop history.';
      setError(msg);
      throw err;
    }
  }, []);

  return {
    account,
    isConnecting,
    txHash,
    etherscanUrl,
    error,
    connectWallet,
    logCropEvent,
    getCropHistory,
  };
}

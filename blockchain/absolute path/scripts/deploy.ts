/**
 * AgriShield Deploy Script — Hardhat v3
 *
 * Prerequisites:
 *   1. Set your Sepolia credentials (one-time setup):
 *        npx hardhat vars set SEPOLIA_RPC_URL    https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
 *        npx hardhat vars set SEPOLIA_PRIVATE_KEY 0xYOUR_PRIVATE_KEY
 *
 *   2. Ensure your wallet has Sepolia ETH:
 *        https://sepoliafaucet.com  (free faucet — needs Alchemy account)
 *
 * Run deployment:
 *   npx hardhat run scripts/deploy.ts
 *
 * After deployment:
 *   Copy the printed contract address and add it to your root .env:
 *     VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
 *
 * ⚠️  NEVER commit your PRIVATE_KEY to git
 * ⚠️  Add blockchain/.env to .gitignore
 */

import { network } from "hardhat";

// ── Connect to Sepolia via configVariable credentials ─────────────────────────
const { ethers } = await network.connect({ network: "sepolia" });

const [deployer] = await ethers.getSigners();

console.log("─────────────────────────────────────────────");
console.log("  AgriShield — Sepolia Deployment");
console.log("─────────────────────────────────────────────");
console.log(`  Deployer : ${deployer.address}`);

const balance = await ethers.provider.getBalance(deployer.address);
console.log(`  Balance  : ${ethers.formatEther(balance)} ETH`);

if (balance === 0n) {
  console.error("\n❌  Deployer wallet has 0 ETH on Sepolia.");
  console.error("   Get free Sepolia ETH at: https://sepoliafaucet.com\n");
  process.exit(1);
}

// ── Deploy ────────────────────────────────────────────────────────────────────
console.log("\nDeploying AgriShield contract...");

const AgriShieldFactory = await ethers.getContractFactory("AgriShield");
const agriShield = await AgriShieldFactory.deploy();

console.log(`  Tx hash  : ${agriShield.deploymentTransaction()?.hash}`);
console.log("  Waiting for confirmations...");

await agriShield.waitForDeployment();

const contractAddress = await agriShield.getAddress();

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n✅  Deployment successful!\n");
console.log(`  Contract address : ${contractAddress}`);
console.log(`  Etherscan        : https://sepolia.etherscan.io/address/${contractAddress}`);
console.log("\n─────────────────────────────────────────────");
console.log("  NEXT STEP — add this line to your root .env:");
console.log(`  VITE_CONTRACT_ADDRESS=${contractAddress}`);
console.log("─────────────────────────────────────────────\n");

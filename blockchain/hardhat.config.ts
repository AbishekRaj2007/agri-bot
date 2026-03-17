/**
 * Hardhat v3 Configuration — AgriShield Blockchain Project
 *
 * ─── HOW TO SET SECRETS (Hardhat v3 uses configVariable, not dotenv) ─────────
 *
 * Option A — Hardhat variable store (recommended, stored in ~/.hardhat/vars):
 *   npx hardhat vars set SEPOLIA_RPC_URL    https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
 *   npx hardhat vars set SEPOLIA_PRIVATE_KEY 0xYOUR_PRIVATE_KEY
 *
 * Option B — Environment variables (set before running hardhat):
 *   export SEPOLIA_RPC_URL=https://...
 *   export SEPOLIA_PRIVATE_KEY=0x...
 *
 * ─── HOW TO GET FREE SEPOLIA CREDENTIALS ─────────────────────────────────────
 *   RPC URL  → https://alchemy.com         (free tier, create a Sepolia app)
 *   Test ETH → https://sepoliafaucet.com   (needs Alchemy account)
 *
 * ─── SECURITY REMINDERS ──────────────────────────────────────────────────────
 *   ⚠️  NEVER commit your PRIVATE_KEY to git
 *   ⚠️  Add blockchain/.env to .gitignore if you use a local .env file
 *   ⚠️  Use a dedicated deployment wallet — never your main wallet
 *
 * ─── DEPLOY COMMAND ──────────────────────────────────────────────────────────
 *   npx hardhat run scripts/deploy.ts    (deploys to Sepolia — see deploy.ts)
 *   npx hardhat compile                  (compile contracts only)
 *   npx hardhat test                     (run tests on local EDR network)
 */

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],

  solidity: {
    profiles: {
      // Default profile — used for development and testing
      default: {
        version: "0.8.20",
      },
      // Production profile — optimizer enabled for lower gas costs on mainnet/testnet
      production: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },

  networks: {
    // ── Local simulated networks (no setup needed) ──────────────────────────
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },

    // ── Sepolia Testnet ──────────────────────────────────────────────────────
    // Set credentials with:
    //   npx hardhat vars set SEPOLIA_RPC_URL <your_alchemy_url>
    //   npx hardhat vars set SEPOLIA_PRIVATE_KEY <0x_your_private_key>
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY!],
    },
  },
});

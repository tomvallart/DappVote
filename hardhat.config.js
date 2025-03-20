// filepath: vsls:/hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

// Vérifiez que les variables d'environnement sont définies
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

if (!SEPOLIA_RPC_URL || !PRIVATE_KEY || !ETHERSCAN_API_KEY) {
  throw new Error("Veuillez définir les variables d'environnement SEPOLIA_RPC_URL, PRIVATE_KEY et ETHERSCAN_API_KEY dans votre fichier .env");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;


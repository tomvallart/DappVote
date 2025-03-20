import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Fournir les arguments nécessaires au constructeur
  const Contract = await ethers.getContractFactory("Voting");
  const contract = await Contract.deploy(deployer.address);

  await contract.waitForDeployment();

  console.log("Contract deployed to address:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


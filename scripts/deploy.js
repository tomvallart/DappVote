import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  // Récupérer le compte déployeur
  const [deployer] = await ethers.getSigners();

  console.log("Déploiement des contrats avec le compte :", deployer.address);

  // Afficher le solde du compte déployeur
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Solde du compte :", balance.toString());

  // Fournir les arguments nécessaires au constructeur
  const Contract = await ethers.getContractFactory("Voting");
  const contract = await Contract.deploy(deployer.address);

  // Attendre que le contrat soit déployé
  await contract.waitForDeployment();

  // Afficher l'adresse du contrat déployé
  console.log("Contrat déployé à l'adresse :", await contract.getAddress());
}

// Exécuter la fonction principale et gérer les erreurs
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
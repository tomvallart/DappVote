import { ethers } from "ethers"
import contractInfo from "../contract-info.json"

// Utiliser l'adresse du contrat depuis contract-info.json
export const contractAddress = contractInfo.address
export const contractABI = contractInfo.abi

export async function getContract(signer: ethers.Signer) {
  return new ethers.Contract(contractAddress, contractABI, signer)
}


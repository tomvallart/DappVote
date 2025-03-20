"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { BrowserProvider } from "ethers"
import { contractAddress, contractABI } from "@/lib/contract"

// Types pour notre contexte
type Voter = {
  isRegistered: boolean
  hasVoted: boolean
  votedProposalId: number
}

type Proposal = {
  id: number
  description: string
  voteCount: number
}

type WorkflowStatus =
  | "RegisteringVoters"
  | "ProposalsRegistrationStarted"
  | "ProposalsRegistrationEnded"
  | "VotingSessionStarted"
  | "VotingSessionEnded"
  | "VotesTallied"

// Ajouter la fonction resetVoting à l'interface VotingContextType
interface VotingContextType {
  connect: () => Promise<void>
  disconnect: () => void
  account: string | null
  isAdmin: boolean
  isVoter: boolean
  voters: Record<string, Voter>
  proposals: Proposal[]
  workflowStatus: WorkflowStatus
  winningProposalId: number | null
  winningProposalVotesCount: number | null
  addVoter: (address: string) => Promise<void>
  startProposalsRegistering: () => Promise<void>
  endProposalsRegistering: () => Promise<void>
  startVotingSession: (durationInMinutes: number) => Promise<void>
  endVotingSession: () => Promise<void>
  tallyVotes: () => Promise<void>
  addProposal: (description: string) => Promise<void>
  setVote: (proposalId: number) => Promise<void>
  delegateVote: (address: string) => Promise<void>
  resetVoting: () => Promise<void>
  refreshData: () => Promise<void>
  isConnected: boolean
  isLoading: boolean
  votingEndTime: number | null
  networkError: string | null
  isCorrectNetwork: boolean
  switchNetwork: () => Promise<void>
}

// Ajouter la fonction resetVoting à l'objet de contexte par défaut
const VotingContext = createContext<VotingContextType | undefined>(undefined)

// Mapping des statuts numériques vers des chaînes lisibles
const workflowStatusMap: Record<number, WorkflowStatus> = {
  0: "RegisteringVoters",
  1: "ProposalsRegistrationStarted",
  2: "ProposalsRegistrationEnded",
  3: "VotingSessionStarted",
  4: "VotingSessionEnded",
  5: "VotesTallied",
}

// ID du réseau Sepolia
const SEPOLIA_CHAIN_ID = "0xaa36a7" // 11155111 en hexadécimal

// Ajouter l'implémentation de la fonction resetVoting dans le provider
export const VotingProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVoter, setIsVoter] = useState(false)
  const [voters, setVoters] = useState<Record<string, Voter>>({})
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("RegisteringVoters")
  const [winningProposalId, setWinningProposalId] = useState<number | null>(null)
  const [winningProposalVotesCount, setWinningProposalVotesCount] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [votingEndTime, setVotingEndTime] = useState<number | null>(null)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  // Vérifier le réseau actuel
  const checkNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        const isCorrect = chainId === SEPOLIA_CHAIN_ID
        setIsCorrectNetwork(isCorrect)
        return isCorrect
      } catch (error) {
        console.error("Erreur lors de la vérification du réseau:", error)
        return false
      }
    }
    return false
  }

  // Changer de réseau pour Sepolia
  const switchNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setNetworkError(null)
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        })

        // Vérifier à nouveau le réseau après le changement
        const isCorrect = await checkNetwork()
        if (isCorrect) {
          // Reconnecter après le changement de réseau
          await connect()
        }
        return isCorrect
      } catch (error: any) {
        // Si le réseau n'est pas configuré dans MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: "Sepolia Test Network",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            })
            // Vérifier à nouveau le réseau après l'ajout
            return await checkNetwork()
          } catch (addError) {
            console.error("Erreur lors de l'ajout du réseau Sepolia:", addError)
            setNetworkError("Impossible d'ajouter le réseau Sepolia à MetaMask")
            return false
          }
        } else {
          console.error("Erreur lors du changement de réseau:", error)
          setNetworkError("Impossible de changer pour le réseau Sepolia")
          return false
        }
      }
    }
    return false
  }

  // Connexion au wallet et au contrat
  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true)
        setNetworkError(null)

        // Vérifier le réseau avant de se connecter
        const isCorrect = await checkNetwork()
        if (!isCorrect) {
          setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
          setIsLoading(false)
          return
        }

        // Demander l'accès au compte
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const account = accounts[0]
        setAccount(account)

        // Configurer le provider et le contrat
        const provider = new BrowserProvider(window.ethereum)
        setProvider(provider)

        try {
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(contractAddress, contractABI, signer)
          setContract(contract)

          // Vérifier si l'utilisateur est l'administrateur
          try {
            const admin = await contract.owner()
            setIsAdmin(admin.toLowerCase() === account.toLowerCase())
          } catch (error) {
            console.error("Erreur lors de la vérification de l'administrateur:", error)
            setIsAdmin(false)
          }

          // Vérifier si l'utilisateur est un électeur
          try {
            const isRegistered = await contract.getVoterIsRegistered(account)
            setIsVoter(isRegistered)
            console.log("Statut d'électeur:", isRegistered)
          } catch (error) {
            console.error("Erreur lors de la vérification du statut d'électeur:", error)
            setIsVoter(false)
          }

          setIsConnected(true)
          await refreshData()
        } catch (error) {
          console.error("Erreur lors de la configuration du contrat:", error)
          setNetworkError("Impossible de se connecter au contrat. Vérifiez que vous êtes sur le réseau Sepolia.")
        }
      } catch (error) {
        console.error("Erreur lors de la connexion:", error)
        setNetworkError("Erreur lors de la connexion à MetaMask")
      } finally {
        setIsLoading(false)
      }
    } else {
      setNetworkError("Veuillez installer MetaMask pour utiliser cette application")
    }
  }

  // Déconnexion
  const disconnect = () => {
    setAccount(null)
    setProvider(null)
    setContract(null)
    setIsAdmin(false)
    setIsVoter(false)
    setIsConnected(false)
    setNetworkError(null)
  }

  // Rafraîchir les données
  const refreshData = async () => {
    if (!contract || !account) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de rafraîchir les données
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      console.log("Rafraîchissement des données...")

      // Récupérer le statut du workflow
      try {
        const statusNum = await contract.workflowStatus()
        const newStatus = workflowStatusMap[Number(statusNum)]
        console.log("Statut du workflow:", newStatus)
        setWorkflowStatus(newStatus)
      } catch (error) {
        console.error("Erreur lors de la récupération du statut du workflow:", error)
      }

      // Récupérer le temps de fin du vote si disponible
      try {
        const endTime = await contract.votingEndTime()
        setVotingEndTime(Number(endTime) * 1000) // Convertir en millisecondes
        console.log("Temps de fin du vote:", new Date(Number(endTime) * 1000).toLocaleString())
      } catch (error) {
        console.error("Erreur lors de la récupération du temps de fin du vote:", error)
        setVotingEndTime(null)
      }

      // Récupérer les propositions
      const proposalsArray: Proposal[] = []
      let i = 0
      let hasMoreProposals = true

      while (hasMoreProposals && i < 100) {
        // Limite de sécurité à 100 propositions
        try {
          const proposal = await contract.proposals(i)
          proposalsArray.push({
            id: i,
            description: proposal.description,
            voteCount: Number(proposal.voteCount),
          })
          i++
        } catch (error) {
          hasMoreProposals = false
        }
      }

      console.log("Propositions récupérées:", proposalsArray.length)
      setProposals(proposalsArray)

      // Si les votes sont comptabilisés, récupérer le gagnant
      if (workflowStatus === "VotesTallied") {
        try {
          const winningId = await contract.getWinningProposalID()
          const winningVotesCount = await contract.getWinningProposalIDVotesCount()
          setWinningProposalId(Number(winningId))
          setWinningProposalVotesCount(Number(winningVotesCount))
          console.log("Proposition gagnante:", Number(winningId), "avec", Number(winningVotesCount), "votes")
        } catch (error) {
          console.error("Erreur lors de la récupération du gagnant:", error)
        }
      }

      // Récupérer les informations sur l'électeur actuel
      try {
        // Vérifier à nouveau si l'utilisateur est un électeur
        const isRegistered = await contract.getVoterIsRegistered(account)
        setIsVoter(isRegistered)
        console.log("Statut d'électeur (rafraîchissement):", isRegistered)

        if (isRegistered) {
          const voterInfo = await contract.getVoter(account)
          setVoters({
            ...voters,
            [account]: {
              isRegistered: voterInfo[0],
              hasVoted: voterInfo[1],
              votedProposalId: Number(voterInfo[2]),
            },
          })
          console.log("Informations de l'électeur:", voterInfo)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations de l'électeur:", error)
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error)
      setNetworkError("Erreur lors du rafraîchissement des données. Vérifiez votre connexion au réseau Sepolia.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonctions d'interaction avec le contrat
  const addVoter = async (address: string) => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant d'ajouter un électeur
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.registerVoter(address)
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un électeur:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const startProposalsRegistering = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de démarrer l'enregistrement des propositions
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.startProposalsRegistration()
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement des propositions:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const endProposalsRegistering = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de terminer l'enregistrement des propositions
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.endProposalsRegistration()
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors de la fin de l'enregistrement des propositions:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const startVotingSession = async (durationInMinutes = 0) => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de démarrer la session de vote
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.startVote(durationInMinutes)
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors du démarrage de la session de vote:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const endVotingSession = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de terminer la session de vote
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.endVote()
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors de la fin de la session de vote:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const tallyVotes = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de comptabiliser les votes
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.countVotes()
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors du comptage des votes:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addProposal = async (description: string) => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant d'ajouter une proposition
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.registerProposal(description)
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une proposition:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const setVote = async (proposalId: number) => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de voter
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.voteForFavoriteProposal(proposalId)
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors du vote:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const delegateVote = async (address: string) => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de déléguer le vote
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.delegateVote(address)
      await tx.wait()
      await refreshData()
    } catch (error) {
      console.error("Erreur lors de la délégation du vote:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour réinitialiser le vote (retour à l'état initial)
  const resetVoting = async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setNetworkError(null)

      // Vérifier le réseau avant de réinitialiser le vote
      const isCorrect = await checkNetwork()
      if (!isCorrect) {
        setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
        setIsLoading(false)
        return
      }

      const tx = await contract.resetVoting()
      await tx.wait()

      // Réinitialiser l'état local
      setWorkflowStatus("RegisteringVoters")
      setProposals([])
      setWinningProposalId(0)

      // Rafraîchir les données
      await refreshData()
    } catch (error: any) {
      console.error("Error resetting voting:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Écouter les changements de compte et de réseau
  useEffect(() => {
    if (window.ethereum) {
      // Écouter les changements de compte
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          // Reconnecter avec le nouveau compte
          connect()
        } else {
          disconnect()
        }
      })

      // Écouter les changements de réseau
      window.ethereum.on("chainChanged", () => {
        // Vérifier le réseau et reconnecter si nécessaire
        checkNetwork().then((isCorrect) => {
          if (isCorrect) {
            connect()
          } else {
            setNetworkError("Veuillez vous connecter au réseau Sepolia pour utiliser cette application")
          }
        })
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  // Vérifier le réseau au chargement
  useEffect(() => {
    checkNetwork()
  }, [])

  // Rafraîchir les données périodiquement
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      // Rafraîchir les données immédiatement au chargement
      refreshData()

      // Puis rafraîchir toutes les 30 secondes
      const interval = setInterval(() => {
        refreshData()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isConnected, isCorrectNetwork])

  // Ajouter resetVoting à la valeur du contexte
  const value = {
    connect,
    disconnect,
    account,
    isAdmin,
    isVoter,
    voters,
    proposals,
    workflowStatus,
    winningProposalId,
    winningProposalVotesCount,
    addVoter,
    startProposalsRegistering,
    endProposalsRegistering,
    startVotingSession,
    endVotingSession,
    tallyVotes,
    addProposal,
    setVote,
    delegateVote,
    resetVoting,
    refreshData,
    isConnected,
    isLoading,
    votingEndTime,
    networkError,
    isCorrectNetwork,
    switchNetwork,
  }

  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>
}

export const useVoting = () => {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error("useVoting doit être utilisé à l'intérieur d'un VotingProvider")
  }
  return context
}


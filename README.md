# DAppVote - Application de Vote Décentralisée

Une application de vote décentralisée aux couleurs de la France, permettant l'enregistrement d'électeurs, la soumission de propositions et le vote.

## Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- MetaMask ou un autre portefeuille Ethereum
- Un réseau Ethereum local (Hardhat, Ganache) ou un réseau de test (Sepolia, Goerli)

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/votre-nom/dappvote.git
cd dappvote
```

# DAppVote
L'objectif à réaliser est un contrat intelligent de vote pour une petite organisation. Les votants, tous connus de l'organisation, sont inscrits sur une liste blanche (whitelist) à l'aide de leur adresse Ethereum, peuvent proposer de nouvelles idées lors d'une session d'enregistrement des propositions et peuvent voter sur les propositions lors de la session de vote.

## Auteurs
- Lucas DEBRUYNE
- Laurane MOURONVAL
- Tom VALLART

## Fonctionnalités 
### Déroulé de l'ensemble du processus de vote
- L'administrateur du vote inscrit une liste blanche d'électeurs identifiés par leur adresse Ethereum.
- L'administrateur du vote démarre la session d'enregistrement des propositions.
Les électeurs inscrits peuvent soumettre leurs propositions pendant que la session d'enregistrement est active.
- L'administrateur du vote clôture la session d'enregistrement des propositions.
- L'administrateur du vote lance la session de vote.
- Les électeurs inscrits votent pour leur proposition favorite.
- L'administrateur du vote clôture la session de vote.
- L'administrateur du vote comptabilise les votes.
- Tout le monde peut vérifier les derniers détails de la proposition gagnante.

### Fonctionnalités supplémentaires
- **Timer de vote**: Ajoute un timer pour permettre aux voters de voter uniquement pendant une période donnée. L'admin ne peut pas cloturer le vote avant la fin du timer. Pour ne pas avoir de temps limite sur un vote, mettre 0 sur en paramètre de la fonction startVote.

- **Fonctionnalité de délégation de vote** : Un votant peut déléguer son vote à un autre votant. Lorsqu'un votant délègue son vote, le délégué vote pour la même proposition que le votant.
 
## Organisation du groupe 
Tous les participants ont contribué aux modifications du fichier principal Voting.sol.
Laurane s'est occupée de l'initialisation et de la configuration du projet. 
Tom s'est occupé de se documenter sur la classe Ownable.
Lucas s'est occupé de se documenter sur le front.

## Vidéo de démo
- Lien :


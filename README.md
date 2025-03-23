# DAppVote - Application de Vote Décentralisée

Une application de vote décentralisée aux couleurs de la France, permettant l'enregistrement d'électeurs, la soumission de propositions et le vote.

## Prérequis

- Node.js (v16 ou supérieur)
- npm
- MetaMask ou un autre portefeuille Ethereum
- Un réseau Ethereum local (Hardhat, Ganache) ou un réseau de test (Sepolia, Goerli)

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/tomvallart/DappVote.git
cd DappVote
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

- **Changement de comptes immédiat** : Sur le site, il est possible de changer de compte directement en sélectionnant le compte qu'on veut depuis Metamask. L'adresse se mettra à jour immédiatement.

- **Mise à jour automatique des données** : Toutes les 30 secondes, la page est rafraîchie afin que le client ait les informations les plus récentes. Il y a également un bouton de rafraîchissement manuel.
 
## Organisation du groupe
Afin de coder ensemble en temps réel, Liveshare est l'outil qui a été utilisé. C'est pourquoi les commits sur Git sont si peu nombreux. Il est à noter qu'un projet GIT a été recréé car l'ancien était devenu trop brouillon. Il est disponible ici : https://github.com/ML-Laurane/DAppVote.git

- Tous les participants ont équitablement contribué aux modifications du fichier principal Voting.sol et du déboggage des problèmes de versions de dépendances pour lier le front et le back.
- Lucas s'est précisément occupé de se documenter sur le front, puis de tester les fonctionnalités de l'application en localhost.
- Laurane s'est précisément occupée de l'initialisation du projet, puis du montage de la vidéo démo finale, puis des tests avec l'Ethereum en tant que votant.
- Tom s'est précisément occupé de se documenter sur la classe Ownable, puis de la création du front avec v0, puis des tests avec l'Ethereum en tant qu'administrateur.

## Vidéo de démo
- Lien : [https://youtu.be/lmBTkljZGGg](https://youtu.be/lmBTkljZGGg)

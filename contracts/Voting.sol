// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

// Contrat de vote décentralisé
contract Voting is Ownable {

    // Identifiant de la proposition gagnante
    uint256 public winningProposalID;
    // Nombre de votes de la proposition gagnante
    uint256 public winningProposalVotesCount;
    // Heure de début du vote
    uint256 public votingStartTime;
    // Heure de fin du vote
    uint256 public votingEndTime;

    // Événements
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event VoteDelegated(address indexed from, address indexed to);
    event VotingReset();

    // Structure représentant un électeur
    struct Voter {
        bool isRegistered; // Indique si l'électeur est enregistré
        bool hasVoted; // Indique si l'électeur a voté
        uint votedProposalId; // Identifiant de la proposition pour laquelle l'électeur a voté
    }
    
    // Structure représentant une proposition
    struct Proposal {
        string description; // Description de la proposition
        uint voteCount; // Nombre de votes pour cette proposition
    }

    // Enumération des différents statuts du workflow
    enum WorkflowStatus {
        RegisteringVoters, // Enregistrement des électeurs
        ProposalsRegistrationStarted, // Début de l'enregistrement des propositions
        ProposalsRegistrationEnded, // Fin de l'enregistrement des propositions
        VotingSessionStarted, // Début de la session de vote
        VotingSessionEnded, // Fin de la session de vote
        VotesTallied // Comptage des votes terminé
    }

    // Statut actuel du workflow
    WorkflowStatus public workflowStatus;
    // Liste des propositions
    Proposal[] public proposals;
    // Mapping des électeurs
    mapping(address => Voter) public voters;

    // Constructeur
    constructor(address initialOwner) Ownable(initialOwner) {
        // Appel du constructeur de Ownable avec l'adresse du propriétaire initial
    }

    // Modificateur pour vérifier si l'utilisateur est un électeur enregistré
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "Not a registered voter");
        _;
    }
    
    // Modificateur pour vérifier si l'utilisateur a voté
    modifier onlyVotersThatHasVoted() {
        require(voters[msg.sender].hasVoted, "Has not voted");
        _;
    }

    // GETTER  -----------------------------------------------------------------------------------------------

    // Obtenir l'identifiant de la proposition gagnante
    function getWinningProposalID() public view returns(uint256) {
        return winningProposalID;
    }

    // Obtenir le nombre de votes de la proposition gagnante
    function getWinningProposalIDVotesCount() public view returns(uint256) {
        return winningProposalVotesCount;
    }

    // Obtenir les informations d'un électeur
    function getVoter(address _voter) public view returns(bool, bool, uint) {
        return (voters[_voter].isRegistered, voters[_voter].hasVoted, voters[_voter].votedProposalId);
    }

    // Vérifier si un électeur a voté
    function getVoterHasVoted(address _voter) public view returns(bool) {
        return voters[_voter].hasVoted;
    }

    // Vérifier si un électeur est enregistré
    function getVoterIsRegistered(address _voter) public view returns(bool) {
        return voters[_voter].isRegistered;
    }

    // FUNCTIONS -----------------------------------------------------------------------------------------------

    // Enregistrer un votant
    function registerVoter(address _voter) public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters);
        require(!voters[_voter].isRegistered);
        
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    // Début de l'enregistrement des propositions
    function startProposalsRegistration() public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters);
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Fin de l'enregistrement des propositions
    function endProposalsRegistration() public onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted);
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    // Enregistrer une proposition
    function registerProposal(string memory description) public onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not active");
        
        proposals.push(Proposal({
            description: description,
            voteCount: 0
        }));
        
        emit ProposalRegistered(proposals.length - 1);
    }

    // Lancement du vote. Pour ne pas avoir de temps limite, mettre 0
    function startVote(uint256 durationInMinutes) public onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded);
        
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        votingStartTime = block.timestamp;
        if (durationInMinutes > 0) {
            votingEndTime = block.timestamp + (durationInMinutes * 1 minutes);
        } else {
            votingEndTime = 0; // Pas de limite de temps
        }
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    // Clôture du vote
    function endVote() public onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted);
        if (votingEndTime > 0) {
            require(block.timestamp >= votingEndTime, "Voting duration has not ended yet");
        }
        
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // Voter pour une proposition favorite
    function voteForFavoriteProposal(uint _proposalId) public onlyVoters {
        Voter storage sender = voters[msg.sender];
        require(!sender.hasVoted);
        require(workflowStatus == WorkflowStatus.VotingSessionStarted);
        if (votingEndTime > 0) {
            require(block.timestamp <= votingEndTime, "Voting period has ended");
        }
        require(_proposalId < proposals.length, "Proposal does not exist");

        sender.hasVoted = true;
        sender.votedProposalId = _proposalId;
        proposals[_proposalId].voteCount += 1;
        emit Voted(msg.sender, _proposalId);
    }
    
    // Compter les votes
    function countVotes() public onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded);
        
        uint countWinnerVotes = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > countWinnerVotes) {
                countWinnerVotes = proposals[i].voteCount;
                winningProposalID = i;
                winningProposalVotesCount = countWinnerVotes;
            }
        }
        
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    // Obtenir la proposition gagnante
    function showWinningProposal() public view returns(string memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied);
        return proposals[winningProposalID].description;
    }

    // Fonctionnalité de délégation de vote
    mapping(address => address) public delegations;

    function delegateVote(address to) public onlyVoters {
        Voter storage sender = voters[msg.sender];
        require(!sender.hasVoted, "You have already voted");
        require(to != msg.sender, "You cannot delegate to yourself");
        require(voters[to].isRegistered, "Delegatee must be a registered voter");

        // Vérifier qu'il n'y a pas de boucle de délégation
        address delegatee = to;
        while (delegations[delegatee] != address(0)) {
            delegatee = delegations[delegatee];
            require(delegatee != msg.sender, "Delegation loop detected!");
        }

        delegations[msg.sender] = to;

        sender.hasVoted = true;

        if (voters[to].hasVoted) {
            proposals[voters[to].votedProposalId].voteCount += 1;
        } else {
            voters[to].votedProposalId = sender.votedProposalId;
        }

        emit VoteDelegated(msg.sender, to);
    }
}
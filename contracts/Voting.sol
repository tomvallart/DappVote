// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    uint256 public winningProposalID;
    uint256 public winningProposalVotesCount;
    uint256 public votingStartTime;
    uint256 public votingEndTime;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event VoteDelegated(address indexed from, address indexed to);
    event VotingReset();

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    
    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] public proposals;
    mapping(address => Voter) public voters;

    constructor(address initialOwner) Ownable(initialOwner) {
        // Appel du constructeur de Ownable avec l'adresse du propriétaire initial
    }

    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "Not a registered voter");
        _;
    }
    
    modifier onlyVotersThatHasVoted() {
        require(voters[msg.sender].hasVoted, "Has not voted");
        _;
    }

    // GETTER  -----------------------------------------------------------------------------------------------

    function getWinningProposalID() public view returns(uint256) {
        return winningProposalID;
    }

    function getWinningProposalIDVotesCount() public view returns(uint256) {
        return winningProposalVotesCount;
    }

    function getVoter(address _voter) public view returns(bool, bool, uint) {
        return (voters[_voter].isRegistered, voters[_voter].hasVoted, voters[_voter].votedProposalId);
    }

    function getVoterHasVoted(address _voter) public view returns(bool) {
        return voters[_voter].hasVoted;
    }

    function getVoterIsRegistered(address _voter) public view returns(bool) {
        return voters[_voter].isRegistered;
    }

/// FUNCTIONS -----------------------------------------------------------------------------------------------

    // Enregistrer un votant
    function registerVoter(address _voter) public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters);
        require(!voters[_voter].isRegistered);
        
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    // Propositions de vote
    function startProposalsRegistration() public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters);
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

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
            votingEndTime = 0; // No time limit
        }
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    // Cloture Vote
    function endVote() public onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted);
        if (votingEndTime > 0) {
            require(block.timestamp >= votingEndTime, "Voting duration has not ended yet");
        }
        
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // Proposition Favorite
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
    
    // Compteur des Votes
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

    // Réinitialiser le vote pour commencer un nouveau cycle
    function resetVoting() public onlyOwner {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Le vote n'est pas fini");
        
        // Réinitialiser les variables d'état
        delete proposals;
        winningProposalID = 0;
        winningProposalVotesCount = 0;
        votingStartTime = 0;
        votingEndTime = 0;
        
        // Réinitialiser le statut du workflow
        WorkflowStatus previousStatus = workflowStatus;
        workflowStatus = WorkflowStatus.RegisteringVoters;
        
        // Réinitialiser les votes des électeurs mais garder leur inscription
        for (uint i = 0; i < proposals.length; i++) {
            proposals[i].voteCount = 0;
        }
        
        // Émettre les événements
        emit WorkflowStatusChange(previousStatus, WorkflowStatus.RegisteringVoters);
        emit VotingReset();
    }
}


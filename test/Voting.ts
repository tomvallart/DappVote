import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

// Déploiement du contrat Voting
async function deployVotingFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(owner.address);
    await voting.waitForDeployment();

    return { voting, owner, addr1, addr2 };
}

describe("Voting Contract", function () {
    it("Devrait enregistrer un votant", async function () {
        const { voting, addr1 } = await loadFixture(deployVotingFixture);
        await voting.registerVoter(addr1.address);
        const voter = await voting.getVoter(addr1.address);
        expect(voter[0]).to.equal(true);
    });

    it("Devrait démarrer et terminer l'enregistrement des propositions", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        await voting.startProposalsRegistration();
        expect(await voting.workflowStatus()).to.equal(1);

        await voting.endProposalsRegistration();
        expect(await voting.workflowStatus()).to.equal(2);
    });

    it("Devrait démarrer et terminer la session de vote avec durée", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        await voting.startProposalsRegistration();
        await voting.endProposalsRegistration();
        await voting.startVote(1); // 1 minute de durée de vote
        expect(await voting.workflowStatus()).to.equal(3);

        // Attendre 1 minute et 1 seconde pour s'assurer que la durée de vote est écoulée
        await time.increase(61);

        await voting.endVote();
        expect(await voting.workflowStatus()).to.equal(4);
    });

    it("Devrait démarrer et terminer la session de vote sans durée", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        await voting.startProposalsRegistration();
        await voting.endProposalsRegistration();
        await voting.startVote(0); // Pas de limite de temps
        expect(await voting.workflowStatus()).to.equal(3);

        await voting.endVote();
        expect(await voting.workflowStatus()).to.equal(4);
    });

    it("Devrait permettre à un votant de voter", async function () {
        const { voting, addr1 } = await loadFixture(deployVotingFixture);
        await voting.registerVoter(addr1.address);
        await voting.startProposalsRegistration();
        await voting.connect(addr1).registerProposal("Proposition 1");
        await voting.endProposalsRegistration();
        await voting.startVote(10); // 10 minutes de durée de vote

        await voting.connect(addr1).voteForFavoriteProposal(0);
        const voter = await voting.getVoter(addr1.address);
        expect(voter[1]).to.equal(true);
    });

    it("Devrait compter les votes et déclarer un gagnant", async function () {
        const { voting, addr1 } = await loadFixture(deployVotingFixture);
        await voting.registerVoter(addr1.address);
        await voting.startProposalsRegistration();
        await voting.connect(addr1).registerProposal("Proposition 1");
        await voting.endProposalsRegistration();
        await voting.startVote(1); // 1 minute de durée de vote

        await voting.connect(addr1).voteForFavoriteProposal(0);

        // Attendre 1 minute et 1 seconde pour s'assurer que la durée de vote est écoulée
        await time.increase(61);
        await voting.endVote();
        await voting.countVotes();

        expect(await voting.getWinningProposalID()).to.equal(0);
    });

    it("Devrait déléguer un vote", async function () {
        const { voting, addr1, addr2 } = await loadFixture(deployVotingFixture);
        await voting.registerVoter(addr1.address);
        await voting.registerVoter(addr2.address);
        await voting.startProposalsRegistration();
        await voting.connect(addr1).registerProposal("Proposition 1");
        await voting.endProposalsRegistration();
        await voting.startVote(10); // 10 minutes de durée de vote

        await voting.connect(addr1).delegateVote(addr2.address);
        const voter = await voting.getVoter(addr1.address);
        expect(voter[1]).to.equal(true);
    });
    
    it("Ne devrait pas permettre aux votants de voter après la durée spécifiée", async function () {
        const { voting, addr1 } = await loadFixture(deployVotingFixture);
        await voting.registerVoter(addr1.address);
        await voting.startProposalsRegistration();
        await voting.connect(addr1).registerProposal("Proposition 1");
        await voting.endProposalsRegistration();
        await voting.startVote(1); // 1 minute de durée de vote

        // Attendre 1 minute et 1 seconde pour s'assurer que la durée de vote est écoulée
        await time.increase(61);

        await expect(voting.connect(addr1).voteForFavoriteProposal(0)).to.be.revertedWith("Voting period has ended");
    });
});


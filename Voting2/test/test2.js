const Voting = artifacts.require("Voting");

const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');

contract("Voting", accounts => {

    let VotingInstance;

    const _owner = accounts[0];
    const _voter1 = accounts[1];
    const _voter2 = accounts[2];
    const _unregistered = accounts[3];
    const _enum = Voting.WorkflowStatus;

    describe("Smart Contract deployed ", () => {

        beforeEach(async function() {
            VotingInstance = await Voting.new({from: _owner});
        });

        it("Owner is _owner", async () => {
            expect(await VotingInstance.owner.call()).to.equal(_owner);
        });

        it("Initial WorkflowStatus start with RegisteringVoters", async () =>{
            expect (await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(_enum.RegisteringVoters));
        });

    });

     
    // ::::::::::::: GETTERS ::::::::::::: //

    describe("getVoter", () => {
        
        before(async function() {
            VotingInstance = await Voting.new({from: _owner});
            await VotingInstance.addVoter(_owner, {from: _owner});
            await VotingInstance.addVoter(_voter1, {from: _owner});
        });

        it("OnlyVoters is allowed to verify the voter profile", async () => {
            await expectRevert(VotingInstance.getVoter(_voter1, {from: _unregistered}), "You're not a voter");
        });

        it("OnlyVoters use getVoter to unregistered voter", async () => {
            voter = await VotingInstance.getVoter.call(_unregistered, {from: _voter1});// unregistered profile is empty
            expect(voter.isRegistered).equal(false);
        });

        it("OnlyVoters Get registered voter", async () => {
            voter = await VotingInstance.getVoter.call(_owner, {from: _voter1});
            expect(voter.isRegistered).equal(true);
        });
    });

    describe("getOneProposal", () => {

        it("OnlyVoter is allowed to getOneproposal", async () => {
            VotingInstance = await Voting.new({from: _owner});
            await VotingInstance.addVoter(_voter1, {from: _owner});
            await VotingInstance.startProposalsRegistering({from: _owner});
            await expectRevert(VotingInstance.getOneProposal.call(1), "You're not a voter");
        });
    });

    
    // ::::::::::::: STATE ::::::::::::: //
    

    describe("WorkflowStatus change ", () => {

        beforeEach(async function() {
            VotingInstance = await Voting.new({from: _owner});
        });

        


        it("Change to ProposalsRegistrationStarted", async () => {
            await VotingInstance.addVoter(_voter1, {from: _owner});
                
            const result = await VotingInstance.startProposalsRegistering({from: _owner});
            expectEvent(result, "WorkflowStatusChange", {
                previousStatus: new BN(0), 
                newStatus: new BN(1)
            });
        });

        it("Change to ProposalsRegistrationEnded", async () => {
            await VotingInstance.startProposalsRegistering({from: _owner});
            const result = await VotingInstance.endProposalsRegistering({from: _owner});
            expectEvent(result, "WorkflowStatusChange", {
                previousStatus: new BN(1), 
                newStatus: new BN(2)
            });
        }); 
        
        it("Change to VotingSessionStarted", async () => {
            await VotingInstance.startProposalsRegistering({from: _owner});
            await VotingInstance.endProposalsRegistering({from: _owner});
            const result = await VotingInstance.startVotingSession({from: _owner});
            expectEvent(result, "WorkflowStatusChange", {
                previousStatus: new BN(2), 
                newStatus: new BN(3)
            });
        }); 
        
        it("Change to VotingSessionEnded", async () => {
            await VotingInstance.startProposalsRegistering({from: _owner});
            await VotingInstance.endProposalsRegistering({from: _owner});
            await VotingInstance.startVotingSession({from: _owner});
            const result = await VotingInstance.endVotingSession({from: _owner});
            expectEvent(result, "WorkflowStatusChange", {
                previousStatus: new BN(3), 
                newStatus: new BN(4)
            });
        }); 

        it("Change to VotesTallied", async () => {
            await VotingInstance.startProposalsRegistering({from: _owner});
            await VotingInstance.endProposalsRegistering({from: _owner});
            await VotingInstance.startVotingSession({from: _owner});
            await VotingInstance.endVotingSession({from: _owner});
            const result = await VotingInstance.tallyVotes({from: _owner});
            expectEvent(result, "WorkflowStatusChange", {
                previousStatus: new BN(4), 
                newStatus: new BN(5)
            });
        }); 

    });


    describe("getWinner", () => {

        beforeEach(async () => {
            VotingInstance = await Voting.new({from: _owner});
            await VotingInstance.addVoter(_voter1, {from: _owner});
            await VotingInstance.addVoter(_voter2, {from: _owner});
            await VotingInstance.startProposalsRegistering({from: _owner});
        });

        it("And the winner is", async () => {
            await VotingInstance.addProposal("Proposal 1", {from: _voter1});
            await VotingInstance.addProposal("Proposal 2", {from: _voter2});
            await VotingInstance.endProposalsRegistering({from: _owner});
            await VotingInstance.startVotingSession({from: _owner});
            await VotingInstance.setVote(1, {from: _voter1});
            await VotingInstance.setVote(1, {from: _voter2});
            await VotingInstance.endVotingSession({from: _owner});
            await VotingInstance.tallyVotes({from: _owner});

            const winningProposalID = await VotingInstance.winningProposalID.call({from: _voter2});
            expect(winningProposalID).to.be.bignumber.equal(new BN(1));
        });
    });
    


    // ::::::::::::: REGISTRATION ::::::::::::: // 

    describe("Registration", () => {

        before(async function() {
            VotingInstance = await Voting.new({from: _owner});
        });

        //test with _voter1
        it("Voter is registrated", async () => {
            const result = await VotingInstance.addVoter(_voter1, {from: _owner});
            await expectEvent(result, "VoterRegistered", {voterAddress: _voter1});

            const voter1 = await VotingInstance.getVoter.call(_voter1, {from: _voter1});// to see voter1 profile after regitration
            expect(voter1.isRegistered).true;
            expect(voter1.hasVoted).false;
            expect(voter1.votedProposalId).to.be.bignumber.equal(new BN(0));
        });

        it("One registration per address", async () => {
            await expectRevert(VotingInstance.addVoter.call(_voter1, {from: _owner}), 'Already registered');
        });
    });

    
    // ::::::::::::: PROPOSAL ::::::::::::: // 

    describe("Proposal registration", () => {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from: _owner});
            await VotingInstance.addVoter(_voter1, {from: _owner});
            await VotingInstance.startProposalsRegistering({from: _owner});
            await VotingInstance.addProposal("Hello World",{from: _voter1});
        });
      
        it("Proposal registered", async () => {
            const result = await VotingInstance.addProposal("Hello World", {from: _voter1});
            await expectEvent(result, "ProposalRegistered", {proposalId: new BN(1)});

        });

        it("Multiple proposal by address is allowed", async () => {
            await VotingInstance.addProposal.call("Proposal 2", {from: _voter1});
            /**rajouter : 
            *const proposal2 = await VotingInstance.getOneProposal.call(2, {from: _voter1});
            *expect(proposal2.description).equal("Proposal 2");
            *expect(proposal2.voteCount).to.be.bignumber.equal(new BN(0));
            */

        });
    });


    // ::::::::::::: VOTE ::::::::::::: //

    describe("Vote", () => {
        beforeEach(async function(){
            VotingInstance= await Voting.new({from: _owner});
            await VotingInstance.addVoter(_voter1);
            await VotingInstance.addVoter(_voter2);
            await VotingInstance.startProposalsRegistering({from: _owner});
            await VotingInstance.addProposal("Hello World",{from: _voter1});
            await VotingInstance.addProposal("Proposal 2",{from: _voter2});
            await VotingInstance.endProposalsRegistering({from: _owner});
            await VotingInstance.startVotingSession({from: _owner});
            await VotingInstance.setVote(0,{from: _voter1});
        });
  
          
        it("Already Vote", async () => { 
            await expectRevert(VotingInstance.setVote(0,{from: _voter1}), "you'are already voted");
        });

        it("Voted", async () => {
            const result = await VotingInstance.setVote(1,{from: _voter1});
            expectEvent(result, 'Voted', {
              voter:_voter1,
              proposalId: new BN(1)
            })
        });  

    });
});
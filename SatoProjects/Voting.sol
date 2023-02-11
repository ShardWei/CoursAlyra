// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";


contract Voting is Ownable {
    struct Voter  {
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
    // Default value is the first element listed in
    // definition of the type, in this case "RegisteringVoters"
    // Returns uint
    // RegisteringVoters ------------- 0
    // ProposalsRegistrationStarted -- 1
    // ProposalsRegistrationEnded ---- 2
    // VotingSessionStarted ---------- 3
    // VotingSessionEnded ------------ 4
    // VotesTallied ------------------ 5
    WorkflowStatus defaultStatus = WorkflowStatus.RegisteringVoters;
    
    
    //event available for Deployed Contracts
    event VoterRegistered(address voterAddress); //The owner registers a whitelist of voters identified by their Ethereum address.
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus); 
    event ProposalsSessionStarted(); //The owner starts proposal recording session
    event ProposalRegistered(uint proposalId); //Registered voters are allowed to register their proposals while the registration session is active.
    event ProposalsSessionEnded(); //The owner terminates the proposal recording session.
    event VotingSessionStarted(); // The owner starts the voting session.
    event Voted (address voter, uint proposalId); //Registered voters vote for their preferred proposal.
    event VotingSessionEnded(); //The owner ends the voting session.
    event VotesTallied(); // The owner counts the votes.
    
    
    mapping  (address => Voter) Votermap;
    mapping (address => uint) votes;
    Proposal[] public proposals;
    
    uint winningProposalId;


    // group of modifiers to limit repetitions
    modifier Whitelisted(address _address) {
        require(Votermap[msg.sender].isRegistered, "This address is unlisted");
        _;
    }
    

    modifier Unlisted(address _address) {
        require(!Votermap[msg.sender].isRegistered, "This address is already whitelisted");
        _;
    }

    
    modifier singleVote(address _address) {   //one vote per address
        require(!Votermap[msg.sender].hasVoted, "The voter has already voted");
        _;
    }
    
    modifier Status(WorkflowStatus status) {  // to check that the voter's action corresponds to the step chosen by the owner
        require(defaultStatus == status, "Now, you can't do that, the owner may change the workflowStatus");
        _;
    }




    // Each voter can see the votes of others
    function getVoter(address _address) public view returns (bool isRegistered,bool hasVoted,uint votedProposalId) {
        return (Votermap[_address].isRegistered,Votermap[_address].hasVoted,Votermap[_address].votedProposalId);
    }


    // Voters Registration by the owner
    function addWhitelist(address _address) public  Unlisted(_address) Status(WorkflowStatus.RegisteringVoters) onlyOwner {
        Votermap[_address].isRegistered = true;
    }



    // Proposal session
    function startProposalRegistration() public onlyOwner Status(WorkflowStatus.RegisteringVoters) {
        emit ProposalsSessionStarted();
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
        defaultStatus = WorkflowStatus.ProposalsRegistrationStarted;
    }

     function addProposal (string memory _description) public Whitelisted(msg.sender) Status(WorkflowStatus.ProposalsRegistrationStarted) {
        proposals.push(Proposal(_description, 0));
    }

    function endProposalRegistration() public onlyOwner Status(WorkflowStatus.ProposalsRegistrationStarted) {
        emit ProposalsSessionEnded();
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
        defaultStatus = WorkflowStatus.ProposalsRegistrationEnded;
    }



    // Voting session

    function startVoting() public onlyOwner Status(WorkflowStatus.ProposalsRegistrationEnded) {
        emit VotingSessionStarted();
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
        defaultStatus = WorkflowStatus.VotingSessionStarted;
    }


    function vote(uint _proposalId) public Whitelisted(msg.sender) singleVote(msg.sender) Status(WorkflowStatus.VotingSessionStarted) {
        Votermap[msg.sender].hasVoted = true;
        Votermap[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;        
        emit Voted(msg.sender, _proposalId);
    }

    function endVoting() public onlyOwner Status(WorkflowStatus.VotingSessionStarted) {
        emit VotingSessionEnded();
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
        defaultStatus = WorkflowStatus.VotingSessionEnded;
    }




    // calculate vote number by proposal
    function countVotes() public onlyOwner Status(WorkflowStatus.VotingSessionEnded) {
        emit VotesTallied();
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        defaultStatus = WorkflowStatus.VotesTallied;

        uint winningCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningCount) {
                winningCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
    }
    


    // winner post
    function getWinner() public view Status(WorkflowStatus.VotesTallied) returns (string memory) {
        return proposals[winningProposalId].description;
    }

}
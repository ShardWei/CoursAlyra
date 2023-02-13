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
    
    
    
    //event available for Deployed Contracts
    event VoterRegistered(address voterAddress); //The owner registers a whitelist of voters identified by their Ethereum address.
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus); 
    event ProposalRegistered(uint proposalId); //Registered voters are allowed to register their proposals while the registration session is active.
    event Voted (address voterAddress, uint proposalId); //Registered voters vote for their preferred proposal.
    
    
    
    mapping  (address => Voter) Votermap;
    Proposal[] public proposals;
    uint winningProposalId;
    WorkflowStatus currentStatus; //to lighten the functions


    // to check if the address is registered
    modifier Whitelisted() {
        require(Votermap[msg.sender].isRegistered, "This address is unlisted");
        _;
    }
    /**
    *
    *
    *
    *
    */

    // to check that the voter's action corresponds to the step chosen by the owner
    function changeWorkflowStatus() private { 
        emit WorkflowStatusChange(currentStatus, WorkflowStatus(uint(currentStatus) + 1));
        currentStatus = WorkflowStatus(uint(currentStatus) + 1);
    }


    // Each voter can see the votes of others
    function getVoter(address _address) external view returns (bool isRegistered,bool hasVoted,uint votedProposalId) {
        return (Votermap[_address].isRegistered,Votermap[_address].hasVoted,Votermap[_address].votedProposalId);
    }

    // to check all proposals registered
    function getProposals() external view Whitelisted returns (Proposal[] memory) {
        return proposals;
    }
    /**
    *
    *
    *
    *
    */

    // Voters Registration by the owner
    function addWhitelist(address _address) external onlyOwner {
        require(currentStatus == WorkflowStatus.RegisteringVoters, "Time isn't to registering voters");
        require(!Votermap[_address].isRegistered, "This address is already whitelisted");
        Votermap[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }
    /**
    *
    *
    *
    *
    */

    // Proposal session
    function startProposalRegistration() external onlyOwner {
        require(currentStatus == WorkflowStatus.RegisteringVoters, "Time isn't to registering voters");
    changeWorkflowStatus();
    }

    function addProposal (string calldata _description) external Whitelisted {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationStarted, "Time isn't to proposals registration");
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length);
    }

    function endProposalRegistration() external onlyOwner {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationStarted, "Time isn't to proposals registration");
        changeWorkflowStatus();
    }
    /**
    *
    *
    *
    *
    *
    */

    // Voting session

    function startVoting() external onlyOwner {
        require(currentStatus == WorkflowStatus.ProposalsRegistrationEnded, "Time isn't to proposals registration");
        changeWorkflowStatus();
    }


    function vote(uint _proposalId) external Whitelisted {
        require(currentStatus == WorkflowStatus.VotingSessionStarted, "Time isn't to vote");
        require(!Votermap[msg.sender].hasVoted, "The voter has already voted");//one vote per address
        Votermap[msg.sender].hasVoted = true;
        Votermap[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;      
        emit Voted(msg.sender, _proposalId);
    }

    function endVoting() external onlyOwner {
        require(currentStatus == WorkflowStatus.VotingSessionStarted, "Time isn't to vote");
        changeWorkflowStatus();
    }
    /*
    *
    *
    *
    *
    *
    */

    // calculate vote number by proposal
    function countVotes() external onlyOwner{
        require(currentStatus == WorkflowStatus.VotingSessionEnded, "Time isn't to vote");

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningProposalId) {
                winningProposalId = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        changeWorkflowStatus();
    }
    

    // winner post
    function getWinner() external view returns (string memory) {
        require(currentStatus == WorkflowStatus.VotesTallied, "Time isn't votetallied");
        return proposals[winningProposalId].description;
    }
    
}
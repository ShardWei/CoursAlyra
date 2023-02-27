const Voting = artifacts.require("./contracts/Voting.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("Voting", accounts => {
  const _owner = accounts[0];
  const _Voter1 = accounts[1];
  const _Voter2 = accounts[3];
  const _Voter3 = accounts[4];
  const _MsgNotOwner = "Ownable: caller is not the owner";
  const _MsgRegisteringCanStarted = "Registering proposals cant be started now";
  const _MsgRegisteringNotStarted = "Registering proposals havent started yet";
  const _MsgRegisteringNotFinished = "Registering proposals phase is not finished";
  const _MsgVotingNotStarted = "Voting session havent started yet";
  const _MsgVotingNotEnded = "Current status is not voting session ended";
  const _MsgAlreadyRegistered = "Already registered";
  const _MsgNotAVoter = "You're not a voter";
  const _MsgProposalNotAllowed ="Proposals are not allowed yet"
  const _MsgRienProposer = "Vous ne pouvez pas ne rien proposer"
  const _MsgVotersRegistrationNotOpen = "Voters registration is not open yet"
  const _MsgAlreadyVoted = "You have already voted"
  const _MsgProposalNotFound = "Proposal not found"

  let VotingInstance;

    describe("Global Testing, owner and modifier",() =>{
      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});
      });

        //Owner testing
        it("Owner of contract", async () => {
          // 1 - We test the contract owner
          expect(await VotingInstance.owner.call()).to.equal(_owner);
        });

        //Voters testing
        it("onlyVoters for getVoter", async () => {
          // 1 - We test the two function, we need to be a voter
          await expectRevert(VotingInstance.getVoter.call(_Voter1), "You're not a voter");
        });

        it("onlyVoters for getOneProposal", async () => {
          // 1 - We test the two function, we need to be a voter
          await expectRevert(VotingInstance.getOneProposal.call(1), "You're not a voter");
        });

        //Onlyowner testing
        it("OnlyOwner for startProposalsRegistering", async () => {
          await expectRevert(VotingInstance.startProposalsRegistering({from: _Voter1}), _MsgNotOwner);
        });

        it("OnlyOwner for endProposalsRegistering", async () => {
          await expectRevert(VotingInstance.endProposalsRegistering({ from: _Voter1}), _MsgNotOwner);
        });

        it("OnlyOwner for startVotingSession", async () => {
          await expectRevert(VotingInstance.endVotingSession({ from: _Voter1}), _MsgNotOwner);
        });

        it("OnlyOwner for endVotingSession", async () => {
          await expectRevert(VotingInstance.endVotingSession({ from: _Voter1}), _MsgNotOwner);
        });

        it("OnlyOwner for tallyVotes", async () => {
          await expectRevert(VotingInstance.tallyVotes({ from: _Voter1}), _MsgNotOwner);
        });
    });

    describe("Status Workflow require",() =>{ 
      before(async function(){
        VotingInstance= await Voting.new({from: _owner});
      });
      
        //State Testing Status change flow
        it("Status Change flow RegisteringVoters for endProposalsRegistering", async () => {
          // 1 - State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
        })

        it("Status Change flow RegisteringVoters for startVotingSession", async () => {
          // 1 - State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
        })

        it("Status Change flow RegisteringVoters for endVotingSession", async () => {
          // 1 - State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
        })

        it("Status Change flow RegisteringVoters for tallyVotes", async () => {
          // 1 - State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
        })

        it("Status Change flow ProposalsRegistrationStarted for startProposalsRegistering", async () => {
          //Change to ProposalsRegistrationStarted
          await VotingInstance.startProposalsRegistering({from: _owner});

          // 2 - State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);
        })  

        it("Status Change flow ProposalsRegistrationStarted for startVotingSession", async () => {
          // 2 - State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
        })  
        
        it("Status Change flow ProposalsRegistrationStarted for endVotingSession", async () => {
          // 2 - State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
        })  

        it("Status Change flow ProposalsRegistrationStarted for tallyVotes", async () => {
          // 2 - State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
        })  

        it("Status Change flow endProposalsRegistering for startProposalsRegistering", async () => {
          //Change to endProposalsRegistering
          await VotingInstance.endProposalsRegistering({from: _owner});

          // 3 - State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
        }) 

        it("Status Change flow endProposalsRegistering for endProposalsRegistering", async () => {
          // 3 - State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession   
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
        }) 

        it("Status Change flow endProposalsRegistering for endVotingSession", async () => {
          // 3 - State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
        }) 

        it("Status Change flow endProposalsRegistering for tallyVotes", async () => {
          // 3 - State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
        }) 

        it("Status Change flow startVotingSession for startProposalsRegistering", async () => {
          //Change to startVotingSession
          await VotingInstance.startVotingSession({from: _owner});

          // 4 - State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);
        })

        it("Status Change flow startVotingSession for endProposalsRegistering", async () => {
          // 4 - State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession    
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
        })

        it("Status Change flow startVotingSession for startVotingSession", async () => {
          // 4 - State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
        })

        it("Status Change flow startVotingSession for tallyVotes", async () => {
          // 4 - State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
        })

        it("Status Change flow endVotingSession for startProposalsRegistering", async () => {
          //Change to endVotingSession
          await VotingInstance.endVotingSession({from: _owner});

          // 5 - State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted); 
        })

        it("Status Change flow endVotingSession for endProposalsRegistering", async () => {
          // 5 - State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes    
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
        })

        it("Status Change flow endVotingSession for startVotingSession", async () => {
          // 5 - State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
        })

        it("Status Change flow endVotingSession for endVotingSession", async () => {
          // 5 - State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
        })

        it("Status Change flow VotesTallied for startProposalsRegistering", async () => {
          //Change to VotesTallied
          await VotingInstance.tallyVotes({from: _owner});

          // 6 - End of status. Impossible to change
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);  
        });

        it("Status Change flow VotesTallied for endProposalsRegistering", async () => {
          // 6 - End of status. Impossible to change   
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
        });

        it("Status Change flow VotesTallied for startVotingSession", async () => {
          // 6 - End of status. Impossible to change
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
        });

        it("Status Change flow VotesTallied for endVotingSession", async () => {
          // 6 - End of status. Impossible to change
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
        });

        it("Status Change flow VotesTallied for tallyVotes", async () => {
          // 6 - End of status. Impossible to change
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
        });
    });

    describe("Status Workflow event",() =>{ 
      before(async function(){
        VotingInstance= await Voting.new({from: _owner});
      });

        //State Testing Status event flow
        it("Status Change events to ProposalsRegistrationStarted", async () => {
          // 1 - Change to ProposalsRegistrationStarted
          const resultstartProposalsRegistering = await VotingInstance.startProposalsRegistering({from: _owner});
          expectEvent(resultstartProposalsRegistering, 'WorkflowStatusChange', {
            previousStatus: new BN(0),
            newStatus: new BN(1)
          });
        });
        
        it("Status Change events to endProposalsRegistering", async () => {
          // 2 - Change to endProposalsRegistering
          const resultendProposalsRegistering = await VotingInstance.endProposalsRegistering({from: _owner});
          expectEvent(resultendProposalsRegistering, 'WorkflowStatusChange', {
            previousStatus: new BN(1),
            newStatus: new BN(2)
          });
        });

        it("Status Change events to startVotingSession", async () => {
          // 3 - Change to startVotingSession
          const resultstartVotingSession = await VotingInstance.startVotingSession({from: _owner});
          expectEvent(resultstartVotingSession, 'WorkflowStatusChange', {
            previousStatus: new BN(2),
            newStatus: new BN(3)
          });
        });

        it("Status Change events to endVotingSession", async () => {
          // 4 - Change to endVotingSession
          const resultendVotingSession = await VotingInstance.endVotingSession({from: _owner});
          expectEvent(resultendVotingSession, 'WorkflowStatusChange', {
            previousStatus: new BN(3),
            newStatus: new BN(4)
          });
        });
        
        it("Status Change events to VotesTallied", async () => {
          // 5 - Change to VotesTallied
          const resulttallyVotes = await VotingInstance.tallyVotes({from: _owner});
          expectEvent(resulttallyVotes, 'WorkflowStatusChange', {
            previousStatus: new BN(4),
            newStatus: new BN(5)
          });
        });
      });

      describe("Status Workflow value",() =>{ 
        before(async function(){
          VotingInstance= await Voting.new({from: _owner});
        });

        //State Testing Status value flow
        it("Status Change Value startProposalsRegistering", async () => {
          // 1 - Change to ProposalsRegistrationStarted
          await VotingInstance.startProposalsRegistering({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(1));
        });

        it("Status Change Value endProposalsRegistering", async () => {
          // 2 - Change to endProposalsRegistering
          await VotingInstance.endProposalsRegistering({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(2));
        });

        it("Status Change Value startVotingSession", async () => {
          // 3 - Change to startVotingSession
          await VotingInstance.startVotingSession({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(3));
        });  

        it("Status Change Value endVotingSession", async () => {  
          // 4 - Change to endVotingSession
          await VotingInstance.endVotingSession({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(4));
        });

        it("Status Change Value tallyVotes", async () => { 
          // 5 - Change to VotesTallied
          await VotingInstance.tallyVotes({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(5));
        });

    });

    describe("WorkflowStatus Addvoter",() =>{
      before(async function(){
        VotingInstance= await Voting.new({from: _owner});

        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1,{from: _owner});
      });

        //Add voter. Check the require WorkflowStatus
        it("Add voter WorkflowStatus startProposalsRegistering", async () => {

          //RegisteringVoters = Add Voter Allowed = No Test

          // 1 - ProposalsRegistrationStarted = Add Voter Not Allowed
          await VotingInstance.startProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
        })

        it("Add voter WorkflowStatus endProposalsRegistering", async () => {
          // 2 - ProposalsRegistrationEnded = Add Voter Not Allowed
          await VotingInstance.endProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
        });

        it("Add voter WorkflowStatus startVotingSession", async () => {
          // 3 - VotingSessionStarted = Add Voter Not Allowed
          await VotingInstance.startVotingSession({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
        });

        it("Add voter WorkflowStatus endVotingSession", async () => {
          // 4 - VotingSessionEnded = Add Voter Not Allowed
          await VotingInstance.endVotingSession({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
        });

        it("Add voter WorkflowStatus tallyVotes", async () => {
          // 5 - VotesTallied = Add Voter Not Allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
        });
    });
    
    describe("WorkflowStatus addProposal",() =>{
      before(async function(){
        VotingInstance= await Voting.new({from: _owner});

        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1,{from: _owner});
      });

      it("Add proposal WorkflowStatus RegisteringVoters", async () => {
        // 1 - RegisteringVoters = proposal not allowed
        await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
      })

      it("Add proposal WorkflowStatus endProposalsRegistering", async () => {
        // 2 - endProposalsRegistering = proposal not allowed
        await VotingInstance.startProposalsRegistering({from: _owner});
        await VotingInstance.endProposalsRegistering({from: _owner});
        await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
      })

      it("Add proposal WorkflowStatus startVotingSession", async () => {
        // 3 - startVotingSession = proposal not allowed
        await VotingInstance.startVotingSession({from: _owner});
        await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
      })

      it("Add proposal WorkflowStatus endVotingSession", async () => {
        // 4 - endVotingSession = proposal not allowed
        await VotingInstance.endVotingSession({from: _owner});
        await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
      })

      it("Add proposal WorkflowStatus VotesTallied", async () => {
        // 5 - VotesTallied = proposal not allowed
        await VotingInstance.tallyVotes({from: _owner});  
        await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
      })
    });

    describe("WorkflowStatus Vote",() =>{
      before(async function(){
        VotingInstance= await Voting.new({from: _owner});

        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1,{from: _owner});
      });
      
      it("Vote WorkflowStatus RegisteringVoters", async () => {
        // 1 - RegisteringVoters = vote not allowed
        await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);
      })

      it("Vote WorkflowStatus ProposalsRegistrationStarted", async () => {
        // 2 - ProposalsRegistrationStarted = vote not allowed
        await VotingInstance.startProposalsRegistering({from: _owner});
        await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);
      })

      it("Vote WorkflowStatus endProposalsRegistering", async () => {
         // 3 - endProposalsRegistering = vote not allowed
         await VotingInstance.endProposalsRegistering({from: _owner});
         await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);
      })

      it("Vote WorkflowStatus endVotingSession", async () => {
          // 4 - startVotingSession = vote allowed = no test
          await VotingInstance.startVotingSession({from: _owner});
          
          // 5 - endVotingSession = vote not allowed
          await VotingInstance.endVotingSession({from: _owner});
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);
      })

      it("Vote WorkflowStatus VotesTallied", async () => {
          // 6 - VotesTallied = vote not allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);  
      })
    });
    
    describe("WorkflowStatus tallyVotes",() =>{
      before(async function(){
        VotingInstance= await Voting.new({from: _owner});

        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1,{from: _owner});
      });

      it("tallyVotes WorkflowStatus RegisteringVoters", async () => {
          // 1 - RegisteringVoters = tallyVotes not allowed
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
      })

      it("tallyVotes WorkflowStatus ProposalsRegistrationStarted", async () => {
          // 2 - ProposalsRegistrationStarted = tallyVotes not allowed
          await VotingInstance.startProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
      })

      it("tallyVotes endProposalsRegistering", async () => {
          // 3 - endProposalsRegistering = tallyVotes not allowed
          await VotingInstance.endProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
      })

      it("tallyVotes WorkflowStatus startVotingSession", async () => {
          // 4 - startVotingSession = tallyVotes not allowed
          await VotingInstance.startVotingSession({from: _owner});
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
      })

      it("tallyVotes WorkflowStatus endVotingSession", async () => {
          // 5 - endVotingSession = tallyVotes allowed = no test
          await VotingInstance.endVotingSession({from: _owner});

          // 6 - VotesTallied = tallyVotes not allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded); 
      })
    });

    
    describe("Function addVoter",() =>{
      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});
        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1);
      });

        //Add voter event
        it("Add voter event", async () => {
          // 1 - We add voter and test emit
          const result = await VotingInstance.addVoter(_Voter2);
          expectEvent(result, 'VoterRegistered', {
            voterAddress: _Voter2
          });
        })

        //Add voter twice
        it("Add double voter", async () => {
          //1 - Double addvoter
          await expectRevert(VotingInstance.addVoter(_Voter1), _MsgAlreadyRegistered);
        })

        //Add voter. if we added the voter
        it("Add voter verification", async () => {
          //1 - If the addVoter working
          let Voter_1 = await VotingInstance.getVoter(_Voter1,{from: _Voter1});
          expect(Voter_1.isRegistered).to.be.true;
        })

      });    

      describe("Function addProposal",() =>{
        beforeEach(async function(){
          VotingInstance= await Voting.new({from: _owner});
          // 1 - We need setup
          await VotingInstance.addVoter(_Voter1,{from: _owner});
          await VotingInstance.startProposalsRegistering({from: _owner});
          await VotingInstance.addProposal("Proposal Test",{from: _Voter1});
        });

        //Add proposal. if we added the proposal, if the proposal is empty
        it("Proposal empty", async () => {
          // 1 - Proposal empty
          await expectRevert(VotingInstance.addProposal("",{from: _Voter1}), _MsgRienProposer);
        })   
        
        //Add proposal event
        it("Proposal event", async () => {
          // 1 - Event
          const result = await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
          expectEvent(result, 'ProposalRegistered', {
            proposalId: new BN(1)
          });
        })    
      }); 

      describe("Function Vote",() =>{
        beforeEach(async function(){
          VotingInstance= await Voting.new({from: _owner});
          // 1 - We need setup
          await VotingInstance.addVoter(_Voter1);
          await VotingInstance.addVoter(_Voter2);
          await VotingInstance.addVoter(_Voter3);
          await VotingInstance.startProposalsRegistering({from: _owner});
          await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
          await VotingInstance.addProposal("Proposal 2",{from: _Voter2});
          await VotingInstance.endProposalsRegistering({from: _owner});
          await VotingInstance.startVotingSession({from: _owner});
          await VotingInstance.setVote(0,{from: _Voter1});
        });

        //Vote. if we vote, already vote
        it("Already Vote", async () => {
          // 1 - Already vote
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgAlreadyVoted);
        })  

        //Vote id exist
        it("Vote for non existing id", async () => {
          // 1 - Vote for not existing id
          await expectRevert(VotingInstance.setVote(10,{from: _Voter2}), _MsgProposalNotFound);
        })
        
        //Vote event
        it("Vote event", async () => {
          // 1 - Event
          const result = await VotingInstance.setVote(1,{from: _Voter3});
          expectEvent(result, 'Voted', {
            voter:_Voter3,
            proposalId: new BN(1)
          });
        })          
      }); 


});
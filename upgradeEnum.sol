// SPDX-License-Identifier: MIT

pragma solidity 0.8.18; 
 
 
 enum WorkflowStatus {
        RegisteringVoters, 
        ProposalsRegistrationStarted, 
        ProposalsRegistrationEnded, 
        VotingSessionStarted, 
        VotingSessionEnded, 
        VotesTallied
    } /**Inscription des électeurs, L'enregistrement des propositions a commencé, Enregistrement des propositions terminé,
        *Session de vote commencée,Session de vote terminée,Votes comptés
        */

    WorkflowStatus public status;


    //You can upgrade to an other enum
    function changeStatus() public {
        status = WorkflowStatus.RegisteringVoters;
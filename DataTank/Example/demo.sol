pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MarketTypes} from "@zondax/filecoin-solidity/contracts/v0.8/types/MarketTypes.sol";
import {MarketAPI} from "@zondax/filecoin-solidity/contracts/v0.8/MarketAPI.sol";

contract DataTankDao {
    // structure to hold proposal details
    struct Proposal {
        uint id;
        uint amount;
        address proposer;
        string ipfsCID;
        uint voteCount;
        uint voteCount2;
        mapping(address => bool) votes;
        mapping(address => bool) votes2;
        bool phase1Approved;
        bool phase2Approved;
        string researchDataIPFS;
        bool isdealverified;
        bytes storageDealProvider;
        uint storageDealExpiry;
        uint storageDealBid;
        uint dealid;
        mapping(address => uint256) rentedBy;
    }
    
    // mapping to store all proposals
    mapping(uint => Proposal) proposals;
    
    // counter to keep track of the proposal id
    uint proposalCounter = 0;

    address public owner;
    ERC20 public token;

    constructor(address _tokenAddress) public {
        owner = msg.sender;
        token = ERC20(_tokenAddress);
    }
    
    // function to submit a proposal
    function submitProposal(uint amount, string memory ipfsCID) public {
        proposals[proposalCounter] = Proposal({
            id: proposalCounter,
            amount: amount,
            proposer: msg.sender,
            ipfsCID: ipfsCID,
            voteCount: 0,
            phase1Approved: false,
            phase2Approved: false,
            researchDataIPFS: "",
            storageDealProvider: address(0),
            
            storageDealExpiry: 0,
            storageDealBid: 0,
            isdealverified: false,
            dealid:0,
            voteCount2:0
        });
        proposalCounter++;
    }
    
    // function to vote on a proposal in phase 1
    function vote(uint id) public {
        
        require(token.balanceOf(msg.sender) > 0, "Only members with a balance in the associated ERC20 token can vote");

        Proposal storage proposal = proposals[id];
        
        // check if the proposal exists
        require(proposal.id == id, "Proposal not found");
        
        // check if the member has already voted
        require(!proposal.votes[msg.sender], "You have already voted on this proposal");
        
        // update the vote count and add the member to the voters list
        proposal.voteCount = proposal.voteCount + token.balanceOf(msg.sender);
        proposal.votes[msg.sender] = true;
        
        // if 80% of members vote in favor, approve the proposal in phase 1
        if (proposal.voteCount >= 0.8 * token.totalSupply()) {
            proposal.phase1Approved = true;
        }
    }
    
    function vote2(uint id) public {
        
        require(token.balanceOf(msg.sender) > 0, "Only members with a balance in the associated ERC20 token can vote");

        Proposal storage proposal = proposals[id];
        
        // check if the proposal exists
        require(proposal.id == id, "Proposal not found");
        require(proposal.phase1Approved == true,"phase1 is not approved");
        // check if the member has already voted
        require(!proposal.votes2[msg.sender], "You have already voted on this proposal");
        require(proposal.isdealverified == true,"deal is not verified");
        
        // update the vote count and add the member to the voters list
        proposal.voteCount2 = proposal.voteCount2 + token.balanceOf(msg.sender);
        proposal.votes2[msg.sender] = true;
        
        // if 80% of members vote in favor, approve the proposal in phase 1
        if (proposal.voteCount2 >= 0.8 * token.totalSupply()) {
            proposal.phase2Approved = true;
        }
    }

    // function to set the research data after phase 1 is approved
    function setResearchData(uint id, string memory researchDataIPFS) public {
        Proposal storage proposal = proposals[id];
        
        // check if the proposal exists
        require(proposal.id == id, "Proposal not found");
        
        // check if the proposal is approved in phase 1
        require(proposal.phase1Approved, "Proposal not approved in phase 1");
        require(proposal.proposer == msg.sender,"Only proposer can change the proposal");
        // set the research data for the proposal
        proposal.researchDataIPFS = researchDataIPFS;
    }


    function verify(uint id,uint64 dealid) public{
        MarketTypes.GetDealDataCommitmentReturn memory commitmentRet = MarketAPI.getDealDataCommitment(MarketTypes.GetDealDataCommitmentParams({id: dealid}));
        require(bytesToString(commitmentRet.data) == proposals[id].researchDataIPFS,"cid not same");
        MarketTypes.GetDealProviderReturn memory providerRet = MarketAPI.getDealProvider(MarketTypes.GetDealProviderParams({id: dealid}));
        proposals[id].dealid = dealid;
        proposals[id].isdealverified = true;
        proposals[id].storageDealProvider = address(bytes32(providerRet.provider).toString()); 
    }


    function bytesToString(bytes memory b) public pure returns (string memory){
        return bytes32(b).toString();
    }
    




    function rentProposal(uint256 proposalId) public payable {
        Proposal memory proposal = proposals[proposalId];
        // check if the proposal exists
        require(proposal.id == proposalId, "Proposal not found");
        
        // check if the proposal is approved in phase 2
        require(proposal.phase2Approved, "Proposal not approved in phase 2");

        require(proposal.amount * 10 / 100 <= msg.value, "You must pay 10% of the proposal reward amount");
        proposal.rentedBy[msg.sender] = 100;
    }
}
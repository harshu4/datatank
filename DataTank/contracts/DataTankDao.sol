pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MarketTypes} from "./lib/filecoin-solidity/contracts/v0.8/types/MarketTypes.sol";
import {MarketAPI, MarketAPIOld} from "./lib/filecoin-solidity/contracts/v0.8/MarketAPI.sol";

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
        uint64 storageDealProvider;
        address payable renewelProvider;
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
        
        Proposal storage newProposal = proposals[proposalCounter];
        newProposal.id = proposalCounter;
        newProposal.amount = amount;
        newProposal.proposer = msg.sender;
        newProposal.ipfsCID = ipfsCID;
        newProposal.voteCount = 0;
        newProposal.phase1Approved = false;
        newProposal.phase2Approved = false;
        newProposal.researchDataIPFS = "";
        newProposal.storageDealProvider = 0;
        newProposal.storageDealExpiry=0;
        newProposal.storageDealBid=0;
        newProposal.isdealverified=false;
        newProposal.dealid=0;
        newProposal.voteCount2=0;
            

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
        if (proposal.voteCount*10 >= 8 * token.totalSupply()) {
            proposal.phase1Approved = true;
        }
    }
    
    function vote2(uint id) public payable {
        
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
        if (proposal.voteCount2*10 >= 8 * token.totalSupply()) {
            proposal.phase2Approved = true;
        }
        payable(proposal.proposer).transfer(proposal.amount);
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
        string memory cidOfData = proposals[id].researchDataIPFS;
        require(keccak256(abi.encodePacked(string(commitmentRet.data)))==keccak256(abi.encodePacked(cidOfData)),"cid not same");
        MarketTypes.GetDealProviderReturn memory providerRet = MarketAPI.getDealProvider(MarketTypes.GetDealProviderParams({id: dealid}));
        proposals[id].dealid = dealid;
        proposals[id].isdealverified = true;
        proposals[id].storageDealProvider = providerRet.provider; 
    }


    function bytesToString(bytes memory b) public pure returns (string memory){
        return string(b);
    }

    function bytesToUint(bytes memory b) internal pure returns (uint256){
        uint256 number;
        for(uint i=0;i<b.length;i++){
            number = number + uint(uint8(b[i]))*(2**(8*(b.length-(i+1))));
        }
        return number;
    }
    
    function checkStorageDealExpiry(uint id) public {
        Proposal storage proposal = proposals[id];

        // check if the proposal exists
        require(proposal.id == id, "Proposal not found");
        
        // check if the proposal is approved in phase 2
        require(proposal.phase2Approved, "Proposal not approved in phase 2");
        
        
        MarketTypes.GetDealTermReturn memory dealTerm = MarketAPIOld.getDealTerm(MarketTypes.GetDealTermParams({id: uint64(proposal.dealid)}));

        // check if the storage deal is near expiry
        require(uint256(uint64(dealTerm.end)) <= block.timestamp + 150, "Storage deal not near expiry");

        // start a timer of 100 blocks
        proposal.storageDealExpiry = block.timestamp + 50;
        
        MarketTypes.GetDealEpochPriceReturn memory epochPrice = MarketAPIOld.getDealTotalPrice(MarketTypes.GetDealEpochPriceParams({id: uint64(proposal.dealid)}));

        uint256 price_uint = bytesToUint(epochPrice.price_per_epoch.val);

        if(proposal.renewelProvider == address(0)){
            proposal.storageDealBid = price_uint;
        }else{
            // check if the new storage deal bid is better than the existing one
            if (price_uint < proposal.storageDealBid) {
                // update the storage deal provider
                proposal.renewelProvider = payable(msg.sender);
                // update the storage deal bid
                proposal.storageDealBid = price_uint;
            }
        }
    }
    
    // function to reward the storage deal provider after the timer expires
    function rewardStorageDealProvider(uint id) public payable {
        // get the proposal details
        Proposal storage proposal = proposals[id];
        // check if the timer has expired
        require(proposal.renewelProvider != address(0), "Renewal not initiated");
        require(block.timestamp >= proposal.storageDealExpiry, "Timer has not yet expired");
        // reward the storage deal provider
        proposal.renewelProvider.transfer(1000000000000000000);
        proposal.renewelProvider = payable(address(0));
    }

    function rentData(uint256 proposalId) public payable {
        Proposal storage proposal = proposals[proposalId];
        // check if the proposal exists
        require(proposal.id == proposalId, "Proposal not found");
        
        // check if the proposal is approved in phase 2
        require(proposal.phase2Approved, "Proposal not approved in phase 2");

        require(proposal.amount * 10 / 100 <= msg.value, "You must pay 10% of the proposal reward amount");
        proposal.rentedBy[msg.sender] = block.timestamp + 10000;
    }
}
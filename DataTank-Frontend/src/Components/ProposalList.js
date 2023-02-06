import React, { useState, useEffect } from "react";
import { Card, Typography, Space } from "antd";
import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import abi from "../contract.js"

const { Title } = Typography;
const {Web3} = (window);
const ProposalCard = ({ proposal }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if(proposal){
      navigate("/proposal", { state: proposal });
    }
  };


  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <Card
        hoverable
        className="w-96 my-3 cursor-pointer"
        style={{
          borderRadius: "10px",
          backgroundColor: "white",
          width:"100%"
        }}
      >
        <Title level={6} className="underline decoration-sky-500 select-none">
          {proposal ? proposal.title : <Skeleton />}
        </Title>
        <Space direction="vertical" size={12}>
          <div className="text-2xl select-none font-semibold underline decoration-pink-500">
            {proposal ? (
              <div>Proposed by: {proposal.proposer}</div>
            ) : (
              <Skeleton width={150} />
            )}
          </div>
          <div className="text-xl font-medium select-none">
            {proposal ? <div>Amount: {proposal.amount}</div> : <Skeleton />}
          </div>
          <Space className="flex justify-between" direction="horizontal">
            <div className="text-lg font-medium select-none">
              {proposal ? (
                <div>Phase1 Approved: {proposal.phase1Approved.toString()}</div>
              ) : (
                <Skeleton width={100} />
              )}
            </div>

            <div className="text-lg font-medium select-none">
              {proposal ? (
                <div>Phase2 Approved: {proposal.phase2Approved.toString()}</div>
              ) : (
                <Skeleton width={100} />
              )}
            </div>
            <div className="text-lg font-medium select-none">
              {proposal ? (
                <div>Vote Count: {proposal.voteCount}</div>
              ) : (
                <Skeleton width={100} />
              )}
            </div>
          </Space>
        </Space>
      </Card>
    </motion.div>
  );
};

const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  //const web3 = useWeb3();

  useEffect(() => {
    // Fetch the proposals using Web3.js
    const fetchProposals = async () => {
      const web3 =  new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      let contract =  new web3.eth.Contract(abi,"0x9156ecC4bA06eC3BdB696c4DCA5676D147CeB8C5")
   
      let proposalCounter = await contract.methods.proposalCounter().call();
      
      
      
      const proposals = [];
      for (let i = 0; i < proposalCounter; i++) {
        let proposaled = await contract.methods.viewProposal(i).call();console.log(proposaled);
        const response = await fetch("https://ipfs.io/ipfs/" + proposaled[3]+ "/proposal.json");
        const joba = await response.json();
        let votes = await contract.methods.viewVotes(i,accounts[0]).call();

      
        const proposal = {
          id: proposaled[0],
          dealid: proposaled[14],
          isdealverified: proposaled[9],
          title: joba.title,
          proposer: proposaled[2],
          amount: proposaled[1],
          phase1Approved:proposaled[6] ,
          phase2Approved:proposaled[7] ,
          researchdataipfs: proposaled[8],
          voteCount: proposaled[4],
          voteCount2: proposaled[5],
          votes : votes[0],
          votes2 : votes[1]
        }; 
        console.log(proposal.phase1Approved)
        proposals.push(proposal);
      }
      setProposals(proposals);
      setLoading(false);
    };
    setTimeout(() => {
      fetchProposals();
    }, 10000);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center w-full">
        <ProposalCard />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
};

export default ProposalList;

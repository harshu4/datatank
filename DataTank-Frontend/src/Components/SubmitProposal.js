import React, { useState } from "react";
import { Form, Input, message, Button, Spin, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Web3Storage } from 'web3.storage'
import abi from "../contract.js"
//import { ethers } from "ethers";
import "./SubmitProposal.css";
//bafybeibnpqpvzn3zf4rxpunhncztpyjtyrsr7vl54durbgdkidrqrg22xa    
const {Web3} = (window);
const tags = ["Financial Data", "Pollution Data", "Stock Data", "Health Data"];
const web3storage = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM4MmM1N2I1M0VEOGY2MEMxMmQxOTE3MzZjMUQ5NWY1MUViZWZiMDMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Mzc2MTY5MzMxNDIsIm5hbWUiOiJUaGV0YSJ9.8DpgeRXRcTyDAn-5IQYS6A0jA5oNQ--pC2ns0eDT7z8" })

function SubmitProposal() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTagSelect = (tag) => {
    setSelectedTags([...selectedTags, tag]);
  };

  const handleTagClose = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const createContract = (web3) => {
    let contract =  new web3.eth.Contract(abi,"0x9156ecC4bA06eC3BdB696c4DCA5676D147CeB8C5")
    return contract;
  }


  const makefile = function makeFileObjects (obj) {
    // You can create File objects from a Blob of binary data
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Blob
    // Here we're just storing a JSON object, but you can store images,
    // audio, or whatever you want!
   
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  
    const files = [
      
      new File([blob], 'proposal.json')
    ]
    return files
  }

  const handleSubmit = async () => {
    if (!title) {
      return message.error("Title is required");
    }
    if (!selectedTags.length) {
      return message.error("At least one tag is required");
    }

    if (!amount.match(/^\d+$/)) {
      message.error("Amount must be a positive integer");
      return;
    }
    setLoading(true);

    //let wallet = ethers.Wallet.createRandom(['21321'])
    //window.comments_publickey = wallet.publicKey
    //window.comments_privatekey = wallet.privateKey
    
    /*let user = await PushAPI.user.create({
      "env": "staging",
      "account": wallet.address
    })
    console.log(user)*/
    const proposalData = { title, tags };

    try {
     const web3 =  new Web3(window.ethereum);
      await window.ethereum.enable();
      const result = makefile(proposalData);
      const proposalDataIpfsCID = await  web3storage.put(result);
      console.log(proposalDataIpfsCID);
      const accounts = await web3.eth.getAccounts();
      let contract = await createContract(web3);
      let ans = await contract.methods.submitProposal(amount, proposalDataIpfsCID).send({ from: accounts[0] });
      setLoading(false);
      message.success('Proposal submitted successfully!');
    } catch (err) {
      setLoading(false);
      message.error(err.message);
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <Form className="bg-white p-10 rounded-lg shadow-lg">
        <Form.Item>
          <Input
            className="w-full border font-bold border-gray-400 rounded-lg rounded-full"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
          />
        </Form.Item>
        <Form.Item>
          <Input
            className="w-full border font-bold border-gray-400 rounded-lg rounded-full"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
          />
        </Form.Item>
        <Form.Item>
          {selectedTags.map((tag) => (
            <Tag
              key={tag}
              className="mr-2 mb-2 font-bold rounded-full"
              closable
              onClose={() => handleTagClose(tag)}
            >
              {tag}
            </Tag>
          ))}
          <Input
            placeholder="Tags"
            className="w-full font-bold border border-gray-400 rounded-lg rounded-full"
            suffix={<PlusOutlined />}
            onPressEnter={(event) => handleTagSelect(event.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
           type="primary"
            className="w-full flex justify-center py-2 items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg "
            onClick={handleSubmit}
          >
            {loading ? (
              <Spin size="small" />
            ) : (
              <span className="font-bold text-xl">Submit Proposal</span>
            )}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SubmitProposal;

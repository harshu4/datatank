import React, { useEffect, useState, useCallback } from "react";
import { Input, Card, Avatar, Button, Modal, Form, message, Spin } from "antd";
import "./DetailProposal.css";
import { useLocation } from "react-router-dom";
import abi from "../contract.js";
import lighthouse from "@lighthouse-web3/sdk";
const { Web3 } = window;
//import * as PushAPI from "@pushprotocol/restapi";

const DetailProposal = () => {
  const [title, setTitle] = useState("");
  const [comments, setComments] = useState([]);
  const [phase1Status, setPhase1Status] = useState(false);
  const [phase2Status, setPhase2Status] = useState(false);
  const [dealverified, setDealverified] = useState(false);
  const location = useLocation();
  const [comment, setComment] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [fileCid, setFileCid] = useState("");
  const [dealId, setDealId] = useState("");
  const [ethaddress, setEth] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");



  useEffect(() => {
    (async () => {
      /*const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );*/
      //await provider.send("eth_requestAccounts", []);
      //const signer = provider.getSigner();
    })();
  }, []);


  const handleall = async(cid,dealid) => {
    setLoading(true)
    setStatus("Submitting uploaded data to DAO");
    console.log(cid)
    const web3 =  new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    let contract =  new web3.eth.Contract(abi,"0x9156ecC4bA06eC3BdB696c4DCA5676D147CeB8C5")
    let ans = await contract.methods.setResearchData(location.state.id,cid).send({ from: accounts[0] })
    setLoading(false)
    message.success('Model Upload done');
    let ans2 = await contract.methods.verify(location.state.id,908).send({ from: accounts[0] })
    message.success('Model Verification done');
  }
  const handleModalSubmit = async () => {
    console.log(fileCid)
    await handleall(fileCid,dealId)
  };

  const handleModal = () => {
    setModalVisible(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleAddComment = () => {
    setComments([...comments, comment]);
    setComment("");
  };
  const handleVote = async () => {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    let contract = new web3.eth.Contract(
      abi,
      "0x9156ecC4bA06eC3BdB696c4DCA5676D147CeB8C5"
    );

    if (phase1Status) {
      let ans = await contract.methods
        .vote2(location.state.id)
        .send({ from: accounts[0] });
    } else {
      let ans = await contract.methods
        .vote(location.state.id)
        .send({ from: accounts[0] });
    }
    message.success('Vote Successfully done');




  }
  useEffect(() => {
    setTitle(location.state.title);
    setDealverified(location.state.isdealverified);
    setPhase1Status(location.state.phase1Approved);
    setPhase2Status(location.state.phase2Approved);
    async function ethsetup() {
      await window.ethereum.enable();
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setEth(accounts[0]);
    }
    ethsetup();
    console.log("the phase one status is ", location.state.phase1approved);
  }, [location.state]);

  return (
    <div className="p-8">
      <Card className="bg-white rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex mb-4">
          <Button
            onClick={handleVote}
            type="primary"
            className="p-2 btn-blue rounded-full flex justify-center py-2 items-center"
            disabled={
              !(
                (!phase1Status && !location.state.votes) ||
                (!phase2Status &&
                  !location.state.votes2 &&
                  location.state.isdealverified)
              )
            }
          >
            Vote
          </Button>
          <Button
            type="primary"
            className="p-2 btn-blue rounded-full ml-2 flex justify-center py-2 items-center"
            disabled={!dealverified}
          >
            Sample Data
          </Button>
          {location.state.proposer == ethaddress && phase1Status ? (
            <>
              <Button
                type="primary"
                className="p-2 btn-blue rounded-full ml-2 flex justify-center py-2 items-center"
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = async (event) => {
                    setLoading(true);
                    setStatus("Reading file...");
                
                    const fileReader = new FileReader();
                    fileReader.onload = async () => {
                      const buffer = fileReader.result;
                
                      setStatus("Uploading to the lighthouse file...");
                      // Your async function logic here
                      //const result = await someAsyncFunction(buffer);
                      setTimeout(async ()=>{
                        await handleall(fileCid,dealId)
                      },5000)
                      /*console.log(lighthouse.uploadBuffer)
                      const uploadResponse = await lighthouse.uploadBuffer(
                        buffer,
                        "ab622721-68d5-4b84-92d4-d60422299381"
                      );*/
                      //console.log(uploadResponse)
                      //setStatus("File processed successfully!");
                      //setLoading(false);
                    };
                    fileReader.readAsArrayBuffer(event.target.files[0]);
                  };
                  input.click();
                }}
              >
                Upload with lighthouse
              </Button>
              <Button
                type="primary"
                className="p-2 btn-blue rounded-full ml-2 flex justify-center py-2 items-center"
                onClick={() => setModalVisible(true)}
              >
                Manual Upload
              </Button>
            </>
          ) : (
            <></>
          )}
        </div>
        <hr size="10" className="my-4 border-solid border-dotted" />
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            {phase1Status ? (
              <Avatar className="bg-green-500" size={24}>
                1
              </Avatar>
            ) : (
              <Avatar size={24}>1</Avatar>
            )}
            <span className="ml-2 font-medium">Phase 1 approved</span>
          </div>
          <div
            style={{ height: 2 }}
            className="my-4 flex-1 border-solid border-dotted border-2 mx-2"
          />
          <div className="flex items-center">
            {dealverified ? (
              <Avatar className="bg-green-500" size={24}>
                2
              </Avatar>
            ) : (
              <Avatar size={24}>2</Avatar>
            )}
            <span className="ml-2 font-medium">Data uploaded</span>
          </div>
          <div
            style={{ height: 2 }}
            className="my-4 flex-1 border-solid border-dotted border-2 mx-2"
          />
          <div className="flex items-center">
            {phase2Status ? (
              <Avatar className="bg-green-500" size={24}>
                3
              </Avatar>
            ) : (
              <Avatar size={24}>3</Avatar>
            )}
            <span className="ml-2 font-medium">Phase 2 approved</span>
          </div>
        </div>
        <Card className="bg-white rounded-lg p-4">
          <Input
            className="mb-4"
            placeholder="Add comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            onClick={handleAddComment}
            type="primary"
            className="p-2 btn-blue rounded-full flex justify-center py-2 items-center "
          >
            Add Comment
          </Button>
        </Card>
        {comments.map((c, i) => (
          <Card key={i} className="bg-white rounded-lg p-4 mt-4">
            <h3 className="text-lg font-bold">
              {window.ethereum.selectedAddress}
            </h3>
            <p className="text-base font-medium">{c}</p>
          </Card>
        ))}
      </Card>
      <Modal
        visible={modalVisible}
        title="Submit The Data"
        onOk={handleModalSubmit}
        onCancel={handleModal}
        footer={[
          <div className="flex">
            <Button
              key="submit"
              type="primary"
              onClick={handleModalSubmit}
              className="p-2 btn-blue rounded-full flex justify-center py-2 items-center"
            >
              Submit
            </Button>
            <Button
              key="back"
              onClick={handleModal}
              type="danger"
              className="p-2 btn-blue rounded-full flex justify-center py-2 items-center"
            >
              Cancel
            </Button>
          </div>,
        ]}
      >
        <Form>
          <Form.Item>
            <Input
              value={fileCid}
              onChange={(e) => setFileCid(e.value)}
              placeholder="Data CID"
            />
            <Input
              value={dealId}
              className="mt-2"
              onChange={(e) => setDealId(e.value)}
              placeholder="DealId"
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal visible={loading}  footer={null}>
        <div className="flex">
        <Spin />
        <p className="text-center ml-4">{status}</p>
        </div>
      </Modal>
    </div>
  );
};

export default DetailProposal;

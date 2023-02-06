import React, { useState } from "react";
import AnimatedButton from "../Components/AnimatedButton";
import AnimatedTitle from "../Components/AnimatedTitle";
import Brush from "../Components/BackgroundBrush";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConnectMetamask = async () => {
    setLoading(true);
    setTimeout(async () => {
      try { 
        // check if metamask is installed
        if (!window.ethereum) {
          throw new Error("Metamask is not installed");
        }
        // connect to metamask
        await window.ethereum.enable();
        // check the current network
        const network = window.ethereum.networkVersion;
        const targetNetwork = 3141;
        if (network !== targetNetwork) {
          // check if filecoin hyperspace network is available
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x" + targetNetwork.toString(16) }],
            });
            navigate("/dashboard");
          } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainName: "Polygon Mainnet",
                    chainId: "0x" + targetNetwork.toString(16),
                    nativeCurrency: {
                      name: "Filecoin Hyperspace",
                      decimals: 18,
                      symbol: "tFIL",
                    },
                    rpcUrls: ["https://api.hyperspace.node.glif.io/rpc/v1"],
                  },
                ],
              });
              navigate("/dashboard");
            } else {
              throw err;
            }
          }
        } else {

          
          console.log("Network exsist!");
          navigate("/dashboard");
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="App" className="flex flex-1 flex-col">
      <div className="flex justify-end py-5 mx-3">
        <AnimatedButton loadingST={loading} onClickCB={handleConnectMetamask} />
      </div>
      <div className="absolute flex w-full" style={{ top: "40%" }}>
        <div className="flex-1"></div>
        <AnimatedTitle />
        <div className="flex-1"></div>
      </div>
      <Brush />
    </div>
  );
}

export default Home;

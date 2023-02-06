import React from "react";
import { useSpring, animated } from "react-spring";
import ProposalList from "../Components/ProposalList";
import SubmitProposal from "../Components/SubmitProposal";

const TabGroup = () => {
  const [activeTab, setActiveTab] = React.useState("Tab 1");

  const { color, background } = useSpring({
    color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
    background: `linear-gradient(to right, 
      rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}), 
      rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}))`,
  });

  const updateColor = () => {
    color.update(c =>
        `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
      );
      background.update(b =>
        `linear-gradient(to right, 
          rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}), 
          rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}))`
      );
  }

  React.useEffect(() => {
    const interval = setInterval(() => {

    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
    <div className="flex content-center w-full justify-center rounded-lg ">
      <animated.div
        style={{ borderColor: color, background: background }}
        className="flex content-center justify-center rounded-full justify-items-center py-2 px-2 my-3 mt-6"
      >
        <button
          className={`rounded-full px-3 py-1 mx-2 border-2  font-bold  ${
            activeTab === "Tab 1"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
          }`}
          onClick={() =>{ 
            updateColor()
            setActiveTab("Tab 1")
          }}
        >
          Proposals
        </button>
        <button
          className={`rounded-full px-3 py-1 mx-2 border-2 font-bold  ${
            activeTab === "Tab 2"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => {
            updateColor()
            setActiveTab("Tab 2")
          }}
        >
          Rent Data
        </button>
        <button
          className={`rounded-full px-3 py-1 mx-2 border-2   font-bold ${
            activeTab === "Tab 3"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => {
            updateColor()
            setActiveTab("Tab 3")}}
        >
          Actor Marketplace
        </button>
        <button
          className={`rounded-full px-3 py-1 mx-2 border-2  font-bold  ${
            activeTab === "Tab 4"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => {
            updateColor()
            setActiveTab("Tab 4")}
          }
        >
          Submit Proposals
        </button>
      </animated.div>
    </div>
    {activeTab=="Tab 1"? <ProposalList/> :<></>}
    {activeTab=="Tab 4"? <SubmitProposal/> :<></>}
    </div>
  );
};

export default TabGroup;


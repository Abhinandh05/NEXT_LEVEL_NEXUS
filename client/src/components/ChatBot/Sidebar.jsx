import React, { useContext } from "react";
import { IoMenu } from "react-icons/io5";
import { FaMessage, FaPlus, FaQuestion } from "react-icons/fa6";
import { MdHistory } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { Context } from "./context/Context";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { onSent, prevPrompt, setRecentPrompt, newChat } = useContext(Context);

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSent(prompt);
    setIsOpen(false); // Auto-close sidebar on mobile after selection
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-screen z-40 bg-[#e4e7eb] w-[250px] sm:flex 
        flex-col justify-between py-6 px-5 transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        sm:translate-x-0 sm:relative sm:w-[250px]
      `}
    >
      {/* Top Section */}
      <div>
        {/* Close Icon for mobile */}
        <div className="sm:hidden mb-4">
          <IoMenu onClick={() => setIsOpen(false)} className="text-2xl cursor-pointer" />
        </div>

        <div
          onClick={() => {
            newChat();
            setIsOpen(false);
          }}
          className="flex items-center gap-3 py-2 px-3 text-sm text-gray-600 bg-gray-300 rounded-full cursor-pointer"
        >
          <FaPlus className="text-xl" />
          <span>New Chat</span>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recent</p>
          <div className="flex flex-col gap-2">
            {prevPrompt?.map((item, index) => (
              <div
                key={index}
                onClick={() => loadPrompt(item)}
                className="flex items-center gap-3 p-2 rounded-full text-gray-700 hover:bg-gray-300 cursor-pointer"
              >
                <FaMessage className="text-xl" />
                <span className="text-sm truncate">{item.slice(0, 18)}...</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-2 rounded-full text-gray-700 hover:bg-gray-300 cursor-pointer">
          <FaQuestion className="text-xl" />
          <span>Help</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-full text-gray-700 hover:bg-gray-300 cursor-pointer">
          <MdHistory className="text-xl" />
          <span>Activity</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-full text-gray-700 hover:bg-gray-300 cursor-pointer">
          <IoSettings className="text-xl" />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

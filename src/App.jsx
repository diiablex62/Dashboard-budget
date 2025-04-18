import React, { useContext } from "react";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import SettingsPanel from "./components/SettingsPanel";
import { AppContext } from "./context/AppContext";
import AppRoutes from "../routes/Routes"; 

export default function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);

  return (
    <div className='flex bg-gray-50'>
      <Sidebar />
      <div className='flex-1 relative'>
        <Navbar />
        <div className='p-6'>
          <AppRoutes /> 
        </div>
        {isSettingsOpen && (
          <div
            className={`absolute top-0 right-0 w-80 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${
              isSettingsOpen ? "translate-x-0" : "translate-x-full"
            }`}>
            <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
          </div>
        )}
      </div>
    </div>
  );
}

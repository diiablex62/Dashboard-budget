import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import SettingsPanel from "./components/SettingsPanel";
import { AppContext } from "./context/AppContext";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);

  return (
    <div className='flex bg-gray-50'>
      <Sidebar />
      <div className='flex-1 relative'>
        <Navbar />
        <div className='p-6'>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/login' element={<Login />} /> 
            <Route path='/register' element={<Register />} />{" /"}
            {/* Route Register */}
          </Routes>
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

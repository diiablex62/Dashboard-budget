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
import Onglet1 from "./pages/Onglet1";
import Onglet2 from "./pages/Onglet2";
import Onglet3 from "./pages/Onglet3";
import Onglet4 from "./pages/Onglet4";
import Onglet5 from "./pages/Onglet5";

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
            <Route path='/register' element={<Register />} />
            <Route path='/onglet1' element={<Onglet1 />} />{" "}
            <Route path='/onglet2' element={<Onglet2 />} />{" "}
            <Route path='/onglet3' element={<Onglet3 />} />{" "}
            <Route path='/onglet4' element={<Onglet4 />} />{" "}
            <Route path='/onglet5' element={<Onglet5 />} />{" "}
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

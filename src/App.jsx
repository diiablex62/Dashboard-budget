import React, { useContext } from "react";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import SettingsPanel from "./components/SettingsPanel";
import { AppContext } from "./context/AppContext"; // Importez le contexte

export default function App() {
  const { isNavbarFixed } = useContext(AppContext); // Vérifiez si la Navbar est fixe

  return (
    <div className='flex bg-gray-50'>
      <Sidebar />
      <div
        className={`flex-1 relative ${
          isNavbarFixed ? "pt-16" : "" // Ajoutez un padding-top si la Navbar est fixe
        }`}
      >
        <Navbar />
        <div className='p-6'>
          <h1 className='text-3xl font-bold mb-6 text-gray-800'>Dashboard</h1>
          <div className='grid grid-cols-3 gap-6'>
            <Card />
            <Card />
            <Card />
          </div>
        </div>
        <SettingsPanel />
      </div>
    </div>
  );
}

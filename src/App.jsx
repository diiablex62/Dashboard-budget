import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import SettingsPanel from "./components/SettingsPanel";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import Onglet1 from "./pages/Onglet1";
import Onglet2 from "./pages/Onglet2";
import Onglet3 from "./pages/Onglet3";
import Onglet4 from "./pages/Onglet4";
import Onglet5 from "./pages/Onglet5";
import {
  AiOutlineHome,
  AiOutlineBell,
  AiOutlineUser,
  AiOutlineSetting,
} from "react-icons/ai"; // Importez les icônes nécessaires

function Navbar() {
  const location = useLocation();

  const titles = {
    "/": "Dashboard",
    "/onglet1": "Onglet 1",
    "/onglet2": "Onglet 2",
    "/onglet3": "Onglet 3",
    "/onglet4": "Onglet 4",
    "/onglet5": "Onglet 5",
  };

  const activeTitle = titles[location.pathname] || "Page inconnue";

  return (
    <div className='p-4 border-b border-gray-200 bg-transparent flex items-center justify-between'>
      <div className='flex items-center space-x-2'>
        <AiOutlineHome className='text-2xl text-gray-600' />{" "}
        {/* Icône "Accueil" */}
        <span className='text-gray-400'>/</span> {/* Séparateur */}
        <h1 className='text-xl font-semibold text-gray-800'>
          {activeTitle}
        </h1>{" "}
        {/* Titre dynamique */}
      </div>
      <div className='flex items-center space-x-4'>
        <AiOutlineBell
          className='text-2xl text-gray-600 cursor-pointer hover:text-gray-800'
          title='Notifications'
        />{" "}
        {/* Icône Notifications */}
        <AiOutlineUser
          className='text-2xl text-gray-600 cursor-pointer hover:text-gray-800'
          title='Mon compte'
        />{" "}
        {/* Icône Mon compte */}
        <AiOutlineSetting
          className='text-2xl text-gray-600 cursor-pointer hover:text-gray-800'
          title='Paramètres'
        />{" "}
        {/* Icône Paramètres */}
      </div>
    </div>
  );
}

export default function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);

  console.log("isSettingsOpen:", isSettingsOpen); // Vérifiez si l'état change

  return (
    <Router>
      <div className='flex bg-gray-50'>
        <Sidebar />
        <div className='flex-1 relative'>
          <Navbar /> {/* Assurez-vous que Navbar est ici */}
          <div className='p-6'>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/onglet1' element={<Onglet1 />} />
              <Route path='/onglet2' element={<Onglet2 />} />
              <Route path='/onglet3' element={<Onglet3 />} />
              <Route path='/onglet4' element={<Onglet4 />} />
              <Route path='/onglet5' element={<Onglet5 />} />
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
    </Router>
  );
}

import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
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
  AiOutlineSearch,
} from "react-icons/ai";

function Navbar() {
  const { activeTitle, setIsSettingsOpen } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const titles = {
    "/": "Dashboard",
    "/onglet1": "Onglet 1",
    "/onglet2": "Onglet 2",
    "/onglet3": "Onglet 3",
    "/onglet4": "Onglet 4",
    "/onglet5": "Onglet 5",
  };

  const excludedRoutes = ["/login", "/register"];
  const currentTitle = excludedRoutes.includes(location.pathname)
    ? ""
    : titles[location.pathname] || "Page inconnue";

  const isLoggedIn = false;

  return (
    <div className='p-4 border-b border-gray-200 bg-transparent flex items-center justify-between'>
      <div className='flex items-center space-x-2'>
        <AiOutlineHome
          className='text-2xl text-gray-600 cursor-pointer'
          onClick={() => navigate("/")}
        />
        {currentTitle && (
          <>
            <span className='text-gray-400'>/</span>
            <h1 className='text-xl font-semibold text-gray-800'>
              {currentTitle}
            </h1>
          </>
        )}
      </div>
      <div className='flex items-center space-x-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Rechercher...'
            className='border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <AiOutlineSearch className='absolute left-3 top-2.5 text-gray-400 text-lg' />
        </div>
        {isLoggedIn && (
          <>
            <AiOutlineBell
              className='text-2xl text-gray-600 cursor-pointer hover:text-gray-800'
              title='Notifications'
            />
            <AiOutlineUser
              className='text-2xl text-gray-600 cursor-pointer hover:text-gray-800'
              title='Mon compte'
            />
          </>
        )}
        <AiOutlineSetting
          className='text-2xl text-gray-600 cursor-pointer hover:text-gray-800'
          title='Paramètres'
          onClick={() => setIsSettingsOpen(true)}
        />
      </div>
    </div>
  );
}

export default function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);

  return (
    <Router>
      <div className='flex bg-gray-50'>
        <Sidebar />
        <div className='flex-1 relative'>
          <Navbar />
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

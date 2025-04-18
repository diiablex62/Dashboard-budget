import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import Onglet1 from "./pages/Onglet1";
import Onglet2 from "./pages/Onglet2";
import Onglet3 from "./pages/Onglet3";
import Onglet4 from "./pages/Onglet4";
import Onglet5 from "./pages/Onglet5";
import Auth from "./pages/Auth";


export default function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);
  const location = useLocation();

  const isolatedRoutes = ["/auth"];
  const isIsolatedRoute = isolatedRoutes.includes(location.pathname);

  return (
    <div className='flex bg-gray-50'>
      {!isIsolatedRoute && <Sidebar />}
      <div
        className={`flex-1 relative ${
          isIsolatedRoute ? "flex items-center justify-center" : ""
        }`}>
        {!isIsolatedRoute && <Navbar />}
        <div className={isIsolatedRoute ? "w-full" : "p-6"}>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/auth' element={<Auth />} />
            <Route path='/onglet1' element={<Onglet1 />} />
            <Route path='/onglet2' element={<Onglet2 />} />
            <Route path='/onglet3' element={<Onglet3 />} />
            <Route path='/onglet4' element={<Onglet4 />} />
            <Route path='/onglet5' element={<Onglet5 />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

import React, { useContext, useEffect } from "react";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const { primaryColor, setPrimaryColor, isLoggedIn } = useContext(AppContext);
  const location = useLocation();

  const isolatedRoutes = ["/auth"];
  const isIsolatedRoute = isolatedRoutes.includes(location.pathname);

  useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor");
    const validPrimaryColor =
      savedColor && savedColor.startsWith("#") && savedColor.length === 7
        ? savedColor
        : primaryColor;

    setPrimaryColor(validPrimaryColor); // Met à jour le contexte
  }, []); // Exécute une seule fois au chargement

  return (
    <div className='flex bg-gray-50'>
      {!isIsolatedRoute && <Sidebar primaryColor={primaryColor} />}
      <div
        className={`flex-1 relative ${
          isIsolatedRoute ? "flex items-center justify-center" : ""
        }`}>
        {!isIsolatedRoute && <Navbar primaryColor={primaryColor} />}
        <div className={isIsolatedRoute ? "w-full" : "p-6"}>
          <Routes>
            <Route
              path='/'
              element={<Dashboard primaryColor={primaryColor} />}
            />
            <Route
              path='/auth'
              element={<Auth primaryColor={primaryColor} />}
            />
            <Route
              path='/onglet1'
              element={<Onglet1 primaryColor={primaryColor} />}
            />
            <Route
              path='/onglet2'
              element={<Onglet2 primaryColor={primaryColor} />}
            />
            <Route
              path='/onglet3'
              element={<Onglet3 primaryColor={primaryColor} />}
            />
            <Route
              path='/onglet4'
              element={<Onglet4 primaryColor={primaryColor} />}
            />
            <Route
              path='/onglet5'
              element={<Onglet5 primaryColor={primaryColor} />}
            />
            <Route
              path='*'
              element={
                <div className='flex items-center justify-center h-screen'>
                  <h1 className='text-2xl font-bold text-red-500'>
                    Page non trouvée
                  </h1>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

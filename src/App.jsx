import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { AppContext } from "./context/AppContext";
import AppRoutes from "../routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const { primaryColor, setPrimaryColor } = useContext(AppContext);
  const location = useLocation();

  const isolatedRoutes = ["/auth"];
  const isIsolatedRoute = isolatedRoutes.includes(location.pathname);

  useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor");
    const validPrimaryColor =
      savedColor && savedColor.startsWith("#") && savedColor.length === 7
        ? savedColor
        : primaryColor;

    setPrimaryColor(validPrimaryColor);
  }, []);

  return (
    <div className='flex bg-gray-50'>
      {!isIsolatedRoute && <Sidebar primaryColor={primaryColor} />}
      <div
        className={`flex-1 relative ${
          isIsolatedRoute ? "flex items-center justify-center" : ""
        }`}>
        {!isIsolatedRoute && <Navbar primaryColor={primaryColor} />}
        <div className={isIsolatedRoute ? "w-full" : "p-6"}>
          <AppRoutes />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

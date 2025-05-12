import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { AppContext } from "./context/AppContext";
import AppRoutes from "../routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";

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
    <div>
      {!isIsolatedRoute && <Sidebar primaryColor={primaryColor} />}
      <div className={isIsolatedRoute ? "" : "ml-72"}>
        {!isIsolatedRoute && <Navbar primaryColor={primaryColor} />}
        <AppRoutes />
      </div>
      <ToastContainer />
      <Analytics />
    </div>
  );
}

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

export default function App() {
  const { primaryColor, setPrimaryColor } = useContext(AppContext);
  const location = useLocation();

  const isolatedRoutes = ["/auth"];
  const isIsolatedRoute = isolatedRoutes.includes(location.pathname);

  const generateColorFromPrimary = (color, adjustment) => {
    if (!color.startsWith("#") || color.length !== 7) {
      console.error("Invalid color format:", color);
      return "#007BFF"; 
    }

    const hexToHSL = (hex) => {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // Achromatique
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const hslToHex = ({ h, s, l }) => {
      s /= 100;
      l /= 100;

      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0,
        g = 0,
        b = 0;

      if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
      } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const hsl = hexToHSL(color);
    hsl.l = Math.max(10, Math.min(90, hsl.l + adjustment)); // Ajuste la luminosité tout en restant dans une plage visible
    return hslToHex(hsl);
  };

  if (typeof window !== "undefined") {
    const savedColor = localStorage.getItem("primaryColor");
    const validPrimaryColor =
      savedColor && savedColor.startsWith("#") && savedColor.length === 7
        ? savedColor
        : "#007BFF"; 

    document.documentElement.style.setProperty(
      "--primary-color",
      validPrimaryColor
    );

    const hoverColor = generateColorFromPrimary(validPrimaryColor, -15);
    document.documentElement.style.setProperty(
      "--primary-hover-color",
      hoverColor
    );

    const lightColor = generateColorFromPrimary(validPrimaryColor, 10);
    document.documentElement.style.setProperty(
      "--primary-light-color",
      lightColor
    );
  }

  useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor");
    const validPrimaryColor =
      savedColor && savedColor.startsWith("#") && savedColor.length === 7
        ? savedColor
        : primaryColor;

    setPrimaryColor(validPrimaryColor); // Met à jour le contexte
  }, []); // Exécute une seule fois au chargement

  const applyColorToDocument = (color) => {
    document.documentElement.style.setProperty("--primary-color", color);

    // Génère une teinte plus foncée pour le hover
    const hoverColor = generateColorFromPrimary(color, -15);
    document.documentElement.style.setProperty(
      "--primary-hover-color",
      hoverColor
    );

    // Génère une teinte plus claire pour d'autres usages si nécessaire
    const lightColor = generateColorFromPrimary(color, 10);
    document.documentElement.style.setProperty(
      "--primary-light-color",
      lightColor
    );
  };

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
          </Routes>
        </div>
      </div>
    </div>
  );
}

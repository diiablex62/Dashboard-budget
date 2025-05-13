import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { AppContext } from "./context/AppContext";
import AppRoutes from "../routes/Routes";

// Composant principal qui utilise les contextes
export default function App() {
  const { primaryColor, setPrimaryColor } = useContext(AppContext);
  const location = useLocation();

  const isolatedRoutes = ["/auth"];
  const isIsolatedRoute = isolatedRoutes.includes(location.pathname);

  useEffect(() => {
    const savedColor = localStorage.getItem("primaryColor");
    const validPrimaryColor =
      savedColor &&
      typeof savedColor === "string" &&
      savedColor.startsWith("#") &&
      (savedColor.length === 7 || savedColor.length === 9);

    if (validPrimaryColor) {
      setPrimaryColor(savedColor);
      document.documentElement.style.setProperty("--primary-color", savedColor);
      // Générer et appliquer la couleur de survol
      const hoverColor = generateHoverColor(savedColor);
      document.documentElement.style.setProperty(
        "--primary-hover-color",
        hoverColor
      );
    }
  }, [setPrimaryColor]);

  const generateHoverColor = (color) => {
    const hexToHSL = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const s =
        max === min
          ? 0
          : l > 0.5
          ? (max - min) / (2 - max - min)
          : (max - min) / (max + min);
      const h =
        max === min
          ? 0
          : max === r
          ? (g - b) / (max - min) + (g < b ? 6 : 0)
          : max === g
          ? (b - r) / (max - min) + 2
          : (r - g) / (max - min) + 4;
      return { h: h * 60, s: s * 100, l: l * 100 };
    };

    const hslToHex = ({ h, s, l }) => {
      const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l / 100 - c / 2;
      const [r, g, b] =
        h < 60
          ? [c, x, 0]
          : h < 120
          ? [x, c, 0]
          : h < 180
          ? [0, c, x]
          : h < 240
          ? [0, x, c]
          : h < 300
          ? [x, 0, c]
          : [c, 0, x];
      return `#${[r, g, b]
        .map((v) =>
          Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, "0")
        )
        .join("")}`;
    };

    const hsl = hexToHSL(color);
    hsl.l = Math.max(10, Math.min(90, hsl.l - 15));
    return hslToHex(hsl);
  };

  return (
    <div className='app'>
      {!isIsolatedRoute && <Sidebar primaryColor={primaryColor} />}
      <div className={isIsolatedRoute ? "" : "ml-72"}>
        {!isIsolatedRoute && <Navbar primaryColor={primaryColor} />}
        <AppRoutes />
      </div>
    </div>
  );
}

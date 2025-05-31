import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./components/navigation/Sidebar";
// import Navbar from "./components/navigation/Navbar"; // supprimé
import SettingsPanel from "./components/ui/SettingsPanel";
import { AppContext } from "./context/AppContext";
import AppRoutes from "./routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

// Composant principal qui utilise les contextes
export default function App() {
  const { primaryColor, setPrimaryColor, isSettingsOpen, setIsSettingsOpen } =
    useContext(AppContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

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

  useEffect(() => {
    const titles = [
      "Futurio : Gestion de budget",
      "Futurio : Gérez votre budget facilement",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      document.title = titles[idx % titles.length];
      idx++;
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
    <AuthProvider>
      <div className='app bg-white dark:bg-black min-h-screen'>
        {!isIsolatedRoute && (
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        )}
        <div
          className={
            isIsolatedRoute
              ? ""
              : (isCollapsed ? "ml-20" : "ml-72") +
                " relative bg-[#f8fafc] min-h-screen transition-all duration-300 ease-in-out rounded-l-3xl overflow-hidden"
          }>
          {/* {!isIsolatedRoute && <Navbar primaryColor={primaryColor} />} */}
          <AppRoutes />
        </div>
        {isSettingsOpen && (
          <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
        )}
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
        />
      </div>
    </AuthProvider>
  );
}

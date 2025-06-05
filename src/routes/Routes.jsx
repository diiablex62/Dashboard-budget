import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import DepensesRevenus from "../pages/DepensesRevenus";
import PaiementRecurrent from "../pages/PaiementRecurrent";
import PaiementEchelonne from "../pages/PaiementEchelonne";
import Agenda from "../pages/Agenda";
import Auth from "../pages/Auth";
import AuthConfirm from "../pages/AuthConfirm";
import Validation from "../pages/Validation";
import Profil from "../pages/Profil";
import Notifications from "../pages/Notifications";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import UserDataDeletion from "../pages/UserDataDeletion";
import NotFound from "../pages/404NotFound";
import ScrollToTop from "../components/ScrollToTop";

// Composant pour les routes publiques qui ne doivent pas être accessibles si connecté
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
}

// Composant pour les routes protégées
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  // Si non connecté, on redirige vers /dashboard
  if (!isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  // Si connecté, on affiche le contenu protégé
  return children;
}

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Route racine - dashboard accessible à tous */}
        <Route path='/' element={<Dashboard />} />
        <Route path='/dashboard' element={<Dashboard />} />

        {/* Routes publiques qui ne doivent pas être accessibles si connecté */}
        <Route
          path='/auth'
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path='/validation'
          element={
            <PublicRoute>
              <Validation />
            </PublicRoute>
          }
        />

        {/* Routes publiques accessibles à tous */}
        <Route path='/conditions-generales-dutilisation' element={<Terms />} />
        <Route
          path='/politique-de-confidentialite'
          element={<PrivacyPolicy />}
        />
        <Route path='/suppression-des-donnees' element={<UserDataDeletion />} />

        {/* Routes accessibles à tous sauf profil */}
        <Route path='/depenses-revenus' element={<DepensesRevenus />} />
        <Route path='/agenda' element={<Agenda />} />
        <Route path='/recurrents' element={<PaiementRecurrent />} />
        <Route path='/echelonne' element={<PaiementEchelonne />} />
        <Route path='/notifications' element={<Notifications />} />

        {/* Route protégée - uniquement profil */}
        <Route
          path='/profil'
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />

        {/* Routes d'authentification */}
        <Route
          path='/auth/confirm'
          element={
            <PublicRoute>
              <AuthConfirm />
            </PublicRoute>
          }
        />

        {/* Route 404 - doit être la dernière route */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

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

  // On retourne simplement les enfants sans redirection
  return children;
}

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Route racine - redirection vers dashboard */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

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

        {/* Routes protégées */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/depenses-revenus'
          element={
            <ProtectedRoute>
              <DepensesRevenus />
            </ProtectedRoute>
          }
        />
        <Route
          path='/agenda'
          element={
            <ProtectedRoute>
              <Agenda />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profil'
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
        <Route
          path='/recurrents'
          element={
            <ProtectedRoute>
              <PaiementRecurrent />
            </ProtectedRoute>
          }
        />
        <Route
          path='/echelonne'
          element={
            <ProtectedRoute>
              <PaiementEchelonne />
            </ProtectedRoute>
          }
        />
        <Route
          path='/notifications'
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Routes d'authentification */}
        <Route path='/auth/confirm' element={<AuthConfirm />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

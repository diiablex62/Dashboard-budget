import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import IfUserConnected from "./components/auth/IfUserConnected";
import Auth from "./pages/Auth";
import Profil from "./pages/Profil";
import Dashboard from "./pages/Dashboard";
import DepensesRevenus from "./pages/DepensesRevenus";
import Recurrents from "./pages/Recurrents";
import PaiementEchelonne from "./pages/PaiementEchelonne";
import Agenda from "./pages/Agenda";
import Notifications from "./pages/Notifications";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UserDataDeletion from "./pages/UserDataDeletion";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path='/auth' element={<Auth />} />
      <Route path='/conditions-generales-dutilisation' element={<Terms />} />
      <Route path='/politique-de-confidentialite' element={<PrivacyPolicy />} />
      <Route path='/suppression-des-donnees' element={<UserDataDeletion />} />

      {/* Routes protégées */}
      <Route
        path='/profil'
        element={
          <IfUserConnected>
            <Profil />
          </IfUserConnected>
        }
      />
      <Route
        path='/dashboard'
        element={
          <IfUserConnected>
            <Dashboard />
          </IfUserConnected>
        }
      />
      <Route
        path='/depenses-revenus'
        element={
          <IfUserConnected>
            <DepensesRevenus />
          </IfUserConnected>
        }
      />
      <Route
        path='/recurrents'
        element={
          <IfUserConnected>
            <Recurrents />
          </IfUserConnected>
        }
      />
      <Route
        path='/echelonne'
        element={
          <IfUserConnected>
            <PaiementEchelonne />
          </IfUserConnected>
        }
      />
      <Route
        path='/agenda'
        element={
          <IfUserConnected>
            <Agenda />
          </IfUserConnected>
        }
      />
      <Route
        path='/notifications'
        element={
          <IfUserConnected>
            <Notifications />
          </IfUserConnected>
        }
      />

      {/* Route par défaut */}
      <Route path='/' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}

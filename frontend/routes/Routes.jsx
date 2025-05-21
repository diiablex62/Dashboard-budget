import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import Profil from "../src/pages/Profil";
import Agenda from "../src/pages/Agenda";
import PaiementRecurrent from "../src/pages/PaiementRecurrent";
import PaiementEchelonne from "../src/pages/PaiementEchelonne";
import Notifications from "../src/pages/Notifications";
import Auth from "../src/pages/Auth";
import AuthConfirm from "../src/pages/AuthConfirm";
import PrivacyPolicy from "../src/pages/PrivacyPolicy";
import UserDataDeletion from "../src/pages/UserDataDeletion";
import Terms from "../src/pages/Terms";
import DepensesRevenus from "../src/pages/DepensesRevenus";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes d'authentification */}
      <Route path='/auth' element={<Auth />} />
      <Route path='/auth/confirm' element={<AuthConfirm />} />

      {/* Routes légales */}
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
      <Route path='/privacy' element={<PrivacyPolicy />} />
      <Route path='/user-data-deletion' element={<UserDataDeletion />} />
      <Route path='/terms' element={<Terms />} />

      {/* Routes principales sous /budget */}
      <Route path='/budget' element={<Dashboard />} />
      <Route path='/budget/users' element={<Profil />} />
      <Route path='/budget/agenda' element={<Agenda />} />
      <Route path='/budget/recurrents' element={<PaiementRecurrent />} />
      <Route path='/budget/echelonne' element={<PaiementEchelonne />} />
      <Route path='/budget/notifications' element={<Notifications />} />
      <Route path='/budget/depenses-revenus' element={<DepensesRevenus />} />

      <Route path='*' element={<Navigate to='/budget' replace />} />
    </Routes>
  );
}

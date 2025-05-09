import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import Profil from "../src/pages/Profil";
import Agenda from "../src/pages/Agenda";
import PaiementRecurrent from "../src/pages/PaiementRecurrent";
import PaiementEchelonne from "../src/pages/PaiementEchelonne";
import Notifications from "../src/pages/Notifications";
import Auth from "../src/pages/Auth";
import PrivacyPolicy from "../src/pages/PrivacyPolicy";
import UserDataDeletion from "../src/pages/UserDataDeletion";
import Terms from "../src/pages/Terms";

// Utilise des URLs explicites pour chaque page
export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/profil' element={<Profil />} />
      <Route path='/agenda' element={<Agenda />} />
      <Route path='/paiements-recurrents' element={<PaiementRecurrent />} />
      <Route path='/paiements-echelonnes' element={<PaiementEchelonne />} />
      <Route path='/notifications' element={<Notifications />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
      <Route path='/privacy' element={<PrivacyPolicy />} />
      <Route path='/user-data-deletion' element={<UserDataDeletion />} />
      <Route path='/terms' element={<Terms />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

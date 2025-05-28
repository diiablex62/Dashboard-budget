import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Redirection de la racine vers /dashboard */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

        {/* Routes principales */}
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/depenses-revenus' element={<DepensesRevenus />} />
        <Route path='/recurrents' element={<PaiementRecurrent />} />
        <Route path='/echelonne' element={<PaiementEchelonne />} />
        <Route path='/agenda' element={<Agenda />} />

        {/* Routes d'authentification */}
        <Route path='/auth' element={<Auth />} />
        <Route path='/auth/confirm' element={<AuthConfirm />} />
        <Route path='/validation' element={<Validation />} />

        {/* Routes utilisateur */}
        <Route path='/profil' element={<Profil />} />
        <Route path='/notifications' element={<Notifications />} />

        {/* Routes légales */}
        <Route path='/terms' element={<Terms />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/user-data-deletion' element={<UserDataDeletion />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

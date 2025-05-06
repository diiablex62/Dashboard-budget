import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import Onglet1 from "../src/pages/Onglet1";
import Onglet2 from "../src/pages/Onglet2";
import PaiementRecurrent from "../src/pages/PaiementRecurrent";
import PaiementXfois from "../src/pages/PaiementXfois";
import Notifications from "../src/pages/Notifications";
import Auth from "../src/pages/Auth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/onglet1' element={<Onglet1 />} />
      <Route path='/onglet2' element={<Onglet2 />} />
      <Route path='/onglet3' element={<PaiementRecurrent />} />
      <Route path='/onglet4' element={<PaiementXfois />} />
      <Route path='/onglet5' element={<Notifications />} />
    </Routes>
  );
}

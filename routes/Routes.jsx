import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import Login from "../src/pages/_Login";
import Register from "../src/pages/_Register";
import Onglet1 from "../src/pages/Onglet1";
import Onglet2 from "../src/pages/Onglet2";
import Onglet3 from "../src/pages/Onglet3";
import Onglet4 from "../src/pages/Onglet4";
import Onglet5 from "../src/pages/Onglet5";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/onglet1' element={<Onglet1 />} />
      <Route path='/onglet2' element={<Onglet2 />} />
      <Route path='/onglet3' element={<Onglet3 />} />
      <Route path='/onglet4' element={<Onglet4 />} />
      <Route path='/onglet5' element={<Onglet5 />} />
    </Routes>
  );
}

import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

export default function Echelonne() {
  const { getData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Utiliser getData pour les données
  const paiementsEchelonnes = getData([]);

  // ... rest of the code ...
}

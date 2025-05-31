import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

export default function Recurrents() {
  const { getData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Utiliser getData pour les données
  const paiementsRecurrents = getData([]);

  // ... rest of the code ...
}

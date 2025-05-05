import React, { createContext, useState } from "react";

export const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [paiements, setPaiements] = useState([]);
  const [recurringDepenses, setRecurringDepenses] = useState([]);
  const [recurringRevenus, setRecurringRevenus] = useState([]);

  // Ajout pour le calendrier :
  const [calendarDepenses, setCalendarDepenses] = useState([]);
  const [calendarRevenus, setCalendarRevenus] = useState([]);

  const addPaiement = (paiement) => {
    setPaiements((prev) => [...prev, paiement]);
  };

  const removePaiement = (index) => {
    setPaiements((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addRecurringDepense = (depense) => {
    setRecurringDepenses((prev) => [...prev, depense]);
  };

  const addRecurringRevenu = (revenu) => {
    setRecurringRevenus((prev) => [...prev, revenu]);
  };

  // Ajoute une dépense au calendrier
  const addCalendarDepense = (depense) => {
    setCalendarDepenses((prev) => [...prev, depense]);
  };

  // Ajoute un revenu au calendrier
  const addCalendarRevenu = (revenu) => {
    setCalendarRevenus((prev) => [...prev, revenu]);
  };

  return (
    <BudgetContext.Provider
      value={{
        paiements,
        addPaiement,
        removePaiement,
        recurringDepenses,
        addRecurringDepense,
        recurringRevenus,
        addRecurringRevenu,
        // Ajout pour le calendrier :
        calendarDepenses,
        addCalendarDepense,
        calendarRevenus,
        addCalendarRevenu,
      }}>
      {children}
    </BudgetContext.Provider>
  );
}

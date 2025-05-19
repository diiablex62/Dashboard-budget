import React, { createContext, useState } from "react";

export const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [paiements, setPaiements] = useState([]);
  const [recurringDepenses, setRecurringDepenses] = useState([]);
  const [recurringRevenus, setRecurringRevenus] = useState([]);

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
      }}>
      {children}
    </BudgetContext.Provider>
  );
}

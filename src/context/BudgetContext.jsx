import React, { createContext, useState } from "react";

export const BudgetContext = createContext();

export function BudgetProvider({ children }) {
  const [paiements, setPaiements] = useState([]);

  // Ajoutez ici d'autres variables globales de budget si besoin

  const addPaiement = (paiement) => {
    setPaiements((prev) => [...prev, paiement]);
  };

  const removePaiement = (index) => {
    setPaiements((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <BudgetContext.Provider
      value={{
        paiements,
        addPaiement,
        removePaiement,
        // Ajoutez ici d'autres setters/getters globaux
      }}>
      {children}
    </BudgetContext.Provider>
  );
}

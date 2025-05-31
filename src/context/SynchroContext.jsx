import React, { createContext, useState, useContext, useEffect } from "react";

export const SynchroContext = createContext();

export function SynchroProvider({ children }) {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem("balance");
    return savedBalance
      ? JSON.parse(savedBalance)
      : { amount: 0, adjustments: [] };
  });

  useEffect(() => {
    localStorage.setItem("balance", JSON.stringify(balance));
  }, [balance]);

  const updateBalance = (newAmount, reason) => {
    const adjustment = {
      date: new Date().toISOString(),
      previousAmount: balance.amount,
      newAmount,
      difference: newAmount - balance.amount,
      reason,
    };

    setBalance((prev) => ({
      amount: newAmount,
      adjustments: [...prev.adjustments, adjustment],
    }));
  };

  const getBalanceHistory = () => {
    return balance.adjustments;
  };

  const getLastAdjustment = () => {
    return balance.adjustments[balance.adjustments.length - 1];
  };

  return (
    <SynchroContext.Provider
      value={{
        balance: balance.amount,
        updateBalance,
        getBalanceHistory,
        getLastAdjustment,
      }}>
      {children}
    </SynchroContext.Provider>
  );
}

export const useSynchro = () => {
  const context = useContext(SynchroContext);
  if (!context) {
    throw new Error("useSynchro must be used within a SynchroProvider");
  }
  return context;
};

import React, { createContext, useState, useContext, useEffect } from "react";

export const BalanceContext = createContext();

export function BalanceProvider({ children }) {
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
    <BalanceContext.Provider
      value={{
        balance: balance.amount,
        updateBalance,
        getBalanceHistory,
        getLastAdjustment,
      }}>
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};

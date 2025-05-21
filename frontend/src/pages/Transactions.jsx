import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";

const Transactions = () => {
  const { primaryColor } = useContext(AppContext);
  const { isDarkMode } = useContext(ThemeContext);

  const transactions = [
    {
      id: 1,
      description: "Salaire",
      amount: 2500,
      type: "revenu",
      date: "2024-03-01",
      category: "Salaire",
    },
    {
      id: 2,
      description: "Loyer",
      amount: 800,
      type: "depense",
      date: "2024-03-05",
      category: "Logement",
    },
    {
      id: 3,
      description: "Courses",
      amount: 150,
      type: "depense",
      date: "2024-03-10",
      category: "Alimentation",
    },
  ];

  return (
    <div className='p-6'>
      <h1
        className={`text-2xl font-bold mb-6 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}>
        Transactions
      </h1>

      <div
        className={`p-6 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}>
                <th
                  className={`text-left py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  Date
                </th>
                <th
                  className={`text-left py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  Description
                </th>
                <th
                  className={`text-left py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  Catégorie
                </th>
                <th
                  className={`text-right py-3 px-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}>
                  <td
                    className={`py-3 px-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    {transaction.date}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                    {transaction.description}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    {transaction.category}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      transaction.type === "revenu"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                    {transaction.type === "revenu" ? "+" : "-"}
                    {transaction.amount.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

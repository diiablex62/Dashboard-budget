import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Card from "../components/Card"; 

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Transactions"));
        const data = querySnapshot.docs.map((doc) => doc.data());
        setTransactions(data);

        // Calculez les totaux
        const income = data
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = data
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        setTotalIncome(income);
        setTotalExpense(expense);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des transactions :",
          error
        );
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Tableau de bord</h1>
      <div className='grid grid-cols-3 gap-4'>
        <Card
          title='Revenus'
          description={`+${totalIncome} €`}
          icon={<span className='text-green-500 text-3xl'>€</span>}
        />
        <Card
          title='Dépenses'
          description={`-${totalExpense} €`}
          icon={<span className='text-red-500 text-3xl'>€</span>}
        />
        <Card
          title='Solde'
          description={`${totalIncome - totalExpense} €`}
          icon={<span className='text-blue-500 text-3xl'>€</span>}
        />
        <Card title='Carte 1' description='' />
        <Card title='Carte 2' description='' />
        <Card title='Carte 3' description='' />
      </div>
    </div>
  );
}

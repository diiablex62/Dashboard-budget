import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Sector,
  LineChart,
  Line,
} from "recharts";
import {
  transactionApi,
  recurrentPaymentApi,
  installmentPaymentApi,
} from "../utils/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paiements récurrents
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);
  const [totalRecurrents, setTotalRecurrents] = useState(0);

  // Paiements échelonnés
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState([]);
  const [totalEchelonnes, setTotalEchelonnes] = useState(0);

  // Dépenses
  const [totalDepensesMois, setTotalDepensesMois] = useState(0);
  const [totalDepensesMoisPrecedent, setTotalDepensesMoisPrecedent] =
    useState(0);

  // Revenus
  const [totalRevenusMois, setTotalRevenusMois] = useState(0);
  const [totalRevenusMoisPrecedent, setTotalRevenusMoisPrecedent] = useState(0);

  // Variables d'état pour les graphiques
  const [budgetData, setBudgetData] = useState([]);
  const [depensesTotalesData, setDepensesTotalesData] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await transactionApi.getTransactions();
      if (!response?.data)
        throw new Error("Format de réponse invalide pour les transactions");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      throw error;
    }
  }, []);

  const fetchRecurrentPayments = useCallback(async () => {
    try {
      const response = await recurrentPaymentApi.getRecurrentPayments();
      if (!response?.data)
        throw new Error(
          "Format de réponse invalide pour les paiements récurrents"
        );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements récurrents:",
        error
      );
      throw error;
    }
  }, []);

  const fetchInstallmentPayments = useCallback(async () => {
    try {
      const response = await installmentPaymentApi.getInstallmentPayments();
      if (!response?.data)
        throw new Error(
          "Format de réponse invalide pour les paiements échelonnés"
        );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements échelonnés:",
        error
      );
      throw error;
    }
  }, []);

  const calculateMonthlyTotals = useCallback((transactionsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const transactionsMoisCourant = transactionsData.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const depensesMoisCourant = transactionsMoisCourant
      .filter((t) => t.type === "depense")
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);

    const revenusMoisCourant = transactionsMoisCourant
      .filter((t) => t.type === "revenu")
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);

    return {
      depensesMoisCourant,
      revenusMoisCourant,
      transactionsMoisCourant,
    };
  }, []);

  const prepareChartData = useCallback(
    (transactionsData, transactionsMoisCourant) => {
      // Données pour le graphique en camembert
      const categories = [
        ...new Set(transactionsMoisCourant.map((t) => t.categorie)),
      ];
      const depensesParCategorie = categories.map((categorie) => ({
        name: categorie,
        value: transactionsMoisCourant
          .filter((t) => t.type === "depense" && t.categorie === categorie)
          .reduce((acc, t) => acc + parseFloat(t.montant), 0),
      }));

      // Données pour le graphique d'évolution
      const mois = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      const evolutionData = mois.map((date) => {
        const transactionsDuMois = transactionsData.filter((t) => {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getMonth() === date.getMonth() &&
            transactionDate.getFullYear() === date.getFullYear()
          );
        });

        return {
          mois: date.toLocaleString("fr-FR", { month: "short" }),
          depenses: transactionsDuMois
            .filter((t) => t.type === "depense")
            .reduce((acc, t) => acc + parseFloat(t.montant), 0),
          revenus: transactionsDuMois
            .filter((t) => t.type === "revenu")
            .reduce((acc, t) => acc + parseFloat(t.montant), 0),
        };
      });

      return {
        depensesParCategorie,
        evolutionData,
      };
    },
    []
  );

  const fetchAll = useCallback(async () => {
    if (!user) {
      console.log("Pas d'utilisateur connecté");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Session expirée, veuillez vous reconnecter");
      }

      // Récupération parallèle des données
      const [transactionsData, recurrentsData, echelonnesData] =
        await Promise.all([
          fetchTransactions(),
          fetchRecurrentPayments(),
          fetchInstallmentPayments(),
        ]);

      setTransactions(transactionsData);
      setPaiementsRecurrents(recurrentsData);
      setPaiementsEchelonnes(echelonnesData);

      // Calcul des totaux
      const {
        depensesMoisCourant,
        revenusMoisCourant,
        transactionsMoisCourant,
      } = calculateMonthlyTotals(transactionsData);

      setTotalDepensesMois(depensesMoisCourant);
      setTotalRevenusMois(revenusMoisCourant);
      setTotalRecurrents(
        recurrentsData.reduce((acc, p) => acc + parseFloat(p.montant), 0)
      );
      setTotalEchelonnes(
        echelonnesData.reduce((acc, p) => acc + parseFloat(p.montant), 0)
      );

      // Préparation des données pour les graphiques
      const { depensesParCategorie, evolutionData } = prepareChartData(
        transactionsData,
        transactionsMoisCourant
      );

      setDepensesTotalesData(depensesParCategorie);
      setBudgetData(evolutionData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      if (error.message === "Session expirée, veuillez vous reconnecter") {
        setError(error.message);
        navigate("/login");
      } else if (error.response) {
        setError(
          `Erreur serveur: ${error.response.data?.message || "Erreur inconnue"}`
        );
      } else if (error.request) {
        setError(
          "Impossible de contacter le serveur, veuillez réessayer plus tard"
        );
      } else {
        setError("Erreur lors du chargement des données");
      }
    } finally {
      setLoading(false);
    }
  }, [
    user,
    navigate,
    fetchTransactions,
    fetchRecurrentPayments,
    fetchInstallmentPayments,
    calculateMonthlyTotals,
    prepareChartData,
  ]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const handleDataUpdate = () => fetchAll();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-32 bg-gray-200 rounded'></div>
            ))}
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='h-96 bg-gray-200 rounded'></div>
            <div className='h-96 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6'>Tableau de bord</h1>

      {/* Cartes de résumé */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Dépenses du mois</p>
              <p className='text-2xl font-bold'>
                {totalDepensesMois.toFixed(2)} €
              </p>
            </div>
            <AiOutlineDollarCircle className='text-red-500 text-2xl' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Revenus du mois</p>
              <p className='text-2xl font-bold'>
                {totalRevenusMois.toFixed(2)} €
              </p>
            </div>
            <AiOutlineRise className='text-green-500 text-2xl' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Paiements récurrents</p>
              <p className='text-2xl font-bold'>
                {totalRecurrents.toFixed(2)} €
              </p>
            </div>
            <AiOutlineCreditCard className='text-blue-500 text-2xl' />
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500'>Paiements échelonnés</p>
              <p className='text-2xl font-bold'>
                {totalEchelonnes.toFixed(2)} €
              </p>
            </div>
            <FaCalendarAlt className='text-purple-500 text-2xl' />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Graphique d'évolution */}
        <div className='bg-white rounded-lg shadow p-4'>
          <h2 className='text-lg font-semibold mb-4'>
            Évolution des dépenses et revenus
          </h2>
          <div className='h-80'>
            {budgetData && budgetData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={budgetData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='mois' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='depenses'
                    stroke='#ef4444'
                    name='Dépenses'
                  />
                  <Line
                    type='monotone'
                    dataKey='revenus'
                    stroke='#22c55e'
                    name='Revenus'
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Graphique de répartition des dépenses */}
        <div className='bg-white rounded-lg shadow p-4'>
          <h2 className='text-lg font-semibold mb-4'>
            Répartition des dépenses par catégorie
          </h2>
          <div className='h-80'>
            {depensesTotalesData && depensesTotalesData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={depensesTotalesData}
                    dataKey='value'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    label>
                    {depensesTotalesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${index * 45}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex items-center justify-center h-full text-gray-500'>
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
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

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E42",
  "#EF4444",
  "#A855F7",
  "#F472B6",
  "#FACC15",
  "#14B8A6",
];

// Données factices pour les transactions
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const fakeTransactions = [
  {
    id: 1,
    nom: "Loyer",
    montant: 700,
    categorie: "Logement",
    date: `${year}-${month}-01`,
    type: "depense",
  },
  {
    id: 2,
    nom: "Courses",
    montant: 220.5,
    categorie: "Alimentation",
    date: `${year}-${month}-03`,
    type: "depense",
  },
  {
    id: 3,
    nom: "Salaire",
    montant: 2100,
    categorie: "Salaire",
    date: `${year}-${month}-01`,
    type: "revenu",
  },
  {
    id: 4,
    nom: "Vente Vinted",
    montant: 45,
    categorie: "Ventes",
    date: `${year}-${month}-10`,
    type: "revenu",
  },
];

// Données factices pour les paiements récurrents
const fakePaiements = [
  {
    id: 1,
    nom: "Netflix",
    categorie: "Divertissement",
    montant: 14.99,
    frequence: "Mensuel",
    date: `${year}-${month}-15`,
    type: "depense",
  },
  {
    id: 2,
    nom: "Spotify",
    categorie: "Divertissement",
    montant: 9.99,
    frequence: "Mensuel",
    date: `${year}-${month}-20`,
    type: "depense",
  },
  {
    id: 3,
    nom: "Salaire principal",
    categorie: "Salaire",
    montant: 2200,
    frequence: "Mensuel",
    date: `${year}-${month}-01`,
    type: "revenu",
  },
];

// Données factices pour les paiements échelonnés
const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "iPhone 13",
    categorie: "Électronique",
    montant: 83.25,
    frequence: "Mensuel",
    date: `${year}-${month}-05`,
    type: "depense",
    progression: "3/12",
  },
  {
    id: 2,
    nom: "MacBook Pro",
    categorie: "Électronique",
    montant: 166.5,
    frequence: "Mensuel",
    date: `${year}-${month}-10`,
    type: "depense",
    progression: "2/24",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paiements récurrents
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);

  // Paiements échelonnés
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState([]);

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

  // Données factices pour les listes du bas (à remplacer par API si besoin)
  const paiementsRecurrentsRecents = [
    {
      id: 1,
      nom: "Netflix",
      description: "Abonnement mensuel",
      montant: 14.99,
    },
    {
      id: 2,
      nom: "Netflix",
      description: "Abonnement mensuel",
      montant: 14.99,
    },
    {
      id: 3,
      nom: "Netflix",
      description: "Abonnement mensuel",
      montant: 14.99,
    },
  ];
  const paiementsEchelonnesRecents = [
    { id: 1, nom: "iPhone 13", description: "3/12 paiements", montant: 83.25 },
    { id: 2, nom: "iPhone 13", description: "3/12 paiements", montant: 83.25 },
    { id: 3, nom: "iPhone 13", description: "3/12 paiements", montant: 83.25 },
  ];

  // Données factices pour les cartes (à remplacer par calculs réels si besoin)
  const totalDepense = 2456.78;
  const totalRecurrents = 451.32;
  const totalEchelonnes = 985.65;
  const totalEconomies = 1258.44;

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

  const fetchData = useCallback(() => {
    setTransactions(fakeTransactions);
    setPaiementsRecurrents(fakePaiements);
    setPaiementsEchelonnes(fakePaiementsEchelonnes);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleDataUpdate = () => fetchData();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchData]);

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
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>Total dépensé</span>
            <span className='bg-blue-100 text-blue-600 rounded px-2 py-1 text-xs font-bold'>
              1
            </span>
          </div>
          <div className='text-2xl font-bold'>
            {totalDepense.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
            €
          </div>
          <div className='text-xs text-gray-400'>
            7+ 3.2% depuis le mois dernier
          </div>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Paiements récurrents
            </span>
            <AiOutlineCalendar className='text-purple-400 text-xl' />
          </div>
          <div className='text-2xl font-bold'>
            {totalRecurrents.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}
            €
          </div>
          <div className='text-xs text-gray-400'>-1.4% le mois dernier</div>
          <button className='mt-2 border rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50'>
            Gerer →
          </button>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Paiements en plusieurs fois
            </span>
            <span className='bg-green-100 text-green-600 rounded px-2 py-1 text-xl'>
              <AiOutlineCreditCard />
            </span>
          </div>
          <div className='text-2xl font-bold'>
            {totalEchelonnes.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}
            €
          </div>
          <div className='text-xs text-gray-400'>+5.7% le mois dernier</div>
          <button className='mt-2 border rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50'>
            Gerer →
          </button>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>Économies</span>
            <span className='bg-orange-100 text-orange-600 rounded px-2 py-1 text-xl'>
              <AiOutlineRise />
            </span>
          </div>
          <div className='text-2xl font-bold'>
            {totalEconomies.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}
            €
          </div>
          <div className='text-xs text-gray-400'>
            +2.5% depuis le mois dernier
          </div>
        </div>
      </div>

      {/* Graphiques centraux */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-2'>Dépenses mensuelles</div>
          <div className='flex-1 flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg text-gray-400'>
            Graphique de dépenses mensuelles
          </div>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-2'>Répartition du budget</div>
          <div className='flex-1 flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg text-gray-400'>
            Graphique camembert
          </div>
        </div>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-4'>Paiements récurrents récents</div>
          <div className='flex flex-col gap-2 mb-4'>
            {paiementsRecurrentsRecents.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2'>
                <div className='flex items-center gap-3'>
                  <span className='bg-blue-100 text-blue-600 rounded-full p-2'>
                    <AiOutlineCalendar />
                  </span>
                  <div>
                    <div className='font-medium'>{item.nom}</div>
                    <div className='text-xs text-gray-400'>
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className='font-semibold'>
                  {item.montant.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </div>
              </div>
            ))}
          </div>
          <button className='w-full border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
            Voir tous les paiements récurrents
          </button>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-4'>Paiements en plusieurs fois</div>
          <div className='flex flex-col gap-2 mb-4'>
            {paiementsEchelonnesRecents.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2'>
                <div className='flex items-center gap-3'>
                  <span className='bg-green-100 text-green-600 rounded-full p-2'>
                    <AiOutlineCreditCard />
                  </span>
                  <div>
                    <div className='font-medium'>{item.nom}</div>
                    <div className='text-xs text-gray-400'>
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className='font-semibold'>
                  {item.montant.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </div>
              </div>
            ))}
          </div>
          <button className='w-full border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
            Voir tous les paiements en plusieurs fois
          </button>
        </div>
      </div>
    </div>
  );
}

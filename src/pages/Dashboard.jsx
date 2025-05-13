import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
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
} from "recharts";

// Définir COLORS en dehors du composant pour éviter l'erreur de portée
const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e42",
  "#f43f5e",
  "#10b981",
  "#a78bfa",
  "#fbbf24",
  "#3b82f6",
  "#ef4444",
  "#64748b",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Paiements récurrents
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);
  const [totalRecurrents, setTotalRecurrents] = useState(0);

  // Paiements échelonnés
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState([]);
  const [totalEchelonnes, setTotalEchelonnes] = useState(0);

  // Données pour le graphique de répartition budget
  const [budgetData, setBudgetData] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return; // Ne tente pas de fetch si non connecté
      try {
        const [recurrentsSnap, echelonnesSnap] = await Promise.all([
          getDocs(collection(db, "recurrent")),
          getDocs(collection(db, "xfois")),
        ]);
        // Paiements récurrents
        const paiements = recurrentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaiementsRecurrents(paiements);
        setTotalRecurrents(
          paiements.reduce((acc, p) => acc + (p.montant || 0), 0)
        );
        // Paiements échelonnés
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const echelonnes = echelonnesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const echelonnesDuMois = echelonnes.filter((p) => {
          if (!p.debutMois || !p.mensualites) return false;
          const [startYear, startMonth] = p.debutMois.split("-").map(Number);
          const debut = new Date(startYear, startMonth - 1);
          const fin = new Date(
            startYear,
            startMonth - 1 + Number(p.mensualites) - 1
          );
          const nowDate = new Date(currentYear, currentMonth - 1);
          return nowDate >= debut && nowDate <= fin;
        });
        setPaiementsEchelonnes(echelonnesDuMois);
        setTotalEchelonnes(
          echelonnesDuMois.reduce((acc, p) => {
            if (!p.montant || !p.mensualites) return acc;
            return acc + Number(p.montant) / Number(p.mensualites);
          }, 0)
        );

        // Récupération des données pour le graphique de répartition du budget
        await fetchBudgetData();
      } catch (err) {
        // Affiche l'erreur seulement si connecté
        if (user) {
          console.error("Erreur Firestore fetch:", err);
        }
      }
    };

    fetchAll();
  }, [user]);

  // Fonction pour récupérer les données de revenus et dépenses par mois
  const fetchBudgetData = async () => {
    try {
      // Récupération des revenus
      const revenuSnap = await getDocs(collection(db, "revenu"));
      const revenus = revenuSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Récupération des dépenses
      const depenseSnap = await getDocs(collection(db, "depense"));
      const depenses = depenseSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Créer un objet pour organiser les données par mois
      const MONTHS = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];

      // Déterminer les 6 derniers mois dans l'ordre chronologique
      const derniersMois = [];
      const maintenant = new Date();
      const moisActuel = maintenant.getMonth(); // 0-11
      const anneeActuelle = maintenant.getFullYear();

      // Calculer les 5 mois précédents et le mois actuel (total: 6 mois)
      for (let i = 5; i >= 0; i--) {
        let mois = moisActuel - i;
        let annee = anneeActuelle;

        // Ajuster l'année si on remonte à l'année précédente
        if (mois < 0) {
          mois += 12;
          annee -= 1;
        }

        derniersMois.push({
          date: new Date(annee, mois, 1),
          name: `${MONTHS[mois]}${annee !== anneeActuelle ? " " + annee : ""}`,
          month: mois,
          year: annee,
          revenus: 0,
          depenses: 0,
        });
      }

      // Calculer les totaux par mois
      const resultat = derniersMois.map((mois) => {
        // Revenus du mois
        const revenusMois = revenus.filter((r) => {
          const date = new Date(r.date);
          return (
            date.getMonth() === mois.month && date.getFullYear() === mois.year
          );
        });

        // Dépenses du mois (montant est négatif pour les dépenses)
        const depensesMois = depenses.filter((d) => {
          const date = new Date(d.date);
          return (
            date.getMonth() === mois.month && date.getFullYear() === mois.year
          );
        });

        return {
          ...mois,
          revenus: revenusMois.reduce(
            (total, r) => total + (parseFloat(r.montant) || 0),
            0
          ),
          depenses: Math.abs(
            depensesMois.reduce(
              (total, d) => total + (parseFloat(d.montant) || 0),
              0
            )
          ),
        };
      });

      setBudgetData(resultat);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de budget:",
        error
      );
    }
  };

  // Fonction utilitaire pour scroller en haut avant navigation
  const scrollToTopAndNavigate = (url) => {
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate(url);
  };

  // Optimisation: useMemo pour éviter les recalculs inutiles
  const dataCategories = useMemo(() => {
    return [...new Set(paiementsRecurrents.map((p) => p.categorie))]
      .map((cat) => ({
        name: cat,
        value: paiementsRecurrents
          .filter((p) => p.categorie === cat)
          .reduce((acc, p) => acc + (p.montant || 0), 0),
      }))
      .filter((d) => d.value > 0);
  }, [paiementsRecurrents]);

  const derniersPaiements = useMemo(
    () =>
      [...paiementsRecurrents]
        .sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        )
        .slice(-3),
    [paiementsRecurrents]
  );

  const derniersEchelonnes = useMemo(
    () =>
      [...paiementsEchelonnes]
        .sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        )
        .slice(-3),
    [paiementsEchelonnes]
  );

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-6'>
      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        {/* Total dépensé */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Total dépensé
            </span>
            <span className='bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded px-2 py-1 text-xs font-bold'>
              1
            </span>
          </div>
          <div className='text-2xl mb-1 text-[#222] dark:text-white'>
            2,456.78€
          </div>
          <div className='text-xs text-gray-400 dark:text-gray-500'>
            +3.2% depuis le mois dernier
          </div>
        </div>
        {/* Paiements récurrents */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Paiements récurrents
            </span>
            <AiOutlineCalendar className='text-purple-400 dark:text-purple-500 text-xl' />
          </div>
          <div className='text-2xl mb-1 text-[#222] dark:text-white'>
            {totalRecurrents.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400 dark:text-gray-500'>
            {paiementsRecurrents.length}{" "}
            {paiementsRecurrents.length === 1 ? "élément" : "éléments"}
          </div>
          <button
            className='mt-3 border dark:border-gray-800 rounded-lg py-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer dark:text-white'
            onClick={() =>
              user
                ? navigate("/paiements-recurrents")
                : navigate("/auth", { state: { isLogin: true } })
            }>
            Gerer →
          </button>
        </div>
        {/* Paiements en plusieurs fois */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Paiements échelonnés
            </span>
            <AiOutlineCreditCard className='text-green-400 dark:text-green-500 text-xl' />
          </div>
          <div className='text-2xl mb-1 text-[#222] dark:text-white'>
            {totalEchelonnes.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400 dark:text-gray-500'>
            {paiementsEchelonnes.length}{" "}
            {paiementsEchelonnes.length === 1 ? "élément" : "éléments"}
          </div>
          <button
            className='mt-3 border dark:border-gray-800 rounded-lg py-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer dark:text-white'
            onClick={() =>
              user
                ? navigate("/paiements-echelonnes")
                : navigate("/auth", { state: { isLogin: true } })
            }>
            Gerer →
          </button>
        </div>
        {/* Économies */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Économies
            </span>
            <AiOutlineRise className='text-orange-400 dark:text-orange-500 text-xl' />
          </div>
          <div className='text-2xl mb-1 text-[#222] dark:text-white'>
            1,258.44€
          </div>
          <div className='text-xs text-gray-400 dark:text-gray-500'>
            +2.5% depuis le mois dernier
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Dépenses mensuelles */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2 dark:text-white'>
            Dépenses mensuelles
          </span>
          <div className='flex-1 flex items-center justify-center'>
            <ResponsiveContainer width='100%' height={220}>
              <PieChart>
                <Pie
                  data={
                    dataCategories.length > 0
                      ? dataCategories
                      : [
                          { name: "Alimentation", value: 1000 },
                          { name: "Logement", value: 1600 },
                          { name: "Transport", value: 400 },
                          { name: "Loisirs", value: 300 },
                          { name: "Santé", value: 250 },
                        ]
                  }
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={70}
                  innerRadius={40}
                  fill='#8884d8'
                  label={({ name }) => name}>
                  {(dataCategories.length > 0
                    ? dataCategories
                    : [
                        { name: "Alimentation", value: 1000 },
                        { name: "Logement", value: 1600 },
                        { name: "Transport", value: 400 },
                        { name: "Loisirs", value: 300 },
                        { name: "Santé", value: 250 },
                      ]
                  ).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Répartition du budget */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2 dark:text-white'>
            Répartition du budget
          </span>
          <div className='flex-1 flex items-center justify-center'>
            <ResponsiveContainer width='100%' height={220}>
              <BarChart
                data={
                  budgetData.length > 0
                    ? budgetData
                    : [
                        { name: "Jan", revenus: 4000, depenses: 3800 },
                        { name: "Fév", revenus: 4200, depenses: 3000 },
                        { name: "Mar", revenus: 3800, depenses: 2000 },
                        { name: "Avr", revenus: 3900, depenses: 2800 },
                        { name: "Mai", revenus: 4700, depenses: 1800 },
                        { name: "Juin", revenus: 3700, depenses: 2400 },
                      ]
                }
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='revenus' fill='#10b981' name='Revenus' />
                <Bar dataKey='depenses' fill='#f43f5e' name='Dépenses' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Paiements récurrents récents */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col'>
          <span className='font-semibold mb-4 dark:text-white'>
            Paiements récurrents récents
          </span>
          <div className='space-y-3 mb-4'>
            {derniersPaiements.length > 0 ? (
              derniersPaiements.map((p, i) => (
                <div
                  key={p.id || i}
                  className='flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3'>
                  <div className='flex items-center'>
                    <div className='bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-400 rounded-full p-2 mr-3'>
                      <AiOutlineCalendar className='text-xl' />
                    </div>
                    <div>
                      <div className='font-medium dark:text-white'>
                        {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className='font-bold dark:text-white'>
                    {p.montant ? Number(p.montant).toFixed(2) : "0.00"}€
                  </div>
                </div>
              ))
            ) : (
              <div className='text-gray-400 dark:text-gray-500 text-center text-sm italic'>
                Aucun paiement récurrent
              </div>
            )}
          </div>
          <button
            className='border dark:border-gray-800 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer dark:text-white'
            onClick={() => scrollToTopAndNavigate("/paiements-recurrents")}>
            Voir tous les paiements récurrents
          </button>
        </div>
        {/* Paiements en plusieurs fois récents */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col'>
          <span className='font-semibold mb-4 dark:text-white'>
            Paiements en plusieurs fois
            <button onClick={() => navigate("/paiements-echelonnes")}></button>
          </span>
          <div className='space-y-3 mb-4'>
            {derniersEchelonnes.length > 0 ? (
              derniersEchelonnes.map((p, i) => (
                <div
                  key={p.id || i}
                  className='flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3'>
                  <div className='flex items-center'>
                    <div className='bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-400 rounded-full p-2 mr-3'>
                      <AiOutlineCreditCard className='text-xl' />
                    </div>
                    <div>
                      <div className='font-medium dark:text-white'>
                        {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                      </div>
                      <div className='text-xs text-gray-400 dark:text-gray-500'>
                        1/{p.mensualites} paiements
                      </div>
                    </div>
                  </div>
                  <div className='font-bold dark:text-white'>
                    {(Number(p.montant) / Number(p.mensualites)).toFixed(2)}€
                  </div>
                </div>
              ))
            ) : (
              <div className='text-gray-400 dark:text-gray-500 text-center text-sm italic'>
                Aucun paiement échelonné ce mois-ci
              </div>
            )}
          </div>
          <button
            className='border dark:border-gray-800 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition cursor-pointer dark:text-white'
            onClick={() => scrollToTopAndNavigate("/paiements-echelonnes")}>
            Voir tous les paiements échelonnés
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
  AiOutlineDollarCircle,
  AiOutlineInfoCircle,
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
    date: "2025-05-01",
    type: "depense",
  },
  {
    id: 2,
    nom: "Courses",
    montant: 220.5,
    categorie: "Alimentation",
    date: "2025-05-03",
    type: "depense",
  },
  {
    id: 3,
    nom: "Essence",
    montant: 80,
    categorie: "Transport",
    date: "2025-05-07",
    type: "depense",
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

// Données factices pour les paiements échelonnés (synchronisées avec la page PaiementEchelonne.jsx)
const fakePaiementsEchelonnes = [
  {
    id: 1,
    nom: "Smartphone Samsung",
    montant: 3599.8,
    mensualites: 24,
    debutDate: "2024-01-01",
    categorie: "High-Tech",
    type: "depense",
  },
  {
    id: 2,
    nom: "Assurance Auto",
    montant: 720,
    mensualites: 12,
    debutDate: "2024-02-01",
    categorie: "Assurance",
    type: "depense",
  },
  {
    id: 3,
    nom: "Crédit Mobilier",
    montant: 995,
    mensualites: 10,
    debutDate: "2024-03-01",
    categorie: "Crédit",
    type: "depense",
  },
  {
    id: 4,
    nom: "Électroménagers",
    montant: 722.7,
    mensualites: 6,
    debutDate: "2024-04-01",
    categorie: "Maison",
    type: "depense",
  },
];

// Ajout d'un helper pour le mois courant
const monthNames = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
const moisEnCours = monthNames[now.getMonth()] + " " + now.getFullYear();

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  // Paiements récurrents
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);

  // Paiements échelonnés
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState([]);

  // Dépenses
  // const [totalDepensesMois, setTotalDepensesMois] = useState(0);
  // const [totalDepensesMoisPrecedent, setTotalDepensesMoisPrecedent] = useState(0);

  // Revenus
  // const [totalRevenusMois, setTotalRevenusMois] = useState(0);
  // const [totalRevenusMoisPrecedent, setTotalRevenusMoisPrecedent] = useState(0);

  // Variables d'état pour les graphiques
  // const [budgetData, setBudgetData] = useState([]);
  // const [depensesTotalesData, setDepensesTotalesData] = useState([]);

  // Calcul du total dépensé (dépenses + récurrents + échelonnés)
  const totalDepense = useMemo(() => {
    const depensesMois = transactions
      .filter((t) => t.type === "depense")
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);

    const recurrentsMois = paiementsRecurrents
      .filter((p) => p.type === "depense")
      .reduce((acc, p) => acc + parseFloat(p.montant), 0);

    const echelonnesMois = paiementsEchelonnes
      .filter((e) => e.type === "depense")
      .reduce(
        (acc, e) => acc + parseFloat(e.montant) / parseInt(e.mensualites),
        0
      );

    return depensesMois + recurrentsMois + echelonnesMois;
  }, [transactions, paiementsRecurrents, paiementsEchelonnes]);

  // Calcul de la différence avec le mois dernier
  const differenceMoisPrecedent = useMemo(() => {
    // Pour la démo, on utilise une valeur fixe
    // Dans une vraie application, il faudrait calculer la vraie différence
    return 245.67;
  }, []);

  // Calcul du total des paiements récurrents (dépenses) du mois
  const totalRecurrents = useMemo(() => {
    return paiementsRecurrents
      .filter((p) => p.type === "depense")
      .reduce((acc, p) => acc + parseFloat(p.montant), 0);
  }, [paiementsRecurrents]);

  // Calcul du total des paiements échelonnés (dépenses) du mois
  const totalEchelonnes = useMemo(() => {
    return paiementsEchelonnes
      .filter((e) => e.type === "depense")
      .reduce(
        (acc, e) => acc + parseFloat(e.montant) / parseInt(e.mensualites),
        0
      );
  }, [paiementsEchelonnes]);

  // Calcul du total des revenus (transactions + récurrents)
  const totalRevenus = useMemo(() => {
    const revenusTransactions = transactions
      .filter((t) => t.type === "revenu")
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);
    const revenusRecurrents = paiementsRecurrents
      .filter((p) => p.type === "revenu")
      .reduce((acc, p) => acc + parseFloat(p.montant), 0);
    return revenusTransactions + revenusRecurrents;
  }, [transactions, paiementsRecurrents]);

  // Calcul des économies (revenus - tout ce qui sort)
  const totalEconomies = useMemo(() => {
    return totalRevenus - totalDepense;
  }, [totalRevenus, totalDepense]);

  // Différence économies mois précédent (démonstration)
  const differenceEconomiesMoisPrecedent = useMemo(() => {
    // Pour la démo, valeur fixe
    return -50.25;
  }, []);

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
  // const totalEchelonnes = 985.65; // <-- supprimée pour éviter le doublon
  // const totalEconomies = 1258.44; // <-- supprimée pour éviter le doublon

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

  useEffect(() => {
    const depensesMois = transactions
      .filter((t) => t.type === "depense")
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);
    const recurrentsMois = paiementsRecurrents
      .filter((p) => p.type === "depense")
      .reduce((acc, p) => acc + parseFloat(p.montant), 0);
    const echelonnesMois = paiementsEchelonnes
      .filter((e) => e.type === "depense")
      .reduce(
        (acc, e) => acc + parseFloat(e.montant) / parseInt(e.mensualites),
        0
      );

    console.log(
      `[Dashboard] Total dépensé ${(
        depensesMois +
        recurrentsMois +
        echelonnesMois
      ).toFixed(2)}€ = Dépenses ${depensesMois.toFixed(
        2
      )}€ + Récurrents ${recurrentsMois.toFixed(
        2
      )}€ + Échelonnés ${echelonnesMois.toFixed(2)}€`
    );
    console.log(
      `[Dashboard] Paiements récurrents : ${recurrentsMois.toFixed(2)}€`
    );
    console.log(
      `[Dashboard] Paiements échelonnés : ${echelonnesMois.toFixed(2)}€`
    );
  }, [transactions, paiementsRecurrents, paiementsEchelonnes]);

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Cartes du haut */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Total dépensé en {moisEnCours}
            </span>
            <AiOutlineDollarCircle className='text-red-600 text-xl' />
          </div>
          <div className='text-2xl font-bold'>{totalDepense.toFixed(2)}€</div>
          <div className='text-xs text-gray-400'>
            +{" "}
            {differenceMoisPrecedent.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            € par rapport au mois dernier
          </div>
          {/* Tooltip des dépenses */}
          <div className='absolute bottom-2 right-2 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
            <div className='absolute -right-32 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <p className='font-semibold mb-1'>Détail du calcul :</p>
              <ul className='list-disc list-inside space-y-1'>
                <li>
                  Dépenses du mois :{" "}
                  {transactions
                    .filter((t) => t.type === "depense")
                    .reduce((acc, t) => acc + parseFloat(t.montant), 0)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li>
                  Paiements récurrents :{" "}
                  {paiementsRecurrents
                    .filter((p) => p.type === "depense")
                    .reduce((acc, p) => acc + parseFloat(p.montant), 0)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li>
                  Paiements échelonnés :{" "}
                  {paiementsEchelonnes
                    .filter((e) => e.type === "depense")
                    .reduce(
                      (acc, e) =>
                        acc + parseFloat(e.montant) / parseInt(e.mensualites),
                      0
                    )
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
              </ul>
              <div className='mt-2 text-[11px] text-gray-300'>
                Ce total inclut toutes les dépenses, les paiements récurrents et
                les paiements échelonnés du mois.
              </div>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Paiements récurrents
            </span>
            <AiOutlineCalendar className='text-purple-400 text-xl' />
          </div>
          <div className='text-2xl font-bold'>
            {totalRecurrents.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>Ce mois-ci</div>
          <button
            className='mt-2 border rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50'
            onClick={() => navigate("/recurrents")}>
            Gérer →
          </button>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>
              Paiements échelonnés
            </span>
            <AiOutlineCreditCard className='text-green-600 text-xl' />
          </div>
          <div className='text-2xl font-bold'>
            {totalEchelonnes.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>Ce mois-ci</div>
          <button
            className='mt-2 border rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50'
            onClick={() => navigate("/echelonne")}>
            Gérer →
          </button>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between'>
            <span className='text-gray-500 font-medium'>Économies</span>
            <AiOutlineRise className='text-orange-600 text-xl' />
          </div>
          <div className='text-2xl font-bold'>
            <span
              className={
                totalEconomies >= 0 ? "text-green-600" : "text-red-600"
              }>
              {totalEconomies >= 0 ? "+" : "-"}
              {Math.abs(totalEconomies).toFixed(2)}€
            </span>
          </div>
          <div className='text-xs text-gray-400'>
            {differenceEconomiesMoisPrecedent >= 0 ? "+" : "-"}
            {Math.abs(differenceEconomiesMoisPrecedent).toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 2 }
            )}{" "}
            € par rapport au mois dernier
          </div>
          {/* Tooltip des économies */}
          <div className='absolute bottom-2 right-2 group'>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
            <div className='absolute right-0 bottom-14 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <p className='font-semibold mb-1'>Détail du calcul :</p>
              <ul className='list-disc list-inside space-y-1'>
                <li>
                  Revenu :{" "}
                  {totalRevenus.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </li>
                <li>
                  Dépense :{" "}
                  {totalDepense.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </li>
              </ul>
              <div className='mt-2 text-[11px] text-gray-300'>
                Économies = Revenu - Dépense
              </div>
            </div>
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

import React, { useState, useMemo } from "react";
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
import CATEGORY_PALETTE from "../styles/categoryPalette";
import {
  fakeTransactions,
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
} from "../fakeData";
import CustomBarTooltip from "../components/CustomBarTooltip";
import CustomSingleBarTooltip from "../components/CustomSingleBarTooltip";
import RenderActiveShape from "../components/RenderActiveShape";
import * as calculs from "../calcul";

// -------------------
// Constantes globales
// -------------------
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
const moisEnCours =
  monthNames[new Date().getMonth()] + " " + new Date().getFullYear();

// -------------------
// Composant principal
// -------------------
export default function Dashboard() {
  const navigate = useNavigate();

  // Données factices utilisées directement
  const transactions = fakeTransactions;
  const paiementsRecurrents = fakePaiementsRecurrents;
  const paiementsEchelonnes = fakePaiementsEchelonnes;

  // Calcul du total dépensé (dépenses + récurrents + échelonnés) pour la carte 1
  const totalDepense = useMemo(() => {
    // Dépenses du mois (transactions)
    const depensesMois = transactions
      .filter(
        (t) =>
          t.type === "depense" &&
          new Date(t.date).getFullYear() === new Date().getFullYear() &&
          new Date(t.date).getMonth() === new Date().getMonth()
      )
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);

    // Paiements récurrents du mois
    const recurrentsMois = paiementsRecurrents
      .filter(
        (p) =>
          p.type === "depense" &&
          new Date(p.date).getFullYear() === new Date().getFullYear() &&
          new Date(p.date).getMonth() === new Date().getMonth()
      )
      .reduce((acc, p) => acc + parseFloat(p.montant), 0);

    // Paiements échelonnés du mois (mensualité due ce mois)
    const echelonnesMois = paiementsEchelonnes
      .filter((e) => e.type === "depense")
      .reduce((acc, e) => {
        const debutDate = new Date(e.debutDate);
        const debutYear = debutDate.getFullYear();
        const debutMonth = debutDate.getMonth();
        const nbMensualites = parseInt(e.mensualites, 10);
        const finDate = new Date(debutDate);
        finDate.setMonth(finDate.getMonth() + nbMensualites - 1);
        const finYear = finDate.getFullYear();
        const finMonth = finDate.getMonth();

        const current = new Date().getFullYear() * 12 + new Date().getMonth();
        const start = debutYear * 12 + debutMonth;
        const end = finYear * 12 + finMonth;

        // LOG DEBUG
        // console.log('current:', current, 'start:', start, 'end:', end);

        if (current >= start && current <= end) {
          return acc + parseFloat(e.montant) / nbMensualites;
        }
        return acc;
      }, 0);

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
      .reduce((acc, e) => {
        const debutDate = new Date(e.debutDate);
        const finDate = new Date(debutDate);
        finDate.setMonth(finDate.getMonth() + parseInt(e.mensualites) - 1);
        const moisActuel = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );
        if (moisActuel >= debutDate && moisActuel <= finDate) {
          return acc + parseFloat(e.montant) / parseInt(e.mensualites);
        }
        return acc;
      }, 0);
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

  const depensesParCategorie = useMemo(() => {
    const depenses = transactions.filter((t) => t.type === "depense");
    const categories = {};
    depenses.forEach((t) => {
      if (!categories[t.categorie]) categories[t.categorie] = 0;
      categories[t.categorie] += parseFloat(t.montant);
    });
    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    return Object.entries(categories).map(([cat, value]) => ({
      name: cat,
      value,
      percent: total ? Math.round((value / total) * 100) : 0,
      color: CATEGORY_PALETTE[cat] || "#8884d8", // couleur par défaut si non trouvée
    }));
  }, [transactions]);

  const [activeIndex, setActiveIndex] = useState(null);
  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  // Préparation des données pour le graphique à barres (6 derniers mois)
  const barChartData = useMemo(() => {
    const now = new Date();
    // Générer les 6 derniers mois
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString("fr-FR", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    });

    const data = months.map(({ label, year, month }) => {
      // Calcul des dépenses du mois (transactions)
      const depensesMois = transactions
        .filter(
          (t) =>
            t.type === "depense" &&
            new Date(t.date).getFullYear() === year &&
            new Date(t.date).getMonth() === month
        )
        .reduce((acc, t) => acc + parseFloat(t.montant), 0);

      // Calcul des paiements récurrents du mois
      const recurrentsMois = paiementsRecurrents
        .filter(
          (p) =>
            p.type === "depense" &&
            new Date(p.date).getFullYear() === year &&
            new Date(p.date).getMonth() === month
        )
        .reduce((acc, p) => acc + parseFloat(p.montant), 0);

      // Calcul des paiements échelonnés du mois (robuste)
      const echelonnesMois = paiementsEchelonnes
        .filter((e) => e.type === "depense")
        .reduce((acc, e) => {
          const debutDate = new Date(e.debutDate);
          const debutYear = debutDate.getFullYear();
          const debutMonth = debutDate.getMonth();
          const nbMensualites = parseInt(e.mensualites, 10);
          const finDate = new Date(debutDate);
          finDate.setMonth(finDate.getMonth() + nbMensualites - 1);
          const finYear = finDate.getFullYear();
          const finMonth = finDate.getMonth();

          const current = year * 12 + month;
          const start = debutYear * 12 + debutMonth;
          const end = finYear * 12 + finMonth;

          if (current >= start && current <= end) {
            return acc + parseFloat(e.montant) / nbMensualites;
          }
          return acc;
        }, 0);

      // Total des dépenses du mois
      const depenses = depensesMois + recurrentsMois + echelonnesMois;

      // Calcul des revenus du mois
      const revenus = transactions
        .filter(
          (t) =>
            t.type === "revenu" &&
            new Date(t.date).getFullYear() === year &&
            new Date(t.date).getMonth() === month
        )
        .reduce((acc, t) => acc + parseFloat(t.montant), 0);

      return {
        mois: label.charAt(0).toUpperCase() + label.slice(1),
        depenses,
        revenus,
      };
    });

    return data;
  }, [transactions, paiementsRecurrents, paiementsEchelonnes]);

  const [barHover, setBarHover] = useState({
    mois: null,
    type: null,
    value: null,
  });

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
          <div className='font-semibold mb-2 text-center'>
            Total des dépenses mensuelles par catégories
          </div>
          <div className='flex-1 flex flex-col items-center justify-center min-h-[340px] bg-gray-50 rounded-lg text-gray-400'>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={depensesParCategorie}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={90}
                  dataKey='value'
                  activeIndex={activeIndex}
                  activeShape={
                    activeIndex !== null ? RenderActiveShape : undefined
                  }
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  paddingAngle={2}>
                  {depensesParCategorie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Légende dynamique au survol, ou placeholder invisible pour garder la hauteur */}
            {activeIndex !== null && depensesParCategorie[activeIndex] ? (
              <div className='flex items-center gap-2 min-h-[24px]'>
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: depensesParCategorie[activeIndex].color,
                  }}
                />
                <span
                  className='font-semibold'
                  style={{ color: depensesParCategorie[activeIndex].color }}>
                  {depensesParCategorie[activeIndex].name}
                </span>
                <span className='text-gray-500'>
                  {depensesParCategorie[activeIndex].percent}%
                </span>
              </div>
            ) : (
              <div className='min-h-[24px]'></div>
            )}
          </div>
        </div>
        <div className='bg-white rounded-xl shadow p-6 flex flex-col'>
          <div className='font-semibold mb-2 text-center'>
            Répartition des dépenses par mois
          </div>
          <div className='flex-1 flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg text-gray-400'>
            <ResponsiveContainer width='100%' height={200}>
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='mois' tick={{ fill: "#888" }} />
                <YAxis tick={{ fill: "#888" }} />
                <Bar
                  dataKey='depenses'
                  fill='#EF4444'
                  name='Dépenses'
                  barSize={24}
                  onMouseOver={(_, idx) => {
                    const d = barChartData[idx];
                    setBarHover({
                      mois: d.mois,
                      type: "depenses",
                      value: d.depenses,
                      x: window.event?.clientX,
                      y: window.event?.clientY - 40,
                    });
                  }}
                  onMouseOut={() =>
                    setBarHover({ mois: null, type: null, value: null })
                  }
                />
                <Bar
                  dataKey='revenus'
                  fill='#22C55E'
                  name='Revenus'
                  barSize={24}
                  onMouseOver={(_, idx) => {
                    const d = barChartData[idx];
                    setBarHover({
                      mois: d.mois,
                      type: "revenus",
                      value: d.revenus,
                      x: window.event?.clientX,
                      y: window.event?.clientY - 40,
                    });
                  }}
                  onMouseOut={() =>
                    setBarHover({ mois: null, type: null, value: null })
                  }
                />
              </BarChart>
            </ResponsiveContainer>
            <CustomSingleBarTooltip />
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

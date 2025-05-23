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
  fakePaiementsRecurrents,
  fakePaiementsEchelonnes,
  fakeDepenseRevenu,
} from "../utils/fakeData";
import CustomBarTooltip from "../components/graphiques/CustomBarTooltip";
import CustomSingleBarTooltip from "../components/graphiques/CustomSingleBarTooltip";
import RenderActiveShape from "../components/graphiques/RenderActiveShape";
import * as calculs from "../utils/calcul";

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
  const depenseRevenu = fakeDepenseRevenu;
  const paiementsRecurrents = fakePaiementsRecurrents;
  const paiementsEchelonnes = fakePaiementsEchelonnes;

  // Calcul de la différence avec le mois dernier
  const differenceMoisPrecedent = useMemo(() => {
    return calculs.calculDifferenceDepensesMoisPrecedent(
      depenseRevenu,
      paiementsRecurrents,
      paiementsEchelonnes
    );
  }, [depenseRevenu, paiementsRecurrents, paiementsEchelonnes]);

  // Calcul du total des paiements échelonnés (dépenses) du mois
  const totalEchelonnes = calculs.totalEchelonnesMois(paiementsEchelonnes);

  // Calcul des économies (revenus - tout ce qui sort)
  const totalRevenus = calculs.totalRevenusGlobalMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes
  );
  const totalDepense = calculs.calculTotalDepensesMois(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes
  );
  const totalEconomies = calculs.calculEconomies(totalRevenus, totalDepense);

  // Différence économies mois précédent (démonstration)
  const differenceEconomiesMoisPrecedent = useMemo(() => {
    const economieMoisActuel = calculs.calculEconomies(
      totalRevenus,
      totalDepense
    );
    const economieMoisPrecedent = calculs.calculEconomies(
      calculs.calculRevenusMoisPrecedent(
        depenseRevenu,
        paiementsRecurrents,
        paiementsEchelonnes
      ),
      calculs.calculTotalDepensesMois(
        depenseRevenu,
        paiementsRecurrents,
        paiementsEchelonnes,
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      )
    );
    return economieMoisActuel - economieMoisPrecedent;
  }, [
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    totalRevenus,
    totalDepense,
  ]);

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

  // Fusion de toutes les dépenses (dépenses classiques, récurrents, échelonnés)
  const toutesDepenses = [
    ...depenseRevenu.filter((d) => d.type === "depense"),
    ...paiementsRecurrents.filter((d) => d.type === "depense"),
    ...paiementsEchelonnes.filter((d) => d.type === "depense"),
  ];

  const depensesParCategorie = calculs.calculDepensesParCategorie(
    toutesDepenses,
    CATEGORY_PALETTE
  );

  const [activeIndex, setActiveIndex] = useState(null);
  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  // Préparation des données pour le graphique à barres (6 derniers mois)
  const barChartData = calculs.calculBarChartData(
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes
  );

  const [barHover, setBarHover] = useState({
    mois: null,
    type: null,
    value: null,
  });

  const totalRecurrents = useMemo(
    () => calculs.calculTotalRecurrentsMois(paiementsRecurrents),
    [paiementsRecurrents]
  );

  // Fonction pour afficher le prix en € sur chaque segment du camembert
  const renderPieLabel = ({
    value,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }) => {
    if (activeIndex !== index) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Dimensions harmonisées avec le tooltip
    const width = 110;
    const height = 40;
    const rx = 16;

    return (
      <g>
        <filter id='pie-shadow' x='-50%' y='-50%' width='200%' height='200%'>
          <feDropShadow
            dx='0'
            dy='2'
            stdDeviation='4'
            floodColor='#000'
            floodOpacity='0.10'
          />
        </filter>
        <rect
          x={x - width / 2}
          y={y - height / 2}
          width={width}
          height={height}
          rx={rx}
          fill='white'
          stroke='#f3f4f6'
          strokeWidth={1}
          opacity={0.9}
          filter='url(#pie-shadow)'
        />
        <text
          x={x}
          y={y}
          fill='#222'
          textAnchor='middle'
          dominantBaseline='central'
          fontSize={20}
          fontWeight={700}
          style={{ fontFamily: "inherit" }}>
          {value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
          <tspan fontSize={18} fontWeight={700} dx={8}>
            €
          </tspan>
        </text>
      </g>
    );
  };

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
            {differenceMoisPrecedent >= 0 ? "+" : "-"}{" "}
            {Math.abs(differenceMoisPrecedent).toLocaleString("fr-FR", {
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
                  {calculs
                    .totalDepensesMois(depenseRevenu)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li>
                  Paiements récurrents :{" "}
                  {calculs
                    .calculTotalRecurrentsMois(paiementsRecurrents)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li>
                  Paiements échelonnés :{" "}
                  {calculs
                    .calculTotalEchelonnesMois(paiementsEchelonnes)
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li>
                  Mois précédent :{" "}
                  {calculs
                    .calculTotalDepensesMois(
                      depenseRevenu,
                      paiementsRecurrents,
                      paiementsEchelonnes,
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() - 1,
                        1
                      )
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
            className='mt-2 border rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'
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
            className='mt-2 border rounded-lg px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'
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
                <li className='mt-2 text-gray-400'>Mois précédent :</li>
                <li className='ml-4'>
                  Revenu :{" "}
                  {calculs
                    .calculRevenusMoisPrecedent(
                      depenseRevenu,
                      paiementsRecurrents,
                      paiementsEchelonnes
                    )
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li className='ml-4'>
                  Dépense :{" "}
                  {calculs
                    .calculTotalDepensesMois(
                      depenseRevenu,
                      paiementsRecurrents,
                      paiementsEchelonnes,
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() - 1,
                        1
                      )
                    )
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                  €
                </li>
                <li className='ml-4'>
                  Économies :{" "}
                  {calculs
                    .calculEconomies(
                      calculs.calculRevenusMoisPrecedent(
                        depenseRevenu,
                        paiementsRecurrents,
                        paiementsEchelonnes
                      ),
                      calculs.calculTotalDepensesMois(
                        depenseRevenu,
                        paiementsRecurrents,
                        paiementsEchelonnes,
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth() - 1,
                          1
                        )
                      )
                    )
                    .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
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
                  onMouseOut={onPieLeave}
                  paddingAngle={2}
                  label={renderPieLabel}
                  labelLine={false}>
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
            <CustomSingleBarTooltip barHover={barHover} />
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
          <button className='w-full border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'>
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
          <button className='w-full border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer'>
            Voir tous les paiements en plusieurs fois
          </button>
        </div>
      </div>
    </div>
  );
}

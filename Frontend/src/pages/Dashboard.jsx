import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineCalendar,
  AiOutlineCreditCard,
  AiOutlineRise,
} from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  const { isLoggedIn } = useContext(AppContext);

  // Paiements récurrents
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);
  const [totalRecurrents, setTotalRecurrents] = useState(0);

  // Paiements échelonnés
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState([]);
  const [totalEchelonnes, setTotalEchelonnes] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
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
      } catch (err) {
        console.error("Erreur Firestore fetch:", err);
      }
    };
    fetchAll();
  }, []);

  // Optimisation : useMemo pour éviter les recalculs inutiles
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
    <div className='bg-[#f8fafc] min-h-screen p-6'>
      {/* Cartes du haut */}
      <div className=' grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        {/* Total dépensé */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Total dépensé</span>
            <span className='bg-blue-100 text-blue-600 rounded px-2 py-1 text-xs font-bold'>
              1
            </span>
          </div>
          <div className='text-2xl font-bold mb-1'>2,456.78€</div>
          <div className='text-xs text-gray-400'>
            +3.2% depuis le mois dernier
          </div>
        </div>
        {/* Paiements récurrents */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Paiements récurrents</span>
            <AiOutlineCalendar className='text-purple-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>
            {totalRecurrents.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>
            {paiementsRecurrents.length}{" "}
            {paiementsRecurrents.length === 1 ? "élément" : "éléments"}
          </div>
          <button
            className='mt-3 border rounded-lg py-1 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() =>
              isLoggedIn
                ? navigate("/paiements-recurrents")
                : navigate("/auth", { state: { isLogin: true } })
            }>
            Gerer →
          </button>
        </div>
        {/* Paiements en plusieurs fois */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>
              Paiements en plusieurs fois
            </span>
            <AiOutlineCreditCard className='text-green-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>
            {totalEchelonnes.toFixed(2)}€
          </div>
          <div className='text-xs text-gray-400'>
            {paiementsEchelonnes.length}{" "}
            {paiementsEchelonnes.length === 1 ? "élément" : "éléments"}
          </div>
          <button
            className='mt-3 border rounded-lg py-1 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() =>
              isLoggedIn
                ? navigate("/paiements-echelonnes")
                : navigate("/auth", { state: { isLogin: true } })
            }>
            Gerer →
          </button>
        </div>
        {/* Économies */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-500'>Économies</span>
            <AiOutlineRise className='text-orange-400 text-xl' />
          </div>
          <div className='text-2xl font-bold mb-1'>1,258.44€</div>
          <div className='text-xs text-gray-400'>
            +2.5% depuis le mois dernier
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Dépenses mensuelles */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2'>Dépenses mensuelles</span>
          <div className='flex-1 flex items-center justify-center'>
            {dataCategories.length > 0 ? (
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie
                    data={dataCategories}
                    dataKey='value'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    outerRadius={70}
                    innerRadius={40}
                    fill='#8884d8'
                    label={({ name }) => name}>
                    {dataCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className='text-gray-400'>
                Aucune dépense récurrente ce mois-ci
              </span>
            )}
          </div>
        </div>
        {/* Répartition du budget */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col min-h-[220px]'>
          <span className='font-semibold mb-2'>Répartition du budget</span>
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            Graphique camembert
          </div>
        </div>
      </div>

      {/* Listes du bas */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Paiements récurrents récents */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <span className='font-semibold mb-4'>
            Paiements récurrents récents
          </span>
          <div className='space-y-3 mb-4'>
            {derniersPaiements.length > 0 ? (
              derniersPaiements.map((p, i) => (
                <div
                  key={p.id || i}
                  className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3'>
                  <div className='flex items-center'>
                    <div className='bg-blue-100 text-blue-500 rounded-full p-2 mr-3'>
                      <AiOutlineCalendar className='text-xl' />
                    </div>
                    <div>
                      <div className='font-medium'>
                        {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className='font-bold'>
                    {p.montant ? Number(p.montant).toFixed(2) : "0.00"}€
                  </div>
                </div>
              ))
            ) : (
              <div className='text-gray-400 text-center text-sm italic'>
                Aucun paiement récurrent
              </div>
            )}
          </div>
          <button
            className='border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() => navigate("/paiements-recurrents")}>
            Voir tous les paiements récurrents
          </button>
        </div>
        {/* Paiements en plusieurs fois récents */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-6 flex flex-col'>
          <span className='font-semibold mb-4'>
            Paiements en plusieurs fois
            <button onClick={() => navigate("/paiements-echelonnes")}></button>
          </span>
          <div className='space-y-3 mb-4'>
            {derniersEchelonnes.length > 0 ? (
              derniersEchelonnes.map((p, i) => (
                <div
                  key={p.id || i}
                  className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3'>
                  <div className='flex items-center'>
                    <div className='bg-green-100 text-green-500 rounded-full p-2 mr-3'>
                      <AiOutlineCreditCard className='text-xl' />
                    </div>
                    <div>
                      <div className='font-medium'>
                        {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                      </div>
                      <div className='text-xs text-gray-400'>
                        {/* Affiche la mensualité courante sur le total */}
                        1/{p.mensualites} paiements
                      </div>
                    </div>
                  </div>
                  <div className='font-bold'>
                    {(Number(p.montant) / Number(p.mensualites)).toFixed(2)}€
                  </div>
                </div>
              ))
            ) : (
              <div className='text-gray-400 text-center text-sm italic'>
                Aucun paiement échelonné ce mois-ci
              </div>
            )}
          </div>
          <button
            className='border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition'
            onClick={() => navigate("/paiements-echelonnes")}>
            Voir tous les paiements échelonnés
          </button>
        </div>
      </div>
    </div>
  );
}

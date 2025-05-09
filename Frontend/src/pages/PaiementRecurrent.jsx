import React, { useContext, useState, useRef, useEffect } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const CATEGORIES = [
  "Maison",
  "Transports",
  "Assurance",
  "Divertissement",
  "Loisirs",
  "Alimentation",
  "Sport",
  "Santé",
  "Éducation",
  "Autre",
];

export default function PaiementRecurrent() {
  // Paiements vides au départ
  const [paiements, setPaiements] = useState([]);
  const totalMensuel =
    paiements.length > 0 ? paiements.reduce((acc, p) => acc + p.montant, 0) : 0;
  const totalAnnuel = totalMensuel * 12;
  const totalDepenses = totalMensuel;
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);

  // Gestion modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    categorie: "",
    montant: "",
  });

  const montantInputRef = useRef(null);
  const nomInputRef = useRef(null); // Ajout du ref pour le champ nom

  useEffect(() => {
    if (showModal && step === 1 && nomInputRef.current) {
      nomInputRef.current.focus();
    }
    if (step === 3 && montantInputRef.current) {
      montantInputRef.current.focus();
    }
  }, [showModal, step]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setNewPaiement({ ...newPaiement, [e.target.name]: e.target.value });
  };

  // Charger les paiements depuis Firestore au chargement et après chaque ajout/suppression/modification
  const fetchPaiements = async () => {
    try {
      const snapshot = await getDocs(collection(db, "recurrent"));
      setPaiements(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (err) {
      console.error("Erreur Firestore fetch:", err);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  // Pour l'édition
  const [editIndex, setEditIndex] = useState(null);

  // Supprimer un paiement (Firestore)
  const handleDelete = async (idx) => {
    try {
      const paiement = paiements[idx];
      if (paiement && paiement.id) {
        await deleteDoc(doc(db, "recurrent", paiement.id));
        await fetchPaiements(); // Recharge la liste après suppression
      }
    } catch (err) {
      console.error("Erreur Firestore delete:", err);
    }
  };

  // Commencer la modification
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setNewPaiement({
      nom: paiements[idx].nom,
      categorie: paiements[idx].categorie,
      montant: paiements[idx].montant.toString(),
    });
    setShowModal(true);
    setStep(1);
  };

  // Ajouter ou modifier un paiement (Firestore)
  const handleAddOrEditPaiement = async () => {
    try {
      if (editIndex !== null && paiements[editIndex]) {
        // Modification
        const paiementId = paiements[editIndex].id;
        await updateDoc(doc(db, "recurrent", paiementId), {
          nom: newPaiement.nom,
          categorie: newPaiement.categorie,
          montant: parseFloat(newPaiement.montant),
        });
      } else {
        // Ajout
        console.log("Ajout paiement Firestore :", newPaiement);
        await addDoc(collection(db, "recurrent"), {
          nom: newPaiement.nom,
          categorie: newPaiement.categorie,
          montant: parseFloat(newPaiement.montant),
          createdAt: serverTimestamp(),
        });
        // Ajoute une notification en BDD
        await addDoc(collection(db, "notifications"), {
          type: "recurrent",
          title: "Nouveau paiement récurrent",
          desc: `Ajout de ${
            newPaiement.nom.charAt(0).toUpperCase() + newPaiement.nom.slice(1)
          } (${parseFloat(newPaiement.montant).toFixed(2)}€)`,
          date: new Date().toLocaleDateString("fr-FR"),
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      await fetchPaiements(); // Recharge la liste après ajout/modif
      setShowModal(false);
      setStep(1);
      setNewPaiement({ nom: "", categorie: "", montant: "" });
      setEditIndex(null);
    } catch (err) {
      console.error("Erreur Firestore add/update:", err);
    }
  };

  // Fonction pour regrouper les montants par catégorie
  const dataCategories = CATEGORIES.map((cat) => ({
    name: cat,
    value: paiements
      .filter((p) => p.categorie === cat)
      .reduce((acc, p) => acc + p.montant, 0),
  })).filter((d) => d.value > 0);

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

  return (
    <div className='bg-[#f8fafc] min-h-screen'>
      <div className='p-8'>
        <div className='flex items-center justify-end mb-6'>
          <button
            className='bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition h-12 min-w-[240px] text-base justify-center'
            onClick={() =>
              isLoggedIn
                ? setShowModal(true)
                : navigate("/auth", { state: { isLogin: true } })
            }>
            <span className='text-xl'>+</span> Ajouter un paiement récurrent
          </button>
        </div>
        {/* Modal */}
        {showModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center'
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative'>
              <button
                className='absolute top-2 right-2 text-gray-400 hover:text-gray-700'
                onClick={() => {
                  setShowModal(false);
                  setStep(1);
                  setNewPaiement({ nom: "", categorie: "", montant: "" });
                }}
                aria-label='Fermer'>
                ✕
              </button>
              <div className='mb-6 text-lg font-semibold'>
                Ajouter un paiement récurrent
              </div>
              {/* Récapitulatif dynamique */}
              <div className='mb-4'>
                {newPaiement.nom && (
                  <div>
                    <span className='font-medium'>Libellé :</span>{" "}
                    {newPaiement.nom.charAt(0).toUpperCase() +
                      newPaiement.nom.slice(1)}
                  </div>
                )}
                {step > 1 && newPaiement.categorie && (
                  <div>
                    <span className='font-medium'>Catégorie :</span>{" "}
                    {newPaiement.categorie}
                  </div>
                )}
                {step > 2 && newPaiement.montant && (
                  <div>
                    <span className='font-medium'>Montant :</span>{" "}
                    {parseFloat(newPaiement.montant).toFixed(2)} €
                  </div>
                )}
              </div>
              {step === 1 && (
                <div>
                  <label className='block mb-2 font-medium'>Libellé</label>
                  <input
                    type='text'
                    name='nom'
                    value={newPaiement.nom}
                    onChange={handleChange}
                    className='w-full border rounded px-3 py-2 mb-4'
                    placeholder='Ex: Netflix'
                    ref={nomInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.nom) handleNext();
                    }}
                  />
                  <div className='flex justify-end'>
                    <button
                      className='bg-blue-600 text-white px-4 py-2 rounded'
                      disabled={!newPaiement.nom}
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className='block mb-2 font-medium'>Catégorie</label>
                  <div className='grid grid-cols-2 gap-2 mb-4'>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type='button'
                        className={`border rounded px-3 py-2 text-left ${
                          newPaiement.categorie === cat
                            ? "bg-blue-100 border-blue-400"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setNewPaiement({ ...newPaiement, categorie: cat });
                          setStep(3);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setNewPaiement({ ...newPaiement, categorie: cat });
                            setStep(3);
                          }
                        }}
                        tabIndex={0}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className='flex justify-between'>
                    <button className='text-gray-600' onClick={handlePrev}>
                      Précédent
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <label className='block mb-2 font-medium'>Montant (€)</label>
                  <input
                    type='number'
                    name='montant'
                    value={newPaiement.montant}
                    onChange={handleChange}
                    className='w-full border rounded px-3 py-2 mb-4'
                    min='0'
                    step='0.01'
                    placeholder='Ex: 14.99'
                    ref={montantInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.montant)
                        handleAddOrEditPaiement();
                    }}
                  />
                  <div className='flex justify-between'>
                    <button className='text-gray-600' onClick={handlePrev}>
                      Précédent
                    </button>
                    <button
                      className='bg-green-600 text-white px-4 py-2 rounded'
                      disabled={!newPaiement.montant}
                      onClick={handleAddOrEditPaiement}>
                      {editIndex !== null ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Totaux */}
        <div className='flex flex-col md:flex-row gap-6 mb-8'>
          {/* Colonne gauche : Totaux mensuel et annuel */}
          <div className='flex-1 flex flex-col gap-4'>
            <div className='bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
              <div className='bg-blue-100 rounded-full p-3'>
                <AiOutlineCalendar className='text-2xl text-blue-500' />
              </div>
              <div>
                <div className='text-gray-500 text-sm font-medium'>
                  Total mensuel
                </div>
                <div className='text-xl font-semibold'>
                  {totalMensuel.toFixed(2)}€
                </div>
              </div>
            </div>
            <div className='bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
              <div className='bg-green-100 rounded-full p-3'>
                <AiOutlineCalendar className='text-2xl text-green-500' />
              </div>
              <div>
                <div className='text-gray-500 text-sm font-medium'>
                  Total annuel
                </div>
                <div className='text-xl font-semibold'>
                  {totalAnnuel.toFixed(2)}€
                </div>
              </div>
            </div>
          </div>
          {/* Colonne droite : Dépenses par catégorie (graphique à venir) */}
          <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex flex-col items-center justify-center p-6'>
            <div className='flex items-center mb-2'>
              <div className='bg-orange-100 rounded-full p-3 mr-2'>
                <AiOutlineCalendar className='text-2xl text-orange-500' />
              </div>
              <div className='text-gray-500 text-sm font-medium'>
                Dépenses par catégorie
              </div>
            </div>
            <div className='w-full h-64 flex items-center justify-center'>
              {dataCategories.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={dataCategories}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      innerRadius={40}
                      fill='#8884d8'
                      label={({ payload }) => {
                        const noms = paiements
                          .filter((p) => p.categorie === payload.name)
                          .map(
                            (p) =>
                              p.nom.charAt(0).toUpperCase() + p.nom.slice(1)
                          );
                        return noms.join(", ");
                      }}>
                      {dataCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (
                          active &&
                          payload &&
                          payload.length &&
                          typeof payload[0].percent === "number"
                        ) {
                          const percent = payload[0].percent * 100;
                          return (
                            <div
                              style={{
                                background: "#fff",
                                border: "1px solid #ddd",
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 14,
                                color: "#222",
                              }}>
                              {isNaN(percent) ? "0%" : `${percent.toFixed(1)}%`}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='text-gray-400 text-center text-sm italic'>
                  (Aucune donnée)
                </div>
              )}
            </div>
            {/* Les boutons Modifier/Supprimer ont été retirés ici */}
          </div>
        </div>
        {/* Liste */}
        <div className='bg-white border border-[#ececec] rounded-xl p-8'>
          <div className='text-lg font-semibold mb-6'>
            Abonnements et prélèvements
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left'>
              <thead>
                <tr className='text-gray-500 font-medium text-sm'>
                  <th className='py-3 px-2'>Nom</th>
                  <th className='py-3 px-2'>Catégorie</th>
                  <th className='py-3 px-2'>Montant</th>
                  <th className='py-3 px-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((p, idx) => (
                  <tr key={idx} className='border-t border-[#ececec]'>
                    <td className='py-3 px-2'>
                      {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                    </td>
                    <td className='py-3 px-2'>{p.categorie}</td>
                    <td className='py-3 px-2'>{p.montant.toFixed(2)}€</td>
                    <td className='py-3 px-2'>
                      <button
                        className='text-blue-700 font-medium hover:underline mr-4'
                        title='Modifier'
                        onClick={() => handleEdit(idx)}>
                        <FiEdit className='inline text-lg' />
                      </button>
                      <button
                        className='text-red-500 font-medium hover:underline'
                        title='Supprimer'
                        onClick={() => handleDelete(idx)}>
                        <FiTrash className='inline text-lg' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

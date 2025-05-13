import React, { useState, useRef, useEffect } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
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

  const { user } = useAuth();

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

  useEffect(() => {
    if (!user) return;
    fetchPaiements();
  }, [user]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setNewPaiement({ ...newPaiement, [e.target.name]: e.target.value });
  };

  // Charger les paiements depuis Firestore au chargement et après chaque ajout/suppression/modification
  const fetchPaiements = async () => {
    if (!user) return;
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

  // Pour l'édition
  const [editIndex, setEditIndex] = useState(null);

  // Fonction pour supprimer un paiement sans toast
  const handleDelete = async (idx) => {
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;

    const paiementId = paiement.id;
    const paiementName = paiement.nom;

    console.log(
      `🚀 Début suppression de ${paiementName} (${paiementId}) dans recurrent`
    );

    try {
      console.log(`🔥 SUPPRESSION: recurrent/${paiementId}`);
      // Suppression directe dans Firestore
      await deleteDoc(doc(db, "recurrent", paiementId));
      console.log(`✅ Document supprimé avec succès: recurrent/${paiementId}`);

      // Mise à jour directe de l'interface
      setPaiements((prevPaiements) => {
        const newPaiements = prevPaiements.filter((p) => p.id !== paiementId);
        console.log(
          `État local: ${
            prevPaiements.length - newPaiements.length
          } paiement supprimé`
        );
        return newPaiements;
      });

      // Ajouter la notification sans bloquer le flux principal
      try {
        await addDoc(collection(db, "notifications"), {
          type: "recurrent",
          title: "Paiement récurrent supprimé",
          desc: `Suppression de ${
            paiementName.charAt(0).toUpperCase() + paiementName.slice(1)
          } (${parseFloat(paiement.montant).toFixed(2)}€)`,
          date: new Date().toLocaleDateString("fr-FR"),
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notifError) {
        console.error("Erreur lors de l'ajout de la notification:", notifError);
      }
    } catch (error) {
      console.error(
        `❌ ERREUR critique lors de la suppression: ${error.message || error}`
      );
      console.error(error);
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
    if (!user) return;

    // Vérifications de base
    if (!newPaiement.nom || !newPaiement.categorie || !newPaiement.montant) {
      console.error("Données manquantes", newPaiement);
      return;
    }

    try {
      if (editIndex !== null && paiements[editIndex]) {
        // Modification
        const paiementId = paiements[editIndex].id;
        await updateDoc(doc(db, "recurrent", paiementId), {
          nom: newPaiement.nom,
          categorie: newPaiement.categorie,
          montant: parseFloat(newPaiement.montant),
          updatedAt: serverTimestamp(),
        });

        // Notification modification paiement récurrent
        await addDoc(collection(db, "notifications"), {
          type: "recurrent",
          title: "Paiement récurrent modifié",
          desc: `Modification de ${
            newPaiement.nom.charAt(0).toUpperCase() + newPaiement.nom.slice(1)
          } (${parseFloat(newPaiement.montant).toFixed(2)}€)`,
          date: new Date().toLocaleDateString("fr-FR"),
          read: false,
          createdAt: serverTimestamp(),
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

      // Recharge la liste après ajout/modif
      await fetchPaiements();

      // Réinitialiser le formulaire et fermer la modal
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
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* En-tête et boutons d'action */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800 dark:text-white mb-1'>
              Paiements Récurrents
            </h1>
            <div className='text-gray-500 dark:text-gray-400 text-base'>
              Gérez vos paiements mensuels.
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 mt-4 md:mt-0'>
            <button
              onClick={() => {
                setEditIndex(null);
                setNewPaiement({
                  nom: "",
                  categorie: "",
                  montant: "",
                });
                setShowModal(true);
                setStep(1);
              }}
              className='px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-semibold flex items-center justify-center'>
              <AiOutlineCalendar className='mr-2' /> Ajouter un paiement
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className='flex flex-col md:flex-row gap-6 mb-8'>
          {/* Colonne gauche : Totaux mensuel et annuel */}
          <div className='flex-1 flex flex-col gap-4'>
            <div className='bg-white dark:bg-black border border-[#ececec] dark:border-gray-800 rounded-xl flex flex-col items-start gap-2 p-6'>
              <div className='flex items-center gap-4'>
                <div className='bg-blue-100 dark:bg-blue-900 rounded-full p-3'>
                  <AiOutlineCalendar className='text-2xl text-blue-500 dark:text-blue-400' />
                </div>
                <div className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
                  Total mensuel
                </div>
              </div>
              <div className='text-2xl text-[#222] dark:text-white'>
                {totalMensuel.toFixed(2)}€
              </div>
            </div>
          </div>
          {/* Colonne droite : Dépenses par catégorie */}
          <div className='flex-1 bg-white dark:bg-black border border-[#ececec] dark:border-gray-800 rounded-xl flex flex-col items-center justify-center p-6'>
            <div className='flex items-center mb-2'>
              <div className='bg-orange-100 dark:bg-orange-900 rounded-full p-3 mr-2'>
                <AiOutlineCalendar className='text-2xl text-orange-500 dark:text-orange-400' />
              </div>
              <div className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
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
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className='text-gray-400 dark:text-gray-500'>
                  Aucune dépense récurrente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Affichage des paiements récurrents */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {paiements.length > 0 ? (
            paiements.map((paiement, idx) => {
              return (
                <div
                  key={paiement.id || idx}
                  className={`bg-white dark:bg-black rounded-xl shadow border border-gray-100 dark:border-gray-800 p-5 flex flex-col transition-all duration-200`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-3'>
                        <AiOutlineCalendar className='text-indigo-600 dark:text-indigo-300 text-xl' />
                      </div>
                      <div>
                        <div className='font-semibold text-[#111] dark:text-white'>
                          {paiement.nom}
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          {paiement.categorie}
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <div className='font-bold text-green-600 dark:text-green-400'>
                        {paiement.montant
                          ? parseFloat(paiement.montant).toFixed(2)
                          : "0.00"}
                        €
                      </div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        par mois
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end mt-4 pt-2 border-t border-gray-100 dark:border-gray-800'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(idx);
                      }}
                      className='text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2'>
                      <FiEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(idx);
                      }}
                      className='text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2'>
                      <FiTrash />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='col-span-3 bg-white dark:bg-black rounded-xl shadow border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center'>
              <div className='text-lg text-gray-500 dark:text-gray-400 text-center'>
                Vous n'avez aucun paiement récurrent.
              </div>
              <button
                onClick={() => {
                  setEditIndex(null);
                  setNewPaiement({
                    nom: "",
                    categorie: "",
                    montant: "",
                  });
                  setShowModal(true);
                  setStep(1);
                }}
                className='mt-4 px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-semibold'>
                Ajouter votre premier paiement récurrent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout ou modification */}
      {showModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-60'
          onClick={(e) => {
            // Ferme le modal seulement si on clique à l'extérieur du contenu
            if (e.target === e.currentTarget) setShowModal(false);
          }}>
          <div className='bg-white dark:bg-black rounded-xl shadow-lg p-8 w-full max-w-md'>
            <h2 className='text-xl font-bold text-[#222] dark:text-white mb-6'>
              {editIndex !== null ? "Modifier" : "Ajouter"} un paiement
              récurrent
            </h2>

            <div className='space-y-4'>
              {/* Étape 1: Nom */}
              {step === 1 && (
                <div className='space-y-3'>
                  <label
                    htmlFor='nom'
                    className='block text-gray-700 dark:text-gray-300 font-medium'>
                    Nom du paiement
                  </label>
                  <input
                    id='nom'
                    name='nom'
                    value={newPaiement.nom}
                    onChange={handleChange}
                    placeholder='Ex: Loyer, Netflix, etc.'
                    className='w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                    ref={nomInputRef}
                    onKeyDown={(e) =>
                      e.key === "Enter" && newPaiement.nom && handleNext()
                    }
                  />
                  <div className='flex justify-end'>
                    <button
                      onClick={handleNext}
                      disabled={!newPaiement.nom}
                      className={`px-5 py-2 rounded-lg font-medium ${
                        newPaiement.nom
                          ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2: Catégorie */}
              {step === 2 && (
                <div className='space-y-3'>
                  <label
                    htmlFor='categorie'
                    className='block text-gray-700 dark:text-gray-300 font-medium'>
                    Catégorie
                  </label>
                  <select
                    id='categorie'
                    name='categorie'
                    value={newPaiement.categorie}
                    onChange={(e) => {
                      handleChange(e);
                      // Passer automatiquement à l'étape suivante si une catégorie est sélectionnée
                      if (e.target.value) setTimeout(() => handleNext(), 200);
                    }}
                    className='w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'>
                    <option value=''>Sélectionner une catégorie</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className='flex justify-between'>
                    <button
                      onClick={handlePrev}
                      className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
                      Retour
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!newPaiement.categorie}
                      className={`px-5 py-2 rounded-lg font-medium ${
                        newPaiement.categorie
                          ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3: Montant */}
              {step === 3 && (
                <div className='space-y-3'>
                  <label
                    htmlFor='montant'
                    className='block text-gray-700 dark:text-gray-300 font-medium'>
                    Montant (€)
                  </label>
                  <input
                    id='montant'
                    name='montant'
                    type='number'
                    step='0.01'
                    min='0.01'
                    value={newPaiement.montant}
                    onChange={handleChange}
                    placeholder='Ex: 49.99'
                    className='w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                    ref={montantInputRef}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      parseFloat(newPaiement.montant) > 0 &&
                      handleAddOrEditPaiement()
                    }
                  />
                  <div className='flex justify-between'>
                    <button
                      onClick={handlePrev}
                      className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
                      Retour
                    </button>
                    <button
                      onClick={handleAddOrEditPaiement}
                      disabled={
                        !newPaiement.montant ||
                        parseFloat(newPaiement.montant) <= 0
                      }
                      className={`px-5 py-2 rounded-lg font-medium ${
                        newPaiement.montant &&
                        parseFloat(newPaiement.montant) > 0
                          ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}>
                      {editIndex !== null ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

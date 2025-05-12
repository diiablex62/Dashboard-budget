import React, { useContext, useState, useRef, useEffect } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
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
import Toast from "../components/Toast";

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

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
    undo: false,
    loading: false,
    timeoutId: null,
    action: null,
  });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [deleteTimeout, setDeleteTimeout] = useState(null);

  const clearToast = () => {
    setToast((t) => {
      if (t.timeoutId) clearTimeout(t.timeoutId);
      return { ...t, open: false, timeoutId: null };
    });
  };

  const handleUndo = () => {
    if (deleteTimeout) clearTimeout(deleteTimeout);
    setDeleteTimeout(null);
    setToast({
      open: true,
      message: "Suppression annulée.",
      type: "success",
      undo: false,
      loading: false,
      timeoutId: setTimeout(() => clearToast(), 3000),
    });
    setLastDeleted(null);
  };

  // Remplace handleDelete par une version avec délai et toast
  const handleDelete = async (idx) => {
    if (!user) return;
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;
    clearToast();
    setToast({
      open: true,
      message: "Suppression en cours...",
      type: "error",
      undo: true,
      loading: true,
      timeoutId: null,
      action: {
        label: "Annuler",
        onClick: handleUndo,
      },
    });
    setLastDeleted({ ...paiement, idx });
    const timeout = setTimeout(async () => {
      await deleteDoc(doc(db, "recurrent", paiement.id));
      setPaiements((prev) => prev.filter((_, i) => i !== idx));
      setToast({
        open: true,
        message: "Suppression effectuée.",
        type: "success",
        undo: false,
        loading: false,
        timeoutId: setTimeout(() => clearToast(), 5000),
      });
      setDeleteTimeout(null);
      setLastDeleted(null);
      // Notification suppression paiement récurrent
      await addDoc(collection(db, "notifications"), {
        type: "recurrent",
        title: "Paiement récurrent supprimé",
        desc: `Suppression de ${
          paiement.nom.charAt(0).toUpperCase() + paiement.nom.slice(1)
        } (${parseFloat(paiement.montant).toFixed(2)}€)`,
        date: new Date().toLocaleDateString("fr-FR"),
        read: false,
        createdAt: serverTimestamp(),
      });
    }, 5000);
    setDeleteTimeout(timeout);
  };

  // Nettoyage du toast si on quitte la page ou démonte le composant
  useEffect(() => {
    return () => {
      if (toast && toast.timeoutId) clearTimeout(toast.timeoutId);
      if (deleteTimeout) clearTimeout(deleteTimeout);
    };
    // eslint-disable-next-line
  }, [toast, deleteTimeout]);

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
    try {
      if (editIndex !== null && paiements[editIndex]) {
        // Modification
        const paiementId = paiements[editIndex].id;
        await updateDoc(doc(db, "recurrent", paiementId), {
          nom: newPaiement.nom,
          categorie: newPaiement.categorie,
          montant: parseFloat(newPaiement.montant),
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
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-6'>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={clearToast}
        loading={toast.loading}
        action={toast.action}
      />
      <div className='flex flex-col gap-6'>
        {/* En-tête */}
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-semibold text-gray-800 dark:text-white'>
            Paiements récurrents
          </div>
          <button
            className='bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition'
            onClick={() => setShowModal(true)}>
            Ajouter un paiement récurrent
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center'
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
              <button
                className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                onClick={() => {
                  setShowModal(false);
                  setStep(1);
                  setNewPaiement({ nom: "", categorie: "", montant: "" });
                }}
                aria-label='Fermer'>
                ✕
              </button>
              <div className='mb-6 text-lg font-semibold dark:text-white'>
                Ajouter un paiement récurrent
              </div>
              {/* Récapitulatif dynamique */}
              <div className='mb-4 dark:text-gray-300'>
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
              {/* Étapes */}
              {step === 1 && (
                <div>
                  <label className='block mb-2 font-medium dark:text-white'>
                    Nom du paiement
                  </label>
                  <input
                    type='text'
                    name='nom'
                    value={newPaiement.nom}
                    onChange={handleChange}
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                    placeholder='Ex: Netflix'
                    ref={nomInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.nom) handleNext();
                    }}
                  />
                  <div className='flex justify-end'>
                    <button
                      className='bg-green-600 text-white px-4 py-2 rounded'
                      disabled={!newPaiement.nom}
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className='block mb-2 font-medium dark:text-white'>
                    Catégorie
                  </label>
                  <select
                    name='categorie'
                    value={newPaiement.categorie}
                    onChange={handleChange}
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'>
                    <option value=''>Sélectionner une catégorie</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className='flex justify-between'>
                    <button
                      className='text-gray-600 dark:text-gray-400'
                      onClick={handlePrev}>
                      Précédent
                    </button>
                    <button
                      className='bg-green-600 text-white px-4 py-2 rounded'
                      disabled={!newPaiement.categorie}
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <label className='block mb-2 font-medium dark:text-white'>
                    Montant (€)
                  </label>
                  <input
                    type='number'
                    name='montant'
                    value={newPaiement.montant}
                    onChange={handleChange}
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
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
                    <button
                      className='text-gray-600 dark:text-gray-400'
                      onClick={handlePrev}>
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
            <div className='bg-white dark:bg-black border border-[#ececec] dark:border-gray-800 rounded-xl flex flex-col items-start gap-2 p-6'>
              <div className='flex items-center gap-4'>
                <div className='bg-green-100 dark:bg-green-900 rounded-full p-3'>
                  <AiOutlineCalendar className='text-2xl text-green-500 dark:text-green-400' />
                </div>
                <div className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
                  Total annuel
                </div>
              </div>
              <div className='text-2xl text-[#222] dark:text-white'>
                {totalAnnuel.toFixed(2)}€
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

        {/* Liste des paiements */}
        <div className='bg-white dark:bg-black border border-[#ececec] dark:border-gray-800 rounded-xl p-8'>
          <div className='text-lg font-semibold mb-6 dark:text-white'>
            Abonnements et prélèvements
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left'>
              <thead>
                <tr className='text-gray-500 dark:text-gray-400 font-medium text-sm'>
                  <th className='py-3 px-2'>Nom</th>
                  <th className='py-3 px-2'>Catégorie</th>
                  <th className='py-3 px-2'>Montant</th>
                  <th className='py-3 px-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((p, idx) => (
                  <tr
                    key={idx}
                    className='border-t border-[#ececec] dark:border-gray-800'>
                    <td className='py-3 px-2 dark:text-white'>
                      {p.nom.charAt(0).toUpperCase() + p.nom.slice(1)}
                    </td>
                    <td className='py-3 px-2 dark:text-gray-300'>
                      {p.categorie}
                    </td>
                    <td className='py-3 px-2 dark:text-white'>
                      {p.montant.toFixed(2)}€
                    </td>
                    <td className='py-3 px-2'>
                      <button
                        className='text-blue-700 dark:text-blue-400 font-medium hover:underline mr-4'
                        title='Modifier'
                        onClick={() => handleEdit(idx)}>
                        <FiEdit className='inline text-lg' />
                      </button>
                      <button
                        className='text-red-500 dark:text-red-400 font-medium hover:underline'
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

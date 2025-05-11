import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { AiOutlinePlus, AiOutlineDollarCircle } from "react-icons/ai";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc, // AJOUT
} from "firebase/firestore";
import { FiEdit, FiTrash } from "react-icons/fi";
import Toast from "../components/Toast"; // Assure-toi que ce composant existe et est identique à celui utilisé pour la connexion

const echelonnes = [
  {
    nom: "Smartphone Samsung",
    mensualite: 149.99,
    numero: 6,
    total: 24,
    reste: 2699.82,
    percent: 25,
    iconColor: "#00b6e6",
  },
  {
    nom: "Assurance Auto",
    mensualite: 60.0,
    numero: 5,
    total: 12,
    reste: 420.0,
    percent: 42,
    iconColor: "#a259e6",
  },
  {
    nom: "Crédit Mobilier",
    mensualite: 99.5,
    numero: 4,
    total: 10,
    reste: 597.0,
    percent: 40,
    iconColor: "#ff7ca3",
  },
  {
    nom: "Électroménagers",
    mensualite: 120.45,
    numero: 2,
    total: 6,
    reste: 482.25,
    percent: 33,
    iconColor: "#a2b6ff",
  },
];

export default function PaiementEchelonne() {
  const totalRevenus = 0;
  const barColor = "#00b96b";
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);
  // Valeur par défaut pour débutMois : mois actuel au format "YYYY-MM"
  const currentMonth = new Date();
  const defaultDebutMois = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    montant: "",
    mensualites: "",
    debutMois: defaultDebutMois,
  });
  const [paiements, setPaiements] = useState([]);
  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const mensualitesInputRef = useRef(null);
  const debutMoisInputRef = useRef(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
    undo: false,
    loading: false,
    timeoutId: null,
  });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [deleteTimeout, setDeleteTimeout] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (showModal && step === 1 && nomInputRef.current)
      nomInputRef.current.focus();
    if (showModal && step === 2 && montantInputRef.current)
      montantInputRef.current.focus();
    if (showModal && step === 3 && mensualitesInputRef.current)
      mensualitesInputRef.current.focus();
    if (showModal && step === 4 && debutMoisInputRef.current)
      debutMoisInputRef.current.focus();
  }, [showModal, step]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setNewPaiement({ ...newPaiement, [e.target.name]: e.target.value });
  };

  // Charger les paiements depuis Firestore
  const fetchPaiements = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "xfois"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      startTransition(() => setPaiements(data));
    } catch (err) {
      console.error("Erreur Firestore fetch xfois:", err);
    }
  }, []);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  // Total Dépenses échelonnées (uniquement la somme des mensualités du mois courant)
  const [currentPeriod, setCurrentPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
  });

  useEffect(() => {
    // Met à jour la période si le mois change (utile si la page reste ouverte longtemps)
    const interval = setInterval(() => {
      const now = new Date();
      const period = `${now.getFullYear()}-${now.getMonth() + 1}`;
      setCurrentPeriod(period);
    }, 1000 * 60 * 60); // vérifie chaque heure
    return () => clearInterval(interval);
  }, []);

  const totalDepenses = useMemo(() => {
    if (!paiements.length) return 0;
    const [year, month] = currentPeriod.split("-").map(Number);
    const nowDate = new Date(year, month - 1);
    return paiements.reduce((acc, p) => {
      if (!p.debutMois || !p.mensualites || !p.montant) return acc;
      const [startYear, startMonth] = p.debutMois.split("-").map(Number);
      const debut = new Date(startYear, startMonth - 1);
      const fin = new Date(
        startYear,
        startMonth - 1 + Number(p.mensualites) - 1
      );
      if (nowDate >= debut && nowDate <= fin) {
        return acc + Number(p.montant) / Number(p.mensualites);
      }
      return acc;
    }, 0);
  }, [paiements, currentPeriod]);

  // Ajout ou modification du paiement échelonné
  const handleAddOrEditPaiement = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editIndex !== null && paiements[editIndex]) {
        // MODIFICATION
        const paiementId = paiements[editIndex].id;
        await updateDoc(doc(db, "xfois", paiementId), {
          nom: newPaiement.nom,
          montant: parseFloat(newPaiement.montant),
          mensualites: parseInt(newPaiement.mensualites, 10),
          debutMois: newPaiement.debutMois,
        });
      } else {
        // AJOUT
        await addDoc(collection(db, "xfois"), {
          nom: newPaiement.nom,
          montant: parseFloat(newPaiement.montant),
          mensualites: parseInt(newPaiement.mensualites, 10),
          debutMois: newPaiement.debutMois,
          createdAt: serverTimestamp(),
        });
      }
      await fetchPaiements();
      setShowModal(false);
      setStep(1);
      setNewPaiement({
        nom: "",
        montant: "",
        mensualites: "",
        debutMois: defaultDebutMois,
      });
      setEditIndex(null);
    } catch (err) {
      console.error("Erreur Firestore add/update xfois:", err);
    }
  };

  // Ajoute ces handlers pour l'exemple (à adapter selon ta logique)
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setNewPaiement({
      nom: paiements[idx].nom,
      montant: paiements[idx].montant.toString(),
      mensualites: paiements[idx].mensualites.toString(),
      debutMois: paiements[idx].debutMois,
    });
    setShowModal(true);
    setStep(1);
  };
  const handleDelete = async (idx) => {
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;
    clearToast();
    setToast({
      open: true,
      message: "Suppression en cours...",
      type: "error", // fond rouge
      undo: true,
      loading: true,
      timeoutId: null,
    });
    setLastDeleted({ ...paiement, idx });
    // Lance le timer d'annulation
    const timeout = setTimeout(async () => {
      await deleteDoc(doc(db, "xfois", paiement.id));
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
    }, 5000);
    setDeleteTimeout(timeout);
  };

  const handleUndo = () => {
    // Annule la suppression
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

  const clearToast = () => {
    setToast((t) => {
      if (t.timeoutId) clearTimeout(t.timeoutId);
      return { ...t, open: false, timeoutId: null };
    });
  };

  // Nettoyage du toast si on quitte la page ou démonte le composant
  useEffect(() => {
    return () => {
      if (toast && toast.timeoutId) clearTimeout(toast.timeoutId);
      if (deleteTimeout) clearTimeout(deleteTimeout);
    };
    // eslint-disable-next-line
  }, [toast, deleteTimeout]);

  // Spinner SVG
  const Spinner = () => (
    <svg
      className='animate-spin h-5 w-5 text-blue-600 mr-2'
      viewBox='0 0 24 24'>
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
        fill='none'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
      />
    </svg>
  );

  // Quand on ouvre la modale pour ajouter, on remet le mois actuel par défaut
  const handleOpenModal = () => {
    setShowModal(true);
    setStep(1);
    setEditIndex(null);
    setNewPaiement({
      nom: "",
      montant: "",
      mensualites: "",
      debutMois: defaultDebutMois,
    });
  };

  // Optimisation : calcul du pourcentage payé avec useMemo pour chaque paiement
  const paiementsAvecPourcentage = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return paiements.map((item) => {
      if (!item.debutMois || !item.mensualites)
        return { ...item, mensualitesPayees: 1, percentPaye: 0 };
      const [startYear, startMonth] = item.debutMois.split("-").map(Number);
      const debut = new Date(startYear, startMonth - 1);
      const nowDate = new Date(currentYear, currentMonth - 1);
      // Calcul du nombre de mensualités déjà passées (1 si on commence ce mois)
      let mensualitesPayees = Math.max(
        1,
        Math.min(
          item.mensualites,
          (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1
        )
      );
      const percentPaye =
        item.mensualites && item.mensualites > 0
          ? (mensualitesPayees / item.mensualites) * 100
          : 0;
      return { ...item, mensualitesPayees, percentPaye };
    });
  }, [paiements]);

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-6'>
      <div className='flex flex-col gap-6'>
        {/* En-tête */}
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-semibold text-gray-800 dark:text-white'>
            Paiements échelonnés
          </div>
          <button
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition'
            onClick={() => setShowModal(true)}>
            <AiOutlinePlus className='inline mr-2' />
            Ajouter
          </button>
        </div>

        {/* Liste : 2 cartes par ligne, toute la largeur */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 w-full'>
          {paiementsAvecPourcentage.map((item, idx) => (
            <div
              key={item.id || idx}
              className='bg-white dark:bg-black border border-[#ececec] dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col relative'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div
                    className='rounded-full p-2'
                    style={{
                      background:
                        "linear-gradient(90deg, #f7fafd 60%, #fff 100%)",
                    }}>
                    <AiOutlineDollarCircle
                      className='text-2xl'
                      style={{ color: "#00b6e6" }}
                    />
                  </div>
                  <span className='font-semibold text-[#222] dark:text-white'>
                    {item.nom.charAt(0).toUpperCase() + item.nom.slice(1)}
                  </span>
                </div>
                <div className='text-[#222] dark:text-white font-bold text-xl'>
                  {(item.montant / item.mensualites).toFixed(2)}
                  <span className='text-base font-normal'>€/mois</span>
                </div>
              </div>
              <div className='flex items-center justify-between mb-1'>
                <div
                  className='font-medium dark:text-gray-300'
                  style={{ color: barColor }}>
                  Mensualité {item.mensualitesPayees}/{item.mensualites}
                </div>
              </div>
              <div className='w-full h-2 bg-[#f0f2f5] dark:bg-gray-800 rounded mb-2 overflow-hidden'>
                <div
                  className='h-2 rounded transition-all duration-500'
                  style={{
                    width: `${item.percentPaye}%`,
                    background: barColor,
                  }}></div>
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Reste à payer:{" "}
                <span className='font-semibold text-[#222] dark:text-white'>
                  {item.montant
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                  €
                </span>
              </div>
              <div className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                {(() => {
                  if (!item.debutMois || !item.mensualites) return "";
                  const [year, month] = item.debutMois.split("-");
                  const debutDate = new Date(Number(year), Number(month) - 1);
                  const finDate = new Date(
                    Number(year),
                    Number(month) - 1 + Number(item.mensualites) - 1
                  );
                  const moisLettres = [
                    "Janvier",
                    "Février",
                    "Mars",
                    "Avril",
                    "Mai",
                    "Juin",
                    "Juillet",
                    "Août",
                    "Septembre",
                    "Octobre",
                    "Novembre",
                    "Décembre",
                  ];
                  const debutStr = `${
                    moisLettres[debutDate.getMonth()]
                  } ${debutDate.getFullYear()}`;
                  const finStr = `${
                    moisLettres[finDate.getMonth()]
                  } ${finDate.getFullYear()}`;
                  return `Début: ${debutStr} - fin ${finStr}`;
                })()}
              </div>
              {/* Boutons action en bas à droite */}
              <div className='absolute top-4 right-4 flex gap-2'>
                <button
                  className='text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                  onClick={() => handleEdit(idx)}>
                  <FiEdit className='text-lg' />
                </button>
                <button
                  className='text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'
                  onClick={() => handleDelete(idx)}>
                  <FiTrash className='text-lg' />
                </button>
              </div>
            </div>
          ))}
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
                  setNewPaiement({
                    nom: "",
                    montant: "",
                    mensualites: "",
                    debutMois: defaultDebutMois,
                  });
                  setEditIndex(null);
                }}
                aria-label='Fermer'>
                ✕
              </button>
              <div className='mb-6 text-lg font-semibold dark:text-white'>
                {editIndex !== null ? "Modifier" : "Ajouter"} un paiement
                échelonné
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
                {step > 1 && newPaiement.montant && (
                  <div>
                    <span className='font-medium'>Montant total :</span>{" "}
                    {parseFloat(newPaiement.montant).toFixed(2)} €
                  </div>
                )}
                {step > 2 && newPaiement.mensualites && (
                  <div>
                    <span className='font-medium'>Nombre de mensualités :</span>{" "}
                    {newPaiement.mensualites}
                  </div>
                )}
                {step > 3 && newPaiement.debutMois && (
                  <div>
                    <span className='font-medium'>Début :</span>{" "}
                    {newPaiement.debutMois}
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
                    placeholder='Ex: Smartphone'
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
                    Montant total (€)
                  </label>
                  <input
                    type='number'
                    name='montant'
                    value={newPaiement.montant}
                    onChange={handleChange}
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                    min='0'
                    step='0.01'
                    placeholder='Ex: 999.99'
                    ref={montantInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.montant)
                        handleNext();
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
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <label className='block mb-2 font-medium dark:text-white'>
                    Nombre de mensualités
                  </label>
                  <input
                    type='number'
                    name='mensualites'
                    value={newPaiement.mensualites}
                    onChange={handleChange}
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                    min='1'
                    max='48'
                    placeholder='Ex: 12'
                    ref={mensualitesInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.mensualites)
                        handleNext();
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
                      disabled={!newPaiement.mensualites}
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <label className='block mb-2 font-medium dark:text-white'>
                    Début de mois
                  </label>
                  <input
                    type='month'
                    name='debutMois'
                    value={newPaiement.debutMois}
                    onChange={handleChange}
                    className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                    ref={debutMoisInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.debutMois)
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
                      disabled={
                        !newPaiement.nom ||
                        !newPaiement.montant ||
                        !newPaiement.mensualites ||
                        !newPaiement.debutMois
                      }
                      onClick={handleAddOrEditPaiement}>
                      {editIndex !== null ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isPending && (
        <div className='fixed top-0 left-0 w-full flex justify-center z-50'>
          <div className='bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded shadow mt-4'>
            Chargement des paiements...
          </div>
        </div>
      )}
    </div>
  );
}

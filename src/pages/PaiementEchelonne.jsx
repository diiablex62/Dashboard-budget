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
import { FiEdit, FiTrash } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import ToastManager from "../components/ToastManager";

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
  const { user } = useAuth();
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

  // Gestion des toasts multiple avec le nouveau système
  const [toasts, setToasts] = useState([]);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [deleteTimeout, setDeleteTimeout] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  // Mode sélection multiple
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPaiements, setSelectedPaiements] = useState([]);

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
    if (!user) return;
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
  }, [user]);

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
    if (!user) return;
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
        // Notification modification paiement échelonné
        await addDoc(collection(db, "notifications"), {
          type: "echelonne",
          title: "Paiement échelonné modifié",
          desc: `Modification de ${
            newPaiement.nom.charAt(0).toUpperCase() + newPaiement.nom.slice(1)
          } (${parseFloat(newPaiement.montant).toFixed(2)}€)`,
          date: new Date().toLocaleDateString("fr-FR"),
          read: false,
          createdAt: serverTimestamp(),
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
        // Notification ajout paiement échelonné
        await addDoc(collection(db, "notifications"), {
          type: "echelonne",
          title: "Nouveau paiement échelonné",
          desc: `Ajout de ${
            newPaiement.nom.charAt(0).toUpperCase() + newPaiement.nom.slice(1)
          } (${parseFloat(newPaiement.montant).toFixed(2)}€)`,
          date: new Date().toLocaleDateString("fr-FR"),
          read: false,
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

  // Fonction pour gérer le mode sélection multiple
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedPaiements([]);
    }
  };

  // Fonction pour sélectionner/désélectionner un paiement
  const togglePaiementSelection = (paiement) => {
    if (!isMultiSelectMode) return;

    setSelectedPaiements((prev) => {
      const isSelected = prev.some((p) => p.id === paiement.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== paiement.id);
      } else {
        return [...prev, paiement];
      }
    });
  };

  // Ajout d'un toast avec identifiant unique
  const addToast = (toast) => {
    const id = Date.now(); // Identifiant unique
    const newToast = {
      id,
      ...toast,
      timeoutId:
        toast.timeoutId ||
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000),
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  // Fonction pour supprimer un toast
  const removeToast = (id) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast && toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  // Fonction pour supprimer tous les toasts
  const clearAllToasts = () => {
    toasts.forEach((toast) => {
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
    });
    setToasts([]);
  };

  // Mise à jour clearToast pour utiliser le nouveau système
  const clearToast = () => {
    clearAllToasts();
  };

  // Mise à jour de handleUndo pour le nouveau système de toast
  const handleUndo = () => {
    if (deleteTimeout) clearTimeout(deleteTimeout);
    setDeleteTimeout(null);
    addToast({
      message: "Suppression annulée.",
      type: "success",
      duration: 3000,
    });
    setLastDeleted(null);
  };

  // Fonction pour supprimer les paiements sélectionnés
  const deleteSelectedPaiements = async () => {
    if (selectedPaiements.length === 0) return;

    // Créer un tableau pour stocker les identifiants de toasts
    const toastIds = [];

    // Ajouter un toast pour chaque paiement
    for (let i = 0; i < selectedPaiements.length; i++) {
      const paiement = selectedPaiements[i];
      const toastId = addToast({
        message: `Suppression de ${paiement.nom} (${i + 1}/${
          selectedPaiements.length
        })`,
        type: "error",
        loading: true,
        duration: 5000,
        action: {
          label: "Annuler",
          onClick: () => {
            // Annuler toutes les suppressions
            if (deleteTimeout) clearTimeout(deleteTimeout);
            // Supprimer tous les toasts en cours
            toastIds.forEach((id) => removeToast(id));
            addToast({
              message: "Suppression annulée",
              type: "success",
              duration: 3000,
            });
          },
        },
      });
      toastIds.push(toastId);
    }

    // Créer un timeout pour la suppression
    const timeout = setTimeout(async () => {
      try {
        // Supprimer chaque paiement sélectionné
        const operations = [];
        for (const paiement of selectedPaiements) {
          operations.push(deleteDoc(doc(db, "xfois", paiement.id)));
        }

        // Attendre que toutes les opérations de suppression soient terminées
        await Promise.all(operations);

        // Mettre à jour les états locaux
        setPaiements((prev) =>
          prev.filter((p) => !selectedPaiements.some((sp) => sp.id === p.id))
        );

        // Supprimer d'abord tous les toasts de chargement
        toastIds.forEach((id) => removeToast(id));

        // Puis ajouter un toast de succès
        addToast({
          message:
            selectedPaiements.length === 1
              ? "Paiement échelonné supprimé"
              : `${selectedPaiements.length} paiements échelonnés supprimés`,
          type: "success",
          duration: 3000,
        });

        // Réinitialiser la sélection
        setSelectedPaiements([]);

        // Sortir du mode sélection si activé
        if (isMultiSelectMode) {
          setIsMultiSelectMode(false);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression multiple:", error);

        // Supprimer tous les toasts de chargement
        toastIds.forEach((id) => removeToast(id));

        addToast({
          message: "Erreur lors de la suppression",
          type: "error",
          duration: 5000,
        });
      }

      // Nettoyage du timeout
      setDeleteTimeout(null);
    }, 3000);

    // Stocker le timeout pour pouvoir l'annuler
    setDeleteTimeout(timeout);
  };

  // Mise à jour de handleDelete pour utiliser le nouveau système de toast
  const handleDelete = async (idx) => {
    if (!user) return;
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;
    clearToast();
    const toastId = addToast({
      message: "Suppression en cours...",
      type: "error",
      loading: true,
      action: {
        label: "Annuler",
        onClick: handleUndo,
      },
    });
    setLastDeleted({ ...paiement, idx });
    const timeout = setTimeout(async () => {
      await deleteDoc(doc(db, "xfois", paiement.id));
      setPaiements((prev) => prev.filter((_, i) => i !== idx));
      removeToast(toastId);
      addToast({
        message: "Suppression effectuée.",
        type: "success",
        duration: 5000,
      });
      setDeleteTimeout(null);
      setLastDeleted(null);
      // Notification suppression paiement échelonné
      await addDoc(collection(db, "notifications"), {
        type: "echelonne",
        title: "Paiement échelonné supprimé",
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
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <ToastManager toasts={toasts} onClose={removeToast} />

      <div className='max-w-6xl mx-auto'>
        {/* En-tête et boutons d'action */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800 dark:text-white mb-1'>
              Paiements Échelonnés
            </h1>
            <div className='text-gray-500 dark:text-gray-400 text-base'>
              Gérez vos paiements en plusieurs fois.
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 mt-4 md:mt-0'>
            {isMultiSelectMode && (
              <button
                onClick={deleteSelectedPaiements}
                disabled={selectedPaiements.length === 0}
                className={`px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center ${
                  selectedPaiements.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}>
                <FiTrash className='mr-2' />
                Supprimer{" "}
                {selectedPaiements.length > 0 &&
                  `(${selectedPaiements.length})`}
              </button>
            )}
            <button
              onClick={toggleMultiSelectMode}
              className={`px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center ${
                isMultiSelectMode
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              }`}>
              {isMultiSelectMode ? "Annuler" : "Sélection multiple"}
            </button>
            <button
              onClick={handleOpenModal}
              className='px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-semibold flex items-center justify-center'>
              <AiOutlinePlus className='mr-2' /> Ajouter un paiement
            </button>
          </div>
        </div>

        {/* Affichage des paiements échelonnés */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {paiements.length > 0 ? (
            paiements.map((paiement, idx) => {
              // Calculer le pourcentage de progression
              const totalPaiement = parseFloat(paiement.montant);
              const mensualite =
                totalPaiement / parseFloat(paiement.mensualites);

              // Calculer le nombre de paiements effectués
              let paiementsEffectues = 0;
              if (paiement.debutMois) {
                const [debutAnnee, debutMois] = paiement.debutMois
                  .split("-")
                  .map(Number);
                const dateDebut = new Date(debutAnnee, debutMois - 1);
                const maintenant = new Date();
                const moisEcoules =
                  (maintenant.getFullYear() - dateDebut.getFullYear()) * 12 +
                  maintenant.getMonth() -
                  dateDebut.getMonth() +
                  1;
                paiementsEffectues = Math.min(
                  moisEcoules,
                  parseInt(paiement.mensualites)
                );
              }

              const progressPercent = Math.max(
                0,
                Math.min(
                  100,
                  (paiementsEffectues / parseFloat(paiement.mensualites)) * 100
                )
              );
              const montantRestant =
                totalPaiement - mensualite * paiementsEffectues;

              // Vérifier si le paiement est sélectionné
              const isSelected = selectedPaiements.some(
                (p) => p.id === paiement.id
              );

              return (
                <div
                  key={paiement.id || idx}
                  className={`bg-white dark:bg-black rounded-xl shadow border ${
                    isSelected
                      ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700"
                      : "border-gray-100 dark:border-gray-800"
                  } p-5 flex flex-col transition-all duration-200 ${
                    isMultiSelectMode ? "cursor-pointer" : ""
                  }`}
                  onClick={() =>
                    isMultiSelectMode && togglePaiementSelection(paiement)
                  }>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      {isMultiSelectMode && (
                        <div className='mr-3'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              togglePaiementSelection(paiement);
                            }}
                            className='h-5 w-5 text-blue-600 rounded'
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                      <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3'>
                        <AiOutlineDollarCircle className='text-blue-600 dark:text-blue-300 text-xl' />
                      </div>
                      <div>
                        <div className='font-semibold text-[#111] dark:text-white'>
                          {paiement.nom}
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          Mensualité: {mensualite.toFixed(2)}€
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <div className='font-bold text-green-600 dark:text-green-400'>
                        {paiementsEffectues}/{paiement.mensualites}
                      </div>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        Reste: {montantRestant.toFixed(2)}€
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className='mt-3 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-blue-500 rounded-full'
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {!isMultiSelectMode && (
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
                  )}
                </div>
              );
            })
          ) : (
            <div className='col-span-3 bg-white dark:bg-black rounded-xl shadow border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center'>
              <div className='text-lg text-gray-500 dark:text-gray-400 text-center'>
                Vous n'avez aucun paiement échelonné.
              </div>
              <button
                onClick={handleOpenModal}
                className='mt-4 px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-semibold'>
                Ajouter votre premier paiement échelonné
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Garder le modal existant */}
      {showModal && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center'
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
                    if (e.key === "Enter" && newPaiement.montant) handleNext();
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
  );
}

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
import { ECHELONNE_CATEGORIES } from "../utils/categoryUtils";

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
  const defaultDebutDate = (() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
  })();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    montant: "",
    mensualites: "",
    debutDate: defaultDebutDate,
    categorie: "",
  });
  const [paiements, setPaiements] = useState([]);
  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const mensualitesInputRef = useRef(null);
  const debutDateInputRef = useRef(null);
  const categorieInputRef = useRef(null);

  const [lastDeleted, setLastDeleted] = useState(null);
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
    if (showModal && step === 4 && debutDateInputRef.current)
      debutDateInputRef.current.focus();
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
      if (!p.debutDate || !p.mensualites || !p.montant) return acc;
      const [startYear, startMonth] = p.debutDate.split("-").map(Number);
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

  // Ajout d'un élément pour afficher le total mensuel
  const renderTotalMensuel = () => {
    return (
      <div className='bg-white dark:bg-black rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 mb-4'>
        <div className='flex justify-between items-center'>
          <div className='font-semibold text-gray-700 dark:text-gray-300'>
            Total mensuel
          </div>
          <div className='font-bold text-green-600 dark:text-green-400'>
            {totalDepenses.toFixed(2)}€
          </div>
        </div>
      </div>
    );
  };

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
          debutDate: newPaiement.debutDate,
          categorie: newPaiement.categorie || "Autre",
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
          debutDate: newPaiement.debutDate,
          categorie: newPaiement.categorie || "Autre",
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
        debutDate: defaultDebutDate,
        categorie: "",
      });
      setEditIndex(null);

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));
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
      debutDate: paiements[idx].debutDate,
      categorie: paiements[idx].categorie || "Autre",
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

  // Fonction pour supprimer un paiement sans toast
  const handleDelete = async (idx) => {
    if (!user) return;
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;

    try {
      console.log(`🔥 SUPPRESSION: xfois/${paiement.id}`);
      await deleteDoc(doc(db, "xfois", paiement.id));
      console.log(`✅ Document supprimé avec succès: xfois/${paiement.id}`);

      setPaiements((prev) => prev.filter((_, i) => i !== idx));

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

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));
    } catch (error) {
      console.error(
        `❌ ERREUR lors de la suppression: ${error.message || error}`
      );
      console.error(error);
    }
  };

  // Fonction pour supprimer plusieurs paiements
  const deleteSelectedPaiements = async () => {
    if (selectedPaiements.length === 0) return;

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

      // Réinitialiser la sélection
      setSelectedPaiements([]);
      setIsMultiSelectMode(false);

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));
    } catch (error) {
      console.error(
        `❌ ERREUR lors des suppressions multiples: ${error.message || error}`
      );
      console.error(error);
    }
  };

  // Quand on ouvre la modale pour ajouter, on remet la date actuelle par défaut
  const handleOpenModal = () => {
    setShowModal(true);
    setStep(1);
    setEditIndex(null);
    setNewPaiement({
      nom: "",
      montant: "",
      mensualites: "",
      debutDate: defaultDebutDate,
      categorie: "",
    });
  };

  // Optimisation : calcul du pourcentage payé avec useMemo pour chaque paiement
  const paiementsAvecPourcentage = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return paiements.map((item) => {
      if (!item.debutDate || !item.mensualites)
        return { ...item, mensualitesPayees: 1, percentPaye: 0 };
      const [startYear, startMonth] = item.debutDate.split("-").map(Number);
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
            <button
              onClick={handleOpenModal}
              className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'>
              <span className='text-lg font-bold'>+</span>
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Affichage des paiements échelonnés */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-2'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222] dark:text-white'>
                Paiements Échelonnés
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Liste de tous vos paiements en plusieurs fois
              </div>
            </div>
          </div>

          {/* Affichage du total mensuel */}
          {paiements.length > 0 && renderTotalMensuel()}

          {paiements.length === 0 ? (
            <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
              <p>Aucun paiement échelonné à afficher.</p>
              <button
                onClick={handleOpenModal}
                className='mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto'>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter un paiement échelonné</span>
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {paiements.map((paiement, idx) => {
                // Calculer le pourcentage de progression
                const totalPaiement = parseFloat(paiement.montant);
                const mensualite =
                  totalPaiement / parseFloat(paiement.mensualites);

                // Calculer le nombre de paiements effectués
                let paiementsEffectues = 0;
                if (paiement.debutDate) {
                  const [debutAnnee, debutMois] = paiement.debutDate
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
                    (paiementsEffectues / parseFloat(paiement.mensualites)) *
                      100
                  )
                );
                const montantRestant =
                  totalPaiement - mensualite * paiementsEffectues;

                return (
                  <div
                    key={paiement.id || idx}
                    className='bg-white dark:bg-black rounded-lg shadow border border-gray-100 dark:border-gray-800 p-4 flex flex-col transition-all duration-200'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3'>
                          <AiOutlineDollarCircle className='text-gray-600 dark:text-gray-300 text-xl' />
                        </div>
                        <div>
                          <div className='font-semibold dark:text-white'>
                            {paiement.nom.charAt(0).toUpperCase() +
                              paiement.nom.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                        <div className='font-bold text-green-600 dark:text-green-400'>
                          {(montantRestant / paiement.mensualites).toFixed(2)}
                          €/mois
                        </div>
                      </div>
                    </div>

                    <div className='mt-4 text-sm text-green-500 font-medium'>
                      Mensualité {paiementsEffectues}/{paiement.mensualites}
                    </div>

                    <div className='mt-1 mb-2 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden'>
                      <div
                        className='bg-green-500 h-full'
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className='mt-1 flex justify-between text-gray-500 dark:text-gray-400 text-sm'>
                      <div>Reste à payer: {montantRestant.toFixed(2)}€</div>
                      <div>
                        Début:{" "}
                        {paiement.debutDate
                          ? paiement.debutDate.replace("-", " ")
                          : "N/A"}
                      </div>
                    </div>

                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      {paiement.categorie || "Autre"}
                    </div>

                    <div className='flex justify-end mt-3'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(idx);
                        }}
                        className='text-blue-500 dark:text-blue-400 mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                        aria-label='Modifier'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={1.5}
                          stroke='currentColor'
                          className='w-4 h-4'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idx);
                        }}
                        className='text-red-500 dark:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                        aria-label='Supprimer'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={1.5}
                          stroke='currentColor'
                          className='w-4 h-4'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  debutDate: defaultDebutDate,
                  categorie: "",
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
              {step > 3 && newPaiement.debutDate && (
                <div>
                  <span className='font-medium'>Début :</span>{" "}
                  {new Date(newPaiement.debutDate).toLocaleDateString("fr-FR")}
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
                  placeholder='Ex: Crédit auto'
                  ref={nomInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.nom) handleNext();
                  }}
                />
                <div className='flex justify-end'>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
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
                  min='0.01'
                  step='0.01'
                  placeholder='Ex: 9999'
                  ref={montantInputRef}
                  autoFocus
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
                    className='bg-gray-900 text-white px-4 py-2 rounded'
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
                  Catégorie
                </label>
                <select
                  name='categorie'
                  value={newPaiement.categorie}
                  onChange={(e) => {
                    handleChange(e);
                    // Passage automatique après sélection d'une catégorie (mais pas sur la valeur vide)
                    if (e.target.value && e.target.value !== "") {
                      setTimeout(() => handleNext(), 100);
                    }
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={categorieInputRef}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.categorie) {
                      e.preventDefault();
                      handleNext();
                    }
                  }}>
                  <option value=''>Sélectionner une catégorie</option>
                  {/* Utiliser Array.from(new Set()) pour éliminer les doublons */}
                  {Array.from(new Set(ECHELONNE_CATEGORIES)).map((cat) => (
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
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.categorie}
                    onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 4 && (
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
                  autoFocus
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
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.mensualites}
                    onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 5 && (
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Date de début
                </label>
                <input
                  type='date'
                  name='debutDate'
                  value={newPaiement.debutDate}
                  onChange={handleChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  ref={debutDateInputRef}
                  autoFocus
                />
                <div className='flex justify-between'>
                  <button
                    className='text-gray-600 dark:text-gray-400'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    className='bg-gray-900 text-white px-4 py-2 rounded'
                    disabled={!newPaiement.debutDate}
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

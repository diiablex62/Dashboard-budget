import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import {
  AiOutlinePlus,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import { FiEdit, FiTrash } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ECHELONNE_CATEGORIES,
  getMonthYear,
  MONTHS,
} from "../utils/categoryUtils";
import { installmentPaymentApi } from "../utils/api";

export default function PaiementEchelonne() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);
  const { user } = useAuth();
  const defaultDebutDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
  const [allPaiements, setAllPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const mensualitesInputRef = useRef(null);
  const debutDateInputRef = useRef(null);
  const categorieInputRef = useRef(null);

  const [_lastDeleted, _setLastDeleted] = useState(null);

  // Mode sélection multiple
  const [_isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [_selectedPaiements, setSelectedPaiements] = useState([]);

  const [_isPending, startTransition] = useTransition();

  const fetchPaiements = useCallback(async () => {
    if (!user) {
      console.log("Pas d'utilisateur connecté");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(
        "Récupération des paiements échelonnés pour l'utilisateur:",
        user.id
      );

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Session expirée, veuillez vous reconnecter");
      }

      const response = await installmentPaymentApi.getByUserId(user.id);
      if (!response) {
        throw new Error("Format de réponse invalide");
      }

      console.log("Paiements échelonnés reçus:", response);
      setPaiements(response);
      setAllPaiements(response);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements échelonnés:",
        error
      );
      if (error.message === "Session expirée, veuillez vous reconnecter") {
        setError(error.message);
      } else if (error.response) {
        setError(
          `Erreur serveur: ${error.response.data?.message || "Erreur inconnue"}`
        );
      } else if (error.request) {
        setError(
          "Impossible de contacter le serveur, veuillez réessayer plus tard"
        );
      } else {
        setError("Erreur lors de la récupération des paiements échelonnés");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  useEffect(() => {
    const handleDataUpdate = () => fetchPaiements();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchPaiements]);

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

  const handleNext = useCallback(() => setStep((s) => s + 1), []);
  const handlePrev = useCallback(() => setStep((s) => s - 1), []);

  const handleChange = useCallback((e) => {
    setNewPaiement((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleAddOrEditPaiement = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!user) {
        setError("Vous devez être connecté pour ajouter un paiement échelonné");
        return;
      }

      if (
        !newPaiement.nom ||
        !newPaiement.montant ||
        !newPaiement.mensualites ||
        !newPaiement.debutDate
      ) {
        setError("Tous les champs sont obligatoires");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const paymentData = {
          ...newPaiement,
          userId: user.id,
          montant: parseFloat(newPaiement.montant),
          mensualites: parseInt(newPaiement.mensualites),
        };

        if (editIndex !== null) {
          await installmentPaymentApi.update(editIndex, paymentData);
          console.log("Paiement échelonné mis à jour:", editIndex);
        } else {
          await installmentPaymentApi.create(paymentData);
          console.log("Nouveau paiement échelonné créé");
        }

        setNewPaiement({
          nom: "",
          montant: "",
          mensualites: "",
          debutDate: defaultDebutDate,
          categorie: "",
        });
        setEditIndex(null);
        setShowModal(false);
        await fetchPaiements();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde du paiement échelonné:",
          error
        );
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la sauvegarde du paiement échelonné");
        }
      } finally {
        setLoading(false);
      }
    },
    [user, newPaiement, editIndex, defaultDebutDate, fetchPaiements]
  );

  const handleEdit = useCallback((payment) => {
    setNewPaiement({
      nom: payment.nom,
      montant: payment.montant.toString(),
      mensualites: payment.mensualites.toString(),
      debutDate: payment.debutDate,
      categorie: payment.categorie || "",
    });
    setEditIndex(payment.id);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (
        !window.confirm(
          "Êtes-vous sûr de vouloir supprimer ce paiement échelonné ?"
        )
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await installmentPaymentApi.delete(id);
        console.log("Paiement échelonné supprimé:", id);
        await fetchPaiements();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du paiement échelonné:",
          error
        );
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la suppression du paiement échelonné");
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchPaiements]
  );

  const totalDepenses = useMemo(() => {
    if (!paiements.length) return 0;

    return paiements.reduce((acc, p) => {
      if (!p.montant || !p.mensualites) return acc;
      const montantMensuel = parseFloat(p.montant) / parseFloat(p.mensualites);
      return acc + montantMensuel;
    }, 0);
  }, [paiements]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "paiementsEchelonnesTotal",
        totalDepenses.toString()
      );
      window.paiementsEchelonnesTotal = totalDepenses;
      window.dispatchEvent(
        new CustomEvent("paiements-echelonnes-updated", {
          detail: { total: totalDepenses },
        })
      );
      console.log("Total paiements échelonnés mis à jour:", totalDepenses);
    }
  }, [totalDepenses]);

  // Calcul de la répartition par catégorie
  const _categoriesStats = useMemo(() => {
    if (!paiements.length) return [];

    // Grouper les paiements par catégorie
    const categoriesMap = paiements.reduce((acc, p) => {
      const categorie = p.categorie || "Autre";
      const montantMensuel = parseFloat(p.montant) / parseFloat(p.mensualites);

      if (!acc[categorie]) {
        acc[categorie] = {
          categorie,
          montant: 0,
          count: 0,
        };
      }

      acc[categorie].montant += montantMensuel;
      acc[categorie].count += 1;

      return acc;
    }, {});

    // Convertir en tableau et trier par montant décroissant
    return Object.values(categoriesMap).sort((a, b) => b.montant - a.montant);
  }, [paiements]);

  // Fonctions pour naviguer entre les mois
  const handlePrevMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Fonctions pour le sélecteur de date avancé
  const handleYearSelect = (yearValue) => {
    console.log(`Année sélectionnée: ${yearValue}`);
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setFullYear(yearValue);
      return d;
    });
  };

  const handleMonthSelect = (monthIndex) => {
    console.log(`Mois sélectionné: ${MONTHS[monthIndex]} (${monthIndex})`);
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(monthIndex);
      return d;
    });
  };

  const handleDatePickerConfirm = () => {
    console.log(`Date confirmée: ${getMonthYear(selectedDate)}`);
    setShowDatePicker(false);
  };

  // Optimisation : calcul du pourcentage payé avec useMemo pour chaque paiement
  const _paiementsAvecPourcentage = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return paiements.map((item) => {
      if (!item.debutDate || !item.mensualites)
        return { ...item, mensualitesPayees: 1, percentPaye: 0 };
      const [startYear, startMonth] = item.debutDate.split("-").map(Number);

      // Calcul du nombre de mensualités déjà passées
      const moisEcoules =
        (currentYear - startYear) * 12 + (currentMonth - (startMonth - 1));

      let mensualitesPayees = Math.max(
        1,
        Math.min(item.mensualites, moisEcoules + 1)
      );

      const percentPaye =
        item.mensualites && item.mensualites > 0
          ? (mensualitesPayees / item.mensualites) * 100
          : 0;
      return { ...item, mensualitesPayees, percentPaye };
    });
  }, [paiements]);

  // Fonction pour gérer le mode sélection multiple
  const _toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!_isMultiSelectMode);
    if (_isMultiSelectMode) {
      setSelectedPaiements([]);
    }
  };

  // Fonction pour sélectionner/désélectionner un paiement
  const _togglePaiementSelection = (paiement) => {
    if (!_isMultiSelectMode) return;

    setSelectedPaiements((prev) => {
      const isSelected = prev.some((p) => p.id === paiement.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== paiement.id);
      } else {
        return [...prev, paiement];
      }
    });
  };

  // Fonction pour supprimer plusieurs paiements
  const _deleteSelectedPaiements = async () => {
    if (_selectedPaiements.length === 0) return;

    try {
      // Supprimer chaque paiement sélectionné
      const operations = [];
      for (const paiement of _selectedPaiements) {
        operations.push(installmentPaymentApi.delete(paiement.id));
      }

      // Attendre que toutes les opérations de suppression soient terminées
      await Promise.all(operations);

      // Mettre à jour les états locaux
      setPaiements((prev) =>
        prev.filter((p) => !_selectedPaiements.some((sp) => sp.id === p.id))
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
  const _handleOpenModal = () => {
    setShowModal(true);
    setStep(1);
    setEditIndex(null);
    setNewPaiement({
      nom: "",
      montant: "",
      mensualites: "",
      debutDate: new Date(selectedDate).toISOString().split("T")[0],
      categorie: "",
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* En-tête et sélecteur de mois */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800 dark:text-white mb-1'>
              Paiements Échelonnés
            </h1>
            <div className='text-gray-500 dark:text-gray-400 text-base'>
              Gérez vos paiements en plusieurs fois.
            </div>
          </div>
          {/* Sélecteur mois/année */}
          <div className='flex items-center mt-4 md:mt-0'>
            <div className='flex items-center bg-[#f6f9fb] dark:bg-black rounded-xl px-4 py-2 shadow-none border border-transparent'>
              <button
                className='text-[#222] dark:text-white text-xl px-2 py-1 rounded hover:bg-[#e9eef2] dark:hover:bg-gray-900 transition'
                onClick={handlePrevMonth}
                aria-label='Mois précédent'
                type='button'>
                <AiOutlineArrowLeft />
              </button>
              <div
                className='mx-4 text-[#222] dark:text-white text-lg font-medium w-40 text-center cursor-pointer hover:bg-[#e9eef2] dark:hover:bg-gray-900 px-3 py-1 rounded transition'
                onClick={() => setShowDatePicker(true)}>
                {getMonthYear(selectedDate)}
              </div>
              <button
                className='text-[#222] dark:text-white text-xl px-2 py-1 rounded hover:bg-[#e9eef2] dark:hover:bg-gray-900 transition'
                onClick={handleNextMonth}
                aria-label='Mois suivant'
                type='button'>
                <AiOutlineArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Sélecteur de mois et année */}
        {showDatePicker && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-80'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                  Sélectionner une date
                </h3>
                <button
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  onClick={() => setShowDatePicker(false)}>
                  &times;
                </button>
              </div>

              {/* Sélecteur d'année */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                  Année
                </label>
                <div className='space-y-2'>
                  {/* Décennies */}
                  {[2020, 2030, 2040, 2050].map((decennie) => (
                    <div key={decennie} className='grid grid-cols-5 gap-2 mb-2'>
                      {[...Array(10)].map((_, i) => {
                        const yearValue = decennie + i;
                        return (
                          <button
                            key={yearValue}
                            className={`py-2 px-3 rounded text-sm ${
                              yearValue === selectedDate.getFullYear()
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => handleYearSelect(yearValue)}>
                            {yearValue}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sélecteur de mois */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                  Mois
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {MONTHS.map((monthName, idx) => (
                    <button
                      key={idx}
                      className={`py-2 px-3 rounded ${
                        idx === selectedDate.getMonth()
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleMonthSelect(idx)}>
                      {monthName.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className='flex justify-end space-x-2'>
                <button
                  className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600'
                  onClick={() => setShowDatePicker(false)}>
                  Annuler
                </button>
                <button
                  className='px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600'
                  onClick={handleDatePickerConfirm}>
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* Carte 1: Total mensuel */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-blue-600 dark:text-blue-400 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Total Mensuel</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {totalDepenses.toFixed(2)} €
            </div>
          </div>

          {/* Carte 2: Paiements actifs */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
              <AiOutlineCalendar className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Paiements Actifs</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {paiements.length} paiements
            </div>
          </div>
        </div>

        {/* Onglets Dépenses/Revenus */}
        <div className='flex justify-center mb-6'>
          <div className='flex w-full max-w-xl bg-[#f3f6fa] dark:bg-black rounded-xl p-1'>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center
                bg-white dark:bg-black text-[#111827] dark:text-white shadow font-semibold border border-[#e5eaf1] dark:border-gray-800
              `}
              onClick={() =>
                navigate("/depenses-revenus", {
                  state: { tabInitial: "depenses" },
                })
              }
              type='button'>
              Dépenses
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center
                bg-transparent text-[#7b849b] dark:text-gray-400 font-normal
              `}
              onClick={() =>
                navigate("/depenses-revenus", {
                  state: { tabInitial: "revenus" },
                })
              }
              type='button'>
              Revenus
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
                Paiements du mois de {getMonthYear(selectedDate)}
              </div>
            </div>
            {/* Bouton Ajouter - toujours visible ici */}
            <div className='flex space-x-3'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={() => {
                  setEditIndex(null);
                  setNewPaiement({
                    nom: "",
                    montant: "",
                    mensualites: "",
                    debutDate: new Date(selectedDate)
                      .toISOString()
                      .split("T")[0],
                    categorie: "",
                  });
                  setShowModal(true);
                  setStep(1);
                }}>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {paiements.length === 0 ? (
            <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
              <p>Aucun paiement échelonné pour {getMonthYear(selectedDate)}.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {paiements.map((paiement, idx) => {
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
                          {(
                            parseFloat(paiement.montant) /
                            parseFloat(paiement.mensualites)
                          ).toFixed(2)}
                          €/mois
                        </div>
                      </div>
                    </div>

                    <div className='mt-4 text-sm text-green-500 font-medium'>
                      Mensualité {paiement.mensualitesPayees}/
                      {paiement.mensualites}
                    </div>

                    <div className='mt-1 mb-2 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden'>
                      <div
                        className='bg-green-500 h-full'
                        style={{
                          width: `${
                            (paiement.mensualitesPayees /
                              parseFloat(paiement.mensualites)) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <div className='mt-1 flex justify-between text-gray-500 dark:text-gray-400 text-sm'>
                      <div>
                        {paiement.debutDate
                          ? `Début: ${new Date(
                              paiement.debutDate
                            ).toLocaleDateString("fr-FR")}`
                          : "Début: N/A"}
                      </div>
                      <div>
                        {paiement.debutDate && paiement.mensualites
                          ? (() => {
                              const dateDebut = new Date(paiement.debutDate);
                              const dateFin = new Date(dateDebut);
                              dateFin.setMonth(
                                dateDebut.getMonth() +
                                  parseInt(paiement.mensualites) -
                                  1
                              );
                              return `Fin: ${dateFin.toLocaleDateString(
                                "fr-FR"
                              )}`;
                            })()
                          : "Fin: N/A"}
                      </div>
                    </div>

                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      {paiement.categorie || "Autre"}
                    </div>

                    <div className='flex justify-end mt-3'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(paiement);
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
                          handleDelete(paiement.id);
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
                  debutDate: new Date(selectedDate).toISOString().split("T")[0],
                  categorie: "",
                });
                setEditIndex(null);
              }}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              {editIndex !== null ? "Modifier" : "Ajouter"} un paiement
              échelonné pour {getMonthYear(selectedDate)}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaiement.debutDate) {
                      e.preventDefault();
                      console.log("Validation par touche Entrée");
                      handleAddOrEditPaiement();
                    }
                  }}
                />
                <div className='flex justify-between mt-4'>
                  <button
                    type='button'
                    className='text-gray-600 dark:text-gray-400 px-4 py-2'
                    onClick={handlePrev}>
                    Précédent
                  </button>
                  <button
                    type='button'
                    className='bg-gray-900 text-white px-6 py-2 rounded-lg font-medium'
                    disabled={!newPaiement.debutDate}
                    onClick={() => {
                      console.log("Validation par clic bouton");
                      handleAddOrEditPaiement();
                    }}>
                    {editIndex !== null
                      ? "Valider la modification"
                      : "Valider l'ajout"}
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

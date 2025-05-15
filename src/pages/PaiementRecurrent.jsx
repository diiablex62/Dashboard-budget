import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineCalendar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
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
import {
  RECURRENT_CATEGORIES,
  getMonthYear,
  MONTHS,
} from "../utils/categoryUtils";

export default function PaiementRecurrent() {
  // Paiements vides au départ
  const [paiements, setPaiements] = useState([]);
  const [allPaiements, setAllPaiements] = useState([]); // Tous les paiements stockés ici
  const totalMensuel =
    paiements.length > 0 ? paiements.reduce((acc, p) => acc + p.montant, 0) : 0;

  // Ajouter l'état pour la date sélectionnée
  const [selectedDate, setSelectedDate] = useState(new Date());

  // État pour contrôler l'affichage du sélecteur de date
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { user } = useAuth();

  // Gestion modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    categorie: "",
    montant: "",
    // Ajouter la date comme propriété pour les paiements récurrents avec mois spécifique
    date: new Date(selectedDate).toISOString().split("T")[0],
    jourPrelevement: "1", // Jour par défaut (1er du mois)
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

  // Effet pour mettre à jour les données quand le mois change
  useEffect(() => {
    if (allPaiements.length > 0) {
      filterPaiementsByMonth();
    }
  }, [selectedDate, allPaiements]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setNewPaiement({ ...newPaiement, [e.target.name]: e.target.value });
  };

  // Charger tous les paiements depuis Firestore
  const fetchPaiements = async () => {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, "recurrent"));
      const loadedPaiements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllPaiements(loadedPaiements);
      filterPaiementsByMonth(loadedPaiements);
    } catch (err) {
      console.error("Erreur Firestore fetch:", err);
    }
  };

  // Filtrer les paiements selon le mois sélectionné
  const filterPaiementsByMonth = (paiementsToFilter = allPaiements) => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    // Filtrer les paiements par mois spécifique si la date existe
    // ou inclure les paiements sans date (mensuels permanents)
    const filteredPaiements = paiementsToFilter.filter((paiement) => {
      // Si le paiement n'a pas de date, c'est un paiement récurrent permanent
      if (!paiement.date) return true;

      const paiementDate = new Date(paiement.date);
      return (
        paiementDate.getMonth() === selectedMonth &&
        paiementDate.getFullYear() === selectedYear
      );
    });

    setPaiements(filteredPaiements);
  };

  // Pour l'édition
  const [editIndex, setEditIndex] = useState(null);

  // Modal de confirmation pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState(null);
  const [deleteOption, setDeleteOption] = useState("all"); // all, futureOnly, currentOnly

  // Ouvrir la modal de confirmation de suppression
  const confirmDelete = (idx) => {
    setPaiementToDelete(idx);
    setDeleteOption("all"); // Option par défaut
    setShowDeleteModal(true);
  };

  // Fonction pour supprimer un paiement selon l'option choisie
  const handleDelete = async () => {
    if (paiementToDelete === null) return;

    const idx = paiementToDelete;
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;

    const paiementId = paiement.id;
    const paiementName = paiement.nom;

    console.log(
      `🚀 Début suppression de ${paiementName} (${paiementId}) dans recurrent - Option: ${deleteOption}`
    );

    try {
      // Selon l'option choisie
      if (deleteOption === "all") {
        // Suppression complète du paiement récurrent
        console.log(`🔥 SUPPRESSION COMPLÈTE: recurrent/${paiementId}`);
        await deleteDoc(doc(db, "recurrent", paiementId));
        console.log(
          `✅ Document supprimé avec succès: recurrent/${paiementId}`
        );

        // Mise à jour directe de l'interface
        setAllPaiements((prevPaiements) => {
          const newPaiements = prevPaiements.filter((p) => p.id !== paiementId);
          return newPaiements;
        });

        setPaiements((prevPaiements) => {
          const newPaiements = prevPaiements.filter((p) => p.id !== paiementId);
          console.log(
            `État local: ${
              prevPaiements.length - newPaiements.length
            } paiement supprimé`
          );
          return newPaiements;
        });

        // Notification de suppression complète
        try {
          await addDoc(collection(db, "notifications"), {
            type: "recurrent",
            title: "Paiement récurrent supprimé",
            desc: `Suppression complète de ${
              paiementName.charAt(0).toUpperCase() + paiementName.slice(1)
            } (${parseFloat(paiement.montant).toFixed(2)}€)`,
            date: new Date().toLocaleDateString("fr-FR"),
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (notifError) {
          console.error(
            "Erreur lors de l'ajout de la notification:",
            notifError
          );
        }
      } else if (deleteOption === "futureOnly") {
        // Mettre à jour le paiement avec une date de fin
        console.log(
          `🔄 MODIFICATION avec date de fin: recurrent/${paiementId}`
        );
        await updateDoc(doc(db, "recurrent", paiementId), {
          finDate: new Date(selectedDate).toISOString().split("T")[0],
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Document mis à jour avec une date de fin`);

        // Conserver le paiement dans l'interface mais mettre à jour son état
        setAllPaiements((prevPaiements) => {
          return prevPaiements.map((p) => {
            if (p.id === paiementId) {
              return {
                ...p,
                finDate: new Date(selectedDate).toISOString().split("T")[0],
              };
            }
            return p;
          });
        });

        // Notification de suppression future
        try {
          await addDoc(collection(db, "notifications"), {
            type: "recurrent",
            title: "Paiement récurrent modifié",
            desc: `Arrêt des paiements futurs de ${
              paiementName.charAt(0).toUpperCase() + paiementName.slice(1)
            } à partir de ${new Date(selectedDate).toLocaleDateString(
              "fr-FR"
            )}`,
            date: new Date().toLocaleDateString("fr-FR"),
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (notifError) {
          console.error(
            "Erreur lors de l'ajout de la notification:",
            notifError
          );
        }
      } else if (deleteOption === "currentOnly") {
        // Créer une exclusion pour ce mois spécifique
        console.log(`🔄 AJOUT d'exclusion mensuelle: recurrent/${paiementId}`);

        // Structure pour stocker les exclusions
        const currentMonth = `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}`;

        // Récupérer les exclusions existantes ou initialiser un tableau vide
        const exclusions = paiement.exclusions || [];

        // Ajouter le mois actuel s'il n'est pas déjà exclu
        if (!exclusions.includes(currentMonth)) {
          exclusions.push(currentMonth);

          await updateDoc(doc(db, "recurrent", paiementId), {
            exclusions: exclusions,
            updatedAt: serverTimestamp(),
          });
          console.log(`✅ Exclusion ajoutée pour ${currentMonth}`);

          // Mettre à jour l'interface
          setAllPaiements((prevPaiements) => {
            return prevPaiements.map((p) => {
              if (p.id === paiementId) {
                return { ...p, exclusions };
              }
              return p;
            });
          });

          // Retirer temporairement de l'affichage pour ce mois
          setPaiements((prevPaiements) => {
            return prevPaiements.filter((p) => p.id !== paiementId);
          });

          // Notification d'exclusion mensuelle
          try {
            await addDoc(collection(db, "notifications"), {
              type: "recurrent",
              title: "Paiement récurrent modifié",
              desc: `Exclusion de ${
                paiementName.charAt(0).toUpperCase() + paiementName.slice(1)
              } pour ${getMonthYear(selectedDate)}`,
              date: new Date().toLocaleDateString("fr-FR"),
              read: false,
              createdAt: serverTimestamp(),
            });
          } catch (notifError) {
            console.error(
              "Erreur lors de l'ajout de la notification:",
              notifError
            );
          }
        }
      }

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));

      // Fermer la modal
      setShowDeleteModal(false);
      setPaiementToDelete(null);
    } catch (error) {
      console.error(
        `❌ ERREUR critique lors de la suppression: ${error.message || error}`
      );
      console.error(error);

      // Fermer la modal même en cas d'erreur
      setShowDeleteModal(false);
      setPaiementToDelete(null);
    }
  };

  // Commencer la modification
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setNewPaiement({
      nom: paiements[idx].nom,
      categorie: paiements[idx].categorie,
      montant: paiements[idx].montant.toString(),
      date:
        paiements[idx].date ||
        new Date(selectedDate).toISOString().split("T")[0],
      jourPrelevement: (paiements[idx].jourPrelevement || 1).toString(),
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
      // S'assurer que la date correspond au mois sélectionné
      const paiementData = {
        nom: newPaiement.nom,
        categorie: newPaiement.categorie,
        montant: parseFloat(newPaiement.montant),
        // Utiliser le mois sélectionné pour la date
        date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 15)
          .toISOString()
          .split("T")[0],
        // Ajouter le jour de prélèvement (entre 1 et 28)
        jourPrelevement: Math.min(
          Math.max(1, parseInt(newPaiement.jourPrelevement) || 1),
          28
        ),
      };

      if (editIndex !== null && paiements[editIndex]) {
        // Modification
        const paiementId = paiements[editIndex].id;
        await updateDoc(doc(db, "recurrent", paiementId), {
          ...paiementData,
          updatedAt: serverTimestamp(),
        });

        // Notification modification paiement récurrent
        await addDoc(collection(db, "notifications"), {
          type: "recurrent",
          title: "Paiement récurrent modifié",
          desc: `Modification de ${
            paiementData.nom.charAt(0).toUpperCase() + paiementData.nom.slice(1)
          } (${parseFloat(paiementData.montant).toFixed(2)}€)`,
          date: new Date().toLocaleDateString("fr-FR"),
          read: false,
          createdAt: serverTimestamp(),
        });
      } else {
        // Ajout
        console.log("Ajout paiement Firestore :", paiementData);

        await addDoc(collection(db, "recurrent"), {
          ...paiementData,
          createdAt: serverTimestamp(),
        });

        // Ajoute une notification en BDD
        await addDoc(collection(db, "notifications"), {
          type: "recurrent",
          title: "Nouveau paiement récurrent",
          desc: `Ajout de ${
            paiementData.nom.charAt(0).toUpperCase() + paiementData.nom.slice(1)
          } (${parseFloat(paiementData.montant).toFixed(2)}€)`,
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
      setNewPaiement({
        nom: "",
        categorie: "",
        montant: "",
        date: new Date(selectedDate).toISOString().split("T")[0],
        jourPrelevement: "1",
      });
      setEditIndex(null);

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));
    } catch (err) {
      console.error("Erreur Firestore add/update:", err);
    }
  };

  // Fonction pour regrouper les montants par catégorie
  const dataCategories = Array.from(new Set(RECURRENT_CATEGORIES))
    .map((cat) => ({
      name: cat,
      value: paiements
        .filter((p) => p.categorie === cat)
        .reduce((acc, p) => acc + p.montant, 0),
    }))
    .filter((d) => d.value > 0);

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

  return (
    <div className='bg-[#f8fafc] dark:bg-black min-h-screen p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* En-tête et sélecteur de mois */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-800 dark:text-white mb-1'>
              Paiements Récurrents
            </h1>
            <div className='text-gray-500 dark:text-gray-400 text-base'>
              Gérez vos paiements mensuels.
            </div>
          </div>
          {/* Sélecteur mois/année style image remplaçant le bouton ajouter */}
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
        <div className='flex flex-col md:flex-row gap-6 mb-8'>
          {/* Colonne gauche : Totaux mensuel et annuel */}
          <div className='flex-1 flex flex-col gap-4'>
            <div className='bg-white dark:bg-black border border-[#ececec] dark:border-gray-800 rounded-xl flex flex-col items-start gap-2 p-6'>
              <div className='flex items-center gap-4'>
                <div className='bg-blue-100 dark:bg-blue-900 rounded-full p-3'>
                  <AiOutlineCalendar className='text-2xl text-blue-500 dark:text-blue-400' />
                </div>
                <div className='text-gray-500 dark:text-gray-400 text-sm font-medium'>
                  Total mensuel pour {getMonthYear(selectedDate)}
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
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222] dark:text-white'>
                Paiements Récurrents
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Paiements du mois de {getMonthYear(selectedDate)}
              </div>
            </div>
            {/* Bouton Ajouter déplacé ici - affiché seulement si des paiements existent déjà */}
            {paiements.length > 0 && (
              <div className='flex space-x-3'>
                <button
                  className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                  onClick={() => {
                    setEditIndex(null);
                    setNewPaiement({
                      nom: "",
                      categorie: "",
                      montant: "",
                      date: new Date(selectedDate).toISOString().split("T")[0],
                      jourPrelevement: "1",
                    });
                    setShowModal(true);
                    setStep(1);
                  }}>
                  <span className='text-lg font-bold'>+</span>
                  <span>Ajouter</span>
                </button>
              </div>
            )}
          </div>

          {paiements.length === 0 ? (
            <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
              <p>Aucun paiement récurrent pour {getMonthYear(selectedDate)}.</p>
              <button
                onClick={() => {
                  setEditIndex(null);
                  setNewPaiement({
                    nom: "",
                    categorie: "",
                    montant: "",
                    date: new Date(selectedDate).toISOString().split("T")[0],
                    jourPrelevement: "1",
                  });
                  setShowModal(true);
                  setStep(1);
                }}
                className='mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto'>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter un paiement récurrent</span>
              </button>
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
                          <AiOutlineCalendar className='text-gray-600 dark:text-gray-300 text-xl' />
                        </div>
                        <div>
                          <div className='font-semibold dark:text-white'>
                            {paiement.nom.charAt(0).toUpperCase() +
                              paiement.nom.slice(1)}
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
                          Prélèvement le {paiement.jourPrelevement || 1} du mois
                        </div>
                      </div>
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
                          confirmDelete(idx);
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

      {/* Modal d'ajout ou modification */}
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
                  categorie: "",
                  montant: "",
                  date: new Date(selectedDate).toISOString().split("T")[0],
                  jourPrelevement: "1",
                });
                setEditIndex(null);
              }}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              {editIndex !== null ? "Modifier" : "Ajouter"} un paiement
              récurrent pour {getMonthYear(selectedDate)}
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

            <div className='space-y-4'>
              {/* Étape 1: Nom */}
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
                    placeholder='Ex: Loyer, Netflix, etc.'
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
              {/* Étape 2: Catégorie */}
              {step === 2 && (
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
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.categorie) {
                        e.preventDefault();
                        handleNext();
                      }
                    }}>
                    <option value=''>Sélectionner une catégorie</option>
                    {Array.from(new Set(RECURRENT_CATEGORIES)).map((cat) => (
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
              {/* Étape 3: Montant */}
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
                    step='0.01'
                    min='0.01'
                    placeholder='Ex: 49.99'
                    ref={montantInputRef}
                    autoFocus
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        parseFloat(newPaiement.montant) > 0
                      )
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
                      disabled={
                        !newPaiement.montant ||
                        parseFloat(newPaiement.montant) <= 0
                      }
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {/* Étape 4: Jour de prélèvement (anciennement étape 5) */}
              {step === 4 && (
                <div>
                  <label className='block mb-2 font-medium dark:text-white'>
                    Jour de prélèvement
                  </label>

                  {/* Ajout d'une gestion du clavier pour la navigation entre les jours */}
                  <div
                    className='mb-4'
                    tabIndex='0'
                    onKeyDown={(e) => {
                      const currentJour = parseInt(newPaiement.jourPrelevement);

                      // Validation avec la touche Entrée
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOrEditPaiement();
                        return;
                      }

                      // Navigation avec les flèches
                      if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        if (currentJour > 1) {
                          setNewPaiement({
                            ...newPaiement,
                            jourPrelevement: (currentJour - 1).toString(),
                          });
                        }
                      } else if (e.key === "ArrowRight") {
                        e.preventDefault();
                        if (currentJour < 28) {
                          setNewPaiement({
                            ...newPaiement,
                            jourPrelevement: (currentJour + 1).toString(),
                          });
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (currentJour > 7) {
                          setNewPaiement({
                            ...newPaiement,
                            jourPrelevement: (currentJour - 7).toString(),
                          });
                        }
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (currentJour <= 21) {
                          setNewPaiement({
                            ...newPaiement,
                            jourPrelevement: (currentJour + 7).toString(),
                          });
                        }
                      }
                    }}
                    style={{ outline: "none" }} // Supprimer le focus visible tout en gardant la fonctionnalité
                    autoFocus>
                    <div className='grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-500 dark:text-gray-400'>
                      <div>L</div>
                      <div>M</div>
                      <div>M</div>
                      <div>J</div>
                      <div>V</div>
                      <div>S</div>
                      <div>D</div>
                    </div>
                    <div className='grid grid-cols-7 gap-1'>
                      {/* Première semaine: 1-7 */}
                      {[1, 2, 3, 4, 5, 6, 7].map((jour) => (
                        <button
                          key={jour}
                          type='button'
                          onClick={() =>
                            setNewPaiement({
                              ...newPaiement,
                              jourPrelevement: jour.toString(),
                            })
                          }
                          className={`p-2 rounded-md text-center ${
                            newPaiement.jourPrelevement === jour.toString()
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOrEditPaiement();
                            }
                          }}>
                          {jour}
                        </button>
                      ))}

                      {/* Deuxième semaine: 8-14 */}
                      {[8, 9, 10, 11, 12, 13, 14].map((jour) => (
                        <button
                          key={jour}
                          type='button'
                          onClick={() =>
                            setNewPaiement({
                              ...newPaiement,
                              jourPrelevement: jour.toString(),
                            })
                          }
                          className={`p-2 rounded-md text-center ${
                            newPaiement.jourPrelevement === jour.toString()
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOrEditPaiement();
                            }
                          }}>
                          {jour}
                        </button>
                      ))}

                      {/* Troisième semaine: 15-21 */}
                      {[15, 16, 17, 18, 19, 20, 21].map((jour) => (
                        <button
                          key={jour}
                          type='button'
                          onClick={() =>
                            setNewPaiement({
                              ...newPaiement,
                              jourPrelevement: jour.toString(),
                            })
                          }
                          className={`p-2 rounded-md text-center ${
                            newPaiement.jourPrelevement === jour.toString()
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOrEditPaiement();
                            }
                          }}>
                          {jour}
                        </button>
                      ))}

                      {/* Quatrième semaine: 22-28 */}
                      {[22, 23, 24, 25, 26, 27, 28].map((jour) => (
                        <button
                          key={jour}
                          type='button'
                          onClick={() =>
                            setNewPaiement({
                              ...newPaiement,
                              jourPrelevement: jour.toString(),
                            })
                          }
                          className={`p-2 rounded-md text-center ${
                            newPaiement.jourPrelevement === jour.toString()
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOrEditPaiement();
                            }
                          }}>
                          {jour}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 dark:text-gray-400 mb-4'>
                    Le système utilisera le 1er jour du mois par défaut pour
                    tous les paiements récurrents, sauf si vous sélectionnez un
                    autre jour. Le paiement sera affiché dans l'agenda à ce jour
                    chaque mois.
                  </div>
                  <div className='flex justify-between'>
                    <button
                      className='text-gray-600 dark:text-gray-400'
                      onClick={handlePrev}>
                      Précédent
                    </button>
                    <button
                      className='bg-gray-900 text-white px-4 py-2 rounded'
                      onClick={handleAddOrEditPaiement}>
                      {editIndex !== null ? "Modifier" : "Ajouter"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center'
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
            <button
              className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              onClick={() => {
                setShowDeleteModal(false);
                setPaiementToDelete(null);
              }}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              Êtes-vous sûr de vouloir supprimer ce paiement récurrent ?
            </div>

            <div className='space-y-4'>
              {/* Étape 1: Options de suppression */}
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Options de suppression
                </label>
                <select
                  value={deleteOption}
                  onChange={(e) => {
                    setDeleteOption(e.target.value);
                  }}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 mb-4'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleDelete();
                    }
                  }}>
                  <option value='all'>
                    Supprimer ce paiement et tous les suivants
                  </option>
                  <option value='futureOnly'>
                    Supprimer ce paiement et tous les suivants à partir de
                    maintenant
                  </option>
                  <option value='currentOnly'>
                    Exclure ce paiement pour ce mois
                  </option>
                </select>
              </div>

              {/* Étape 2: Confirmation */}
              <div>
                <button
                  className='bg-gray-900 text-white px-4 py-2 rounded'
                  onClick={handleDelete}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

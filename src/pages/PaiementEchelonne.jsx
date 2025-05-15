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
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ECHELONNE_CATEGORIES, getMonthYear } from "../utils/categoryUtils";

export default function PaiementEchelonne() {
  const _navigate = useNavigate();
  const { _isLoggedIn } = useContext(AppContext);
  const { user } = useAuth();
  const defaultDebutDate = (() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
  })();

  // Ajouter l'état pour la date sélectionnée
  const [selectedDate, setSelectedDate] = useState(new Date());

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
  const [allPaiements, setAllPaiements] = useState([]); // Tous les paiements stockés ici
  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const mensualitesInputRef = useRef(null);
  const debutDateInputRef = useRef(null);
  const categorieInputRef = useRef(null);

  const [_lastDeleted, _setLastDeleted] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  // Mode sélection multiple
  const [_isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [_selectedPaiements, setSelectedPaiements] = useState([]);

  const [_isPending, startTransition] = useTransition();

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
      const snapshot = await getDocs(collection(db, "echelonne"));
      const data = snapshot.docs
        .filter((doc) => doc.data().uid === user.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      startTransition(() => {
        setAllPaiements(data);
        filterPaiementsByMonth(data);
        console.log(
          "Paiements échelonnés chargés depuis echelonne:",
          data.length
        );
      });
    } catch (err) {
      console.error("Erreur Firestore fetch paiements échelonnés:", err);
      setAllPaiements([]);
      setPaiements([]);
    }
  }, [user]);

  // Filtrer les paiements selon le mois sélectionné
  const filterPaiementsByMonth = (paiementsToFilter = allPaiements) => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDateObj = new Date(selectedYear, selectedMonth);

    // Filtrer les paiements actifs pour le mois sélectionné
    const filteredPaiements = paiementsToFilter.filter((p) => {
      if (!p.debutDate || !p.mensualites || !p.montant) return false;

      // Convertir la date de début en objet Date
      const [startYear, startMonth] = p.debutDate.split("-").map(Number);
      const debutDate = new Date(startYear, startMonth - 1); // -1 car les mois dans Date sont 0-11

      // Calculer la date de fin (date de début + nombre de mensualités)
      const finDate = new Date(
        startYear,
        startMonth - 1 + parseInt(p.mensualites)
      );

      // Le paiement est actif si le mois sélectionné est entre la date de début et la date de fin
      return selectedDateObj >= debutDate && selectedDateObj < finDate;
    });

    // Une fois filtrés, mettre à jour les paiements avec le calcul du nombre de mensualités déjà effectuées
    // pour le mois sélectionné (pour l'affichage de la progression)
    const paiementsAvecMensualites = filteredPaiements.map((p) => {
      const [startYear, startMonth] = p.debutDate.split("-").map(Number);

      // Calculer le nombre de mois écoulés depuis la date de début (0-based)
      // Si on est en mars et le paiement a commencé en mars, moisEcoules = 0
      // Si on est en avril et le paiement a commencé en mars, moisEcoules = 1
      const moisEcoules =
        (selectedYear - startYear) * 12 + (selectedMonth - (startMonth - 1));

      // Mensualité = mois écoulés + 1
      // Si on commence en mars, mensualité 1 en mars, mensualité 2 en avril
      const mensualitesPayees = Math.max(
        1,
        Math.min(moisEcoules + 1, parseInt(p.mensualites))
      );

      // Mettre à jour le paiement avec l'information du nombre de mensualités déjà payées
      // pour le mois actuellement sélectionné
      return {
        ...p,
        mensualitesPayees,
      };
    });

    setPaiements(paiementsAvecMensualites);
  };

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  // Effet pour mettre à jour les données quand le mois change
  useEffect(() => {
    if (allPaiements.length > 0) {
      filterPaiementsByMonth();
    }
  }, [selectedDate, allPaiements]);

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

  // Total Dépenses échelonnées (uniquement la somme des mensualités du mois courant)
  const totalDepenses = useMemo(() => {
    if (!paiements.length) return 0;

    return paiements.reduce((acc, p) => {
      if (!p.montant || !p.mensualites) return acc;
      // Calcul du montant mensuel = montant total / nombre de mensualités
      const montantMensuel = parseFloat(p.montant) / parseFloat(p.mensualites);
      return acc + montantMensuel;
    }, 0);
  }, [paiements]);

  // On expose le montant total des paiements échelonnés pour le tableau de bord
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Stockage dans le localStorage pour une meilleure persistance
      localStorage.setItem(
        "paiementsEchelonnesTotal",
        totalDepenses.toString()
      );

      // Également dans une variable globale pour un accès facile
      window.paiementsEchelonnesTotal = totalDepenses;

      // Déclencher un événement pour mettre à jour le tableau de bord
      const event = new CustomEvent("paiements-echelonnes-updated", {
        detail: { total: totalDepenses },
      });
      window.dispatchEvent(event);

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

  // Ajout ou modification du paiement échelonné
  const handleAddOrEditPaiement = async (e) => {
    if (e) e.preventDefault();

    // Vérification des champs obligatoires
    if (
      !newPaiement.nom ||
      !newPaiement.montant ||
      !newPaiement.mensualites ||
      !newPaiement.debutDate
    ) {
      console.error("Tous les champs sont obligatoires");
      alert("Tous les champs sont obligatoires");
      return;
    }

    // Vérification de la connexion utilisateur
    if (!user) {
      console.error("Utilisateur non connecté");
      alert("Vous devez être connecté pour ajouter un paiement échelonné.");
      return;
    }

    console.log(
      "Tentative d'ajout/modification d'un paiement échelonné:",
      newPaiement
    );

    try {
      if (editIndex !== null && paiements[editIndex]) {
        // MODIFICATION
        try {
          const paiementId = paiements[editIndex].id;
          console.log(`Modification du paiement: echelonne/${paiementId}`);

          await updateDoc(doc(db, "echelonne", paiementId), {
            nom: newPaiement.nom,
            montant: parseFloat(newPaiement.montant),
            mensualites: parseInt(newPaiement.mensualites, 10),
            debutDate: newPaiement.debutDate,
            categorie: newPaiement.categorie || "Autre",
            updatedAt: serverTimestamp(),
          });

          console.log("✅ Modification réussie");
        } catch (modifError) {
          console.error("Erreur lors de la modification:", modifError);
          throw new Error(
            `Erreur lors de la modification: ${modifError.message}`
          );
        }

        // Notification
        try {
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
        } catch (notifError) {
          console.error(
            "Erreur lors de l'ajout de notification (non bloquant):",
            notifError
          );
          // On continue même si l'ajout de notification échoue
        }
      } else {
        // AJOUT
        try {
          console.log(
            `Création d'un nouveau paiement échelonné dans echelonne`
          );

          const newData = {
            nom: newPaiement.nom,
            montant: parseFloat(newPaiement.montant),
            mensualites: parseInt(newPaiement.mensualites, 10),
            debutDate: newPaiement.debutDate,
            categorie: newPaiement.categorie || "Autre",
            createdAt: serverTimestamp(),
            uid: user.uid,
          };

          console.log("Données à ajouter:", newData);

          const docRef = await addDoc(collection(db, "echelonne"), newData);

          console.log(`✅ Ajout réussi avec ID: ${docRef.id} dans echelonne`);
        } catch (ajoutError) {
          console.error("Erreur lors de l'ajout:", ajoutError);
          throw new Error(`Erreur lors de l'ajout: ${ajoutError.message}`);
        }

        // Notification
        try {
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
        } catch (notifError) {
          console.error(
            "Erreur lors de l'ajout de notification (non bloquant):",
            notifError
          );
          // On continue même si l'ajout de notification échoue
        }
      }

      // Mise à jour du dashboard
      try {
        // Enregistrer le total mensuel dans une collection séparée pour le dashboard
        const currentYear = selectedDate.getFullYear();
        const currentMonth = selectedDate.getMonth() + 1;
        const periodId = `${currentYear}-${currentMonth}`;

        console.log(`Mise à jour du dashboard pour la période ${periodId}`);

        // Calculer le total des paiements échelonnés pour le mois en cours
        const updatedPaiements = await getDocs(collection(db, "echelonne"));
        const userPaiements = updatedPaiements.docs
          .filter((doc) => doc.data().uid === user.uid)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        console.log(
          `Paiements utilisateur après ajout/modification: ${userPaiements.length}`
        );

        // Filtrer pour n'avoir que les paiements actifs pour le mois courant
        const activePaiements = userPaiements.filter((p) => {
          if (!p.debutDate || !p.mensualites || !p.montant) return false;
          const [startYear, startMonth] = p.debutDate.split("-").map(Number);
          const debutDate = new Date(startYear, startMonth - 1);
          const finDate = new Date(
            startYear,
            startMonth - 1 + parseInt(p.mensualites)
          );
          const currentDate = new Date(currentYear, currentMonth - 1);
          return currentDate >= debutDate && currentDate < finDate;
        });

        console.log(
          `Paiements actifs pour ${periodId}: ${activePaiements.length}`
        );

        // Calculer le total mensuel
        const totalMensuel = activePaiements.reduce((sum, p) => {
          const mensualite = parseFloat(p.montant) / parseInt(p.mensualites);
          return sum + mensualite;
        }, 0);

        // Récupérer ou créer le document pour ce mois
        const dashboardRef = doc(db, "dashboard", periodId);

        // Vérifier si le document existe déjà
        const dashboardDoc = await getDoc(dashboardRef);

        if (dashboardDoc.exists()) {
          // Mettre à jour le document existant
          await updateDoc(dashboardRef, {
            echelonneTotal: totalMensuel,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Créer un nouveau document
          await setDoc(dashboardRef, {
            echelonneTotal: totalMensuel,
            year: currentYear,
            month: currentMonth,
            updatedAt: serverTimestamp(),
            uid: user.uid,
          });
        }

        console.log(
          `Total échelonné pour ${periodId} mis à jour: ${totalMensuel}€`
        );
      } catch (dashboardError) {
        console.error(
          "Erreur lors de la mise à jour du dashboard (non bloquant):",
          dashboardError
        );
        // On continue même si la mise à jour du dashboard échoue
      }

      try {
        // Réinitialiser l'état et fermer la modale
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
      } catch (resetError) {
        console.error(
          "Erreur lors de la réinitialisation de l'interface:",
          resetError
        );
      }

      console.log("Processus d'ajout/modification terminé avec succès");
    } catch (err) {
      console.error("❌ Erreur Firestore add/update:", err);
      alert(`Une erreur est survenue: ${err.message || "Erreur inconnue"}`);
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
        operations.push(deleteDoc(doc(db, "echelonne", paiement.id)));
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

  // Fonction pour supprimer un paiement sans toast
  const handleDelete = async (idx) => {
    if (!user) return;
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;

    try {
      console.log(`🔥 SUPPRESSION: echelonne/${paiement.id}`);
      await deleteDoc(doc(db, "echelonne", paiement.id));
      console.log(`✅ Document supprimé avec succès: echelonne/${paiement.id}`);

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

      // Mettre à jour le total dans la collection dashboard
      const currentYear = selectedDate.getFullYear();
      const currentMonth = selectedDate.getMonth() + 1;
      const periodId = `${currentYear}-${currentMonth}`;

      try {
        // Recalculer le total après suppression
        const updatedPaiements = await getDocs(collection(db, "echelonne"));
        const userPaiements = updatedPaiements.docs
          .filter((doc) => doc.data().uid === user.uid)
          .map((doc) => doc.data());

        // Filtrer pour n'avoir que les paiements actifs pour le mois courant
        const activePaiements = userPaiements.filter((p) => {
          if (!p.debutDate || !p.mensualites || !p.montant) return false;
          const [startYear, startMonth] = p.debutDate.split("-").map(Number);
          const debutDate = new Date(startYear, startMonth - 1);
          const finDate = new Date(
            startYear,
            startMonth - 1 + parseInt(p.mensualites)
          );
          const currentDate = new Date(currentYear, currentMonth - 1);
          return currentDate >= debutDate && currentDate < finDate;
        });

        // Calculer le total mensuel
        const totalMensuel = activePaiements.reduce((sum, p) => {
          const mensualite = parseFloat(p.montant) / parseInt(p.mensualites);
          return sum + mensualite;
        }, 0);

        // Récupérer ou créer le document pour ce mois
        const dashboardRef = doc(db, "dashboard", periodId);

        // Vérifier si le document existe déjà
        const dashboardDoc = await getDoc(dashboardRef);

        if (dashboardDoc.exists()) {
          // Mettre à jour le document existant
          await updateDoc(dashboardRef, {
            echelonneTotal: totalMensuel,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Créer un nouveau document
          await setDoc(dashboardRef, {
            echelonneTotal: totalMensuel,
            year: currentYear,
            month: currentMonth,
            updatedAt: serverTimestamp(),
            uid: user.uid,
          });
        }

        console.log(
          `Total échelonné pour ${periodId} mis à jour après suppression: ${totalMensuel}€`
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour du dashboard:", error);
      }

      // Déclencher un événement pour mettre à jour le tableau de bord
      window.dispatchEvent(new Event("data-updated"));
    } catch (error) {
      console.error(
        `❌ ERREUR lors de la suppression: ${error.message || error}`
      );
      console.error(error);
    }
  };

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
              <div className='mx-4 text-[#222] dark:text-white text-lg font-medium w-40 text-center'>
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

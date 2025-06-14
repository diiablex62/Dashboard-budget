import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  AiOutlinePlus,
  AiOutlineCalendar,
  AiOutlineDollarCircle,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  MONTHS,
  CATEGORY_COLORS,
} from "../utils/categoryUtils";
import {
  calculTotalRevenusRecurrentsMois,
  calculTotalDepensesRecurrentesMois,
  formatMontant,
} from "../utils/calcul";
import MonthPickerModal from "../components/ui/MonthPickerModal";
import CardDesign from "../components/ui/CardDesign";
import { ModalRecurrent } from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

const PaiementRecurrent = () => {
  const { getData, updateData } = useAuth();
  const [currentTab, setCurrentTab] = useState("revenu");
  const [error] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("selected");
  const [paiementsRecurrents, setPaiementsRecurrents] = useState([]);

  // Sécurisation des données pour éviter les erreurs si non chargées
  const { paiementsRecurrents: dataPaiementsRecurrents } = useMemo(
    () => getData() || {},
    [getData]
  );
  const safePaiementsRecurrents = Array.isArray(dataPaiementsRecurrents)
    ? dataPaiementsRecurrents
    : [];

  // Sélectionner les catégories en fonction du type
  const categories = useMemo(() => {
    return currentTab === "depense" ? DEPENSES_CATEGORIES : REVENUS_CATEGORIES;
  }, [currentTab]);

  useEffect(() => {
    if (selectedId) {
      const paiement = safePaiementsRecurrents.find(
        (p) => p.id === parseInt(selectedId)
      );
      if (paiement) {
        setSelectedPaiement(paiement);
        setShowModal(true);
        setCurrentTab(paiement.type === "depense" ? "depense" : "revenu");
      }
    }
  }, [selectedId, safePaiementsRecurrents]);

  // Initialiser les paiements récurrents avec les données de getData
  useEffect(() => {
    const { paiementsRecurrents: initialData } = getData() || {};
    if (Array.isArray(initialData)) {
      setPaiementsRecurrents(initialData);
    }
  }, [getData]);

  // Calcul des totaux
  const totalRevenus = useMemo(() => {
    const total = calculTotalRevenusRecurrentsMois(
      paiementsRecurrents.filter((p) => p.type === "revenu"),
      selectedMonth
    );
    console.log("Total revenus récurrents calculé:", total);
    return total;
  }, [paiementsRecurrents, selectedMonth]);

  const totalDepenses = useMemo(() => {
    const total = calculTotalDepensesRecurrentesMois(
      paiementsRecurrents.filter((p) => p.type === "depense"),
      selectedMonth
    );
    console.log("Total dépenses récurrentes calculé:", total);
    return total;
  }, [paiementsRecurrents, selectedMonth]);

  // Mettre à jour le total dans le localStorage et déclencher l'événement
  useEffect(() => {
    if (typeof window !== "undefined") {
      const total = currentTab === "depense" ? totalDepenses : totalRevenus;
      localStorage.setItem("paiementsRecurrentsTotal", total.toString());
      window.paiementsRecurrentsTotal = total;
      window.dispatchEvent(
        new CustomEvent("paiements-recurrents-updated", {
          detail: { total },
        })
      );
    }
  }, [totalRevenus, totalDepenses, currentTab]);

  // Filtrage des paiements selon le type et le mois
  const paiementsFiltres = useMemo(() => {
    const filtres = paiementsRecurrents.filter((p) => {
      if (p.type !== currentTab) return false;

      // Vérifie si le jour de prélèvement est valide pour ce mois
      const moisActuel = selectedMonth.getMonth() + 1;
      const anneeActuelle = selectedMonth.getFullYear();
      const jourPrelevement = p.jourPrelevement;
      const joursDansMois = new Date(anneeActuelle, moisActuel, 0).getDate();
      const jourValide = jourPrelevement <= joursDansMois;

      return jourValide;
    });
    console.log("Paiements filtrés:", filtres);
    return filtres;
  }, [paiementsRecurrents, currentTab, selectedMonth]);

  // Trier les paiements par jour de prélèvement
  const paiementsTries = useMemo(() => {
    return [...paiementsFiltres].sort(
      (a, b) => a.jourPrelevement - b.jourPrelevement
    );
  }, [paiementsFiltres]);

  // Fonction locale pour éditer un paiement
  const handleEditPaiement = useCallback((paiement) => {
    setSelectedPaiement(paiement);
    setShowModal(true);
  }, []);

  const handleAddPaiement = useCallback(() => {
    setSelectedPaiement({
      nom: "",
      categorie: "",
      montant: "",
      jour: "",
    });
    setShowModal(true);
  }, []);

  const handleSave = useCallback(
    (paiement) => {
      console.log("Paiement reçu dans handleSave:", paiement);

      const newPaiement = {
        ...paiement,
        id: Date.now(),
        type: currentTab,
        isRecurrent: true,
        date: paiement.dateDebut,
        dateDebut: paiement.dateDebut,
        jourPrelevement: parseInt(paiement.jour),
        montant: parseFloat(paiement.montant),
        nom: paiement.nom,
        categorie: paiement.categorie,
      };
      console.log("Nouveau paiement formaté:", newPaiement);

      // Mettre à jour les paiements récurrents
      setPaiementsRecurrents((prev) => {
        const updated = [...prev, newPaiement];
        console.log("Paiements récurrents mis à jour:", updated);
        return updated;
      });

      // Ajouter au tableau depenseRevenu
      const { depenseRevenu = [] } = getData() || {};
      console.log("DepenseRevenu actuel:", depenseRevenu);

      const updatedDepenseRevenu = [...depenseRevenu, newPaiement];
      console.log("DepenseRevenu mis à jour:", updatedDepenseRevenu);

      updateData({ depenseRevenu: updatedDepenseRevenu });
      console.log("Données mises à jour avec updateData");

      // Déclencher l'événement de mise à jour
      window.dispatchEvent(new CustomEvent("data-updated"));
      console.log("Événement data-updated déclenché");

      setShowModal(false);
    },
    [currentTab, getData, updateData]
  );

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        {/* Titre et sélecteur de mois */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap'>
              Paiements récurrents
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap'>
              {currentTab === "depense"
                ? "Gérez vos dépenses qui sont les mêmes chaque mois"
                : "Gérez vos revenus qui sont les mêmes chaque mois"}
            </p>
          </div>
          <MonthPickerModal
            selectedDate={selectedMonth}
            onDateChange={setSelectedMonth}
          />
        </div>
        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {currentTab === "depense" ? (
            /* Carte total dépenses */
            <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
              <div className='flex items-center text-red-600 mb-2'>
                <AiOutlineDollarCircle className='text-2xl mr-2' />
                <span className='text-sm font-semibold'>Total dépenses</span>
              </div>
              <div className='text-2xl font-bold dark:text-white'>
                {formatMontant(totalDepenses)}€
              </div>
            </div>
          ) : (
            /* Carte total revenus */
            <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
              <div className='flex items-center text-green-600 mb-2'>
                <AiOutlineCalendar className='text-2xl mr-2' />
                <span className='text-sm font-semibold'>Total revenus</span>
              </div>
              <div className='text-2xl font-bold dark:text-white'>
                {formatMontant(totalRevenus)}€
              </div>
            </div>
          )}
        </div>
        {/* Switch Dépenses/Revenus */}
        <div className='flex w-full max-w-xl bg-[#f3f6fa] rounded-xl p-1 dark:bg-gray-900 mb-6 mx-auto'>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              currentTab === "revenu"
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setCurrentTab("revenu")}
            type='button'>
            Revenus
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              currentTab === "depense"
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setCurrentTab("depense")}
            type='button'>
            Dépenses
          </button>
        </div>

        {/* Liste des paiements filtrés */}
        <div className='bg-white rounded-2xl shadow border border-[#ececec] p-8 mt-2 dark:bg-black dark:text-white dark:border-gray-700'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222] dark:text-white'>
                {currentTab === "depense"
                  ? "Dépenses récurrentes mensuelles"
                  : "Revenus récurrents mensuels"}
              </div>
              <div className='text-sm text-gray-500 mt-1 dark:text-white'>
                {currentTab === "depense" ? "Dépenses" : "Revenus"} récurrents
                mensuels
              </div>
            </div>
            <Button
              onClick={handleAddPaiement}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'>
              <AiOutlinePlus className='text-lg' />
              Ajouter
            </Button>
          </div>
          {paiementsTries.length === 0 ? (
            <div className='text-center py-10 text-gray-500'>
              <p>
                Aucun paiement {currentTab === "depense" ? "dépense" : "revenu"}{" "}
                récurrent.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {paiementsTries.map((p) => (
                <CardDesign
                  key={p.id}
                  item={p}
                  currentTab={currentTab}
                  onEdit={() => handleEditPaiement(p)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <ModalRecurrent
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          initialValues={selectedPaiement}
          categories={categories}
          type={currentTab}
        />
      )}
    </div>
  );
};

export default PaiementRecurrent;

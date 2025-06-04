import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  AiOutlinePlus,
  AiOutlineCalendar,
  AiOutlineDollarCircle,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import { fakePaiementsRecurrents } from "../utils/fakeData";
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  getMonthYear,
  MONTHS,
  CATEGORY_COLORS,
} from "../utils/categoryUtils";
import {
  calculTotalRevenusRecurrentsMois,
  calculTotalDepensesRecurrentesMois,
  formatMontant,
} from "../utils/calcul";
import MonthPickerModal from "../components/ui/MonthPickerModal";
import {
  editPaiement,
  deletePaiementWithUndo,
} from "../utils/paiementActions.jsx";
import CardDesign from "../components/ui/CardDesign";
import { ModalRecurrent } from "../components/ui/Modal";

const PaiementRecurrent = () => {
  const [paiementsRecurrents, setPaiementsRecurrents] = useState(
    fakePaiementsRecurrents
  );
  const [currentTab, setCurrentTab] = useState("revenu");
  const [error] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Calcul des totaux
  const totalRevenus = useMemo(() => {
    return calculTotalRevenusRecurrentsMois(
      paiementsRecurrents.filter((p) => p.type === "revenu"),
      selectedMonth
    );
  }, [paiementsRecurrents, selectedMonth]);

  const totalDepenses = useMemo(() => {
    return calculTotalDepensesRecurrentesMois(
      paiementsRecurrents.filter((p) => p.type === "depense"),
      selectedMonth
    );
  }, [paiementsRecurrents, selectedMonth]);

  // Filtrage des paiements selon le type et le mois
  const paiementsFiltres = useMemo(() => {
    return paiementsRecurrents.filter((p) => {
      if (p.type !== currentTab) return false;

      // Vérifie si le jour de prélèvement est valide pour ce mois
      const moisActuel = selectedMonth.getMonth() + 1;
      const anneeActuelle = selectedMonth.getFullYear();
      const jourPrelevement = p.jourPrelevement;
      const joursDansMois = new Date(anneeActuelle, moisActuel, 0).getDate();
      const jourValide = jourPrelevement <= joursDansMois;

      return jourValide;
    });
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
    setStep(1);
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

  const handleSavePaiement = useCallback(
    async (paiement) => {
      setPaiementsRecurrents((prev) => {
        const newPaiement = {
          ...paiement,
          type: currentTab,
          jourPrelevement: Number(paiement.jour),
          montant: Number(paiement.montant),
        };

        if (paiement.id) {
          const updatedPaiements = prev.map((t) =>
            t.id === paiement.id ? newPaiement : t
          );
          return updatedPaiements;
        } else {
          const newId = Math.max(...prev.map((p) => p.id), 0) + 1;
          const updatedPaiements = [...prev, { ...newPaiement, id: newId }];
          return updatedPaiements;
        }
      });
      setShowModal(false);
    },
    [currentTab]
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
              Paiements Récurrents
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
            /* Carte Total Dépenses */
            <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
              <div className='flex items-center text-red-600 mb-2'>
                <AiOutlineDollarCircle className='text-2xl mr-2' />
                <span className='text-sm font-semibold'>Total Dépenses</span>
              </div>
              <div className='text-2xl font-bold dark:text-white'>
                {formatMontant(totalDepenses)}€
              </div>
            </div>
          ) : (
            /* Carte Total Revenus */
            <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
              <div className='flex items-center text-green-600 mb-2'>
                <AiOutlineCalendar className='text-2xl mr-2' />
                <span className='text-sm font-semibold'>Total Revenus</span>
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
        {/* Affichage des paiements récurrents filtrés */}
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
            {/* Bouton Ajouter */}
            <div className='flex space-x-3'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={handleAddPaiement}>
                <AiOutlinePlus className='text-lg' />
                <span>Ajouter</span>
              </button>
            </div>
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
                  onDelete={() =>
                    deletePaiementWithUndo(p.id, setPaiementsRecurrents, p.nom)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalRecurrent
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePaiement}
        initialValues={selectedPaiement}
        categories={
          currentTab === "depense" ? DEPENSES_CATEGORIES : REVENUS_CATEGORIES
        }
        title={`${selectedPaiement ? "Modifier" : "Ajouter"} une ${
          currentTab === "depense" ? "dépense" : "revenu"
        } récurrente`}
        editMode={!!selectedPaiement}
      />
    </div>
  );
};

export default PaiementRecurrent;

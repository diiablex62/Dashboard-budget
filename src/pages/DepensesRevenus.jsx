import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlinePlus,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { FaArrowDown, FaArrowUp, FaFilter, FaTimes } from "react-icons/fa";
import { FiEdit, FiTrash } from "react-icons/fi";
import MonthPickerModal from "../components/ui/MonthPickerModal";
import TransactionCard from "../components/ui/TransactionCard";
import { ModalDepenseRevenu } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";

// Import des catégories et données centralisées
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  getMonthYear,
  CATEGORY_COLORS,
  CATEGORIES,
} from "../utils/categoryUtils";

import {
  calculTotalDepensesMois,
  totalRevenusGlobalMois,
  calculEconomies,
  formatMontant,
} from "../utils/calcul";
import { deletePaiementWithUndo } from "../utils/paiementActions.jsx";

export default function DepensesRevenus() {
  const { getData } = useAuth();
  const [currentTab, setCurrentTab] = useState("depense");
  const [depenses, setDepenses] = useState([]);
  const [revenus, setRevenus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchDepenseRevenu = useCallback(() => {
    const { depenseRevenu } = getData();
    setDepenses(depenseRevenu.filter((t) => t.type === "depense"));
    setRevenus(depenseRevenu.filter((t) => t.type === "revenu"));
  }, [getData]);

  useEffect(() => {
    fetchDepenseRevenu();
  }, [fetchDepenseRevenu]);

  useEffect(() => {
    const handleDataUpdate = () => fetchDepenseRevenu();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchDepenseRevenu]);

  const handleAddTransaction = useCallback(() => {
    setSelectedItem(null);
    setShowModal(true);
  }, []);

  const handleSaveTransaction = useCallback(
    async (transaction) => {
      if (currentTab === "depense") {
        setDepenses((prev) => {
          if (transaction.id) {
            return prev.map((t) =>
              t.id === transaction.id ? { ...transaction, type: "depense" } : t
            );
          } else {
            return [
              ...prev,
              { ...transaction, id: Date.now(), type: "depense" },
            ];
          }
        });
      } else {
        setRevenus((prev) => {
          if (transaction.id) {
            return prev.map((t) =>
              t.id === transaction.id ? { ...transaction, type: "revenu" } : t
            );
          } else {
            return [
              ...prev,
              { ...transaction, id: Date.now(), type: "revenu" },
            ];
          }
        });
      }
    },
    [currentTab]
  );

  const filteredDepenseRevenu = useMemo(() => {
    const items = currentTab === "depense" ? depenses : revenus;
    return items.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [currentTab, depenses, revenus, selectedDate]);

  const totalDepenses = useMemo(
    () => calculTotalDepensesMois(depenses, selectedDate),
    [depenses, selectedDate]
  );
  const totalRevenus = useMemo(
    () => totalRevenusGlobalMois(revenus, selectedDate),
    [revenus, selectedDate]
  );

  const renderContent = () => {
    try {
      return (
        <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
          <div>
            {/* Titre et sélecteur de mois */}
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Dépenses et Revenus
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  Dépenses du mois de {getMonthYear(selectedDate)}
                </p>
              </div>
              <MonthPickerModal
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Cartes de statistiques */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              {/* Carte 1: Total Dépenses */}
              <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center relative'>
                <div className='flex items-center text-red-600 mb-2'>
                  <AiOutlineDollarCircle className='text-2xl mr-2' />
                  <span className='text-sm font-semibold dark:text-white'>
                    Total Dépenses
                  </span>
                  <div className='relative group ml-2'>
                    <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
                    <div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                      Ce total correspond uniquement aux transactions de type
                      dépense, hors paiements récurrents et échelonnés.
                    </div>
                  </div>
                </div>
                <div className='text-2xl text-[#222] dark:text-white'>
                  {formatMontant(totalDepenses)}€
                </div>
              </div>
              {/* Carte 2: Total Revenus */}
              <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center'>
                <div className='flex items-center text-green-600 mb-2'>
                  <AiOutlineCalendar className='text-2xl mr-2' />
                  <span className='text-sm font-semibold dark:text-white'>
                    Total Revenus
                  </span>
                </div>
                <div className='text-2xl text-[#222] dark:text-white'>
                  {formatMontant(totalRevenus)}€
                </div>
              </div>
            </div>
            {/* Switch Dépenses/Revenus */}
            <div className='flex w-full max-w-xl bg-[#f3f6fa] rounded-xl p-1 dark:bg-gray-900 mb-6 mx-auto'>
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
            </div>
            {/* Affichage des dépenses & revenus */}
            <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-8 mt-2 '>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <div className='text-2xl font-bold text-[#222] dark:text-white'>
                    {currentTab === "depense"
                      ? "Dépenses du mois"
                      : "Revenus du mois"}
                  </div>
                  <div className='text-sm text-gray-500 mt-1 dark:text-gray-300'>
                    {currentTab === "depense" ? "Dépenses" : "Revenus"} du mois
                    de {getMonthYear(selectedDate)}
                  </div>
                </div>
                {/* Bouton Ajouter - toujours visible ici */}
                <div className='flex space-x-3'>
                  <button
                    className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                    onClick={handleAddTransaction}>
                    <AiOutlinePlus className='text-lg' />
                    Ajouter
                  </button>
                </div>
              </div>

              {filteredDepenseRevenu.length === 0 ? (
                <div className='text-center py-10 text-gray-500 dark:text-gray-300'>
                  <p>
                    Aucune {currentTab === "depense" ? "dépense" : "revenu"}{" "}
                    pour {getMonthYear(selectedDate)}.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 h-full'>
                  {filteredDepenseRevenu.map((depenseRevenuItem, idx) => (
                    <TransactionCard
                      key={depenseRevenuItem.id || idx}
                      item={depenseRevenuItem}
                      currentTab={currentTab}
                      onEdit={() => {
                        setSelectedItem(depenseRevenuItem);
                        setShowModal(true);
                      }}
                      onDelete={() => {
                        if (currentTab === "depense") {
                          deletePaiementWithUndo(
                            depenseRevenuItem.id,
                            setDepenses,
                            depenseRevenuItem.nom
                          );
                        } else {
                          deletePaiementWithUndo(
                            depenseRevenuItem.id,
                            setRevenus,
                            depenseRevenuItem.nom
                          );
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <ModalDepenseRevenu
            visible={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveTransaction}
            initialValues={selectedItem}
            categories={
              currentTab === "depense"
                ? DEPENSES_CATEGORIES
                : REVENUS_CATEGORIES
            }
            title={
              currentTab === "depense"
                ? "Ajouter une dépense"
                : "Ajouter un revenu"
            }
            editMode={!!selectedItem}
          />
        </div>
      );
    } catch (error) {
      console.error("Erreur dans le rendu de DepensesRevenus:", error);
      return (
        <div className='container mx-auto px-4 py-8'>
          <div
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
            role='alert'>
            <strong className='font-bold'>Erreur !</strong>
            <span className='block sm:inline'>
              {" "}
              Une erreur est survenue lors du chargement de la page.
            </span>
          </div>
        </div>
      );
    }
  };

  // Ajouter la gestion des fonctions manquantes
  const handleAddDepense = async (depenseData) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      await addDoc(collection(db, "depense"), {
        ...depenseData,
        date: depenseData.date || currentDate,
        createdAt: serverTimestamp(),
      });
      // Recharger les données
      const fetchData = async () => {
        const depenseSnap = await getDocs(
          query(collection(db, "depense"), orderBy("date", "desc"))
        );
        setDepenses(
          depenseSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      };
      fetchData();
    } catch (err) {
      console.error("Erreur ajout dépense:", err);
    }
  };

  const handleAddRevenu = async (revenuData) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      await addDoc(collection(db, "revenu"), {
        ...revenuData,
        date: revenuData.date || currentDate,
        createdAt: serverTimestamp(),
      });
      // Recharger les données
      const fetchData = async () => {
        const revenuSnap = await getDocs(
          query(collection(db, "revenu"), orderBy("date", "desc"))
        );
        setRevenus(
          revenuSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      };
      fetchData();
    } catch (err) {
      console.error("Erreur ajout revenu:", err);
    }
  };

  return renderContent();
}

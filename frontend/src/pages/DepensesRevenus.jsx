import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AiOutlinePlus,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
} from "react-icons/ai";
import MonthPickerModal from "../components/ui/MonthPickerModal";
import TransactionCard from "../components/ui/TransactionCard";
import { ModalDepenseRevenu } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { showDeleteConfirmation } from "../components/ui/ToastConfirmation";

// Import des catégories et données centralisées
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  getMonthYear,
} from "../utils/categoryUtils";

import {
  calculTotalDepensesMois,
  totalRevenusGlobalMois,
  formatMontant,
} from "../utils/calcul";

export default function DepensesRevenus() {
  const { getData } = useAuth();
  const [currentTab, setCurrentTab] = useState("revenu");
  const [depenses, setDepenses] = useState([]);
  const [revenus, setRevenus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedId = searchParams.get("selected");

  const fetchDepenseRevenu = useCallback(() => {
    const { depenseRevenu } = getData();

    const depensesFiltrees = depenseRevenu.filter(
      (t) =>
        t.type === "depense" ||
        (t.nom === "Solde mois précédent" && t.montant < 0)
    );
    const revenusFiltres = depenseRevenu.filter(
      (t) =>
        t.type === "revenu" ||
        (t.nom === "Solde mois précédent" && t.montant >= 0)
    );

    setDepenses(depensesFiltrees);
    setRevenus(revenusFiltres);
  }, [getData]);

  useEffect(() => {
    fetchDepenseRevenu();
  }, [fetchDepenseRevenu]);

  useEffect(() => {
    const handleDataUpdate = () => {
      fetchDepenseRevenu();
    };
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchDepenseRevenu]);

  useEffect(() => {
    if (selectedId) {
      const item = [...depenses, ...revenus].find(
        (item) => item.id === parseInt(selectedId)
      );
      if (item) {
        setSelectedItem(item);
        setShowModal(true);
        setCurrentTab(item.type === "depense" ? "depense" : "revenu");
      }
    }
  }, [selectedId, depenses, revenus]);

  const handleAddTransaction = useCallback(() => {
    setSelectedItem(null);
    setShowModal(true);
    setSearchParams({});
  }, [setSearchParams]);

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

  const handleDelete = useCallback(
    (transaction) => {
      showDeleteConfirmation({
        label: transaction.nom,
        onConfirm: () => {
          if (currentTab === "depense") {
            setDepenses((prev) => prev.filter((t) => t.id !== transaction.id));
          } else {
            setRevenus((prev) => prev.filter((t) => t.id !== transaction.id));
          }
        },
      });
    },
    [currentTab]
  );

  const filteredDepenseRevenu = useMemo(() => {
    const items = currentTab === "depense" ? depenses : revenus;
    const filtered = items.filter((t) => {
      const d = new Date(t.date);
      const isInSelectedMonth =
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear();

      return isInSelectedMonth;
    });

    return filtered;
  }, [currentTab, depenses, revenus, selectedDate]);

  const totalDepenses = useMemo(() => {
    const total = calculTotalDepensesMois(depenses, selectedDate);
    return total;
  }, [depenses, selectedDate]);

  const totalRevenus = useMemo(() => {
    const total = totalRevenusGlobalMois(revenus, selectedDate);
    return total;
  }, [revenus, selectedDate]);

  const renderContent = () => {
    try {
      return (
        <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
          <div>
            {/* Titre et sélecteur de mois */}
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap'>
                  Dépenses et revenus
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  {currentTab === "depense"
                    ? "Gérez vos dépenses ponctuelles"
                    : "Gérez vos revenus ponctuels"}
                </p>
              </div>
              <MonthPickerModal
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Cartes de statistiques */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
              {currentTab === "depense" ? (
                /* Carte total dépenses */
                <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white'>
                  <div className='flex items-center text-red-600 mb-2'>
                    <AiOutlineDollarCircle className='text-2xl mr-2' />
                    <span className='text-sm font-semibold'>
                      Total dépenses mensuelles
                    </span>
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
                <div className='grid grid-cols-1 gap-4'>
                  {filteredDepenseRevenu.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={() => {
                        setSelectedItem(transaction);
                        setShowModal(true);
                      }}
                      onDelete={() => {
                        showDeleteConfirmation({
                          label: transaction.nom,
                          onConfirm: () => {
                            if (currentTab === "depense") {
                              setDepenses((prev) =>
                                prev.filter((t) => t.id !== transaction.id)
                              );
                            } else {
                              setRevenus((prev) =>
                                prev.filter((t) => t.id !== transaction.id)
                              );
                            }
                          },
                        });
                      }}
                      categories={
                        transaction.type === "depense"
                          ? DEPENSES_CATEGORIES
                          : REVENUS_CATEGORIES
                      }
                      type={transaction.type}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <ModalDepenseRevenu
            visible={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedItem(null);
              navigate(".", { replace: true });
            }}
            onSave={handleSaveTransaction}
            initialValues={selectedItem}
            isDepense={currentTab === "depense"}
            categories={
              currentTab === "depense"
                ? DEPENSES_CATEGORIES
                : REVENUS_CATEGORIES
            }
            isViewMode={!!selectedId}
          />
        </div>
      );
    } catch (error) {
      console.error("Erreur dans le rendu:", error);
      return (
        <div className='text-center py-10 text-red-500'>
          Une erreur est survenue lors du chargement des données.
        </div>
      );
    }
  };

  return renderContent();
}

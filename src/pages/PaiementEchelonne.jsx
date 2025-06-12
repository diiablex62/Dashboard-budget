import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AiOutlinePlus,
  AiOutlineDollarCircle,
  AiOutlineCalendar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import {
  DEPENSES_CATEGORIES,
  REVENUS_CATEGORIES,
  getMonthYear,
} from "../utils/categoryUtils";
import { fakePaiementsEchelonnes } from "../utils/fakeData";
import MonthPickerModal from "../components/ui/MonthPickerModal";
import CardDesign from "../components/ui/CardDesign";
import { ModalEchelonne } from "../components/ui/Modal";
import { toast } from "react-toastify";
import { deletePaiementWithUndo } from "../utils/paiementActions.jsx";
import {
  formatMontant,
  calculTotalCreditEchelonneesMois,
  calculTotalDebitEchelonneesMois,
  calculPaiementsEchelonnesActifs,
  calculProgressionPaiementEchelonne,
} from "../utils/calcul";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

export const PaiementEchelonne = () => {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("selected");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isRevenus, setIsRevenus] = useState(false);
  const { getData, isAuthenticated } = useAuth();

  const handleEdit = useCallback((payment) => {
    setEditIndex(payment.id);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id, nom) => {
    toast.warn(
      <div>
        <b>Suppression du paiement échelonné : {nom}</b>
        <div className='mt-1'>
          Vous allez supprimer ce paiement échelonné pour tous les mois.
          <br />
          Voulez-vous continuer&nbsp;?
        </div>
        <div className='flex justify-end gap-2 mt-3'>
          <button
            className='px-3 py-1 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300'
            onClick={() => toast.dismiss()}>
            Annuler
          </button>
          <button
            className='px-3 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600'
            onClick={() => {
              toast.dismiss();
              deletePaiementWithUndo(id, setPaiementsEchelonnes, nom);
            }}>
            Supprimer
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-right",
        toastId: `alert-delete-echelonne-${id}`,
      }
    );
  }, []);

  const { paiementsEchelonnes: dataPaiementsEchelonnes } = useMemo(
    () => getData() || {},
    [getData]
  );

  const safePaiementsEchelonnes = useMemo(() => {
    if (!isAuthenticated) return [];
    return Array.isArray(dataPaiementsEchelonnes)
      ? dataPaiementsEchelonnes
      : [];
  }, [isAuthenticated, dataPaiementsEchelonnes]);

  const totalDepenses = useMemo(() => {
    if (isRevenus) {
      return calculTotalDebitEchelonneesMois(
        safePaiementsEchelonnes,
        selectedDate
      );
    }
    return calculTotalCreditEchelonneesMois(
      safePaiementsEchelonnes,
      selectedDate
    );
  }, [safePaiementsEchelonnes, selectedDate, isRevenus]);

  const paiementsActifsCount = useMemo(() => {
    return calculPaiementsEchelonnesActifs(
      safePaiementsEchelonnes,
      selectedDate,
      isRevenus
    );
  }, [safePaiementsEchelonnes, selectedDate, isRevenus]);

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
    }
  }, [totalDepenses]);

  useEffect(() => {
    if (selectedId) {
      const paiement = paiementsEchelonnes.find(
        (p) => p.id === parseInt(selectedId)
      );
      if (paiement) {
        setEditIndex(paiement.id);
        setShowModal(true);
        setIsRevenus(paiement.type === "debit");
      }
    }
  }, [selectedId, paiementsEchelonnes]);

  const handleSave = useCallback(
    (formData) => {
      const paymentData = {
        ...formData,
        montant: parseFloat(formData.montant),
        mensualites: parseInt(formData.mensualites),
        type: isRevenus ? "debit" : "credit",
        debutDate: formData.debutDate,
      };

      if (editIndex !== null) {
        setPaiementsEchelonnes((prev) => {
          const updated = prev.map((p) =>
            p.id === editIndex ? { ...paymentData, id: editIndex } : p
          );
          return updated;
        });
      } else {
        const newId = Math.max(...paiementsEchelonnes.map((p) => p.id), 0) + 1;
        setPaiementsEchelonnes((prev) => {
          const updated = [...prev, { ...paymentData, id: newId }];
          return updated;
        });
      }
      setEditIndex(null);
      setShowModal(false);
    },
    [editIndex, isRevenus, paiementsEchelonnes]
  );

  return (
    <div className='bg-[#f8fafc] min-h-screen p-8 dark:bg-black'>
      <div>
        {/* Titre et sélecteur de mois */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap'>
              Paiements échelonnés
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap'>
              {isRevenus
                ? "Gérez les paiements que vous effectuez en plusieurs mensualités"
                : "Gérez les paiements que vous remboursez en plusieurs mensualités"}
            </p>
          </div>
          <MonthPickerModal
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 '>
          {/* Carte 1: Total Mensuel */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-blue-600 dark:text-blue-400 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>
                Total mensuel {isRevenus ? "débit" : "crédit"}
              </span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {formatMontant(totalDepenses)}€
            </div>
          </div>

          {/* Carte 2: Paiements Actifs */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
              <AiOutlineCalendar className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Paiements actifs</span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {paiementsActifsCount} paiement
              {paiementsActifsCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Switch Dépenses/Revenus */}
        <div className='flex w-full max-w-xl bg-[#f3f6fa] rounded-xl p-1 dark:bg-gray-900 mb-6 mx-auto'>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              !isRevenus
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setIsRevenus(false)}
            type='button'>
            Crédit (Dépense)
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              isRevenus
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setIsRevenus(true)}
            type='button'>
            Débit (Revenu)
          </button>
        </div>

        {/* Affichage des paiements échelonnés */}
        <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-8 mt-2'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <div className='text-2xl font-bold text-[#222] dark:text-white'>
                Paiements échelonnés
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                Paiements du mois de {getMonthYear(selectedDate)}
              </div>
            </div>
            {isAuthenticated && (
              <div className='flex justify-end mt-8'>
                <Button
                  onClick={() => {
                    setEditIndex(null);
                    setShowModal(true);
                  }}
                  icon={AiOutlinePlus}>
                  Ajouter
                </Button>
              </div>
            )}
          </div>

          {safePaiementsEchelonnes.filter(
            (p) => p.type === (isRevenus ? "debit" : "credit")
          ).length === 0 ? (
            <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
              <p>
                {isAuthenticated
                  ? `Aucun paiement échelonné ${
                      isRevenus ? "de revenu" : "de dépense"
                    } pour ${getMonthYear(selectedDate)}.`
                  : "Connectez-vous pour gérer vos paiements échelonnés."}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {safePaiementsEchelonnes
                .filter((p) => p.type === (isRevenus ? "debit" : "credit"))
                .filter((paiement) => {
                  const debut = new Date(paiement.debutDate);
                  const fin = new Date(paiement.debutDate);
                  fin.setMonth(
                    fin.getMonth() + parseInt(paiement.mensualites) - 1
                  );
                  const afterStart =
                    selectedDate.getFullYear() > debut.getFullYear() ||
                    (selectedDate.getFullYear() === debut.getFullYear() &&
                      selectedDate.getMonth() >= debut.getMonth());
                  const beforeEnd =
                    selectedDate.getFullYear() < fin.getFullYear() ||
                    (selectedDate.getFullYear() === fin.getFullYear() &&
                      selectedDate.getMonth() <= fin.getMonth());
                  return afterStart && beforeEnd;
                })
                .map((paiement) => {
                  const progression = calculProgressionPaiementEchelonne(
                    paiement,
                    selectedDate
                  );

                  const isDepense = paiement.type === "credit";
                  const montantAffiche = `${
                    isDepense ? "-" : "+"
                  }${progression.montantMensuel.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}€`;
                  const montantClass = isDepense
                    ? "text-red-600"
                    : "text-green-600";
                  const barreClass = isDepense
                    ? "bg-red-600 dark:bg-red-400"
                    : "bg-green-600 dark:bg-green-400";

                  return (
                    <CardDesign
                      key={paiement.id}
                      item={{
                        ...paiement,
                        montant: progression.montantMensuel,
                        montantTotal: progression.montantTotal,
                        nombreMensualites: progression.nombreMensualites,
                      }}
                      currentTab={isDepense ? "depense" : "revenu"}
                      onEdit={() => handleEdit(paiement)}
                      onDelete={() => handleDelete(paiement.id, paiement.nom)}>
                      {/* Barre de progression */}
                      <div className='flex flex-col gap-2'>
                        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5'>
                          <div
                            className={`${barreClass} h-2.5 rounded-full`}
                            style={{
                              width: `${progression.pourcentage}%`,
                            }}></div>
                        </div>
                        {/* Infos mensualité et fin */}
                        <div className='flex justify-between items-center text-sm text-gray-500 dark:text-gray-400'>
                          <span className='font-medium'>
                            Mensualité {progression.mensualitesPayees}/
                            {paiement.mensualites}
                          </span>
                          <div className='flex flex-col items-end'>
                            <span>
                              Début :{" "}
                              {new Date(paiement.debutDate).toLocaleDateString(
                                "fr-FR"
                              )}
                            </span>
                            <span>
                              Fin :{" "}
                              {progression.finDate.toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardDesign>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ModalEchelonne */}
      <ModalEchelonne
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditIndex(null);
        }}
        onSave={handleSave}
        categories={isRevenus ? REVENUS_CATEGORIES : DEPENSES_CATEGORIES}
        initialValues={
          editIndex !== null
            ? (() => {
                const paiement = paiementsEchelonnes.find(
                  (p) => p.id === editIndex
                );
                return {
                  ...paiement,
                  debutDate: paiement.debutDate,
                };
              })()
            : {
                nom: "",
                montant: "",
                mensualites: "",
                debutDate: new Date(selectedDate).toISOString().split("T")[0],
                categorie: "",
                type: isRevenus ? "debit" : "credit",
              }
        }
        title={editIndex !== null ? "Modifier" : "Ajouter"}
        editMode={editIndex !== null}
      />
    </div>
  );
};

export default PaiementEchelonne;

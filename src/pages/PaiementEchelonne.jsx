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
  calculTotalDepensesEchelonneesMois,
} from "../utils/calcul";

export const PaiementEchelonne = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [paiementsEchelonnes, setPaiementsEchelonnes] = useState(
    fakePaiementsEchelonnes
  );
  const [editIndex, setEditIndex] = useState(null);
  const [isRevenus, setIsRevenus] = useState(false);

  const handleEdit = useCallback((payment) => {
    console.log("handleEdit - payment reçu:", payment);
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

  const totalDepenses = useMemo(() => {
    return calculTotalDepensesEchelonneesMois(
      paiementsEchelonnes,
      selectedDate
    );
  }, [paiementsEchelonnes, selectedDate]);

  const paiementsActifsCount = useMemo(() => {
    return paiementsEchelonnes
      .filter((p) => p.type === (isRevenus ? "debit" : "credit"))
      .filter((paiement) => {
        const debut = new Date(paiement.debutDate);
        const fin = new Date(paiement.debutDate);
        fin.setMonth(fin.getMonth() + parseInt(paiement.mensualites) - 1);
        const afterStart =
          selectedDate.getFullYear() > debut.getFullYear() ||
          (selectedDate.getFullYear() === debut.getFullYear() &&
            selectedDate.getMonth() >= debut.getMonth());
        const beforeEnd =
          selectedDate.getFullYear() < fin.getFullYear() ||
          (selectedDate.getFullYear() === fin.getFullYear() &&
            selectedDate.getMonth() <= fin.getMonth());
        return afterStart && beforeEnd;
      }).length;
  }, [paiementsEchelonnes, selectedDate, isRevenus]);

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

  const handleSave = useCallback(
    (formData) => {
      const paymentData = {
        ...formData,
        montant: parseFloat(formData.montant),
        mensualites: parseInt(formData.mensualites),
        type: isRevenus ? "debit" : "credit",
        debutDate: formData.debutDate,
      };
      console.log("[handleSave] Donnée à enregistrer :", paymentData);

      if (editIndex !== null) {
        setPaiementsEchelonnes((prev) => {
          const updated = prev.map((p) =>
            p.id === editIndex ? { ...paymentData, id: editIndex } : p
          );
          console.log(
            "[handleSave] Paiements échelonnés après modification :",
            updated
          );
          return updated;
        });
      } else {
        const newId = Math.max(...paiementsEchelonnes.map((p) => p.id), 0) + 1;
        setPaiementsEchelonnes((prev) => {
          const updated = [...prev, { ...paymentData, id: newId }];
          console.log(
            "[handleSave] Paiements échelonnés après ajout :",
            updated
          );
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
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Paiements Échelonnés
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              Gérez vos dépenses et revenus mensuels.
            </p>
          </div>
          <MonthPickerModal
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Cartes de statistiques */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Carte 1: Total Mensuel */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-blue-600 dark:text-blue-400 mb-2'>
              <AiOutlineDollarCircle className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>
                Total Mensuel {isRevenus ? "Débit" : "Crédit"} -{" "}
                {getMonthYear(selectedDate)}
              </span>
            </div>
            <div className='text-2xl text-[#222] dark:text-white'>
              {formatMontant(
                isRevenus ? totalDepenses.debits : totalDepenses.credits
              )}
              €
            </div>
          </div>

          {/* Carte 2: Paiements Actifs */}
          <div className='bg-white dark:bg-black rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 flex flex-col items-start justify-center'>
            <div className='flex items-center text-green-600 dark:text-green-400 mb-2'>
              <AiOutlineCalendar className='text-2xl mr-2' />
              <span className='text-sm font-semibold'>Paiements Actifs</span>
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
            Crédit
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition text-center ${
              isRevenus
                ? "bg-white text-gray-800 shadow font-semibold border border-gray-200 dark:bg-black dark:text-white dark:border-gray-700"
                : "bg-transparent text-[#7b849b] font-normal dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            } cursor-pointer`}
            onClick={() => setIsRevenus(true)}
            type='button'>
            Débit
          </button>
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
            {/* Bouton Ajouter */}
            <div className='flex justify-end mt-8'>
              <button
                className='flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer'
                onClick={() => {
                  setEditIndex(null);
                  setShowModal(true);
                }}>
                <span className='text-lg font-bold'>+</span>
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {paiementsEchelonnes.filter(
            (p) => p.type === (isRevenus ? "debit" : "credit")
          ).length === 0 ? (
            <div className='text-center py-10 text-gray-500 dark:text-gray-400'>
              <p>
                Aucun paiement échelonné {isRevenus ? "debit" : "credit"} pour{" "}
                {getMonthYear(selectedDate)}.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              {paiementsEchelonnes
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
                  // Calcul dynamique du nombre de mensualités payées selon selectedDate
                  const debut = new Date(paiement.debutDate);
                  const moisEcoules =
                    (selectedDate.getFullYear() - debut.getFullYear()) * 12 +
                    (selectedDate.getMonth() - debut.getMonth()) +
                    1;
                  const mensualitesPayees = Math.max(
                    1,
                    Math.min(moisEcoules, paiement.mensualites)
                  );
                  const pourcentage =
                    (mensualitesPayees / paiement.mensualites) * 100;
                  const finDate = new Date(
                    new Date(paiement.debutDate).setMonth(
                      new Date(paiement.debutDate).getMonth() +
                        parseInt(paiement.mensualites) -
                        1
                    )
                  );

                  // Calcul du montant mensuel
                  const montantTotal = Math.abs(parseFloat(paiement.montant));
                  const nombreMensualites = parseInt(paiement.mensualites);
                  const montantMensuel = montantTotal / nombreMensualites;

                  console.log(`Calcul mensualité pour ${paiement.nom}:`, {
                    montantTotal,
                    nombreMensualites,
                    montantMensuel,
                  });

                  return (
                    <CardDesign
                      key={paiement.id}
                      item={{
                        ...paiement,
                        montant: montantMensuel,
                        montantTotal: montantTotal,
                        nombreMensualites: nombreMensualites,
                      }}
                      currentTab={isRevenus ? "debit" : "credit"}
                      onEdit={() => handleEdit(paiement)}
                      onDelete={() => handleDelete(paiement.id, paiement.nom)}>
                      {/* Barre de progression */}
                      <div className='flex flex-col gap-2'>
                        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5'>
                          <div
                            className='bg-green-600 dark:bg-green-400 h-2.5 rounded-full'
                            style={{ width: `${pourcentage}%` }}></div>
                        </div>
                        {/* Infos mensualité et fin */}
                        <div className='flex justify-between items-center text-sm text-gray-500 dark:text-gray-400'>
                          <span className='font-medium'>
                            Mensualité {mensualitesPayees}/
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
                              Fin : {finDate.toLocaleDateString("fr-FR")}
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
          console.log("Modal fermé");
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
                console.log(
                  "Modal - paiement trouvé pour modification:",
                  paiement
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

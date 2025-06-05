/**
 * @file TooltipDepense.jsx
 * @description Composant de tooltip pour afficher les détails des dépenses (contenu seul, sans icône info)
 */

import React, { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  calculDepensesClassiquesTotal,
  calculDepensesRecurrentesTotal,
  calculDepensesEchelonneesTotal,
} from "../calculDashboard";
import { formatMontant } from "../../../utils/calcul";

const TooltipDepense = ({
  depensesClassiquesCourant = 0,
  recurrentsDepenseCourant = 0,
  echelonnesDepenseCourant = 0,
  totalDepense = 0,
  totalDepenseJusquaAujourdhui = 0,
  totalDepenseMoisPrecedent = 0,
  differenceDepenseMoisPrecedent = 0,
}) => {
  const { getData } = useAuth();
  const {
    depenseRevenu = [],
    paiementsRecurrents = [],
    paiementsEchelonnes = [],
  } = getData() || {};

  // Calcul du total prévisionnel pour le mois en cours
  const totalPrevisionnel = useMemo(() => {
    const date = new Date();

    // Calcul des dépenses classiques du mois
    const depensesClassiques =
      calculDepensesClassiquesTotal(depenseRevenu, date) || 0;

    // Calcul des dépenses récurrentes du mois
    const recurrents =
      calculDepensesRecurrentesTotal(paiementsRecurrents, date) || 0;

    // Calcul des dépenses échelonnées du mois
    const echelonnes =
      calculDepensesEchelonneesTotal(paiementsEchelonnes, date) || 0;

    // Logs pour le débogage
    console.log(
      "Dépenses du 1er au jour actuel:",
      totalDepenseJusquaAujourdhui
    );
    console.log(
      "Total prévisionnel:",
      depensesClassiques + recurrents + echelonnes
    );
    console.log("Total du mois précédent:", totalDepenseMoisPrecedent);
    console.log("Détail du total prévisionnel:");
    console.log("  - Dépenses classiques:", depensesClassiques);
    console.log("  - Paiements récurrents:", recurrents);
    console.log("  - Paiements échelonnés:", echelonnes);

    return depensesClassiques + recurrents + echelonnes;
  }, [
    depenseRevenu,
    paiementsRecurrents,
    paiementsEchelonnes,
    totalDepenseJusquaAujourdhui,
    totalDepenseMoisPrecedent,
  ]);

  return (
    <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg whitespace-pre-line'>
      <div>
        <div className='mb-2'>
          <span className='font-semibold'>
            Dépenses du 1 du mois jusqu'à aujourd'hui :
          </span>{" "}
          {formatMontant(totalDepenseJusquaAujourdhui || 0)}€
        </div>
        <ul className='mb-2'>
          <li className='text-red-400'>
            <span className='font-bold' style={{ color: "#ef4444" }}>
              Dépenses :
            </span>{" "}
            {formatMontant(depensesClassiquesCourant || 0)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents :{" "}
            {formatMontant(recurrentsDepenseCourant || 0)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés :{" "}
            {formatMontant(echelonnesDepenseCourant || 0)}€
          </li>
        </ul>
        <div className='mb-2 mt-4'>
          <span className='font-semibold'>
            Total prévisionnel à la fin du mois :
          </span>{" "}
          {formatMontant(totalPrevisionnel || 0)}€
        </div>
        <ul className='mb-2'>
          <li className='text-red-400'>
            <span className='font-bold' style={{ color: "#ef4444" }}>
              Dépenses :
            </span>{" "}
            {formatMontant(
              calculDepensesClassiquesTotal(depenseRevenu, new Date()) || 0
            )}
            €
          </li>
          <li className='text-blue-400'>
            Paiements récurrents :{" "}
            {formatMontant(
              calculDepensesRecurrentesTotal(paiementsRecurrents, new Date()) ||
                0
            )}
            €
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés :{" "}
            {formatMontant(
              calculDepensesEchelonneesTotal(paiementsEchelonnes, new Date()) ||
                0
            )}
            €
          </li>
        </ul>
        <div className='mb-2'>
          <span className='font-semibold'>
            Total des dépenses du mois précédent :
          </span>{" "}
          {formatMontant(totalDepenseMoisPrecedent || 0)}€
        </div>
        <ul>
          <li className='text-red-400'>
            <span className='font-bold' style={{ color: "#ef4444" }}>
              Dépenses :
            </span>{" "}
            {formatMontant(depensesClassiquesCourant || 0)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents (dépense) :{" "}
            {formatMontant(recurrentsDepenseCourant || 0)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés (dépense) :{" "}
            {formatMontant(echelonnesDepenseCourant || 0)}€
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TooltipDepense;

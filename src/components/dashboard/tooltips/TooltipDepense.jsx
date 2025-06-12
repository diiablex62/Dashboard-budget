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
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculDepensesEchelonneesJusquaAujourdhui,
} from "../calculDashboard";
import { formatMontant } from "../../../utils/calcul";
import {
  calculRevenusEchelonnesJusquaAujourdhui,
  calculRevenusEchelonnesTotal,
} from "../calculDashboard";

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

  // Calculs du 1er au jour actuel
  const depensesClassiquesJusquaAujourdhui =
    calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, new Date()) || 0;
  const recurrentsJusquaAujourdhui =
    calculDepensesRecurrentesJusquaAujourdhui(
      paiementsRecurrents,
      new Date()
    ) || 0;
  const echelonnesJusquaAujourdhui =
    calculDepensesEchelonneesJusquaAujourdhui(
      paiementsEchelonnes,
      new Date()
    ) || 0;
  const totalDepensesJusquaAujourdhui =
    depensesClassiquesJusquaAujourdhui +
    recurrentsJusquaAujourdhui +
    echelonnesJusquaAujourdhui;

  // Calculs prévisionnels (fin de mois)
  const depensesClassiquesPrevisionnel =
    calculDepensesClassiquesTotal(depenseRevenu, new Date()) || 0;
  const recurrentsPrevisionnel =
    calculDepensesRecurrentesTotal(paiementsRecurrents, new Date()) || 0;
  const echelonnesPrevisionnel =
    calculDepensesEchelonneesTotal(paiementsEchelonnes, new Date()) || 0;
  const totalPrevisionnel =
    depensesClassiquesPrevisionnel +
    recurrentsPrevisionnel +
    echelonnesPrevisionnel;

  // Calculs du mois précédent
  const now = new Date();
  const dateMoisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const depensesClassiquesMoisPrec =
    calculDepensesClassiquesTotal(depenseRevenu, dateMoisPrecedent) || 0;
  const recurrentsDepenseMoisPrec =
    calculDepensesRecurrentesTotal(paiementsRecurrents, dateMoisPrecedent) || 0;
  const echelonnesDepenseMoisPrec =
    calculDepensesEchelonneesTotal(paiementsEchelonnes, dateMoisPrecedent) || 0;
  const totalMoisPrecedent =
    depensesClassiquesMoisPrec +
    recurrentsDepenseMoisPrec +
    echelonnesDepenseMoisPrec;

  // Différences avec le mois précédent
  const differenceAvecMoisDernierJusquaAujourdhui =
    depensesClassiquesMoisPrec +
    recurrentsDepenseMoisPrec +
    echelonnesDepenseMoisPrec -
    totalDepensesJusquaAujourdhui;
  const differenceAvecMoisDernierPrevisionnel =
    depensesClassiquesMoisPrec +
    recurrentsDepenseMoisPrec +
    echelonnesDepenseMoisPrec -
    totalPrevisionnel;

  return (
    <div className='absolute top-0 right-full mr-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg whitespace-pre-line'>
      <div>
        <div className='mb-2'>
          <span className='font-semibold'>
            Dépenses du 1 du mois jusqu'à aujourd'hui :
          </span>{" "}
          {formatMontant(totalDepensesJusquaAujourdhui || 0)}€
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
            {formatMontant(depensesClassiquesPrevisionnel || 0)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsPrevisionnel || 0)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesPrevisionnel || 0)}€
          </li>
        </ul>
        <div className='mb-2'>
          <span className='font-semibold'>
            Total des dépenses du mois précédent :
          </span>{" "}
          {formatMontant(totalMoisPrecedent || 0)}€
        </div>
        <ul>
          <li className='text-red-400'>
            <span className='font-bold' style={{ color: "#ef4444" }}>
              Dépenses :
            </span>{" "}
            {formatMontant(depensesClassiquesMoisPrec || 0)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents (dépense) :{" "}
            {formatMontant(recurrentsDepenseMoisPrec || 0)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés (dépense) :{" "}
            {formatMontant(echelonnesDepenseMoisPrec || 0)}€
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TooltipDepense;

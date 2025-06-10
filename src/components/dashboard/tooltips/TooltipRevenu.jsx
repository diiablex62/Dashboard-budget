/**
 * @file TooltipRevenu.jsx
 * @description Composant de tooltip pour afficher les détails des revenus (contenu seul, sans icône info)
 */

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  calculRevenusClassiquesJusquaAujourdhui,
  calculRevenusRecurrentsJusquaAujourdhui,
  calculRevenusEchelonnesJusquaAujourdhui,
  calculRevenusClassiquesTotal,
  calculRevenusRecurrentsTotal,
  calculRevenusEchelonnesTotal,
  calculDepensesEchelonneesJusquaAujourdhui,
  calculDepensesEchelonneesTotal,
} from "../calculDashboard";

const TooltipRevenu = () => {
  const { getData } = useAuth();
  const {
    depenseRevenu = [],
    paiementsRecurrents = [],
    paiementsEchelonnes = [],
  } = getData() || {};

  // Calculs jusqu'à aujourd'hui
  const revenusClassiquesJusquaAujourdhui =
    calculRevenusClassiquesJusquaAujourdhui(depenseRevenu, new Date()) || 0;
  const recurrentsJusquaAujourdhui =
    calculRevenusRecurrentsJusquaAujourdhui(paiementsRecurrents, new Date()) ||
    0;
  const echelonnesJusquaAujourdhui =
    calculDepensesEchelonneesJusquaAujourdhui(
      paiementsEchelonnes,
      new Date()
    ) || 0;
  const totalJusquaAujourdhui =
    revenusClassiquesJusquaAujourdhui +
    recurrentsJusquaAujourdhui +
    echelonnesJusquaAujourdhui;

  // Calculs prévisionnels (fin de mois)
  const revenusClassiquesPrevisionnel =
    calculRevenusClassiquesTotal(depenseRevenu, new Date()) || 0;
  const recurrentsPrevisionnel =
    calculRevenusRecurrentsTotal(paiementsRecurrents, new Date()) || 0;
  const echelonnesPrevisionnel =
    calculDepensesEchelonneesTotal(paiementsEchelonnes, new Date()) || 0;
  const totalPrevisionnel =
    revenusClassiquesPrevisionnel +
    recurrentsPrevisionnel +
    echelonnesPrevisionnel;

  // Calculs du mois précédent
  const now = new Date();
  const dateMoisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const revenusClassiquesMoisPrec =
    calculRevenusClassiquesTotal(depenseRevenu, dateMoisPrecedent) || 0;
  const recurrentsMoisPrec =
    calculRevenusRecurrentsTotal(paiementsRecurrents, dateMoisPrecedent) || 0;
  const echelonnesMoisPrec =
    calculDepensesEchelonneesTotal(paiementsEchelonnes, dateMoisPrecedent) || 0;
  const totalMoisPrecedent =
    revenusClassiquesMoisPrec + recurrentsMoisPrec + echelonnesMoisPrec;

  const formatMontant = (v) =>
    Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2 });

  return (
    <div className='absolute top-0 right-full mr-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg whitespace-pre-line'>
      <div>
        <div className='mb-2'>
          <span className='font-semibold'>
            Revenus du 1 du mois jusqu'à aujourd'hui:
          </span>{" "}
          {formatMontant(totalJusquaAujourdhui)}€
        </div>
        <ul className='mb-2'>
          <li className='text-green-400'>
            <span className='font-bold'>Revenus :</span>{" "}
            {formatMontant(revenusClassiquesJusquaAujourdhui)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsJusquaAujourdhui)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesJusquaAujourdhui)}€
          </li>
        </ul>
        <div className='mb-2 mt-4'>
          <span className='font-semibold'>
            Total prévisionnel à la fin du mois :
          </span>{" "}
          {formatMontant(totalPrevisionnel)}€
        </div>
        <ul className='mb-2'>
          <li className='text-green-400'>
            <span className='font-bold'>Revenus :</span>{" "}
            {formatMontant(revenusClassiquesPrevisionnel)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsPrevisionnel)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesPrevisionnel)}€
          </li>
        </ul>
        <div className='mb-2'>
          <span className='font-semibold'>
            Total des revenus du mois précédent :
          </span>{" "}
          {formatMontant(totalMoisPrecedent)}€
        </div>
        <ul>
          <li className='text-green-400'>
            <span className='font-bold'>Revenus :</span>{" "}
            {formatMontant(revenusClassiquesMoisPrec)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsMoisPrec)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesMoisPrec)}€
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TooltipRevenu;

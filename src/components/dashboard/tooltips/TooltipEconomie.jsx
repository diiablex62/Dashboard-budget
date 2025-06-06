/**
 * @file TooltipEconomie.jsx
 * @description Composant de tooltip pour afficher les détails des économies (version complète, comme l'exemple fourni)
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
  calculDepensesClassiquesJusquaAujourdhui,
  calculDepensesRecurrentesJusquaAujourdhui,
  calculDepensesEchelonneesJusquaAujourdhui,
  calculDepensesClassiquesTotal,
  calculDepensesRecurrentesTotal,
  calculDepensesEchelonneesTotal,
} from "../calculDashboard";

const TooltipEconomie = () => {
  const { getData } = useAuth();
  const {
    depenseRevenu = [],
    paiementsRecurrents = [],
    paiementsEchelonnes = [],
  } = getData() || {};

  // Calculs jusqu'à aujourd'hui
  const revenusJusquaAujourdhui =
    (calculRevenusClassiquesJusquaAujourdhui(depenseRevenu, new Date()) || 0) +
    (calculRevenusRecurrentsJusquaAujourdhui(paiementsRecurrents, new Date()) ||
      0) +
    (calculRevenusEchelonnesJusquaAujourdhui(paiementsEchelonnes, new Date()) ||
      0);
  const depensesJusquaAujourdhui =
    (calculDepensesClassiquesJusquaAujourdhui(depenseRevenu, new Date()) || 0) +
    (calculDepensesRecurrentesJusquaAujourdhui(
      paiementsRecurrents,
      new Date()
    ) || 0) +
    (calculDepensesEchelonneesJusquaAujourdhui(
      paiementsEchelonnes,
      new Date()
    ) || 0);
  const economiesJusquaAujourdhui =
    revenusJusquaAujourdhui - depensesJusquaAujourdhui;

  // Calculs prévisionnels (fin de mois)
  const revenusPrevisionnel =
    (calculRevenusClassiquesTotal(depenseRevenu, new Date()) || 0) +
    (calculRevenusRecurrentsTotal(paiementsRecurrents, new Date()) || 0) +
    (calculRevenusEchelonnesTotal(paiementsEchelonnes, new Date()) || 0);
  const depensesPrevisionnel =
    (calculDepensesClassiquesTotal(depenseRevenu, new Date()) || 0) +
    (calculDepensesRecurrentesTotal(paiementsRecurrents, new Date()) || 0) +
    (calculDepensesEchelonneesTotal(paiementsEchelonnes, new Date()) || 0);
  const economiesPrevisionnel = revenusPrevisionnel - depensesPrevisionnel;

  // Calculs du mois précédent
  const now = new Date();
  const dateMoisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const revenusMoisPrec =
    (calculRevenusClassiquesTotal(depenseRevenu, dateMoisPrecedent) || 0) +
    (calculRevenusRecurrentsTotal(paiementsRecurrents, dateMoisPrecedent) ||
      0) +
    (calculRevenusEchelonnesTotal(paiementsEchelonnes, dateMoisPrecedent) || 0);
  const depensesMoisPrec =
    (calculDepensesClassiquesTotal(depenseRevenu, dateMoisPrecedent) || 0) +
    (calculDepensesRecurrentesTotal(paiementsRecurrents, dateMoisPrecedent) ||
      0) +
    (calculDepensesEchelonneesTotal(paiementsEchelonnes, dateMoisPrecedent) ||
      0);
  const economiesMoisPrec = revenusMoisPrec - depensesMoisPrec;

  // LOGS DEBUG
  console.log(
    "[TOOLTIP ECONOMIE] Revenus jusqu'à aujourd'hui:",
    revenusJusquaAujourdhui
  );
  console.log(
    "[TOOLTIP ECONOMIE] Dépenses jusqu'à aujourd'hui:",
    depensesJusquaAujourdhui
  );
  console.log(
    "[TOOLTIP ECONOMIE] Économies jusqu'à aujourd'hui:",
    economiesJusquaAujourdhui
  );
  console.log("[TOOLTIP ECONOMIE] Revenus prévisionnel:", revenusPrevisionnel);
  console.log(
    "[TOOLTIP ECONOMIE] Dépenses prévisionnel:",
    depensesPrevisionnel
  );
  console.log(
    "[TOOLTIP ECONOMIE] Économies prévisionnel:",
    economiesPrevisionnel
  );
  console.log("[TOOLTIP ECONOMIE] Revenus mois précédent:", revenusMoisPrec);
  console.log("[TOOLTIP ECONOMIE] Dépenses mois précédent:", depensesMoisPrec);
  console.log(
    "[TOOLTIP ECONOMIE] Économies mois précédent:",
    economiesMoisPrec
  );

  return (
    <div className='absolute top-0 right-full mr-2 w-96 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg'>
      <p className='font-semibold mb-2'>Comprendre le calcul : </p>
      <ul className='list-disc list-inside space-y-0.5'>
        <li className='text-green-400'>
          Total revenus :{" "}
          {revenusJusquaAujourdhui.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
        <li className='text-red-400'>
          Total dépenses :{" "}
          {depensesJusquaAujourdhui.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
        <li className='text-white'>
          Total économies :{" "}
          {economiesJusquaAujourdhui.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
      </ul>
      <div className='h-1' />
      <div className='font-semibold mt-1 mb-2'>
        Prévisionnel pour la fin du mois :
      </div>
      <ul className='list-disc list-inside space-y-0.5'>
        <li className='text-green-400'>
          Total revenus :{" "}
          {revenusPrevisionnel.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
        <li className='text-red-400'>
          Total dépenses :{" "}
          {depensesPrevisionnel.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
        <li className='text-white'>
          Total économies :{" "}
          {economiesPrevisionnel.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
      </ul>
      <div className='h-1' />
      <div className='font-semibold mt-1 mb-0'>Mois précédent :</div>
      <ul className='list-disc list-inside space-y-0.5'>
        <li className='text-green-400'>
          Revenu :{" "}
          {revenusMoisPrec.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
        <li className='text-red-400'>
          Dépenses :{" "}
          {depensesMoisPrec.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
        <li className='text-white mb-2'>
          Total économies :{" "}
          {economiesMoisPrec.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </li>
      </ul>
      <div className='mt-1 text-[10px] text-gray-300'>
        Les économies sont calculées en soustrayant le total des dépenses du
        total des revenus.
      </div>
    </div>
  );
};

export default TooltipEconomie;

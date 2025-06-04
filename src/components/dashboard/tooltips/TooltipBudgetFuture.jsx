/**
 * @file TooltipBudgetFuture.jsx
 * @description Composant de tooltip pour afficher les détails du budget prévisionnel (version complète, comme l'exemple fourni)
 */

import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";

const TooltipBudgetFuture = ({
  depenseRevenu = [],
  paiementsRecurrents = [],
  paiementsEchelonnes = [],
  isCurrentMonth = () => false,
  isFuture = () => false,
  today = new Date(),
  formatMontant = (v) =>
    Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
  monthNames = [
    "Janv.",
    "Févr.",
    "Mars",
    "Avr.",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
}) => (
  <div className='absolute bottom-2 right-2 group'>
    <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help' />
    <div className='absolute top-0 left-full ml-2 w-96 max-h-[600px] overflow-y-auto p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg'>
      <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help absolute top-2 right-2 text-lg' />
      <div className='font-semibold mb-2'>Montants à venir :</div>
      <div className='mb-2'>
        {(() => {
          const depenses = [
            ...depenseRevenu.filter(
              (item) =>
                item.type === "depense" &&
                isCurrentMonth(new Date(item.date)) &&
                isFuture(new Date(item.date))
            ),
          ].sort((a, b) => new Date(a.date) - new Date(b.date));
          return depenses.length > 0 ? (
            <div className='mb-2'>
              <span className='font-bold' style={{ color: "#ef4444" }}>
                Dépenses :
              </span>
              <ul className='ml-2 list-disc'>
                {depenses.map((item) => (
                  <li key={item.id || item.nom + item.date}>
                    {item.nom} : {formatMontant(item.montant)}€{" "}
                    <span className='text-gray-300'>
                      {(function () {
                        const d = new Date(item.date);
                        return `(le ${d.getDate()} ${
                          monthNames[d.getMonth()]
                        })`;
                      })()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}
      </div>
      <div className='mb-2'>
        {(() => {
          const revenus = [
            ...depenseRevenu.filter(
              (item) =>
                item.type === "revenu" &&
                isCurrentMonth(new Date(item.date)) &&
                isFuture(new Date(item.date))
            ),
          ].sort((a, b) => new Date(a.date) - new Date(b.date));
          return revenus.length > 0 ? (
            <div className='mb-2'>
              <span className='font-bold' style={{ color: "#2ECC71" }}>
                Revenus :
              </span>
              <ul className='ml-2 list-disc'>
                {revenus.map((item) => (
                  <li key={item.id || item.nom + item.date}>
                    {item.nom} : {formatMontant(item.montant)}€{" "}
                    <span className='text-gray-300'>
                      {(function () {
                        const d = new Date(item.date);
                        return `(le ${d.getDate()} ${
                          monthNames[d.getMonth()]
                        })`;
                      })()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}
      </div>
      <div className='mb-2'>
        {(() => {
          const recurrents = [
            ...paiementsRecurrents
              .filter((p) => (p.type === "revenu" ? false : true))
              .filter((p) => {
                if (p.jourPrelevement) {
                  return (
                    isCurrentMonth(
                      new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        p.jourPrelevement
                      )
                    ) && p.jourPrelevement > today.getDate()
                  );
                }
                return false;
              }),
          ].sort((a, b) => a.jourPrelevement - b.jourPrelevement);
          return recurrents.length > 0 ? (
            <div className='mb-2'>
              <span className='font-bold' style={{ color: "#a78bfa" }}>
                Récurrents à venir :
              </span>
              <ul className='ml-2 list-disc'>
                {recurrents.map((p) => (
                  <li key={p.id || p.nom + p.jourPrelevement}>
                    {p.nom} : {formatMontant(p.montant)}€{" "}
                    <span className='text-gray-300'>
                      {(function () {
                        return `(le ${p.jourPrelevement} ${
                          monthNames[today.getMonth()]
                        })`;
                      })()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}
      </div>
      <div className='mb-2'>
        {(() => {
          const echelonnes = [
            ...paiementsEchelonnes
              .filter((e) => e.type === "depense")
              .flatMap((e) => {
                const debut = new Date(e.debutDate);
                const mensualites = parseInt(e.mensualites, 10);
                return Array.from({ length: mensualites }, (_, i) => {
                  const datePrelevement = new Date(debut);
                  datePrelevement.setMonth(debut.getMonth() + i);
                  if (
                    isCurrentMonth(datePrelevement) &&
                    datePrelevement > today
                  ) {
                    return {
                      id: e.id + "-" + i,
                      nom: e.nom,
                      montant: Math.abs(parseFloat(e.montant)) / mensualites,
                      date: datePrelevement,
                    };
                  }
                  return null;
                }).filter(Boolean);
              }),
          ].sort((a, b) => a.date - b.date);
          return echelonnes.length > 0 ? (
            <div className='mb-2'>
              <span className='font-bold' style={{ color: "#4ECDC4" }}>
                Échelonnés à venir :
              </span>
              <ul className='ml-2 list-disc'>
                {echelonnes.map((ech) => (
                  <li key={ech.id}>
                    {ech.nom} : {formatMontant(ech.montant)}€{" "}
                    <span className='text-gray-300'>
                      {(function () {
                        const d = ech.date;
                        return `(le ${d.getDate()} ${
                          monthNames[d.getMonth()]
                        })`;
                      })()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  </div>
);

export default TooltipBudgetFuture;

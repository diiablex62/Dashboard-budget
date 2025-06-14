/**
 * @file useSortedPayments.js
 * @description Hook personnalisé pour gérer le tri des paiements récurrents et échelonnés
 */

import { useMemo } from "react";

export const useSortedPayments = (paiementsRecurrents, paiementsEchelonnes) => {
  // Tri des paiements récurrents du plus récent au plus ancien
  const paiementsRecurrentsTries = useMemo(() => {
    return [...paiementsRecurrents].sort((a, b) => {
      if (a.jourPrelevement && b.jourPrelevement) {
        return b.jourPrelevement - a.jourPrelevement;
      }
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getFullYear() === dateB.getFullYear()
      ) {
        return dateB.getDate() - dateA.getDate();
      }
      return dateB - dateA;
    });
  }, [paiementsRecurrents]);

  // Tri des paiements échelonnés du plus récent au plus ancien
  const paiementsEchelonnesTries = useMemo(() => {
    return [...paiementsEchelonnes].sort((a, b) => {
      const dateA = new Date(a.debutDate);
      const dateB = new Date(b.debutDate);
      return dateB - dateA;
    });
  }, [paiementsEchelonnes]);

  return {
    paiementsRecurrentsTries,
    paiementsEchelonnesTries,
  };
};

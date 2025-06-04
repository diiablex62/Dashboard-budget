/**
 * Composant de carte statistique réutilisable
 * @param {Object} props
 * @param {string} props.title - Titre de la carte
 * @param {number} props.value - Valeur à afficher
 * @param {string} props.icon - Icône à afficher
 * @param {string} props.iconColor - Couleur de l'icône
 * @param {string} props.valuePrefix - Préfixe pour la valeur (ex: "€")
 */
import React from "react";
import { formatMontant } from "../../utils/calcul";

export default function StatCard({ title, value, icon: Icon, iconColor, valuePrefix = "€" }) {
  return (
    <div className="bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-2xl shadow p-6 flex flex-col items-start justify-center text-gray-800 dark:text-white">
      <div className={`flex items-center ${iconColor} mb-2`}>
        <Icon className="text-2xl mr-2" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="text-2xl font-bold dark:text-white">
        {formatMontant(value)}{valuePrefix}
      </div>
    </div>
  );
} 
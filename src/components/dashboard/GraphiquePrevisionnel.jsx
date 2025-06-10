/**
 * @file GraphiquePrevisionnel.jsx
 * @description Graphique en courbes pour visualiser l'évolution prévisionnelle des revenus, dépenses et solde sur plusieurs mois.
 * Utilisé dans la page Prévisionnel.
 */
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * @param {Array} data - Tableau d'objets { mois, revenus, depenses, solde }
 */
const GraphiquePrevisionnel = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='mois' />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`
            }
          />
          <Legend />
          <Line
            type='monotone'
            dataKey='revenus'
            stroke='#2563eb'
            name='Revenus prévisionnels'
            strokeWidth={2}
            dot={false}
          />
          <Line
            type='monotone'
            dataKey='depenses'
            stroke='#dc2626'
            name='Dépenses prévisionnelles'
            strokeWidth={2}
            dot={false}
          />
          <Line
            type='monotone'
            dataKey='solde'
            stroke='#16a34a'
            name='Solde cumulé'
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphiquePrevisionnel;

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
 * Composant de tooltip personnalisé pour le graphique
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'>
        <p className='font-semibold text-gray-900 dark:text-white mb-2'>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className='text-sm'>
            {entry.name}: {entry.value.toFixed(2)}€
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Composant principal du graphique prévisionnel
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.data - Les données à afficher
 * @returns {JSX.Element} Le composant de graphique
 */
const GraphiquePrevisionnel = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='mois' stroke='#6b7280' tick={{ fill: "#6b7280" }} />
          <YAxis
            stroke='#6b7280'
            tick={{ fill: "#6b7280" }}
            tickFormatter={(value) => `${value.toFixed(2)}€`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type='monotone'
            dataKey='revenus'
            name='Revenus prévisionnels'
            stroke='#2563eb'
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey='depenses'
            name='Dépenses prévisionnelles'
            stroke='#dc2626'
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey='solde'
            name='Solde prévisionnel'
            stroke='#16a34a'
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraphiquePrevisionnel;

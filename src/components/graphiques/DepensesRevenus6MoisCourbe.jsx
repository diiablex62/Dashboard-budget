import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatMontant } from "../../utils/calcul";

export default function DepensesRevenus6MoisCourbe({ data }) {
  return (
    <div className='flex-1 flex flex-col items-center justify-center min-h-[200px] bg-white dark:bg-black rounded-lg text-gray-400'>
      <ResponsiveContainer width='100%' height={220}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='mois' tick={{ fill: "#aaa" }} />
          <YAxis tick={{ fill: "#aaa" }} />
          <Tooltip
            formatter={(value, name) => [
              `${formatMontant(value)}€`,
              name === "depenses" ? "Dépenses" : "Revenus",
            ]}
          />
          <Legend />
          <Line
            type='monotone'
            dataKey='revenus'
            stroke='#22C55E'
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name='Revenus'
          />
          <Line
            type='monotone'
            dataKey='depenses'
            stroke='#EF4444'
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name='Dépenses'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

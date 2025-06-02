import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { formatMontant } from "../../utils/calcul";

export default function DepensesRevenus6Mois({ data }) {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const hoveredData = hoveredMonth
    ? data.find((d) => d.mois === hoveredMonth)
    : null;

  return (
    <div className='flex-1 flex flex-col items-center justify-center min-h-[200px] bg-white dark:bg-black  rounded-lg text-gray-400'>
      <ResponsiveContainer width='100%' height={200}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            if (state && state.activeLabel) {
              setHoveredMonth(state.activeLabel);
            } else {
              setHoveredMonth(null);
            }
          }}
          onMouseLeave={() => setHoveredMonth(null)}>
          <CartesianGrid strokeDasharray='3 3' />
          {hoveredMonth && (
            <ReferenceArea
              x1={hoveredMonth}
              x2={hoveredMonth}
              stroke='#6366F1'
              strokeOpacity={0.7}
              fill='#6366F1'
              fillOpacity={0.08}
              ifOverflow='extendDomain'
            />
          )}
          <XAxis dataKey='mois' tick={{ fill: "#888" }} />
          <YAxis tick={{ fill: "#888" }} />
          <Bar dataKey='depenses' fill='#EF4444' name='Dépenses' barSize={24} />
          <Bar dataKey='revenus' fill='#22C55E' name='Revenus' barSize={24} />
        </BarChart>
      </ResponsiveContainer>
      {hoveredData && (
        <div className='mt-3 flex flex-col items-center text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-black px-4 py-2 rounded-lg shadow border border-gray-200 dark:border-gray-700'>
          <span className='font-medium'>{hoveredData.mois}</span>
          <div className='text-sm font-medium'>
            <span className='text-red-500'>Dépenses : </span>
            {formatMontant(hoveredData.depenses)}€
          </div>
          <div className='text-sm font-medium'>
            <span className='text-green-500'>Revenus : </span>
            {formatMontant(hoveredData.revenus)}€
          </div>
        </div>
      )}
    </div>
  );
}

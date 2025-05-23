import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DepensesRevenus6Mois({ data }) {
  const [barHover, setBarHover] = useState({
    mois: null,
    type: null,
    value: null,
  });

  return (
    <div className='flex-1 flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-lg text-gray-400'>
      <ResponsiveContainer width='100%' height={200}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='mois' tick={{ fill: "#888" }} />
          <YAxis tick={{ fill: "#888" }} />
          <Bar
            dataKey='depenses'
            fill='#EF4444'
            name='Dépenses'
            barSize={24}
            opacity={
              barHover.type === null || barHover.type === "depenses" ? 1 : 0.5
            }
            onMouseOver={(_, idx) => {
              const d = data[idx];
              setBarHover({
                mois: d.mois,
                type: "depenses",
                value: d.depenses,
              });
            }}
            onMouseOut={() =>
              setBarHover({ mois: null, type: null, value: null })
            }
          />
          <Bar
            dataKey='revenus'
            fill='#22C55E'
            name='Revenus'
            barSize={24}
            opacity={
              barHover.type === null || barHover.type === "revenus" ? 1 : 0.5
            }
            onMouseOver={(_, idx) => {
              const d = data[idx];
              setBarHover({
                mois: d.mois,
                type: "revenus",
                value: d.revenus,
              });
            }}
            onMouseOut={() =>
              setBarHover({ mois: null, type: null, value: null })
            }
          />
        </BarChart>
      </ResponsiveContainer>
      {barHover.mois && (
        <div className='w-full flex justify-center mt-2'>
          <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg'>
            <span
              className='w-3 h-3 rounded-full'
              style={{
                backgroundColor:
                  barHover.type === "depenses" ? "#EF4444" : "#22C55E",
              }}
            />
            <span className='font-semibold text-gray-700'>
              {barHover.value.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import AnimationDepensesParCategorieChart from "./AnimationDepensesParCategorieChart";

export default function DepensesParCategorieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Trier les données par montant décroissant
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
  ];

  // Calculer le total pour les pourcentages
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);
  const activePercentage =
    activeIndex !== null && sortedData[activeIndex]
      ? ((sortedData[activeIndex].value / total) * 100).toFixed(1)
      : null;

  return (
    <div className='flex-1 flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg text-gray-400 bg-white dark:bg-black '>
      <div className='flex w-full h-full'>
        {/* Graphique à gauche */}
        <div className='w-1/2 h-full flex items-center justify-center relative'>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={AnimationDepensesParCategorieChart}
                data={sortedData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                onMouseEnter={onPieEnter}>
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {activePercentage && (
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'>
              <span className='text-2xl font-bold text-gray-700 dark:text-white'>
                {activePercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Liste des catégories à droite */}
        <div className='w-1/2 h-full p-4 overflow-y-auto'>
          <div className='space-y-2'>
            {sortedData.map((item, index) => (
              <div
                key={item.name}
                className='flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer'
                onMouseEnter={() => setActiveIndex(index)}>
                <div className='flex items-center gap-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className='text-sm font-medium text-gray-700 dark:text-white'>
                    {item.name}
                  </span>
                </div>
                <span className='text-sm text-gray-600 dark:text-white'>
                  {item.value.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

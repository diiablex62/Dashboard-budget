import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import RenderActiveShape from "./RenderActiveShape";

export default function PieChartComponent({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  return (
    <div className='flex-1 flex flex-col items-center justify-center min-h-[340px] bg-gray-50 rounded-lg text-gray-400'>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={90}
            dataKey='value'
            activeIndex={activeIndex}
            activeShape={activeIndex !== null ? RenderActiveShape : undefined}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onMouseOut={onPieLeave}
            paddingAngle={2}
            labelLine={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {activeIndex !== null && (
            <text
              x='50%'
              y='50%'
              textAnchor='middle'
              dominantBaseline='central'
              fill='#222'
              fontSize={24}
              fontWeight={700}
              style={{ fontFamily: "inherit" }}>
              {data[activeIndex].percent}%
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
      {activeIndex !== null && data[activeIndex] ? (
        <div className='flex items-center gap-2 min-h-[24px]'>
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: data[activeIndex].color,
            }}
          />
          <span
            className='font-semibold'
            style={{ color: data[activeIndex].color }}>
            {data[activeIndex].name}
          </span>
          <span className='text-gray-500'>
            {data[activeIndex].value.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            €
          </span>
        </div>
      ) : (
        <div className='min-h-[24px]'></div>
      )}
    </div>
  );
}

import React from "react";

export default function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length === 1) {
    const entry = payload[0];
    return (
      <div className='bg-white border border-gray-200 rounded px-3 py-2 shadow text-xs text-gray-800'>
        <div className='font-semibold mb-1'>{label}</div>
        <div style={{ color: entry.color }}>
          {entry.name} :{" "}
          {entry.value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
        </div>
      </div>
    );
  }
  return null;
}

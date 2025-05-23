import React from "react";

export default function CustomSingleBarTooltip({ barHover }) {
  if (!barHover) return null;
  if (barHover.mois && barHover.type && barHover.value !== null) {
    const tooltipWidth = 110;
    const screenW = window.innerWidth;
    let left = barHover.x - tooltipWidth / 2;
    if (left + tooltipWidth > screenW - 8) left = screenW - tooltipWidth - 8;
    if (left < 8) left = 8;
    return (
      <div
        style={{
          position: "absolute",
          left,
          top: barHover.y,
          pointerEvents: "none",
          zIndex: 50,
          transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
        }}>
        <div
          className='bg-white/90 border border-gray-100 rounded-xl px-3 py-2 shadow-lg flex items-center justify-center gap-2 text-lg font-bold text-center'
          style={{
            color: barHover.type === "depenses" ? "#EF4444" : "#22C55E",
            minWidth: 60,
          }}>
          <span>
            {barHover.value.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, marginLeft: 4 }}>
            €
          </span>
        </div>
      </div>
    );
  }
  return null;
}

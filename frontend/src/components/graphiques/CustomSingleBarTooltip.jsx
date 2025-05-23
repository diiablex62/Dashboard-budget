import React from "react";

export default function CustomSingleBarTooltip({ barHover, containerRef }) {
  if (!barHover) return null;
  if (
    barHover.mois &&
    barHover.type &&
    barHover.value !== null &&
    containerRef &&
    containerRef.current
  ) {
    const tooltipWidth = 110;
    const containerRect = containerRef.current.getBoundingClientRect();
    let left = barHover.x - containerRect.left - tooltipWidth / 2;
    let top = barHover.y - containerRect.top - 40; // 40px au-dessus de la souris
    // Limites pour ne pas sortir du cadre
    if (left + tooltipWidth > containerRect.width - 8)
      left = containerRect.width - tooltipWidth - 8;
    if (left < 8) left = 8;
    if (top < 8) top = 8;
    if (top > containerRect.height - 40) top = containerRect.height - 40;
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
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

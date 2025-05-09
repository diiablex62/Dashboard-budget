import React from "react";

export default function Toast({
  open,
  message,
  type = "success", // "success" | "error" | "loading"
  onClose,
  action,
  loading = false,
}) {
  if (!open) return null;

  let color = "bg-green-600 text-white";
  if (type === "error") color = "bg-red-600 text-white";
  if (type === "loading") color = "bg-blue-600 text-white";

  return (
    <div
      className={`fixed top-6 right-6 z-50 min-w-[260px] max-w-xs shadow-lg rounded-lg px-5 py-4 flex items-center ${color} animate-fade-in`}
      style={{ transition: "all 0.2s" }}
      role='alert'>
      {/* Tout sur la même ligne, pas de gap qui force le retour à la ligne */}
      {loading && (
        <svg
          className='animate-spin h-5 w-5 text-white mr-2'
          viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
            fill='none'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
          />
        </svg>
      )}
      <span className='text-base whitespace-nowrap'>{message}</span>
      {action && (
        <button
          className='ml-3 px-3 py-1 rounded bg-white text-blue-700 font-semibold hover:bg-blue-50 transition'
          onClick={action.onClick}>
          Annuler
        </button>
      )}
    </div>
  );
}

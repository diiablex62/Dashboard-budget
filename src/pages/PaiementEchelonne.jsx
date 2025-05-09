import React, { useContext } from "react";
import { AiOutlinePlus, AiOutlineDollarCircle } from "react-icons/ai";
import { AppContext } from "../context/AppContext";

const echelonnes = [
  {
    nom: "Smartphone Samsung",
    mensualite: 149.99,
    numero: 6,
    total: 24,
    reste: 2699.82,
    percent: 25,
    iconColor: "#00b6e6",
  },
  {
    nom: "Assurance Auto",
    mensualite: 60.0,
    numero: 5,
    total: 12,
    reste: 420.0,
    percent: 42,
    iconColor: "#a259e6",
  },
  {
    nom: "Crédit Mobilier",
    mensualite: 99.5,
    numero: 4,
    total: 10,
    reste: 597.0,
    percent: 40,
    iconColor: "#ff7ca3",
  },
  {
    nom: "Électroménagers",
    mensualite: 120.45,
    numero: 2,
    total: 6,
    reste: 482.25,
    percent: 33,
    iconColor: "#a2b6ff",
  },
];

export default function PaiementEchelonne() {
  const totalRevenus = 0;
  const totalDepenses = 0;
  const barColor = "#00b96b";
  const { isLoggedIn } = useContext(AppContext);

  return (
    <div className='min-h-screen p-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-[#222]'>
            Paiements échelonnés
          </h1>
        </div>
        <button
          className='bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition h-12 min-w-[240px] text-base justify-center'
          onClick={() =>
            isLoggedIn
              ? /* ouvrir la modale ou logique d'ajout */
                null
              : navigate("/auth", { state: { isLogin: true } })
          }>
          <AiOutlinePlus className='text-xl' /> Ajouter un paiement échelonné
        </button>
      </div>
      {/* Totaux */}
      <div className='flex flex-col gap-4 md:flex-row md:gap-8 mb-8'>
        <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
          <div className='bg-blue-100 rounded-full p-3'>
            <AiOutlineDollarCircle className='text-2xl text-blue-500' />
          </div>
          <div>
            <div className='text-gray-500 text-sm font-medium'>
              Total Revenus
            </div>
            <div className='text-xl font-semibold' style={{ color: "#00b96b" }}>
              {totalRevenus.toFixed(2)}€
            </div>
          </div>
        </div>
        <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
          <div className='bg-green-100 rounded-full p-3'>
            <AiOutlineDollarCircle className='text-2xl text-green-500' />
          </div>
          <div>
            <div className='text-gray-500 text-sm font-medium'>
              Total Dépenses
            </div>
            <div className='text-xl font-semibold' style={{ color: "#00b96b" }}>
              {totalDepenses.toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
      {/* Liste */}
      <div className='w-full max-w-2xl'>
        {echelonnes.map((item, idx) => (
          <div
            key={idx}
            className='bg-white border border-[#ececec] rounded-xl shadow-sm p-6 mb-6 flex flex-col'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-3'>
                <div
                  className='rounded-full p-2'
                  style={{
                    background:
                      "linear-gradient(90deg, #f7fafd 60%, #fff 100%)",
                  }}>
                  <AiOutlineDollarCircle
                    className='text-2xl'
                    style={{ color: item.iconColor }}
                  />
                </div>
                <span className='font-semibold text-[#222]'>{item.nom}</span>
              </div>
              <div className='text-[#222] font-medium text-sm opacity-70'>
                {item.mensualite.toFixed(2)}€/mois
              </div>
            </div>
            <div className='flex items-center justify-between mb-1'>
              <div className='font-medium' style={{ color: barColor }}>
                Mensualité {item.numero}/{item.total}
              </div>
              <div className='font-semibold' style={{ color: barColor }}>
                {item.percent}%
              </div>
            </div>
            <div className='w-full h-2 bg-[#f0f2f5] rounded mb-2'>
              <div
                className='h-2 rounded'
                style={{
                  width: `${item.percent}%`,
                  background: barColor,
                }}></div>
            </div>
            <div className='text-[#a0aec0] text-sm'>
              Reste à payer:{" "}
              <span className='font-semibold text-[#222]'>
                {item.reste.toFixed(2)}€
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

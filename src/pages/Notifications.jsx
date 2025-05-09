import React from "react";
import { AiOutlineCreditCard, AiOutlineCalendar, AiOutlineExclamationCircle } from "react-icons/ai";
import { FiBell } from "react-icons/fi";

const notifications = [
  {
    icon: <AiOutlineCreditCard className="text-2xl text-[#5b8efc]" />,
    bg: "bg-[#eaf1ff]",
    title: "Paiement effectué",
    desc: "Votre paiement pour iPhone 13 a été traité avec succès.",
    date: "Aujourd'hui",
  },
  {
    icon: <AiOutlineCalendar className="text-2xl text-[#a259e6]" />,
    bg: "bg-[#f3eaff]",
    title: "Paiement à venir",
    desc: "Paiement récurrent Netflix prévu dans 3 jours.",
    date: "Aujourd'hui",
  },
  {
    icon: <AiOutlineExclamationCircle className="text-2xl text-[#222]" />,
    bg: "bg-[#f5f6fa]",
    title: "Budget dépassé",
    desc: "Vous avez dépassé votre budget dans la catégorie Divertissement.",
    date: "Hier",
  },
  {
    icon: <FiBell className="text-2xl text-[#ffb86b]" />,
    bg: "bg-[#fff7e6]",
    title: "Rappel de paiement",
    desc: "N'oubliez pas de payer votre abonnement à la salle de sport.",
    date: "25/05/2025",
  },
  {
    icon: <AiOutlineCreditCard className="text-2xl text-[#5b8efc]" />,
    bg: "bg-[#eaf1ff]",
    title: "Paiement effectué",
    desc: "Votre paiement pour MacBook Pro a été traité avec succès.",
    date: "20/05/2025",
  },
];

export default function Notifications() {
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-start justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow border border-[#e6eaf1]">
          {notifications.map((notif, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 px-6 py-6 ${idx !== notifications.length - 1 ? "border-b border-[#e6eaf1]" : ""}`}
            >
              <div className={`flex-shrink-0 ${notif.bg} rounded-full w-12 h-12 flex items-center justify-center`}>
                {notif.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#222] mb-1">{notif.title}</div>
                <div className="text-[#7b849b] text-base">{notif.desc}</div>
              </div>
              <div className="text-[#b0b8c9] text-sm whitespace-nowrap mt-1">{notif.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

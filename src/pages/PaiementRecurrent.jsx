import React, { useContext } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const paiements = [
  {
    nom: "Netflix",
    categorie: "Divertissement",
    montant: 14.99,
    frequence: "Mensuel",
    prochaine: "15/06/2025",
  },
  {
    nom: "Spotify",
    categorie: "Divertissement",
    montant: 9.99,
    frequence: "Mensuel",
    prochaine: "20/06/2025",
  },
  {
    nom: "Salle de sport",
    categorie: "Sport",
    montant: 39.99,
    frequence: "Mensuel",
    prochaine: "01/07/2025",
  },
  {
    nom: "Assurance habitation",
    categorie: "Assurance",
    montant: 20.5,
    frequence: "Mensuel",
    prochaine: "05/07/2025",
  },
];

export default function PaiementRecurrent() {
  const totalMensuel = paiements.reduce((acc, p) => acc + p.montant, 0);
  const totalAnnuel = totalMensuel * 12;
  const totalDepenses = totalMensuel;
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);

  return (
    <div className='bg-[#f8fafc] min-h-screen'>
      <div className='p-8'>
        <div className='flex items-center justify-end mb-6'>
          <button
            className='bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition h-12 min-w-[240px] text-base justify-center'
            onClick={() =>
              isLoggedIn
                ? /* ouvrir la modale ou logique d'ajout */
                  null
                : navigate("/auth", { state: { isLogin: true } })
            }>
            <span className='text-xl'>+</span> Ajouter un paiement récurrent
          </button>
        </div>
        {/* Totaux */}
        <div className='flex flex-col md:flex-row gap-6 mb-8'>
          <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
            <div className='bg-blue-100 rounded-full p-3'>
              <AiOutlineCalendar className='text-2xl text-blue-500' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>
                Total mensuel
              </div>
              <div className='text-xl font-semibold'>
                {totalMensuel.toFixed(2)}€
              </div>
            </div>
          </div>
          <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
            <div className='bg-green-100 rounded-full p-3'>
              <AiOutlineCalendar className='text-2xl text-green-500' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>
                Total annuel
              </div>
              <div className='text-xl font-semibold'>
                {totalAnnuel.toFixed(2)}€
              </div>
            </div>
          </div>
          <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
            <div className='bg-orange-100 rounded-full p-3'>
              <AiOutlineCalendar className='text-2xl text-orange-500' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>Dépenses</div>
              <div className='text-xl font-semibold'>
                {totalDepenses.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>
        {/* Liste */}
        <div className='bg-white border border-[#ececec] rounded-xl p-8'>
          <div className='text-lg font-semibold mb-6'>
            Abonnements et prélèvements
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left'>
              <thead>
                <tr className='text-gray-500 font-medium text-sm'>
                  <th className='py-3 px-2'>Nom</th>
                  <th className='py-3 px-2'>Catégorie</th>
                  <th className='py-3 px-2'>Montant</th>
                  <th className='py-3 px-2'>Fréquence</th>
                  <th className='py-3 px-2'>Prochaine date</th>
                  <th className='py-3 px-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((p, idx) => (
                  <tr key={idx} className='border-t border-[#ececec]'>
                    <td className='py-3 px-2'>{p.nom}</td>
                    <td className='py-3 px-2'>{p.categorie}</td>
                    <td className='py-3 px-2'>{p.montant.toFixed(2)}€</td>
                    <td className='py-3 px-2'>{p.frequence}</td>
                    <td className='py-3 px-2'>{p.prochaine}</td>
                    <td className='py-3 px-2'>
                      <button className='text-blue-700 font-medium hover:underline mr-4'>
                        Modifier
                      </button>
                      <button className='text-red-500 font-medium hover:underline'>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

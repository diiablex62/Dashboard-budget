import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineCalendar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RECURRENT_CATEGORIES,
  getMonthYear,
  MONTHS,
} from "../utils/categoryUtils";
import TransactionsChart from "../components/TransactionsChart";
import { useNavigate } from "react-router-dom";
import { recurrentPaymentApi } from "../utils/api";

export default function PaiementRecurrent() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    montant: "",
    jourPrelevement: "1",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      console.log(
        "Récupération des paiements récurrents pour l'utilisateur:",
        user.id
      );
      const response = await recurrentPaymentApi.getByUserId(user.id);
      console.log("Paiements récurrents reçus:", response);
      setPayments(response);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements récurrents:",
        error
      );
      setError("Erreur lors de la récupération des paiements récurrents");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...formData,
        userId: user.id,
        montant: parseFloat(formData.montant),
        jourPrelevement: parseInt(formData.jourPrelevement),
      };

      if (editingId) {
        await recurrentPaymentApi.update(editingId, paymentData);
        console.log("Paiement récurrent mis à jour:", editingId);
      } else {
        await recurrentPaymentApi.create(paymentData);
        console.log("Nouveau paiement récurrent créé");
      }

      setFormData({
        nom: "",
        montant: "",
        jourPrelevement: "1",
        description: "",
      });
      setEditingId(null);
      fetchPayments();
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du paiement récurrent:",
        error
      );
      setError("Erreur lors de la sauvegarde du paiement récurrent");
    }
  };

  const handleEdit = (payment) => {
    setFormData({
      nom: payment.nom,
      montant: payment.montant.toString(),
      jourPrelevement: payment.jourPrelevement.toString(),
      description: payment.description || "",
    });
    setEditingId(payment.id);
  };

  const handleDelete = async (id) => {
    try {
      await recurrentPaymentApi.delete(id);
      console.log("Paiement récurrent supprimé:", id);
      fetchPayments();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du paiement récurrent:",
        error
      );
      setError("Erreur lors de la suppression du paiement récurrent");
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>
            {editingId
              ? "Modifier le paiement récurrent"
              : "Nouveau paiement récurrent"}
          </h1>

          {error && (
            <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='nom'
                className='block text-sm font-medium text-gray-700'>
                Nom
              </label>
              <input
                type='text'
                id='nom'
                name='nom'
                value={formData.nom}
                onChange={handleInputChange}
                required
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>

            <div>
              <label
                htmlFor='montant'
                className='block text-sm font-medium text-gray-700'>
                Montant (€)
              </label>
              <input
                type='number'
                id='montant'
                name='montant'
                value={formData.montant}
                onChange={handleInputChange}
                required
                min='0'
                step='0.01'
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>

            <div>
              <label
                htmlFor='jourPrelevement'
                className='block text-sm font-medium text-gray-700'>
                Jour de prélèvement
              </label>
              <select
                id='jourPrelevement'
                name='jourPrelevement'
                value={formData.jourPrelevement}
                onChange={handleInputChange}
                required
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows='3'
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>

            <div className='flex justify-end space-x-3'>
              {editingId && (
                <button
                  type='button'
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      nom: "",
                      montant: "",
                      jourPrelevement: "1",
                      description: "",
                    });
                  }}
                  className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  Annuler
                </button>
              )}
              <button
                type='submit'
                className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'>
                {editingId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </div>

        <div className='border-t border-gray-200'>
          <div className='p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Paiements récurrents
            </h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Nom
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Montant
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Jour de prélèvement
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Description
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {payment.nom}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {payment.montant.toFixed(2)} €
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {payment.jourPrelevement}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        {payment.description}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => handleEdit(payment)}
                          className='text-indigo-600 hover:text-indigo-900 mr-4'>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className='text-red-600 hover:text-red-900'>
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
    </div>
  );
}

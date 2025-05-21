import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { recurrentPaymentApi } from "../utils/api";

export default function PaiementRecurrent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    montant: "",
    jourPrelevement: "1",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      console.log(
        "Utilisateur non connecté, redirection vers la page de connexion"
      );
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchPayments = useCallback(async () => {
    if (!user) {
      console.log("Pas d'utilisateur connecté");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(
        "Récupération des paiements récurrents pour l'utilisateur:",
        user.id
      );

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Session expirée, veuillez vous reconnecter");
      }

      const response = await recurrentPaymentApi.getByUserId(user.id);
      if (!response) {
        throw new Error("Format de réponse invalide");
      }

      console.log("Paiements récurrents reçus:", response);
      setPayments(response);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des paiements récurrents:",
        error
      );
      if (error.message === "Session expirée, veuillez vous reconnecter") {
        setError(error.message);
        navigate("/login");
      } else if (error.response) {
        setError(
          `Erreur serveur: ${error.response.data?.message || "Erreur inconnue"}`
        );
      } else if (error.request) {
        setError(
          "Impossible de contacter le serveur, veuillez réessayer plus tard"
        );
      } else {
        setError("Erreur lors de la récupération des paiements récurrents");
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [fetchPayments, user]);

  useEffect(() => {
    const handleDataUpdate = () => {
      if (user) {
        fetchPayments();
      }
    };
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchPayments, user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        console.log(
          "Utilisateur non connecté, redirection vers la page de connexion"
        );
        navigate("/login");
        return;
      }

      if (!formData.nom) {
        setError("Le nom est requis");
        return;
      }

      if (!formData.montant) {
        setError("Le montant est requis");
        return;
      }

      const montant = parseFloat(formData.montant);
      if (isNaN(montant) || montant <= 0) {
        setError("Le montant doit être un nombre positif");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const paymentData = {
          ...formData,
          userId: user.id,
          montant: montant,
          jourPrelevement: parseInt(formData.jourPrelevement),
        };

        console.log("Données du paiement récurrent:", paymentData);

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
        setShowModal(false);
        await fetchPayments();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde du paiement récurrent:",
          error
        );
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la sauvegarde du paiement récurrent");
        }
      } finally {
        setLoading(false);
      }
    },
    [editingId, formData, user, fetchPayments, navigate]
  );

  const handleEdit = useCallback((payment) => {
    setFormData({
      nom: payment.nom,
      montant: payment.montant.toString(),
      jourPrelevement: payment.jourPrelevement.toString(),
      description: payment.description || "",
    });
    setEditingId(payment.id);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (
        !window.confirm(
          "Êtes-vous sûr de vouloir supprimer ce paiement récurrent ?"
        )
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await recurrentPaymentApi.delete(id);
        console.log("Paiement récurrent supprimé:", id);
        await fetchPayments();
        window.dispatchEvent(new Event("data-updated"));
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du paiement récurrent:",
          error
        );
        if (error.response) {
          setError(
            `Erreur serveur: ${
              error.response.data?.message || "Erreur inconnue"
            }`
          );
        } else {
          setError("Erreur lors de la suppression du paiement récurrent");
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchPayments]
  );

  const handleAddNew = useCallback(() => {
    setFormData({
      nom: "",
      montant: "",
      jourPrelevement: "1",
      description: "",
    });
    setEditingId(null);
    setShowModal(true);
  }, []);

  const totalMontant = useMemo(() => {
    return payments.reduce((acc, payment) => acc + payment.montant, 0);
  }, [payments]);

  if (!user) {
    return null; // Ne rien afficher pendant la redirection
  }

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden'>
        <div className='p-4 border-b flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Paiements récurrents
          </h1>
          <button
            onClick={handleAddNew}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
            Ajouter un paiement récurrent
          </button>
        </div>

        <div className='p-4'>
          <div className='mb-6'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              Total des paiements récurrents
            </h2>
            <p className='text-2xl font-bold text-gray-900 dark:text-white'>
              {totalMontant.toFixed(2)} €
            </p>
          </div>

          <div className='space-y-4'>
            {payments.map((payment) => (
              <div
                key={payment.id}
                className='flex justify-between items-center p-4 border rounded-lg'>
                <div>
                  <div className='font-medium dark:text-white'>
                    {payment.nom}
                  </div>
                  <div className='text-sm text-gray-500'>
                    Jour de prélèvement: {payment.jourPrelevement}
                  </div>
                  {payment.description && (
                    <div className='text-sm text-gray-500'>
                      {payment.description}
                    </div>
                  )}
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {payment.montant.toFixed(2)} €
                  </div>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => handleEdit(payment)}
                      className='text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'>
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'>
                      <FiTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center'
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
            <button
              className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              onClick={() => setShowModal(false)}
              aria-label='Fermer'>
              ✕
            </button>
            <div className='mb-6 text-lg font-semibold dark:text-white'>
              {editingId
                ? "Modifier le paiement récurrent"
                : "Nouveau paiement récurrent"}
            </div>
            {error && (
              <div className='mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded'>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Nom
                </label>
                <input
                  type='text'
                  name='nom'
                  value={formData.nom}
                  onChange={handleInputChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                  placeholder='Ex: Loyer'
                  required
                />
              </div>
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Montant (€)
                </label>
                <input
                  type='number'
                  name='montant'
                  value={formData.montant}
                  onChange={handleInputChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                  min='0.01'
                  step='0.01'
                  placeholder='Ex: 500'
                  required
                />
              </div>
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Jour de prélèvement
                </label>
                <input
                  type='number'
                  name='jourPrelevement'
                  value={formData.jourPrelevement}
                  onChange={handleInputChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                  min='1'
                  max='31'
                  required
                />
              </div>
              <div>
                <label className='block mb-2 font-medium dark:text-white'>
                  Description (optionnel)
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                  rows='3'
                  placeholder='Ajouter une description...'
                />
              </div>
              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
                  Annuler
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

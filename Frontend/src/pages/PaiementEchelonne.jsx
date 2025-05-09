import React, { useContext, useState, useRef, useEffect } from "react";
import { AiOutlinePlus, AiOutlineDollarCircle } from "react-icons/ai";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { FiEdit, FiTrash } from "react-icons/fi";
import Toast from "../components/Toast"; // Assure-toi que ce composant existe et est identique à celui utilisé pour la connexion

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
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [newPaiement, setNewPaiement] = useState({
    nom: "",
    montant: "",
    mensualites: "",
    debutMois: "",
  });
  const [paiements, setPaiements] = useState([]);
  const nomInputRef = useRef(null);
  const montantInputRef = useRef(null);
  const mensualitesInputRef = useRef(null);
  const debutMoisInputRef = useRef(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
    undo: false,
    loading: false,
    timeoutId: null,
  });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [deleteTimeout, setDeleteTimeout] = useState(null);

  useEffect(() => {
    if (showModal && step === 1 && nomInputRef.current)
      nomInputRef.current.focus();
    if (showModal && step === 2 && montantInputRef.current)
      montantInputRef.current.focus();
    if (showModal && step === 3 && mensualitesInputRef.current)
      mensualitesInputRef.current.focus();
    if (showModal && step === 4 && debutMoisInputRef.current)
      debutMoisInputRef.current.focus();
  }, [showModal, step]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e) => {
    setNewPaiement({ ...newPaiement, [e.target.name]: e.target.value });
  };

  // Charger les paiements depuis Firestore
  const fetchPaiements = async () => {
    try {
      const snapshot = await getDocs(collection(db, "xfois"));
      setPaiements(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (err) {
      console.error("Erreur Firestore fetch xfois:", err);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  // Ajout du paiement échelonné
  const handleAddPaiement = async () => {
    try {
      await addDoc(collection(db, "xfois"), {
        nom: newPaiement.nom,
        montant: parseFloat(newPaiement.montant),
        mensualites: parseInt(newPaiement.mensualites, 10),
        debutMois: newPaiement.debutMois,
        createdAt: serverTimestamp(),
      });
      await fetchPaiements();
      setShowModal(false);
      setStep(1);
      setNewPaiement({ nom: "", montant: "", mensualites: "", debutMois: "" });
    } catch (err) {
      console.error("Erreur Firestore add xfois:", err);
    }
  };

  // Ajoute ces handlers pour l'exemple (à adapter selon ta logique)
  const handleEdit = (idx) => {
    // TODO: ouvrir la modale en mode édition pour l'élément idx
    alert("Fonction modifier à implémenter");
  };
  const handleDelete = async (idx) => {
    const paiement = paiements[idx];
    if (!paiement || !paiement.id) return;
    clearToast();
    setToast({
      open: true,
      message: "Suppression en cours...",
      type: "error", // fond rouge
      undo: true,
      loading: true,
      timeoutId: null,
    });
    setLastDeleted({ ...paiement, idx });
    // Lance le timer d'annulation
    const timeout = setTimeout(async () => {
      await deleteDoc(doc(db, "xfois", paiement.id));
      setPaiements((prev) => prev.filter((_, i) => i !== idx));
      setToast({
        open: true,
        message: "Suppression effectuée.",
        type: "success",
        undo: false,
        loading: false,
        timeoutId: setTimeout(() => clearToast(), 5000),
      });
      setDeleteTimeout(null);
      setLastDeleted(null);
    }, 5000);
    setDeleteTimeout(timeout);
  };

  const handleUndo = () => {
    // Annule la suppression
    if (deleteTimeout) clearTimeout(deleteTimeout);
    setDeleteTimeout(null);
    setToast({
      open: true,
      message: "Suppression annulée.",
      type: "success",
      undo: false,
      loading: false,
      timeoutId: setTimeout(() => clearToast(), 3000),
    });
    setLastDeleted(null);
  };

  const clearToast = () => {
    setToast((t) => {
      if (t.timeoutId) clearTimeout(t.timeoutId);
      return { ...t, open: false, timeoutId: null };
    });
  };

  // Nettoyage du toast si on quitte la page ou démonte le composant
  useEffect(() => {
    return () => {
      if (toast && toast.timeoutId) clearTimeout(toast.timeoutId);
      if (deleteTimeout) clearTimeout(deleteTimeout);
    };
    // eslint-disable-next-line
  }, [toast, deleteTimeout]);

  // Spinner SVG
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  return (
    <div className='bg-[#f8fafc] min-h-screen'>
      {/* Toast notification identique à la connexion */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={clearToast}
        loading={toast.loading}
        action={
          toast.undo
            ? {
                label: "Annuler",
                onClick: handleUndo,
              }
            : undefined
        }
      />
      <div className='p-8'>
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
                ? setShowModal(true)
                : navigate("/auth", { state: { isLogin: true } })
            }>
            <AiOutlinePlus className='text-xl' /> Ajouter un paiement échelonné
          </button>
        </div>
        {/* Modal */}
        {showModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center'
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative'>
              <button
                className='absolute top-2 right-2 text-gray-400 hover:text-gray-700'
                onClick={() => {
                  setShowModal(false);
                  setStep(1);
                  setNewPaiement({
                    nom: "",
                    montant: "",
                    mensualites: "",
                    debutMois: "",
                  });
                }}
                aria-label='Fermer'>
                ✕
              </button>
              <div className='mb-6 text-lg font-semibold'>
                Ajouter un paiement échelonné
              </div>
              {/* Récapitulatif dynamique */}
              <div className='mb-4'>
                {newPaiement.nom && (
                  <div>
                    <span className='font-medium'>Libellé :</span>{" "}
                    {newPaiement.nom.charAt(0).toUpperCase() +
                      newPaiement.nom.slice(1)}
                  </div>
                )}
                {step > 1 && newPaiement.montant && (
                  <div>
                    <span className='font-medium'>Montant total :</span>{" "}
                    {parseFloat(newPaiement.montant).toFixed(2)} €
                  </div>
                )}
                {step > 2 && newPaiement.mensualites && (
                  <div>
                    <span className='font-medium'>Nombre de mensualités :</span>{" "}
                    {newPaiement.mensualites}
                  </div>
                )}
                {step > 3 && newPaiement.debutMois && (
                  <div>
                    <span className='font-medium'>Début de mois :</span>{" "}
                    {newPaiement.debutMois}
                  </div>
                )}
              </div>
              {step === 1 && (
                <div>
                  <label className='block mb-2 font-medium'>Libellé</label>
                  <input
                    type='text'
                    name='nom'
                    value={newPaiement.nom}
                    onChange={handleChange}
                    className='w-full border rounded px-3 py-2 mb-4'
                    placeholder='Ex: Smartphone Samsung'
                    ref={nomInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.nom) handleNext();
                    }}
                  />
                  <div className='flex justify-end'>
                    <button
                      className='bg-blue-600 text-white px-4 py-2 rounded'
                      disabled={!newPaiement.nom}
                      onClick={handleNext}>
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className='block mb-2 font-medium'>
                    Montant total (€)
                  </label>
                  <input
                    type='number'
                    name='montant'
                    value={newPaiement.montant}
                    onChange={handleChange}
                    className='w-full border rounded px-3 py-2 mb-4'
                    min='0'
                    step='0.01'
                    placeholder='Ex: 899.99'
                    ref={montantInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.montant)
                        handleNext();
                    }}
                  />
                  <div className='flex justify-between'>
                    <button className='text-gray-600' onClick={handlePrev}>
                      Précédent
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <label className='block mb-2 font-medium'>
                    Nombre de mensualités
                  </label>
                  <input
                    type='number'
                    name='mensualites'
                    value={newPaiement.mensualites}
                    onChange={handleChange}
                    className='w-full border rounded px-3 py-2 mb-4'
                    min='1'
                    step='1'
                    placeholder='Ex: 12'
                    ref={mensualitesInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.mensualites)
                        handleNext();
                    }}
                  />
                  <div className='flex justify-between'>
                    <button className='text-gray-600' onClick={handlePrev}>
                      Précédent
                    </button>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <label className='block mb-2 font-medium'>
                    Début de mois
                  </label>
                  <input
                    type='month'
                    name='debutMois'
                    value={newPaiement.debutMois}
                    onChange={handleChange}
                    className='w-full border rounded px-3 py-2 mb-4'
                    ref={debutMoisInputRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPaiement.debutMois)
                        handleAddPaiement();
                    }}
                  />
                  <div className='flex justify-between'>
                    <button className='text-gray-600' onClick={handlePrev}>
                      Précédent
                    </button>
                    <button
                      className='bg-green-600 text-white px-4 py-2 rounded'
                      disabled={
                        !newPaiement.nom ||
                        !newPaiement.montant ||
                        !newPaiement.mensualites ||
                        !newPaiement.debutMois
                      }
                      onClick={handleAddPaiement}>
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Totaux */}
        <div className='flex flex-col gap-4 md:flex-row md:gap-8 mb-8'>
          <div className='flex-1 bg-white border border-[#ececec] rounded-xl flex items-center gap-4 p-6'>
            <div className='bg-green-100 rounded-full p-3'>
              <AiOutlineDollarCircle className='text-2xl text-green-500' />
            </div>
            <div>
              <div className='text-gray-500 text-sm font-medium'>
                Total Dépenses
              </div>
              <div
                className='text-xl font-semibold'
                style={{ color: "#00b96b" }}>
                {totalDepenses.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>
        {/* Liste */}
        <div className='w-full max-w-2xl'>
          {/* Affichage des paiements Firestore */}
          {paiements.map((item, idx) => (
            <div
              key={item.id || idx}
              className='bg-white border border-[#ececec] rounded-xl shadow-sm p-6 mb-6 flex flex-col relative'>
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
                      style={{ color: "#00b6e6" }}
                    />
                  </div>
                  <span className='font-semibold text-[#222]'>
                    {item.nom.charAt(0).toUpperCase() + item.nom.slice(1)}
                  </span>
                </div>
                <div className='text-[#222] font-medium text-sm opacity-70'>
                  {(item.montant / item.mensualites).toFixed(2)}€/mois
                </div>
              </div>
              <div className='flex items-center justify-between mb-1'>
                <div className='font-medium' style={{ color: barColor }}>
                  Mensualité {/* Affiche la mensualité courante si besoin */}
                  1/{item.mensualites}
                </div>
                {/* Pourcentage payé non calculé ici */}
              </div>
              <div className='w-full h-2 bg-[#f0f2f5] rounded mb-2'>
                <div
                  className='h-2 rounded'
                  style={{
                    width: `0%`,
                    background: barColor,
                  }}></div>
              </div>
              <div className='text-[#a0aec0] text-sm'>
                Reste à payer:{" "}
                <span className='font-semibold text-[#222]'>
                  {item.montant.toFixed(2)}€
                </span>
              </div>
              <div className='text-xs text-gray-400 mt-1'>
                {(() => {
                  if (!item.debutMois || !item.mensualites) return "";
                  // Parse début
                  const [year, month] = item.debutMois.split("-");
                  const debutDate = new Date(Number(year), Number(month) - 1);
                  // Calcule la date de fin
                  const finDate = new Date(
                    Number(year),
                    Number(month) - 1 + Number(item.mensualites) - 1
                  );
                  // Mois en lettres
                  const moisLettres = [
                    "Janvier",
                    "Février",
                    "Mars",
                    "Avril",
                    "Mai",
                    "Juin",
                    "Juillet",
                    "Août",
                    "Septembre",
                    "Octobre",
                    "Novembre",
                    "Décembre",
                  ];
                  const debutStr = `${
                    moisLettres[debutDate.getMonth()]
                  } ${debutDate.getFullYear()}`;
                  const finStr = `${
                    moisLettres[finDate.getMonth()]
                  } ${finDate.getFullYear()}`;
                  return `Début: ${debutStr} - fin ${finStr}`;
                })()}
              </div>
              {/* Boutons action en bas à droite */}
              <div className='flex justify-end gap-2 mt-4'>
                <button
                  className='flex items-center gap-1 px-3 py-1 rounded text-blue-600 hover:bg-blue-50 text-sm font-medium'
                  title='Modifier'
                  onClick={() => handleEdit(idx)}>
                  <FiEdit className='inline' /> Modifier
                </button>
                <button
                  className='flex items-center gap-1 px-3 py-1 rounded text-red-500 hover:bg-red-50 text-sm font-medium'
                  title='Supprimer'
                  onClick={() => handleDelete(idx)}>
                  <FiTrash className='inline' /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

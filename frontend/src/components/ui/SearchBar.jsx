/**
 * Composant SearchBar
 * Un composant de barre de recherche réutilisable avec support du mode sombre
 * Utilisé dans la sidebar pour la recherche globale
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SearchBar = ({
  placeholder = "Rechercher...",
  onSearch,
  onBlur,
  isSidebarCollapsed,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    depenseRevenu: [],
    recurrent: [],
    echelonne: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { getData } = useAuth();

  // Gestion des raccourcis clavier
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setShowResults(false);
        setSearchTerm("");
        setIsFocused(false);
        if (onBlur) onBlur();
      } else if (e.key === "Enter" && searchResults.length > 0) {
        const firstResult = Object.values(searchResults).flat()[0];
        if (firstResult) {
          handleResultClick(firstResult);
        }
      }
    },
    [searchResults, onBlur]
  );

  useEffect(() => {
    if (isFocused) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, handleKeyDown]);

  // Réinitialiser la recherche quand la sidebar se ferme
  useEffect(() => {
    if (isSidebarCollapsed) {
      setSearchTerm("");
      setSearchResults({
        depenseRevenu: [],
        recurrent: [],
        echelonne: [],
      });
      setShowResults(false);
      setIsFocused(false);
      if (onSearch) onSearch("");
    }
  }, [isSidebarCollapsed, onSearch]);

  const searchInData = (term) => {
    if (!term) {
      setSearchResults({
        depenseRevenu: [],
        recurrent: [],
        echelonne: [],
      });
      return;
    }

    const data = getData() || {};
    const results = {
      depenseRevenu: [],
      recurrent: [],
      echelonne: [],
    };

    // Recherche dans les dépenses et revenus
    data.depenseRevenu?.forEach((item) => {
      if (
        item.nom?.toLowerCase().includes(term.toLowerCase()) ||
        item.montant?.toString().includes(term) ||
        item.categorie?.toLowerCase().includes(term.toLowerCase())
      ) {
        results.depenseRevenu.push({
          type: "depenseRevenu",
          id: item.id,
          nom: item.nom,
          montant: item.montant,
          date: item.date,
          categorie: item.categorie,
          transactionType: item.type,
        });
      }
    });

    // Recherche dans les paiements récurrents
    data.paiementsRecurrents?.forEach((item) => {
      if (
        item.nom?.toLowerCase().includes(term.toLowerCase()) ||
        item.montant?.toString().includes(term) ||
        item.categorie?.toLowerCase().includes(term.toLowerCase())
      ) {
        results.recurrent.push({
          type: "recurrent",
          id: item.id,
          nom: item.nom,
          montant: item.montant,
          categorie: item.categorie,
          jourPrelevement: item.jourPrelevement,
        });
      }
    });

    // Recherche dans les paiements échelonnés
    data.paiementsEchelonnes?.forEach((item) => {
      if (
        item.nom?.toLowerCase().includes(term.toLowerCase()) ||
        item.montant?.toString().includes(term) ||
        item.categorie?.toLowerCase().includes(term.toLowerCase())
      ) {
        results.echelonne.push({
          type: "echelonne",
          id: item.id,
          nom: item.nom,
          montant: item.montant,
          categorie: item.categorie,
          debutDate: item.debutDate,
          mensualites: item.mensualites,
        });
      }
    });

    setSearchResults(results);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchInData(value);
    setShowResults(true);
    if (onSearch) onSearch(value);
  };

  const handleResultClick = (result) => {
    console.log("=== DÉBUT DE LA REDIRECTION ===");
    console.log("Résultat cliqué:", result);
    console.log("Type de résultat:", result.type);
    console.log("ID du résultat:", result.id);

    setShowResults(false);
    setSearchTerm("");
    setIsFocused(false);
    setSearchResults({
      depenseRevenu: [],
      recurrent: [],
      echelonne: [],
    });

    // Empêcher la fermeture de la sidebar
    if (onBlur) {
      console.log("Appel de onBlur");
      onBlur();
    }

    // Navigation vers la page appropriée avec l'ID de l'élément
    let path = "";
    switch (result.type) {
      case "depenseRevenu":
        path = `/depenses-revenus?selected=${result.id}`;
        break;
      case "recurrent":
        path = `/recurrents?selected=${result.id}`;
        break;
      case "echelonne":
        path = `/echelonne?selected=${result.id}`;
        break;
      default:
        console.error("Type de résultat non reconnu:", result.type);
        return;
    }

    console.log("Chemin de redirection calculé:", path);

    // Utiliser navigate au lieu de window.location.href
    try {
      console.log("Tentative de redirection avec navigate...");
      navigate(path);
      console.log("Redirection effectuée avec succès");
    } catch (error) {
      console.error("Erreur lors de la redirection:", error);
      console.error("Détails de l'erreur:", {
        message: error.message,
        stack: error.stack,
      });
    }
    console.log("=== FIN DE LA REDIRECTION ===");
  };

  const getPageTitle = (type) => {
    switch (type) {
      case "depenseRevenu":
        return "Dépenses & Revenus";
      case "recurrent":
        return "Paiements récurrents";
      case "echelonne":
        return "Paiements échelonnés";
      default:
        return "";
    }
  };

  const hasResults = Object.values(searchResults).some((arr) => arr.length > 0);

  return (
    <div className='relative w-full'>
      <input
        type='text'
        id='search-bar'
        value={searchTerm}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Ne pas fermer les résultats immédiatement
          setTimeout(() => {
            setShowResults(false);
            setIsFocused(false);
          }, 200);
        }}
        placeholder={placeholder}
        className='w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
      />
      <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
        <svg
          className='w-4 h-4 text-gray-400 dark:text-gray-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>

      {/* Résultats de recherche */}
      {showResults && hasResults && (
        <div
          className='absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto'
          onClick={(e) => e.stopPropagation()}>
          {Object.entries(searchResults).map(
            ([type, results]) =>
              results.length > 0 && (
                <div
                  key={type}
                  className='border-b border-gray-200 dark:border-gray-700 last:border-b-0'>
                  <div className='px-3 py-2 bg-gray-50 dark:bg-gray-700'>
                    <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                      {getPageTitle(type)}
                    </h3>
                  </div>
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleResultClick(result)}
                      className='p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0'>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {result.nom}
                        </span>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          {result.montant}€
                        </span>
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {result.type === "depenseRevenu" && (
                          <span>
                            {new Date(result.date).toLocaleDateString("fr-FR")}{" "}
                            -{" "}
                            {result.transactionType === "depense"
                              ? "Dépense"
                              : "Revenu"}
                          </span>
                        )}
                        {result.type === "recurrent" && (
                          <span>
                            Paiement récurrent - Jour {result.jourPrelevement}
                          </span>
                        )}
                        {result.type === "echelonne" && (
                          <span>
                            Paiement échelonné - {result.mensualites}{" "}
                            mensualités
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

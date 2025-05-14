import React, { useState, useEffect, useRef } from "react";
import { getCategoryColor } from "../utils/categoryUtils";

/**
 * Composant affichant un graphique en camembert pour visualiser
 * la répartition des transactions par catégorie
 *
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.data - Données des transactions
 * @param {string} props.type - Type de transactions ('revenus' ou 'depenses')
 * @param {Function} props.onCategoryClick - Fonction appelée lors du clic sur une catégorie (optionnel)
 */
const TransactionsChart = ({ data, type, onCategoryClick }) => {
  console.log(`TransactionsChart rendu avec type: ${type}, données: `, data);

  const svgRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [key, setKey] = useState(0); // Clé unique pour forcer le remontage du composant

  // Remontage du composant quand le type change
  useEffect(() => {
    console.log(`Type changé: ${type}`);
    // Génère une nouvelle clé pour forcer le remontage du composant
    setKey((prevKey) => prevKey + 1);
    // Réinitialiser l'animation
    setAnimationProgress(0);
  }, [type]);

  // Animation des transitions
  useEffect(() => {
    if (!data || data.length === 0) return;

    console.log(`Animation démarrée pour ${type}`);
    // Réinitialiser l'animation
    setAnimationProgress(0);

    const animationDuration = 1000; // 1 seconde
    const frameDuration = 16; // ~60fps
    const totalFrames = animationDuration / frameDuration;
    let frame = 0;

    const animateChart = () => {
      if (frame < totalFrames) {
        // Fonction d'accélération pour une animation plus naturelle
        const progress = Math.pow(frame / totalFrames, 2);
        setAnimationProgress(progress);
        frame++;
        requestAnimationFrame(animateChart);
      } else {
        setAnimationProgress(1);
        console.log(`Animation terminée pour ${type}`);
      }
    };

    const timerId = setTimeout(() => {
      requestAnimationFrame(animateChart);
    }, 200); // Petit délai avant le début de l'animation

    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(animateChart);
    };
  }, [data, key]); // Dépend aussi de la clé pour se relancer à chaque remontage

  // Recalcul des données à chaque changement de données ou de type
  useEffect(() => {
    if (!data || data.length === 0) {
      console.log(`Pas de données pour ${type}`);
      setChartData([]);
      setTotal(0);
      return;
    }

    // Regrouper les données par catégorie
    const dataByCat = data.reduce((acc, item) => {
      const cat = item.categorie || "Autre";
      const amount = type === "revenus" ? item.montant : Math.abs(item.montant);
      acc[cat] = (acc[cat] || 0) + amount;
      return acc;
    }, {});

    // Calculer le total pour les pourcentages
    const totalAmount = Object.values(dataByCat).reduce(
      (sum, val) => sum + val,
      0
    );
    setTotal(totalAmount);

    // Convertir en tableau pour l'affichage et trier par montant décroissant
    const processedData = Object.entries(dataByCat)
      .map(([cat, amount]) => {
        const color = getCategoryColor(cat);
        console.log(`Catégorie: ${cat}, Montant: ${amount}, Couleur: ${color}`);
        return {
          categorie: cat,
          montant: amount,
          percentage: (amount / totalAmount) * 100,
          color: color,
        };
      })
      .sort((a, b) => b.montant - a.montant);

    console.log(`Données traitées pour ${type}:`, processedData);
    setChartData(processedData);
  }, [data, type]);

  // Gestion du clic sur une catégorie
  const handleCategoryClick = (category) => {
    console.log(`Catégorie cliquée: ${category}`);
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  // Rendu du graphique
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className='flex items-center justify-center h-60 text-gray-500 dark:text-gray-400'>
          Aucune donnée à afficher
        </div>
      );
    }

    console.log(`Rendu du graphique ${type} avec ${chartData.length} segments`);

    // Calculer les positions des segments du camembert avec l'animation
    return (
      <div className='flex flex-col items-center mt-4'>
        {/* Rendu du camembert avec SVG */}
        <div
          className='relative w-64 h-64 mb-8'
          role='img'
          aria-label={`Graphique des ${
            type === "revenus" ? "revenus" : "dépenses"
          } par catégorie`}>
          <svg
            ref={svgRef}
            viewBox='0 0 100 100'
            width='100%'
            height='100%'
            className={
              type === "depenses" ? "depenses-chart" : "revenus-chart"
            }>
            {chartData.map((item, index) => {
              // Calculer les angles pour créer les portions du camembert
              const totalPercentage = chartData
                .slice(0, index)
                .reduce((sum, slice) => sum + slice.percentage, 0);

              // Appliquer l'animation
              const animatedPercentage = item.percentage * animationProgress;

              const startAngle =
                (totalPercentage / 100) * 2 * Math.PI - Math.PI / 2;
              const endAngle =
                ((totalPercentage + animatedPercentage) / 100) * 2 * Math.PI -
                Math.PI / 2;

              // Calculer les coordonnées
              const startX = 50 + 40 * Math.cos(startAngle);
              const startY = 50 + 40 * Math.sin(startAngle);
              const endX = 50 + 40 * Math.cos(endAngle);
              const endY = 50 + 40 * Math.sin(endAngle);

              // Déterminer si c'est un arc long (plus de 180°)
              const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

              // Créer le chemin d'arc
              const pathData = [
                `M 50 50`,
                `L ${startX} ${startY}`,
                `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`,
              ].join(" ");

              // Calcul de l'angle médian pour positionner le label (utilisé pour l'accessibilité)
              const midAngle = (startAngle + endAngle) / 2;

              // Effet de "hover" pour mettre en évidence la section
              const isHovered = hoveredCategory === item.categorie;
              const hoverScale = isHovered ? 1.05 : 1;
              const transform = isHovered
                ? `translate(${Math.cos(midAngle) * 2}, ${
                    Math.sin(midAngle) * 2
                  }) scale(${hoverScale})`
                : "";

              console.log(
                `Segment ${index}: ${item.categorie}, Couleur: ${
                  item.color
                }, Pourcentage: ${item.percentage.toFixed(1)}%`
              );

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || "#cccccc"}
                  stroke='#fff'
                  strokeWidth='0.5'
                  transform={transform}
                  style={{
                    transformOrigin: "center",
                    transition: "transform 0.2s ease-out",
                  }}
                  onMouseEnter={() => setHoveredCategory(item.categorie)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => handleCategoryClick(item.categorie)}
                  role='button'
                  aria-label={`${item.categorie}: ${item.percentage.toFixed(
                    1
                  )}%, ${item.montant.toFixed(2)} €`}
                  tabIndex='0'
                  className='cursor-pointer'
                />
              );
            })}

            {/* Cercle intérieur pour l'effet donut */}
            <circle
              cx='50'
              cy='50'
              r='20'
              fill='white'
              className='dark:fill-gray-800'
            />

            {/* Texte au centre avec animation de compteur */}
            <text
              x='50'
              y='50'
              textAnchor='middle'
              dominantBaseline='middle'
              fontSize='5'
              fontWeight='bold'
              fill='currentColor'
              className='text-gray-700 dark:text-gray-300'>
              {(total * animationProgress).toFixed(2)} €
            </text>
          </svg>
        </div>

        {/* Légende avec effet de surbrillance */}
        <div className='grid grid-cols-2 gap-x-6 gap-y-3 mt-2 max-w-xs'>
          {chartData.map((item, index) => (
            <div
              key={index}
              className={`flex items-center p-1 rounded cursor-pointer transition-all duration-200 ${
                hoveredCategory === item.categorie
                  ? "bg-gray-100 dark:bg-gray-800 scale-105 shadow-sm"
                  : ""
              }`}
              onClick={() => handleCategoryClick(item.categorie)}
              onMouseEnter={() => setHoveredCategory(item.categorie)}
              onMouseLeave={() => setHoveredCategory(null)}
              role='button'
              tabIndex='0'>
              <div
                className='w-3 h-3 rounded-full mr-2 transition-transform duration-200'
                style={{
                  backgroundColor: item.color || "#cccccc",
                  transform:
                    hoveredCategory === item.categorie
                      ? "scale(1.3)"
                      : "scale(1)",
                }}></div>
              <div className='text-xs'>
                <span className='font-medium'>{item.categorie}</span>
                <span className='text-gray-500 dark:text-gray-400 ml-1'>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Affichage du graphique avec une clé unique pour forcer le remontage à chaque changement de type
  return (
    <div
      key={key}
      className='bg-white dark:bg-gray-900 rounded-2xl shadow border border-[#ececec] dark:border-gray-800 p-6 h-full'>
      <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
        {type === "revenus"
          ? "Répartition des revenus"
          : "Répartition des dépenses"}
      </h3>
      <div className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
        Par catégorie
      </div>
      <style jsx global>{`
        .depenses-chart path {
          /* Forcer les couleurs à rester visibles */
          fill-opacity: 1 !important;
        }
        .revenus-chart path {
          /* Assurer la visibilité des revenus aussi */
          fill-opacity: 1 !important;
        }
      `}</style>
      {renderChart()}
    </div>
  );
};

export default TransactionsChart;

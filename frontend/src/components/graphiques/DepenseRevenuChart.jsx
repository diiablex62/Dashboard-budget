import React, { useState, useEffect, useRef } from "react";
import * as categoryUtils from "../../utils/categoryUtils";

/**
 * Affiche la répartition des dépenses & revenus par catégorie
 * @param {Array} props.data - Données des dépenses & revenus
 * @param {string} props.type - Type ('revenus' ou 'depenses')
 */
const DepenseRevenuChart = ({ data, type }) => {
  console.log(`DepenseRevenuChart rendu avec type: ${type}, données: `, data);

  const svgRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [key, setKey] = useState(0); // Clé unique pour forcer le remontage du composant
  const [loading, setLoading] = useState(true);

  // Fonction pour afficher le montant avec le bon formatage
  const formatMontant = (montant) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(montant);
  };

  // Remontage du composant quand le type change
  useEffect(() => {
    console.log(`Type changé: ${type}`);
    // Génère une nouvelle clé pour forcer le remontage du composant
    setKey((prevKey) => prevKey + 1);
    // Réinitialiser l'animation
    setAnimationProgress(0);
    setLoading(true);
  }, [type]);

  // Animation des transitions
  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    console.log(
      `Animation démarrée pour ${type} avec ${data.length} catégories`
    );
    // Réinitialiser l'animation
    setAnimationProgress(0);
    setLoading(true);

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
        setLoading(false);
        console.log(`Animation terminée pour ${type}, données: `, chartData);
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
        const color = categoryUtils.getCategoryColor(cat);
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

  // Rendu du graphique
  const renderChart = () => {
    if (chartData.length === 0) {
      console.log(`Aucune donnée à afficher pour ${type}`);
      return (
        <div className='flex items-center justify-center h-60 text-gray-500 dark:text-gray-400'>
          Aucune donnée à afficher
        </div>
      );
    }

    console.log(
      `Rendu du graphique ${type} avec ${
        chartData.length
      } segments, animation: ${animationProgress * 100}%`
    );

    // Cas spécial pour un graphique avec un seul segment
    if (chartData.length === 1) {
      const singleItem = chartData[0];
      console.log(
        `Graphique à segment unique - Catégorie: ${singleItem.categorie}, Couleur: ${singleItem.color}`
      );

      return (
        <div className='flex flex-col items-center mt-4'>
          {/* Rendu d'un cercle plein pour un seul segment */}
          <div
            className='relative w-64 h-64'
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
              {/* Cercle complet pour le segment unique */}
              <circle
                cx='50'
                cy='50'
                r='40'
                fill={singleItem.color || "#cccccc"}
                stroke='#fff'
                strokeWidth='0.5'
                style={{
                  transformOrigin: "center",
                  transition: "transform 0.2s ease-out",
                  opacity: animationProgress, // Animation d'opacité
                }}
                role='presentation'
                aria-label={`${singleItem.categorie}: 100%`}
                className=''
              />

              {/* Cercle intérieur pour l'effet donut */}
              <circle
                cx='50'
                cy='50'
                r='20'
                fill='white'
                className='dark:fill-gray-800'
                style={{
                  opacity: animationProgress, // Animation d'opacité
                }}
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
                {/* Aucun texte au centre */}
              </text>

              {/* Afficher le prix au survol */}
              {hoveredCategory === singleItem.categorie && (
                <g>
                  <rect
                    x='25'
                    y='40'
                    width='50'
                    height='10'
                    rx='2'
                    fill='rgba(0,0,0,0.7)'
                    className='dark:fill-gray-800'
                  />
                  <text
                    x='50'
                    y='46'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    fontSize='4'
                    fill='white'
                    className='text-white'>
                    {formatMontant(singleItem.montant)}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      );
    }

    // Calculer les positions des segments du camembert avec l'animation
    return (
      <div className='flex flex-col items-center mt-4'>
        {/* Rendu du camembert avec SVG */}
        <div
          className='relative w-64 h-64'
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
                <g key={index}>
                  <path
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
                    role='presentation'
                    aria-label={`${item.categorie}: ${item.percentage.toFixed(
                      1
                    )}%`}
                    className=''
                  />

                  {/* Afficher le prix au survol */}
                  {isHovered && (
                    <g>
                      {/* Position du tooltip près du segment survolé */}
                      <rect
                        x='30'
                        y='45'
                        width='40'
                        height='10'
                        rx='2'
                        fill='rgba(0,0,0,0.7)'
                        className='dark:fill-gray-800'
                      />
                      <text
                        x='50'
                        y='50'
                        textAnchor='middle'
                        dominantBaseline='middle'
                        fontSize='4'
                        fill='white'
                        className='text-white'>
                        {formatMontant(item.montant)}
                      </text>
                    </g>
                  )}
                </g>
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
              {/* Aucun texte au centre */}
            </text>
          </svg>
        </div>
      </div>
    );
  };

  // Affichage du graphique avec une clé unique pour forcer le remontage à chaque changement de type
  return (
    <div className='h-[300px] flex flex-col relative' key={key}>
      {loading && (
        <div className='absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center z-10'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
        </div>
      )}

      <div className='flex-1 flex flex-col md:flex-row items-center justify-center gap-6'>
        {/* Partie graphique */}
        <div className='flex-1 flex items-center justify-center'>
          {renderChart()}
        </div>

        {/* Légende */}
        <div className='flex-1'>
          {chartData.length > 0 && (
            <div className='space-y-2'>
              {chartData.map((item) => (
                <div
                  key={item.categorie}
                  className={`flex items-center justify-between p-2 rounded-md transition-all duration-200 ${
                    hoveredCategory === item.categorie ? "bg-transparent" : ""
                  }`}
                  onMouseEnter={() => setHoveredCategory(item.categorie)}
                  onMouseLeave={() => setHoveredCategory(null)}>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: item.color || "#ccc" }}></div>
                    <span className='text-gray-700 dark:text-gray-300 font-medium'>
                      {item.categorie} : {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepenseRevenuChart;

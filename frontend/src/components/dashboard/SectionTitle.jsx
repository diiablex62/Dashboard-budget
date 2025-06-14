/**
 * @file SectionTitle.jsx
 * @description Composant réutilisable pour les titres de section
 */

import React from "react";

const SectionTitle = ({ children, className = "" }) => {
  return (
    <h2 className={`text-lg font-semibold mb-4 text-center ${className}`}>
      {children}
    </h2>
  );
};

export default SectionTitle;

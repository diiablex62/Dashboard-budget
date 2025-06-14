/**
 * @file Button.jsx
 * @description Composant de bouton réutilisable avec le style standard de l'application
 */

import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  icon: Icon,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 
        px-5 py-2 
        bg-gray-900 text-white 
        rounded-lg 
        hover:bg-gray-800 
        transition-colors 
        cursor-pointer 
        text-base font-semibold 
        shadow-md
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}>
      {Icon && <Icon className='text-lg' />}
      {children}
    </button>
  );
};

export default Button;

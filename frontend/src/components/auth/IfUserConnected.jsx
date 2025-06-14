import React from "react";
import { useAuth } from "../../context/AuthContext";

const IfUserConnected = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // On retourne simplement les enfants sans redirection
  return children;
};

export default IfUserConnected;

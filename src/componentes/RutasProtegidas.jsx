import React from "react";
import { Navigate } from "react-router-dom";

const RutasProtegidas = ({ children }) => {
  const usuario = sessionStorage.getItem("usuarioId");

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RutasProtegidas;

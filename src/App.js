import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./componentes/Login";
import Inicio from "./componentes/Inicio";
import RutasProtegidas from "./componentes/RutasProtegidas";
//import Inicio from "./componentes/Inicio";
import  { useEffect } from "react";


function App() {
  // useEffect(() => {
  //   sessionStorage.clear();
  // }, []);
  const RutaProtegida = ({ children }) => {
    const usuario = sessionStorage.getItem("usuario");
    return usuario ? children : <Navigate to="/login" />;
  };
  return (
    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
        path="/inicio" 
        element={
          <RutasProtegidas>
            <Inicio />
          </RutasProtegidas>
        } />

        <Route path="*" element={<Login />} /> {/* Ruta por defecto */}
      </Routes>
    </Router>
  );
}

export default App;

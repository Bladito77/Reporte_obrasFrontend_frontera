import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  HardHat,
  Package,
  Building2,
  FolderCog,
  FilePlus2,
  LogOut,
} from "lucide-react";

import Empleados from "./Empleados";
import Actividades from "./Actividades";
import DashboardGraficas from "./DashboardGraficas";
import Bienvenida from "./Bienvenida";

// Placeholders para futuras vistas
import Equipos from "./Equipos";
import Materiales from "./Materiales";
import Proyectos from "./Proyectos";
import Areas from "./Areas";
import Cargos from "./Cargos";
import ReporteObra from "./ReporteObra";

export default function Inicio() {
  const navigate = useNavigate();
  const [formularioActivo, setFormularioActivo] = useState("Bienvenida");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const rolUsuario = sessionStorage.getItem("Rol") || "No definido";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const renderFormulario = () => {
    switch (formularioActivo) {
      case "Bienvenida":
        return <Bienvenida />;
      case "Empleados":
        return <Empleados />;
      case "Actividades":
        return <Actividades />;
      case "Equipos":
        return <Equipos />;
      case "Materiales":
        return <Materiales />;
      case "Proyectos":
        return <Proyectos />;
      case "Áreas":
        return <Areas />;
      case "Cargos de empleados":
        return <Cargos />;
      case "Nuevo reporte de obra":
        //return <ReporteObra />;
        return <ReporteObra irAInicio={() => setFormularioActivo("Bienvenida")} />;
      default:
        return (
          <div className="text-center text-gray-500 font-bold mt-20">
            Panel de estadisticas a construir con cliente
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white px-3 py-2 rounded"
      >
        ☰ Menú
      </button>

      <aside
        className={`bg-gradient-to-b from-blue-900 to-blue-600 text-white p-4 space-y-3 z-40 fixed top-0 left-0 h-full w-64 transform transition-transform duration-300 ease-in-out
            ${menuAbierto ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:block`}
      >
        <h2 className="text-xl font-bold mb-4">Menú</h2>
        {[
          { label: "Bienvenida", icon: Users },
          { label: "Inicio", icon: Users }, 
          { label: "Empleados", icon: Users },
          { label: "Actividades", icon: ClipboardList },
          { label: "Equipos", icon: HardHat },
          { label: "Materiales", icon: Package },
          { label: "Proyectos", icon: Building2 },
          { label: "Áreas", icon: FolderCog },
          { label: "Cargos de empleados", icon: Users },
          { label: "Nuevo reporte de obra", icon: FilePlus2 },
        ].map(({ label, icon: Icon }, idx) => (
          <button
            key={idx}
            onClick={() => {
              setFormularioActivo(label);
              setMenuAbierto(false);
            }}
            className="flex items-center gap-2 w-full text-left px-2 py-1 bg-blue-800 hover:bg-blue-700 rounded"
          >
            <Icon size={16} /> {label}
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded mt-4"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-16 md:pt-0">
        <section className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded shadow-md p-4 h-full">
            {renderFormulario()}
          </div>
        </section>

        <aside className="w-[300px] min-w-[250px] max-w-sm bg-white shadow-md rounded p-4 hidden lg:block overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
          <p>Progreso: 70%</p>
          <p>Último reporte: ayer</p>
          <p>Total actividades: 12</p>
          <div className="mt-4 border-t pt-2">
            <h4 className="font-bold">Rol del usuario</h4>
            <p className="text-blue-700">{rolUsuario}</p>
          </div>
          <DashboardGraficas />
        </aside>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from '../api'; 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardGraficas() {
  const [datosGrafica, setDatosGrafica] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await axios.get(`${API}/api/empleados`);
        const empleados = res.data;

        // Agrupar por área
        const conteoPorArea = {};
        empleados.forEach((emp) => {
          conteoPorArea[emp.area] = (conteoPorArea[emp.area] || 0) + 1;
        });

        // Convertir a arreglo para la gráfica
        const datos = Object.entries(conteoPorArea).map(([area, cantidad]) => ({
          area: `Área ${area}`,
          cantidad,
        }));

        setDatosGrafica(datos);
      } catch (error) {
        console.error("Error al obtener empleados para la gráfica", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <div className="mt-4">
      <h4 className="font-bold mb-2">Empleados por Área</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={datosGrafica} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" fill="#3b82f6" name="Total empleados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from 'material-react-table';
import axios from "axios";
import { API } from "../api"; // ← usamos tu archivo api.js

export default function Actividades() {
  const [actividades, setActividades] = useState([]);
  const [areas, setAreas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [resAct, resAreas, resProy] = await Promise.all([
        axios.get(`${API}/api/actividades`),
        axios.get(`${API}/api/areas`),
        axios.get(`${API}/api/proyectos`),
      ]);

      setAreas(resAreas.data);
      setProyectos(resProy.data);

      const actividadesConTexto = resAct.data.map((act) => {
        const area = resAreas.data.find((a) => a.id === act.area);
        const proyecto = resProy.data.find((p) => p.id === act.proyecto);
        return {
          ...act,
          areaTexto: area ? area.area_ : "—",
          proyectoTexto: proyecto ? proyecto.proyectos : "—",
        };
      });

      setActividades(actividadesConTexto);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async ({ values }) => {
    const datos = {
      ...values,
      area: areas.find(a => a.area_ === values.areaTexto)?.id || values.areaTexto,
      proyecto: proyectos.find(p => p.proyectos === values.proyectoTexto)?.id || values.proyectoTexto,
    };
    try {
      await axios.post(`${API}/api/actividades`, datos);
      fetchAll();
    } catch (error) {
      console.error("Error creando actividad", error);
    }
  };

  const handleUpdate = async ({ values, row }) => {
    const id = values.id || row?.original?.id;
    const datos = {
      ...values,
      area: areas.find(a => a.area_ === values.areaTexto)?.id || values.areaTexto,
      proyecto: proyectos.find(p => p.proyectos === values.proyectoTexto)?.id || values.proyectoTexto,
    };
    try {
      await axios.put(`${API}/api/actividades/${id}`, datos);
      fetchAll();
    } catch (error) {
      console.error("Error actualizando actividad", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`${API}/api/actividades/${row.original.id}`);
      fetchAll();
    } catch (error) {
      console.error("Error eliminando actividad", error);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "descript",
      header: "Descripción",
    },
    {
      accessorKey: "areaTexto",
      header: "Área",
      editVariant: "select",
      editSelectOptions: areas.map(a => ({ value: a.area_, label: a.area_ })),
    },
    {
      accessorKey: "proyectoTexto",
      header: "Proyecto",
      editVariant: "select",
      editSelectOptions: proyectos.map(p => ({ value: p.proyectos, label: p.proyectos })),
    },
  ], [areas, proyectos]);

  return (
    <MaterialReactTable
      columns={columns}
      data={actividades}
      enableEditing
      editingMode="modal"
      enableRowActions
      enableTopToolbar
      createDisplayMode="modal"
      onCreatingRowSave={handleCreate}
      onEditingRowSave={handleUpdate}
      muiTableProps={{ sx: { tableLayout: "auto" } }}
      state={{ isLoading }}
      renderRowActions={({ row, table }) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => table.setEditingRow(row)}>
            <Pencil size={18} />
          </button>
          <button onClick={() => handleDelete(row)}>
            <Trash2 size={18} color="red" />
          </button>
        </div>
      )}
      renderTopToolbarCustomActions={({ table }) => (
        <button
          onClick={() => table.setCreatingRow(true)}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "6px 12px",
            borderRadius: "4px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          Crear nueva actividad
        </button>
      )}
    />
  );
}

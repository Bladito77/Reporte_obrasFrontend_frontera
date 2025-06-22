import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from "material-react-table";
import axios from "axios";
import { API } from '../api'; 
export default function Cargos() {
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [resCargos, resAreas, resProyectos] = await Promise.all([
        axios.get(`${API}/api/cargos`),
        axios.get(`${API}/api/areas`),
        axios.get(`${API}/api/proyectos`),
      ]);

      setAreas(resAreas.data);
      setProyectos(resProyectos.data);

      const datos = resCargos.data.map((cargo) => {
        const area = resAreas.data.find((a) => a.id === cargo.area);
        const proyecto = resProyectos.data.find((p) => p.id === cargo.proyecto);
        return {
          ...cargo,
          areaTexto: area?.area_ || "—",
          proyectoTexto: proyecto?.proyectos || "—",
        };
      });

      setCargos(datos);
    } catch (error) {
      console.error("Error al cargar datos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async ({ values }) => {
    const areaObj = areas.find((a) => a.area_ === values.areaTexto || a.id === values.area);
    const proyectoObj = proyectos.find((p) => p.proyectos === values.proyectoTexto || p.id === values.proyecto);

    const datos = {
      ...values,
      area: areaObj?.id,
      proyecto: proyectoObj?.id,
    };

    try {
      await axios.post(`${API}/api/cargos`, datos);
      fetchAll();
    } catch (error) {
      console.error("Error al crear cargo", error);
    }
  };

  const handleUpdate = async ({ values, row }) => {
    const id = values.id || row?.original?.id;

    const datos = {
      ...values,
      area: areas.find((a) => a.area_ === values.areaTexto || a.id === values.area)?.id,
      proyecto: proyectos.find((p) => p.proyectos === values.proyectoTexto || p.id === values.proyecto)?.id,
    };

    try {
      await axios.put(`${API}/api/cargos/${id}`, datos);
      fetchAll();
    } catch (error) {
      console.error("Error al actualizar cargo", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`${API}/api/cargos/${row.original.id}`);
      fetchAll();
    } catch (error) {
      console.error("Error al eliminar cargo", error);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "cargo",
      header: "Cargo",
      filterVariant: "text",
    },
    {
      accessorKey: "areaTexto",
      header: "Área",
      filterVariant: "text",
      editVariant: "select",
      editSelectOptions: areas.map((a) => ({ value: a.area_, label: a.area_ })),
    },
    {
      accessorKey: "proyectoTexto",
      header: "Proyecto",
      filterVariant: "text",
      editVariant: "select",
      editSelectOptions: proyectos.map((p) => ({ value: p.proyectos, label: p.proyectos })),
    },
  ], [areas, proyectos]);

  return (
    <MaterialReactTable
      columns={columns}
      data={cargos}
      enableEditing
      editingMode="modal"
      enableRowActions
      enableTopToolbar
      createDisplayMode="modal"
      onCreatingRowSave={handleCreate}
      onEditingRowSave={handleUpdate}
      state={{ isLoading }}
      muiTableProps={{ sx: { tableLayout: "auto" } }}
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
          Crear nuevo cargo
        </button>
      )}
    />
  );
}

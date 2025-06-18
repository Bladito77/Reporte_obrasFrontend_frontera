import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from 'material-react-table';
import axios from "axios";

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:3000/api/areas");
      setAreas(res.data);
    } catch (error) {
      console.error("Error al cargar áreas", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async ({ values }) => {
    try {
      await axios.post("http://localhost:3000/api/areas", values);
      fetchAreas();
    } catch (error) {
      console.error("Error al crear área", error);
    }
  };

  const handleUpdate = async ({ values, row }) => {
    try {
      const id = values.id || row.original.id;
      await axios.put(`http://localhost:3000/api/areas/${id}`, values);
      fetchAreas();
    } catch (error) {
      console.error("Error al actualizar área", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`http://localhost:3000/api/areas/${row.original.id}`);
      fetchAreas();
    } catch (error) {
      console.error("Error al eliminar área", error);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "area_",
      header: "Nombre del Área",
      filterVariant: "text",
    },
  ], []);

  return (
    <MaterialReactTable
      columns={columns}
      data={areas}
      enableEditing
      editingMode="modal"
      enableRowActions
      enableTopToolbar
      createDisplayMode="modal"
      onCreatingRowSave={handleCreate}
      onEditingRowSave={handleUpdate}
      state={{ isLoading }}
      muiTableProps={{ sx: { tableLayout: "auto" } }}
      renderCreateRowDialogTitle={() => <span>Crear nueva área</span>}
      renderEditRowDialogTitle={() => <span>Editar área</span>}
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
          Crear nueva área
        </button>
      )}
    />
  );
}

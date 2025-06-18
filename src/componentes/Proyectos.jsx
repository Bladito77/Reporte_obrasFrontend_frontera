import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from 'material-react-table';
import axios from "axios";

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:3000/api/proyectos");
      setProyectos(res.data);
    } catch (error) {
      console.error("Error al cargar proyectos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async ({ values }) => {
    try {
      await axios.post("http://localhost:3000/api/proyectos", values);
      fetchProyectos();
    } catch (error) {
      console.error("Error al crear proyecto", error);
    }
  };

  const handleUpdate = async ({ values, row }) => {
    try {
      const id = values.id || row?.original?.id;
      await axios.put(`http://localhost:3000/api/proyectos/${id}`, values);
      fetchProyectos();
    } catch (error) {
      console.error("Error al actualizar proyecto", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`http://localhost:3000/api/proyectos/${row.original.id}`);
      fetchProyectos();
    } catch (error) {
      console.error("Error al eliminar proyecto", error);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "proyectos",
      header: "Nombre del Proyecto",
      filterVariant: "text",
    },
  ], []);

  return (
    <MaterialReactTable
      columns={columns}
      data={proyectos}
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
          Crear nuevo proyecto
        </button>
      )}
    />
  );
}

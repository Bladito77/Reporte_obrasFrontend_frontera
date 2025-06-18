import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from 'material-react-table';
import axios from "axios";

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEquipos();
  }, []);

  const fetchEquipos = async () => {
    try {
      setIsLoading(true);

      const [resEquipos, resAreas, resProyectos] = await Promise.all([
        axios.get("http://localhost:3000/api/equipos"),
        axios.get("http://localhost:3000/api/areas"),
        axios.get("http://localhost:3000/api/proyectos"),
      ]);

      setAreas(resAreas.data);
      setProyectos(resProyectos.data);

      const equiposConTexto = resEquipos.data.map((eq) => {
        const area = resAreas.data.find(a => a.id === eq.area);
        const proyecto = resProyectos.data.find(p => p.id === eq.proyecto);
        return {
          ...eq,
          areaTexto: area ? area.area_ : "—",
          proyectoTexto: proyecto ? proyecto.proyectos : "—"
        };
      });

      setEquipos(equiposConTexto);
    } catch (error) {
      console.error("Error al cargar equipos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async ({ values }) => {
    const datos = {
      ...values,
      area: Number(values.area),
      proyecto: Number(values.proyecto),
    };
    try {
      await axios.post("http://localhost:3000/api/equipos", datos);
      fetchEquipos();
    } catch (error) {
      console.error("Error al crear equipo", error);
    }
  };

  const handleUpdate = async ({ values, row }) => {
    try {
      const id = values.id || row?.original?.id;
      const datos = {
        ...values,
        area: Number(values.area),
        proyecto: Number(values.proyecto),
      };
      await axios.put(`http://localhost:3000/api/equipos/${id}`, datos);
      fetchEquipos();
    } catch (error) {
      console.error("Error al actualizar equipo", error);
    }
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`http://localhost:3000/api/equipos/${row.original.id}`);
      fetchEquipos();
    } catch (error) {
      console.error("Error al eliminar equipo", error);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name_machine",
      header: "Nombre del Equipo",
    },
    {
      accessorKey: "areaTexto",
      header: "Área",
      filterVariant: "text",
    },
    {
      accessorKey: "proyectoTexto",
      header: "Proyecto",
      filterVariant: "text",
    }
  ], [areas, proyectos]);

  return (
    <MaterialReactTable
      columns={columns}
      data={equipos}
      enableEditing
      editingMode="modal"
      enableRowActions
      enableTopToolbar
      createDisplayMode="modal"
      onCreatingRowSave={handleCreate}
      onEditingRowSave={handleUpdate}
      state={{ isLoading }}
      muiTableProps={{ sx: { tableLayout: 'auto' } }}
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
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Crear nuevo equipo
        </button>
      )}
    />
  );
}

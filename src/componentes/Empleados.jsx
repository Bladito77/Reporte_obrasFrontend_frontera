import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from 'material-react-table';
import axios from "axios";
import { API, apiFetch } from '../api'; // ← si api.js está en la raíz


export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    apiFetchData();
  }, []);

  const apiFetchData = async () => {
    try {
      setIsLoading(true);
      const [resEmpleados, resCargos, resAreas] = await Promise.all([
        axios.get(`${API}/api/empleados`),
        axios.get(`${API}/api/cargos`),
        axios.get(`${API}/api/areas`),
      ]);

      setCargos(resCargos.data);
      setAreas(resAreas.data);

      // Agregar campos texto para filtros y visibilidad
      const empleadosConTexto = resEmpleados.data.map(emp => {
        const cargo = resCargos.data.find(c => c.id === emp.cargo);
        const area = resAreas.data.find(a => a.id === emp.area);
        return {
          ...emp,
          cargoTexto: cargo?.cargo || "—",
          areaTexto: area?.area_ || "—",
        };
      });

      setEmpleados(empleadosConTexto);
    } catch (error) {
      console.error("Error al cargar datos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async ({ values }) => {
    const cargoObj = cargos.find(c => c.cargo === values.cargoTexto || c.id === values.cargo);
    const areaObj = areas.find(a => a.area_ === values.areaTexto || a.id === values.area);

    const datos = {
      ...values,
      cargo: cargoObj?.id || values.cargo,
      area: areaObj?.id || values.area,
    };
    try {
      await axios.post(`${API}/api/empleados`, datos);
      apiFetchData();
    } catch (error) {
      console.error("Error al crear empleado", error);
    }
  };

  const handleUpdate = async ({ values, row }) => {
    try {
      const id = values.id || row?.original?.id;
      if (!id) throw new Error("ID no definido para actualizar");

      const datos = {
        ...values,
        cargo: cargos.find(c => c.cargo === values.cargoTexto || c.id === values.cargo)?.id ?? values.cargo,
        area: areas.find(a => a.area_ === values.areaTexto || a.id === values.area)?.id ?? values.area,
      };

      await axios.put(`${API}/api/empleados/${id}`, datos);
      apiFetchData();
    } catch (error) {
      console.error("🛑 Error al actualizar empleado:", error.response?.data || error.message);
    }
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`${API}/api/empleados/${row.original.id}`);
      apiFetchData();
    } catch (error) {
      console.error("Error al eliminar empleado", error);
    }
  };

  const columns = useMemo(() => [
    { accessorKey: "nombres", header: "Nombres", filterVariant: "text" },
    { accessorKey: "apellidos", header: "Apellidos", filterVariant: "text" },
    // { accessorKey: "cedula", header: "Cédula", filterVariant: "text" },
    {
      accessorKey: "cedula",
      header: "Cédula",
      filterVariant: "text",
      muiEditTextFieldProps: {
        type: "number",
        inputProps: { min: 0 },
        required: true,
        onInput: (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
        },
      },
    },

    { accessorKey: "telefono", header: "Teléfono", filterVariant: "text" },
    {
      accessorKey: "cargoTexto",
      header: "Cargo",
      filterVariant: "text",
      editVariant: "select",
      editSelectOptions: cargos.map(c => ({ value: c.cargo, label: c.cargo })),
    },
    {
      accessorKey: "areaTexto",
      header: "Área",
      filterVariant: "text",
      editVariant: "select",
      editSelectOptions: areas.map(a => ({ value: a.area_, label: a.area_ })),
    },
    { accessorKey: "ciudad", header: "Ciudad", filterVariant: "text" },
  ], [cargos, areas]);

  return (
    <MaterialReactTable
      columns={columns}
      data={empleados}
      enableEditing
      editingMode="modal"
      enableRowActions
      enableTopToolbar
      createDisplayMode="modal"
      onCreatingRowSave={handleCreate}
      onEditingRowSave={handleUpdate}
      muiTableProps={{ sx: { tableLayout: "auto" } }}
      renderEditRowDialogTitle={({ table, row }) => (
        <span>Editar empleado</span>
      )}
      renderCreateRowDialogTitle={({ table }) => (
        <span>Crear nuevo empleado</span>
      )}
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
          Crear nuevo empleado
        </button>
      )}
      state={{ isLoading }}
    />
  );
}

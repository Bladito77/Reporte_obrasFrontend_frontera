import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MaterialReactTable } from "material-react-table";
import axios from "axios";
import { API } from '../api'; 

export default function Materiales() {
    const [materiales, setMateriales] = useState([]);
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchMateriales();
        fetchAreas();
    }, []);

    const fetchMateriales = async () => {
        try {
            setIsLoading(true);
            const [resMateriales, resAreas] = await Promise.all([
                axios.get(`${API}/api/materiales`),
                axios.get(`${API}/api/areas`),
            ]);

            setAreas(resAreas.data);

            const materialesConTexto = resMateriales.data.map((mat) => {
                const area = resAreas.data.find((a) => a.id === mat.area);
                return {
                    ...mat,
                    areaTexto: area ? area.area_ : "—",
                };
            });

            setMateriales(materialesConTexto);
        } catch (error) {
            console.error("Error al cargar materiales", error);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchAreas = async () => {
        try {
            const res = await axios.get(`${API}/api/areas`);
            setAreas(res.data);
        } catch (error) {
            console.error("Error al cargar áreas", error);
        }
    };

    const handleCreate = async ({ values }) => {
        const datos = {
            ...values,
            area: Number(values.area),
        };
        try {
            await axios.post(`${API}/api/materiales`, datos);
            fetchMateriales();
        } catch (error) {
            console.error("Error al crear material", error);
        }
    };

    const handleUpdate = async ({ values, row }) => {
        try {
            const id = values.id || row?.original?.id;
            const datos = {
                ...values,
                area: Number(values.area),
            };
            await axios.put(`${API}/api/materiales/${id}`, datos);
            fetchMateriales();
        } catch (error) {
            console.error("Error al actualizar material", error);
        }
    };

    const handleDelete = async (row) => {
        try {
            await axios.delete(`${API}/api/materiales/${row.original.id}`);
            fetchMateriales();
        } catch (error) {
            console.error("Error al eliminar material", error);
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: "name_mat",
            header: "Nombre del Material",
        },
        {
            accessorKey: "area",
            header: "Área",
            editVariant: "select",
            editSelectOptions: areas.map((a) => ({ value: a.id, label: a.area_ })),
            muiEditTextFieldProps: { select: true },
            Cell: ({ cell }) => {
                const area = areas.find((a) => a.id === Number(cell.getValue()));
                return area ? area.area_ : "—";
            },
        },
    ], [areas]);


    return (
        <MaterialReactTable
            columns={columns}
            data={materiales}
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
                    Crear nuevo material
                </button>
            )}
        />
    );
}

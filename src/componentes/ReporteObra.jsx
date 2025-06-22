import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Accordion, AccordionSummary, AccordionDetails, TextField, Button, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PlusCircle, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API } from '../api'; 

import {
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";

export default function ReporteObra({ irAInicio }) {
    const [guardando, setGuardando] = useState(false);
    const navigate = useNavigate();
    const [encabezado, setEncabezado] = useState({
        fecha: '',
        proyectos: '',
        area: '',
        fechainicio: '',
        fechafin: '',
        responsable: sessionStorage.getItem("usuarioNombre") || '', // 👈 aquí
        linea: '',
        tiempo: '',
    });



    const [empleadosOptions, setEmpleadosOptions] = useState([]);
    const [empleados, setEmpleados] = useState([{ nombre: '', cedula: '', horas: '' }]);

    useEffect(() => {
        axios.get(`${API}/api/empleados`)
            .then(res => setEmpleadosOptions(res.data))
            .catch(err => console.error("Error cargando empleados", err));
    }, []);
    useEffect(() => {
        if (encabezado.fechainicio && encabezado.fechafin) {
            const inicio = new Date(encabezado.fechainicio);
            const fin = new Date(encabezado.fechafin);
            const horas = Math.abs(fin - inicio) / 36e5;

            setEmpleados(prev =>
                prev.map(emp => ({
                    ...emp,
                    //horas: horas.toFixed(2) // 👈 redondeado a 2 decimales
                    horas: parseFloat(horas.toFixed(2))
                }))
            );
            setEncabezado(prev => ({
                ...prev,
                tiempo: horas.toFixed(2)
            }));
        }
    }, [encabezado.fechainicio, encabezado.fechafin]);



    const [equipos, setEquipos] = useState([{ id: Date.now(), id_maqu: "", cantidad: "", proveedor: "",consecu: "" }]);
    const [equiposOptions, setEquiposOptions] = useState([]);
    //const [equipos, setEquipos] = useState([{ equipo: '', horas: '' }]);
    //const [materiales, setMateriales] = useState([{ material: '', cantidad: '' }]);
    const [actividades, setActividades] = useState([{ actividad: '', avance: '' }]);
    const [materiales, setMateriales] = useState([{ id: Date.now(), id_mat: "", cantidad: "", proveedor: "", consecu: "" }]);
    const [materialesOptions, setMaterialesOptions] = useState([]);
    const handleAddFila = (setFn, data) => setFn(prev => [...prev, data]);
    const handleRemoveFila = (setFn, index) => setFn(prev => prev.filter((_, i) => i !== index));

    const handleChange = (setFn, index, field, value) => {
        setFn(prev => {
            const copy = [...prev];
            copy[index][field] = value;
            return copy;
        });
    };
    const [actividadesRealizadas, setActividadesRealizadas] = useState([
        { id: Date.now(), id_descr_acti: "", cantidad: "", consecu: "" },
    ]);

    const [actividadesFuturas, setActividadesFuturas] = useState([
        { id: Date.now(), id_descr_acti: "", cantidad: "", consecu: "" },
    ]);

    const [actividadOptions, setActividadOptions] = useState([]);

    useEffect(() => {
        axios.get(`${API}/api/actividades`)
            .then(res => setActividadOptions(res.data))
            .catch(err => console.error("Error cargando descripciones de actividad", err));
    }, []);

    useEffect(() => {
        //console.log("🔎 Equipos antes de enviar:", equipos);
        // Carga los nombres de equipos desde la BD
        axios.get(`${API}/api/equipos`)
            .then(res => setEquiposOptions(res.data))
            .catch(err => console.error("Error cargando equipos", err));
    }, []);
    const handleEquipoChange = (index, field, value) => {
        const updated = [...equipos];
        updated[index][field] = value;
        setEquipos(updated);
    };

    const addFilaEquipo = () => {
        setEquipos([...equipos, { id: Date.now(), id_maqu: "", cantidad: "", proveedor: "", consecu: "" // oculto, pero se puede setear si es necesario
 }]);
    };


    const removeFilaEquipo = (id) => {
        setEquipos(equipos.filter(eq => eq.id !== id));
    };
    useEffect(() => {
        axios.get(`${API}/api/materiales`)
            .then(res => setMaterialesOptions(res.data))
            .catch(err => console.error("Error cargando materiales", err));
    }, []);

    const handleMaterialChange = (index, field, value) => {
        const updated = [...materiales];
        updated[index][field] = value;
        setMateriales(updated);
    };

    const addFilaMaterial = () => {
        setMateriales([...materiales, {
            id: Date.now(),
            id_mat: "",
            cantidad: "",
            proveedor: "",
            consecu: "" // oculto, pero se puede setear si es necesario
        }]);
    };

    const removeFilaMaterial = (id) => {
        setMateriales(materiales.filter(mat => mat.id !== id));
    };
    const [areas, setAreas] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    useEffect(() => {
        axios.get(`${API}/api/areas`)
            .then(res => setAreas(res.data))
            .catch(err => console.error("Error cargando áreas", err));

        axios.get(`${API}/api/proyectos`)
            .then(res => setProyectos(res.data))
            .catch(err => console.error("Error cargando proyectos", err));
    }, []);

    const [ultimoIdReporte, setUltimoIdReporte] = useState(null);
    const guardarReporte = async () => {
        if (guardando) return; // Evita doble clic
        setGuardando(true);
        // 🔐 Validaciones  no se tocan
        if (
            !encabezado.fecha ||
            !encabezado.proyectos ||
            !encabezado.area ||
            !encabezado.fechainicio ||
            !encabezado.fechafin ||
            !encabezado.responsable ||
            !encabezado.linea ||
            !encabezado.tiempo
        ) {
            alert("❌ Completa todos los campos del encabezado.");
            return;
        }

        if (
            empleados.length === 0 ||
            empleados.some(emp => !emp.nombre || !emp.cedula || !emp.horas)
        ) {
            alert("❌ Debes agregar al menos un empleado y completar nombre, cedula y horas.");
            return;
        }

        const equiposValidos = equipos.every(eq =>
            !eq.id_maqu && !eq.cantidad && !eq.proveedor
                ? true
                : eq.id_maqu && eq.cantidad && eq.proveedor
        );
        if (!equiposValidos) {
            alert("❌ Revisa que todos los campos de los equipos estén completos o elimina las filas vacías.");
            return;
        }

        const materialesValidos = materiales.every(mat =>
            !mat.id_mat && !mat.cantidad && !mat.proveedor
                ? true
                : mat.id_mat && mat.cantidad && mat.proveedor
        );
        if (!materialesValidos) {
            alert("❌ Revisa que todos los campos de los materiales estén completos o elimina las filas vacías.");
            return;
        }

        const actividadesRealizadasValidas = actividadesRealizadas.every(act =>
            !act.id_descr_acti && !act.cantidad
                ? true
                : act.id_descr_acti && act.cantidad
        );
        if (!actividadesRealizadasValidas) {
            alert("❌ Revisa las actividades realizadas. Completa los campos o elimina las filas vacías.");
            return;
        }

        const actividadesFuturasValidas = actividadesFuturas.every(act =>
            !act.id_descr_acti && !act.cantidad
                ? true
                : act.id_descr_acti && act.cantidad
        );
        if (!actividadesFuturasValidas) {
            alert("❌ Revisa las actividades futuras. Completa los campos o elimina las filas vacías.");
            return;
        }

        try {
            const payload = {
                encabezado,
                empleados,
                //equipos: equipos.filter(eq => eq.id_maqu && eq.cantidad && eq.proveedor).map(({ id, ...rest }) => rest),
                equipos: equipos.filter(eq => eq.id_maqu && eq.cantidad && eq.proveedor).map(({ id, ...rest }) => ({...rest,id_maqu: parseInt(rest.id_maqu) || null})),

                materiales: materiales.filter(mat => mat.id_mat && mat.cantidad && mat.proveedor).map(({ id, ...rest }) => rest),
                actividades_realizadas: actividadesRealizadas.filter(act => act.id_descr_acti && act.cantidad).map(({ id, ...rest }) => rest),
                actividades_futuras: actividadesFuturas.filter(act => act.id_descr_acti && act.cantidad).map(({ id, ...rest }) => rest)
            };

            const res = await axios.post(`${API}/api/reportes`, payload);
            const nuevoId = res.data.id;
            setUltimoIdReporte(nuevoId);
            //console.log("🧾 ID recibido en el frontend:", nuevoId);
            if (!nuevoId) {
                alert("❌ No se recibió un ID válido del backend");
                return;
            }
            setUltimoIdReporte(nuevoId);
            //alert("✅ Reporte guardado con éxito. Se generará el PDF.");

            // 🧾 Genera el PDF directo con el nuevo ID, no con el estado
            //await generarPDF(nuevoId);
            alert("✅ Reporte guardado con éxito. Se generará el PDF.");
            await generarPDF(nuevoId, irAInicio); // 👈 esto sí debe recibir el ID

            // ✅ Redirige después de imprimir
            //irAInicio?.();

        } catch (error) {
            console.error("Error al guardar el reporte", error);
            alert("❌ Error al guardar el reporte");
        }

    };

    const generarPDF = async (id, callbackAfterDownload) => {
        try {
            const response = await fetch(`${API}/api/reportes/pdf/${id}`);
            if (!response.ok) {
                throw new Error("Error al generar el PDF");
            }

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `reporte_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // ✅ Llamamos al callback después de descargar
            setTimeout(() => {
                if (typeof callbackAfterDownload === 'function') {
                    callbackAfterDownload();
                }
            }, 1500);

        } catch (error) {
            console.error("Error al generar el PDF", error);
            alert("❌ No se pudo generar el PDF");
        }
    };

    return (
        <>
            {/* Fragmento del encabezado... */}


            <div className="bg-white shadow-md rounded p-4 space-y-4 mb-6">
                <h3 className="text-lg font-bold text-gray-700">Reporte de Obra Diario</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                        label="Fecha"
                        type="date"
                        fullWidth
                        value={encabezado.fecha}
                        onChange={(e) => setEncabezado({ ...encabezado, fecha: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth>
                        <InputLabel id="proyecto-label">Proyecto</InputLabel>
                        <Select
                            labelId="proyecto-label"
                            value={encabezado.proyectos}
                            onChange={(e) => setEncabezado({ ...encabezado, proyectos: e.target.value })}
                        >
                            {proyectos.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.proyectos}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id="area-label">Área</InputLabel>
                        <Select
                            labelId="area-label"
                            value={encabezado.area}
                            onChange={(e) => setEncabezado({ ...encabezado, area: e.target.value })}
                        >
                            {areas.map((a) => (
                                <MenuItem key={a.id} value={a.id}>{a.area_}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Fecha de Inicio"
                        type="datetime-local"
                        fullWidth
                        value={encabezado.fechainicio}
                        onChange={(e) => setEncabezado({ ...encabezado, fechainicio: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Fecha de Fin"
                        type="datetime-local"
                        fullWidth
                        value={encabezado.fechafin}
                        onChange={(e) => setEncabezado({ ...encabezado, fechafin: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Responsable"
                        fullWidth
                        value={encabezado.responsable}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label="Línea"
                        fullWidth
                        value={encabezado.linea}
                        onChange={(e) => setEncabezado({ ...encabezado, linea: e.target.value })}
                    />
                    <TextField
                        label="Tiempo estimado"
                        fullWidth
                        value={encabezado.tiempo}
                        InputProps={{ readOnly: true }}
                        type="number"
                    />
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">Reporte Diario de Obra</h2>

                {/* Acordeón: EMPLEADOS */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="font-bold">Empleados</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {empleados.map((emp, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">

                                {/* ComboBox con empleados desde la BD */}
                                <FormControl fullWidth>
                                    <InputLabel>Empleado</InputLabel>
                                    <Select
                                        value={emp.nombre}
                                        onChange={(e) => {
                                            const selected = empleadosOptions.find(op => `${op.nombres} ${op.apellidos}` === e.target.value);
                                            handleChange(setEmpleados, idx, 'nombre', e.target.value);
                                            handleChange(setEmpleados, idx, 'cedula', selected?.cedula || selected?.id || '');
                                        }}
                                    >
                                        {empleadosOptions.map((op) => (
                                            <MenuItem key={op.id} value={`${op.nombres} ${op.apellidos}`}>
                                                {op.nombres} {op.apellidos}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Cédula"
                                    fullWidth
                                    value={emp.cedula || ''}
                                    InputProps={{ readOnly: true }} // Solo lectura
                                />
                                <TextField
                                    label="Horas"
                                    type="number"
                                    fullWidth
                                    value={emp.horas}
                                    onChange={e => handleChange(setEmpleados, idx, 'horas', e.target.value)}
                                />

                                <div className="col-span-full text-right">
                                    <Button onClick={() => handleRemoveFila(setEmpleados, idx)}>
                                        <Trash2 size={18} color="red" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            onClick={() => {
                                const inicio = new Date(encabezado.fechainicio);
                                const fin = new Date(encabezado.fechafin);
                                const horas = encabezado.fechainicio && encabezado.fechafin
                                    ? (Math.abs(fin - inicio) / 36e5).toFixed(2)
                                    : '';
                                handleAddFila(setEmpleados, { nombre: '', cedula: '', horas });
                            }}
                            startIcon={<PlusCircle />}
                        >
                            Agregar Empleado
                        </Button>

                    </AccordionDetails>
                </Accordion>

                {/* Acordeón: EQUIPOS */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="font-bold">Equipos</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {equipos.map((eq, idx) => (
                            <div key={eq.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                                <select
                                    className="border p-2"
                                    value={eq.id_maqu}
                                    onChange={(e) => handleEquipoChange(idx, "id_maqu", Number(e.target.value))}

                                    //onChange={(e) => handleEquipoChange(idx, "id_maqu", parseInt(e.target.value))}
                                >
                                    <option value="">Seleccione equipo</option>
                                    {equiposOptions.map((e) => (
                                      //<option key={e.id} value={e.id}>{e.name_machine}</option>
                                        <option key={e.id} value={String(e.id)}>{e.name_machine}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    className="border p-2"
                                    value={eq.cantidad}
                                    onChange={(e) => handleEquipoChange(idx, "cantidad", e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Proveedor"
                                    className="border p-2"
                                    value={eq.proveedor}
                                    onChange={(e) => handleEquipoChange(idx, "proveedor", e.target.value)}
                                />
                                <Button onClick={() => removeFilaEquipo(eq.id)}>
                                    <Trash2 size={18} color="red" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addFilaEquipo} startIcon={<PlusCircle />} className="mt-2">
                            Agregar Equipo
                        </Button>
                    </AccordionDetails>
                </Accordion>
                {/* Acordeón: MATERIALES */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="font-bold">Materiales</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {materiales.map((mat, idx) => (
                            <div key={mat.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                <select
                                    className="border p-2"
                                    value={mat.id_mat}
                                    onChange={(e) => handleMaterialChange(idx, "id_mat", e.target.value)}
                                >
                                    <option value="">Seleccione material</option>
                                    {materialesOptions.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name_mat}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    className="border p-2"
                                    value={mat.cantidad}
                                    onChange={(e) => handleMaterialChange(idx, "cantidad", e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Proveedor"
                                    className="border p-2"
                                    value={mat.proveedor}
                                    onChange={(e) => handleMaterialChange(idx, "proveedor", e.target.value)}
                                />
                                <Button onClick={() => removeFilaMaterial(mat.id)}>
                                    <Trash2 size={18} color="red" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addFilaMaterial} startIcon={<PlusCircle />} className="mt-2">
                            Agregar Material
                        </Button>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="font-bold">Actividades Realizadas</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {actividadesRealizadas.map((act, idx) => (
                            <div key={act.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                <select
                                    className="border p-2"
                                    value={act.id_descr_acti}
                                    onChange={(e) => {
                                        const updated = [...actividadesRealizadas];
                                        updated[idx].id_descr_acti = e.target.value;
                                        setActividadesRealizadas(updated);
                                    }}
                                >
                                    <option value="">Seleccione actividad</option>
                                    {actividadOptions.map((a) => (
                                        <option key={a.id} value={a.id}>{a.descript}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    className="border p-2"
                                    value={act.cantidad}
                                    onChange={(e) => {
                                        const updated = [...actividadesRealizadas];
                                        updated[idx].cantidad = e.target.value;
                                        setActividadesRealizadas(updated);
                                    }}
                                />
                                <Button onClick={() => {
                                    setActividadesRealizadas(prev => prev.filter((_, i) => i !== idx));
                                }}>
                                    <Trash2 size={18} color="red" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            onClick={() =>
                                setActividadesRealizadas(prev => [...prev, { id: Date.now(), id_descr_acti: "", cantidad: "", consecu: "" }])
                            }
                            startIcon={<PlusCircle />}
                        >
                            Agregar Actividad Realizada
                        </Button>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="font-bold">Actividades Futuras</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {actividadesFuturas.map((act, idx) => (
                            <div key={act.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                <select
                                    className="border p-2"
                                    value={act.id_descr_acti}
                                    onChange={(e) => {
                                        const updated = [...actividadesFuturas];
                                        updated[idx].id_descr_acti = e.target.value;
                                        setActividadesFuturas(updated);
                                    }}
                                >
                                    <option value="">Seleccione actividad</option>
                                    {actividadOptions.map((a) => (
                                        <option key={a.id} value={a.id}>{a.descript}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    className="border p-2"
                                    value={act.cantidad}
                                    onChange={(e) => {
                                        const updated = [...actividadesFuturas];
                                        updated[idx].cantidad = e.target.value;
                                        setActividadesFuturas(updated);
                                    }}
                                />
                                <Button onClick={() => {
                                    setActividadesFuturas(prev => prev.filter((_, i) => i !== idx));
                                }}>
                                    <Trash2 size={18} color="red" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            onClick={() =>
                                setActividadesFuturas(prev => [...prev, { id: Date.now(), id_descr_acti: "", cantidad: "", consecu: "" }])
                            }
                            startIcon={<PlusCircle />}
                        >
                            Agregar Actividad Futura
                        </Button>
                    </AccordionDetails>
                </Accordion>
                <div className="text-center mt-6 space-x-4">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={guardarReporte}
                        className="bg-blue-600 text-white"
                    >
                        Guardar Reporte Diario de Obra
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (ultimoIdReporte) {
                                generarPDF(ultimoIdReporte);
                            } else {
                                alert("⚠️ Primero debes guardar un reporte para poder imprimir.");
                            }
                        }}
                        disabled={!ultimoIdReporte}
                        className="bg-blue-600 text-white"
                    >
                        Imprimir Reporte
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            //console.log("🔁 Redirigiendo manualmente a /inicio");
                            //navigate('/inicio');
                            irAInicio?.();
                        }}
                    >
                        Terminar
                    </Button>

                </div>
            </div>
        </>
    );
}

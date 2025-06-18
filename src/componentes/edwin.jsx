const guardarReporte = async () => {
    // Validaciones (tus mismas)
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
        !eq.id_maq && !eq.cantidad && !eq.proveedor
            ? true
            : eq.id_maq && eq.cantidad && eq.proveedor
    );

    if (!equiposValidos) {
        alert("❌ Revisa los campos de los equipos.");
        return;
    }

    const materialesValidos = materiales.every(mat =>
        !mat.id_mat && !mat.cantidad && !mat.proveedor
            ? true
            : mat.id_mat && mat.cantidad && mat.proveedor
    );
    if (!materialesValidos) {
        alert("❌ Revisa los campos de los materiales.");
        return;
    }

    const actividadesRealizadasValidas = actividadesRealizadas.every(act =>
        !act.id_descr_acti && !act.cantidad
            ? true
            : act.id_descr_acti && act.cantidad
    );
    if (!actividadesRealizadasValidas) {
        alert("❌ Revisa las actividades realizadas.");
        return;
    }

    const actividadesFuturasValidas = actividadesFuturas.every(act =>
        !act.id_descr_acti && !act.cantidad
            ? true
            : act.id_descr_acti && act.cantidad
    );
    if (!actividadesFuturasValidas) {
        alert("❌ Revisa las actividades futuras.");
        return;
    }

    // ENVÍO DE DATOS
    try {
        const payload = {
            encabezado,
            empleados,
            equipos: equipos
                .filter(eq => eq.id_maq && eq.cantidad && eq.proveedor)
                .map(({ id, ...rest }) => rest),
            materiales: materiales
                .filter(mat => mat.id_mat && mat.cantidad && mat.proveedor)
                .map(({ id, ...mat }) => mat),
            actividades_realizadas: actividadesRealizadas
                .filter(act => act.id_descr_acti && act.cantidad)
                .map(({ id, ...act }) => act),
            actividades_futuras: actividadesFuturas
                .filter(act => act.id_descr_acti && act.cantidad)
                .map(({ id, ...act }) => act),
        };

        const res = await axios.post("http://localhost:3000/api/reportes", payload);
        const nuevoId = res.data.id;
        setUltimoIdReporte(nuevoId);

        alert("✅ Reporte guardado con éxito.");

        await generarPDF(nuevoId); // 👉 primero imprime

        irAInicio?.(); // 👉 luego redirige

    } catch (error) {
        console.error("Error al guardar el reporte", error);
        alert("❌ Error al guardar el reporte");
    }
};

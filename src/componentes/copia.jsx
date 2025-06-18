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
            !eq.id_maq && !eq.cantidad && !eq.proveedor
                ? true
                : eq.id_maq && eq.cantidad && eq.proveedor
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
                //equipos: equipos.filter(eq => eq.id_maq && eq.cantidad && eq.proveedor).map(({ id, ...rest }) => rest),
                equipos: equipos
                    .filter(eq => eq.id_maq && eq.cantidad && eq.proveedor)
                    .map(({ id, ...rest }) => ({
                        ...rest,
                        id_maq: parseInt(rest.id_maq) || null  // 👈 aquí aseguramos que sea entero o null
                    })),

                materiales: materiales.filter(mat => mat.id_mat && mat.cantidad && mat.proveedor).map(({ id, ...rest }) => rest),
                actividades_realizadas: actividadesRealizadas.filter(act => act.id_descr_acti && act.cantidad).map(({ id, ...rest }) => rest),
                actividades_futuras: actividadesFuturas.filter(act => act.id_descr_acti && act.cantidad).map(({ id, ...rest }) => rest)
            };

            const res = await axios.post("http://localhost:3000/api/reportes", payload);
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
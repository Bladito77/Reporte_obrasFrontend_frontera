const guardarReporte = async () => {
    try {
        const res = await axios.post("http://localhost:3000/api/reportes", payload);
        const nuevoId = res.data.id;

        setUltimoIdReporte(nuevoId);

        alert("✅ Reporte guardado con éxito. Se generará el PDF automáticamente.");

        await generarPDF(nuevoId); // 👈 Generar PDF antes de redirigir

        irAInicio?.(); // 👈 Redirige después de imprimir
    } catch (error) {
        console.error("Error al guardar el reporte", error);
        alert("❌ Error al guardar el reporte");
    }
};

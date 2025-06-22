// Este sí exporta la constante API como esperan los demás archivos
const API = process.env.REACT_APP_API_BACK;

export { API };  // 👈 Esta línea soluciona el error

// Si más adelante quieres usar esta función para hacer fetch, también la exportas:
export const Api = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API}${endpoint}`, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en fetch:", error);
    throw error;
  }
};

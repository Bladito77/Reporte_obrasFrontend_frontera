const API_URL = process.env.REACT_APP_API_BACK;

export const fetchFromApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error en fetch:", error);
    throw error;
  }
};

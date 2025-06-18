import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../img/imageninicio.png"; // Importa la imagen de fondo


export default function Login() {
  const navigate = useNavigate(); // Hook para la navegación

  // Estados para almacenar el email y la contraseña
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const url = process.env.REACT_APP_API_BACK + "/api/login";
      const response = await axios.post(url, {
        Email: Email,
        Password: Password
      });
      //console.log("➡️ Response completo:", response);
      //console.log("➡️ response.data:", response.data);
      //console.log("➡️ response.data.data:", response.data.data);

      if (response.status === 200 && response.data && response.data.data) {
        const usuario = response.data.data;

        //console.log("✅ Login exitoso. Usuario:", usuario);

        sessionStorage.setItem("usuarioNombre", `${usuario.Nombres} ${usuario.Apellidos}`);
        sessionStorage.setItem("usuarioId", usuario.IdUsuario);
        sessionStorage.setItem("usuarioEmail", usuario.Email);
        sessionStorage.setItem("usuarioRol", usuario.Rol);

        navigate("/inicio", { replace: true }); // 👈 Fuerza navegación
      } else {
        console.warn("⚠️ Datos de login inválidos:", response);
        alert("❌ Usuario o contraseña incorrectos");
      }


    } catch (error) {
      console.error("Error en login:", error);
      alert("❌ Error al iniciar sesión");
    }
  };


  

  return (
    <div
      className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="mb-8 md:mb-0 md:mr-8 text-center">
        <h1 className="text-white text-3xl md:text-5xl font-bold uppercase hover:scale-105 transition-transform duration-300">
          Avance de obras
        </h1>
      </div>
      <form
        className="bg-white/80 p-6 md:p-8 rounded-lg w-11/12 sm:w-96"
        onSubmit={handleSubmit}
      >
        <h2 className="text-center text-xl font-semibold mb-4">Inicio Sesión</h2>
        <input
          type="text"
          name="Email"
          placeholder="Ingrese su correo electrónico"
          value={Email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
          className="block w-full h-12 px-2 mb-4 rounded border border-gray-300 focus:outline-none focus:border-blue-400"
        />
        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={Password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="block w-full h-12 px-2 mb-4 rounded border border-gray-300 focus:outline-none focus:border-blue-400"
        />
        <label className="flex items-center mb-4 text-sm">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            className="h-4 w-4 mr-2"
          />
          Recordarme
        </label>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>

  );
}

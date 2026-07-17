import { createNotification } from "../components/notification.js";

// CAPTURA DE ELEMENTOS DEL HTML
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// ENVÍO DEL FORMULARIO (SUBMIT)
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value;

  // Validación básica previa para evitar peticiones vacías
  if (!emailValue || !passwordValue) {
    createNotification(true, "Por favor, completa todos los campos.");
    return;
  }

  // Bloquear botón para evitar múltiples clics
  loginButton.disabled = true;
  const originalButtonText = loginButton.innerHTML;
  loginButton.innerHTML = "Iniciando sesión...";

  console.log("--- INTENTO DE INICIO DE SESIÓN ---");
  console.log("Enviando credenciales de:", emailValue);

  try {
    const credentials = {
      email: emailValue,
      password: passwordValue,
    };

    // Petición POST directa al endpoint de login configurado en app.js
    const response = await axios.post("/api/login", credentials);

    console.log("Respuesta del servidor (éxito):", response.status);
    createNotification(false, "Inicio de sesión exitoso.");

    // Redirección a la vista principal
    setTimeout(() => {
      window.location.href = "../home/index.html"; 
    }, 1500);

  } catch (error) {
    console.error("Error detectado en el login:");
    
    if (error.response) {
      // El backend rechazó las credenciales o la cuenta no está verificada
      console.log("Código HTTP del error:", error.response.status);
      console.log("Mensaje enviado por el backend:", error.response.data);
      
      if (error.response.data && error.response.data.error) {
        createNotification(true, error.response.data.error);
      }
    } else {
      // Servidor caído o error de red
      console.log("No se obtuvo respuesta del servidor. Verifica que tu API de Node esté corriendo.");
      createNotification(true, "Error de conexión con el servidor.");
    }
  } finally {
    // Restaurar el botón al terminar
    loginButton.disabled = false;
    loginButton.innerHTML = originalButtonText;
  }
});
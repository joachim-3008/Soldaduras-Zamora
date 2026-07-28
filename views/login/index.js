import { createNotification } from "../components/notification.js";

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value;

  if (!emailValue || !passwordValue) {
    createNotification(true, "Por favor, completa todos los campos.");
    return;
  }

  loginButton.disabled = true;
  const originalButtonText = loginButton.innerHTML;
  loginButton.innerHTML = "Iniciando sesión...";
  try {
    const credentials = {
      email: emailValue,
      password: passwordValue,
    };

    const response = await axios.post("/api/login", credentials);

    console.log("Respuesta del servidor (éxito):", response.status);
    createNotification(false, "Inicio de sesión exitoso.");

    setTimeout(() => {
      window.location.href = "../catalogo/index.html";
    }, 1500);
  } catch (error) {
    console.error("Error detectado en el login:");

    if (error.response) {
      console.log("Código HTTP del error:", error.response.status);
      console.log("Mensaje enviado por el backend:", error.response.data);

      if (error.response.data && error.response.data.error) {
        createNotification(true, error.response.data.error);
      }
    } else {
      console.log(
        "No se obtuvo respuesta del servidor. Verifica que tu API de Node esté corriendo.",
      );
      createNotification(true, "Error de conexión con el servidor.");
    }
  } finally {
    loginButton.disabled = false;
    loginButton.innerHTML = originalButtonText;
  }
});

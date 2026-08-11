// Importamos la herramienta de notificaciones para mostrar avisos visuales (éxito o error) en la pantalla.
import { createNotification } from "../components/notification.js";

// Definimos las reglas de validación (expresiones regulares) para cada campo del formulario.
const REGEX_PASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,12}$/; // Mínimo una mayúscula, una minúscula, un número y entre 6 y 12 caracteres.
const REGEX_USERNAME = /^[a-zA-Z0-9_ ]{3,16}$/; // Letras, números, guiones bajos y espacios, entre 3 y 16 caracteres.
const REGEX_PHONE = /^(\+?\d{1,3})?(\d{7,12})$/; // Validación opcional de teléfono.
const REGEX_EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Formato clásico de correo electrónico.

// Buscamos en la página el formulario de registro y el botón principal.
const registerForm = document.getElementById("register-form");
const registerButton = document.getElementById("register-button");

// Buscamos los campos de entrada de texto (nombre, correo, contraseñas) y los mensajes informativos de error.
const fullnameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const information = document.querySelectorAll("#information");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

// Variables para recordar si cada campo ha sido llenado correctamente o no.
let nameValidation = false;
let emailValidation = false;
let passwordValidation = false;
let matchValidation = false;

// Ocultamos todos los mensajes de error informativos al cargar la página por primera vez.
information.forEach((info) => {
  info.classList.add("hidden");
});

// Una función inteligente que revisa si lo que escribiste cumple con las reglas (regex). 
// Cambia los bordes de color rojo (si está mal) o verde (si está bien) y muestra u oculta los mensajes de advertencia.
const validation = (input, regexValidation, informationElement) => {
  if (input.value === "") {
    // Si el campo está vacío, quitamos todos los bordes de colores y dejamos el diseño original.
    input.classList.remove("outline-red-500", "outline-2", "outline");
    input.classList.remove("outline-green-500", "outline-2", "outline");
    if (informationElement) informationElement.classList.add("hidden");
    input.classList.add("focus:outline-indigo-700");
  } else if (!regexValidation) {
    // Si la validación falla, ponemos un borde rojo y mostramos el mensaje de error.
    input.classList.remove("focus:outline-indigo-700");
    if (informationElement) informationElement.classList.remove("hidden");
    input.classList.add("outline-red-500", "outline-2", "outline");
  } else {
    // Si todo está correcto, ponemos un borde verde y ocultamos el mensaje de error.
    input.classList.remove("outline-red-500", "outline-2", "outline");
    if (informationElement) informationElement.classList.add("hidden");
    input.classList.add("outline-green-500", "outline-2", "outline");
  }

  // Habilitamos el botón de registro solo si los cuatro campos están validados correctamente.
  registerButton.disabled =
    nameValidation && emailValidation && passwordValidation && matchValidation
      ? false
      : true;
};

// Escuchamos cada letra que escribas en el campo de Nombre completo.
fullnameInput.addEventListener("input", (e) => {
  nameValidation = REGEX_USERNAME.test(fullnameInput.value);
  validation(fullnameInput, nameValidation, information[0]);
});

// Escuchamos cada letra que escribas en el campo de Correo electrónico.
emailInput.addEventListener("input", (e) => {
  emailValidation = REGEX_EMAIL.test(emailInput.value);
  validation(emailInput, emailValidation, information[1]);
});

// Escuchamos cada letra que escribas en la contraseña y revisamos si coincide con la confirmación.
passwordInput.addEventListener("input", (e) => {
  passwordValidation = REGEX_PASSWORD.test(passwordInput.value);
  matchValidation = e.target.value === confirmPasswordInput.value;
  validation(passwordInput, passwordValidation, information[2]);
  validation(confirmPasswordInput, matchValidation, information[3]);
});

// Escuchamos cuando escribas en el campo de confirmar contraseña para ver si ambas son idénticas.
confirmPasswordInput.addEventListener("input", (e) => {
  matchValidation = e.target.value === passwordInput.value;
  validation(confirmPasswordInput, matchValidation, information[3]);
});

// Cuando le den clic al botón de registrarse...
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evitamos que la página se recargue de forma brusca.

  registerButton.disabled = true; // Desactivamos el botón temporalmente para evitar doble clic.
  const originalButtonText = registerButton.innerHTML; // Guardamos el texto original del botón.
  registerButton.innerHTML = "Registrando..."; // Cambiamos el texto para mostrar que está cargando.

  try {
    // Armamos un paquete ordenado con los datos del nuevo usuario.
    const newUser = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      profile: {
        name: fullnameInput.value.trim(),
      },
    };

    // Mandamos los datos al servidor mediante una petición POST a la ruta de registro.
    const { data } = await axios.post("/api/signup", newUser);

    // Si el servidor responde que se registró con éxito...
    if (data && data.message === "Usuario registrado exitosamente") {
      createNotification(false, data.message); // Mostramos notificación verde de éxito.

      // Esperamos dos segundos y mandamos al usuario a la página de iniciar sesión.
      setTimeout(() => {
        window.location.href = "../login/index.html";
      }, 2000);
    } else {
      // Si hubo una respuesta distinta, mostramos el mensaje y limpiamos el formulario por seguridad.
      createNotification(false, data.message || "Usuario registrado.");

      fullnameInput.value = " ";
      emailInput.value = " ";
      passwordInput.value = " ";
      confirmPasswordInput.value = " ";

      nameValidation = false;
      emailValidation = false;
      passwordValidation = false;
      matchValidation = false;

      validation(fullnameInput, false);
      validation(emailInput, false);
      validation(passwordInput, false);
      validation(confirmPasswordInput, false);
    }
  } catch (error) {
    // Si ocurre un error de red o el servidor rechaza el registro, mostramos una notificación roja con el error.
    console.error(error);
    if (error.response && error.response.data && error.response.data.error) {
      createNotification(true, error.response.data.error);
    } else {
      createNotification(true, "Error de conexión con el servidor.");
    }
  } finally {
    // Al terminar (haya salido bien o mal), dejamos el botón desactivado por seguridad y restauramos su texto original.
    registerButton.disabled = true;
    registerButton.innerHTML = originalButtonText;
  }
});
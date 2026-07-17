import { createNotification } from "../components/notification.js";

const REGEX_PASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,12}$/;
const REGEX_USERNAME = /^[a-zA-Z0-9_ ]{3,16}$/;
const REGEX_PHONE = /^(\+?\d{1,3})?(\d{7,12})$/;
const REGEX_EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// El formulario completo (para capturar el evento de envío)
const registerForm = document.getElementById("register-form");
const registerButton = document.getElementById("register-button");

// Inputs de datos
const fullnameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const information = document.querySelectorAll("#information");

// Inputs de contraseñas
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

// Validaciones del estado
let nameValidation = false;
let emailValidation = false;
let passwordValidation = false;
let matchValidation = false;

information.forEach((info) => {
  info.classList.add("hidden");
});

const validation = (input, regexValidation, informationElement) => {
  if (input.value === "") {
    input.classList.remove("outline-red-500", "outline-2", "outline");
    input.classList.remove("outline-green-500", "outline-2", "outline");
    if (informationElement) informationElement.classList.add("hidden");
    input.classList.add("focus:outline-indigo-700");
  } else if (!regexValidation) {
    input.classList.remove("focus:outline-indigo-700");
    if (informationElement) informationElement.classList.remove("hidden");
    input.classList.add("outline-red-500", "outline-2", "outline");
  } else {
    input.classList.remove("outline-red-500", "outline-2", "outline");
    if (informationElement) informationElement.classList.add("hidden");
    input.classList.add("outline-green-500", "outline-2", "outline");
  }

  registerButton.disabled =
    nameValidation && emailValidation && passwordValidation && matchValidation
      ? false
      : true;
};

// Eventos de escucha en tiempo real
fullnameInput.addEventListener("input", (e) => {
  nameValidation = REGEX_USERNAME.test(fullnameInput.value);
  validation(fullnameInput, nameValidation, information[0]);
});

emailInput.addEventListener("input", (e) => {
  emailValidation = REGEX_EMAIL.test(emailInput.value);
  validation(emailInput, emailValidation, information[1]);
});

passwordInput.addEventListener("input", (e) => {
  passwordValidation = REGEX_PASSWORD.test(passwordInput.value);
  matchValidation = e.target.value === confirmPasswordInput.value;
  validation(passwordInput, passwordValidation, information[2]);
  validation(confirmPasswordInput, matchValidation, information[3]);
});

confirmPasswordInput.addEventListener("input", (e) => {
  matchValidation = e.target.value === passwordInput.value;
  validation(confirmPasswordInput, matchValidation, information[3]);
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  registerButton.disabled = true;
  const originalButtonText = registerButton.innerHTML;
  registerButton.innerHTML = "Registrando...";

  try {
    const newUser = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      profile: {
        name: fullnameInput.value.trim(),
      },
    };

    const { data } = await axios.post("/api/signup", newUser);

    if (data && data.message === "Usuario registrado exitosamente") {
      createNotification(false, data.message);
      
      // Breve espera antes de redirigir al login
      setTimeout(() => {
        window.location.href = "../login/index.html"; 
      }, 2000);

    } else {
      createNotification(false, data.message || "Usuario registrado.");

      // Limpieza de campos
      fullnameInput.value = " ";
      emailInput.value = " ";
      passwordInput.value = " ";
      confirmPasswordInput.value = " ";

      // Resetear banderas
      nameValidation = false;
      emailValidation = false;
      passwordValidation = false;
      matchValidation = false;

      // Limpiar estilos Tailwind
      validation(fullnameInput, false);
      validation(emailInput, false);
      validation(passwordInput, false);
      validation(confirmPasswordInput, false);
    }

  } catch (error) {
    console.error(error);
    if (error.response && error.response.data && error.response.data.error) {
      createNotification(true, error.response.data.error);
    } else {
      createNotification(true, "Error de conexión con el servidor.");
    }
  } finally {
    // Restaurar estado del botón
    registerButton.disabled = true; // Se queda deshabilitado hasta que el formulario sea válido de nuevo
    registerButton.innerHTML = originalButtonText;
  }
});
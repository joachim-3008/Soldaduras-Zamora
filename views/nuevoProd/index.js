// Importamos la función de notificaciones para mostrar avisos visuales en la pantalla.
import { createNotification } from "../components/notification.js";

// Buscamos en la página todos los elementos importantes: botones, el formulario y los campos para rellenar.
const closeFormBtn = document.getElementById("new-close-form-btn");
const newProductForm = document.getElementById("new-product-form");
const prodAvailability = document.getElementById("new-prod-availability");

const prodName = document.getElementById("new-prod-name");
const prodSku = document.getElementById("new-prod-sku");
const prodDesc = document.getElementById("new-prod-desc");
const prodPrice = document.getElementById("new-prod-price");
const prodStock = document.getElementById("new-prod-stock");
const prodCategory = document.getElementById("new-prod-category");
const prodImg = document.getElementById("new-prod-img");
const logoutBtn = document.getElementById("logout-button");

// Guardamos las direcciones web de la API que vamos a usar.
const API = {
  products: "/api/products",
  me: "/api/me",
};

// Configuramos Axios para que siempre envíe las credenciales (cookies de sesión) de forma automática.
axios.defaults.withCredentials = true;

let selectedProduct = null;
let isAdmin = false; // Variable para recordar si el usuario es administrador o no.

// Una función para revisar discretamente si la persona conectada tiene permisos de administrador.
const checkAdminRole = async () => {
  try {
    const { data } = await axios.get(API.me); // Pedimos los datos del usuario actual.
    const roles = data.roles || [];
    isAdmin = roles.includes("admin"); // Verificamos si en su lista de roles está "admin".
  } catch (error) {
    isAdmin = false; // Si falla o no está logueado, no es admin.
  }
};

// Ejecutamos la revisión de administrador apenas carga el script.
checkAdminRole();

// Una función para limpiar todos los campos del formulario de creación de productos.
const clearForm = () => {
  selectedProduct = null;
  if (newProductForm) newProductForm.reset();
  if (prodAvailability) prodAvailability.value = "available"; // Dejamos la disponibilidad por defecto en "disponible".
};

// Función para cerrar el formulario y regresar automáticamente a la página del catálogo.
const closeForm = () => {
  clearForm();
  window.location.href = "/catalogo/";
};

// Función que toma todo lo que escribiste en el formulario y lo arma en un paquete ordenado (payload) para enviarlo al servidor.
const createProductPayload = () => {
  // Convertimos las URLs de las imágenes separadas por comas en una lista limpia (Array).
  const pictures = prodImg && prodImg.value
    ? prodImg.value.split(",").map((url) => url.trim()).filter(Boolean)
    : [];

  return {
    sku: prodSku ? prodSku.value.trim() : "",
    name: prodName ? prodName.value.trim() : "",
    description: prodDesc ? prodDesc.value.trim() : "",
    price: prodPrice ? Number(prodPrice.value) || 0 : 0,
    stock: prodStock ? Number(prodStock.value) || 0 : 0,
    available: prodAvailability ? prodAvailability.value === "available" : true,
    categoryName: prodCategory ? prodCategory.value.trim() : "",
    pictures,
  };
};

// Función principal para enviar el producto nuevo a la base de datos a través del servidor.
const saveProduct = async () => {
  // Si intentan guardar y no son administradores, mostramos un aviso y detenemos el proceso.
  if (!isAdmin) {
    createNotification(true, "Solo admin puede crear productos.");
    return;
  }

  const payload = createProductPayload(); // Armamos el paquete con los datos.

  // Verificamos que los campos obligatorios no estén vacíos.
  if (!payload.sku || !payload.name || !payload.categoryName) {
    createNotification(true, "SKU, nombre y categoría son obligatorios.");
    return;
  }

  try {
    // Mandamos el producto nuevo al servidor mediante una petición POST.
    await axios.post(API.products, payload);
    createNotification(false, "Producto creado correctamente."); // ¡Todo salió bien!

    clearForm(); // Limpiamos el formulario.
    
    // Esperamos un segundo y medio antes de regresar al catálogo para que el usuario alcance a leer el aviso.
    setTimeout(() => {
      window.location.href = "/catalogo/";
    }, 1500);

  } catch (error) {
    // Si el servidor rechaza el producto, mostramos el mensaje de error exacto.
    const message =
      error.response?.data?.error || "No se pudo guardar el producto.";
    createNotification(true, message);
  }
};

// Si el formulario existe en la página, escuchamos cuando le den al botón de enviar.
if (newProductForm) {
  newProductForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evitamos que la página se recargue sola.
    await saveProduct(); // Guardamos el producto.
  });
}

// Si existe el botón para cerrar el formulario, le agregamos la acción de cerrar y salir.
if (closeFormBtn) {
  closeFormBtn.addEventListener("click", closeForm);
}

// Si existe el botón de cerrar sesión (logout), lo configuramos para borrar la sesión y mandar al usuario al login.
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await axios.get("/api/logout");
      window.location.href = "/login/";
    } catch (error) {
      window.location.href = "/login/";
    }
  });
}
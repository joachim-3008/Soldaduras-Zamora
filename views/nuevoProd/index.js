import { createNotification } from "../components/notification.js";

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

const API = {
  products: "/api/products",
  me: "/api/me",
};

axios.defaults.withCredentials = true;

let selectedProduct = null;
let isAdmin = false;

// Verificación de admin limpia sin afectar al catálogo
const checkAdminRole = async () => {
  try {
    const { data } = await axios.get(API.me);
    const roles = data.roles || [];
    isAdmin = roles.includes("admin");
  } catch (error) {
    isAdmin = false;
  }
};

checkAdminRole();

const clearForm = () => {
  selectedProduct = null;
  if (newProductForm) newProductForm.reset();
  if (prodAvailability) prodAvailability.value = "available";
};

const closeForm = () => {
  clearForm();
  window.location.href = "/catalogo/";
};

const createProductPayload = () => {
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

const saveProduct = async () => {
  if (!isAdmin) {
    createNotification(true, "Solo admin puede crear productos.");
    return;
  }

  const payload = createProductPayload();

  if (!payload.sku || !payload.name || !payload.categoryName) {
    createNotification(true, "SKU, nombre y categoría son obligatorios.");
    return;
  }

  try {
    await axios.post(API.products, payload);
    createNotification(false, "Producto creado correctamente.");

    clearForm();
    
    setTimeout(() => {
      window.location.href = "/catalogo/";
    }, 1500);

  } catch (error) {
    const message =
      error.response?.data?.error || "No se pudo guardar el producto.";
    createNotification(true, message);
  }
};

if (newProductForm) {
  newProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveProduct();
  });
}

if (closeFormBtn) {
  closeFormBtn.addEventListener("click", closeForm);
}

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
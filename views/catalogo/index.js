import { createNotification } from "../components/notification.js";
import { showProductDetail } from "../components/productDetail.js";
import { renderProducts } from "../components/renderProduct.js";
import { deleteProduct } from "../components/productDetail.js";


const currentUser = {
  id: null,
  roles: [],
};

const addProductCard = document.getElementById("add-product-card"); 
// const createProductCard = document.getElementById("create-product-card");
// const closeFormBtn = document.getElementById("close-form-btn");
// const newProductForm = document.getElementById("new-product-form");
const searchInput = document.getElementById("search-input");
const prodName = document.getElementById("prod-name");
const prodSku = document.getElementById("prod-sku");
const prodDesc = document.getElementById("prod-desc");
const prodPrice = document.getElementById("prod-price");
const prodStock = document.getElementById("prod-stock");
const prodCategory = document.getElementById("prod-category");
const prodImg = document.getElementById("prod-img");
// const prodAvailability = document.getElementById("prod-availability");
const currentCategoryName = document.getElementById("current-category-name");
const logoutBtn = document.getElementById("logout-button");

let products = [];
let categories = [];
let selectedProduct = null;
let isAdmin = false;

axios.defaults.withCredentials = true;

logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    await axios.get("/api/logout");
    window.location.href = "/login/index.html";
  } catch (error) {
    console.error("Error during logout:", error);
    window.location.href = "/login/index.html";
  }
});

const API = {
  products: "/api/products",
  categories: "/api/categories",
  me: "/api/me",
};

const fetchUser = async () => {
  try {
    const { data } = await axios.get(API.me);
    currentUser.id = data.id;
    currentUser.roles = data.roles || [];
    isAdmin = currentUser.roles.includes("admin");
  } catch (error) {
    isAdmin = false;
  }
};

const fetchProducts = async () => {
  try {
    const { data } = await axios.get(API.products);
    products = data;
    renderProducts(products);
  } catch (error) {
    createNotification(true, "No se pudieron cargar los productos.");
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await axios.get(API.categories);
    categories = data;
    renderCategories(categories);
  } catch (error) {
    createNotification(true, "No se pudieron cargar las categorías.");
  }
};

const renderCategories = (items) => {
  const list = document.querySelector("aside ul");
  list.innerHTML = "";

  const allItem = document.createElement("li");
  allItem.innerHTML = `<a href="#" class="hover:text-amber-400 transition-all">Todas las categorías</a>`;
  allItem.addEventListener("click", (event) => {
    event.preventDefault();
    filterProductsByCategory(null);
  });
  list.appendChild(allItem);

  items.forEach((category) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" class="hover:text-amber-400 transition-all">${category.name}</a>`;
    li.addEventListener("click", (event) => {
      event.preventDefault();
      filterProductsByCategory(category);
    });
    list.appendChild(li);
  });
};

const filterProductsByCategory = (category) => {
  const filtered = category
    ? products.filter((product) => product.category_id?.id === category.id)
    : products;
  currentCategoryName.textContent = category
    ? category.name
    : "Todas las Categorías";
  renderProducts(filtered);
};

//filtrado de la barra de busqueda
const handleSearch = () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(query) ||
      (product.description || "").toLowerCase().includes(query) ||
      (product.category_id?.name || "").toLowerCase().includes(query)
    );
  });
  renderProducts(filtered);
};

if (addProductCard) {
  addProductCard.addEventListener("click", () => {
    if (!isAdmin) {
      createNotification(true, "Solo admin puede crear productos.");
      return;
    }
    window.location.href = "/nuevoProd";
  });
}
if (searchInput) {
  searchInput.addEventListener("input", handleSearch);
};

const init = async () => {
  await fetchUser();
  await fetchCategories();
  await fetchProducts();
};

init();

export {fetchProducts, isAdmin}
import { createNotification } from "../components/notification.js";

const currentUser = {
  id: null,
  roles: [],
};

const addProductCard = document.getElementById("add-product-card");
const createProductCard = document.getElementById("create-product-card");
const closeFormBtn = document.getElementById("close-form-btn");
const newProductForm = document.getElementById("new-product-form");
const productsContainer = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");
const prodName = document.getElementById("prod-name");
const prodSku = document.getElementById("prod-sku");
const prodDesc = document.getElementById("prod-desc");
const prodPrice = document.getElementById("prod-price");
const prodStock = document.getElementById("prod-stock");
const prodCategory = document.getElementById("prod-category");
const prodImg = document.getElementById("prod-img");
const prodAvailability = document.getElementById("prod-availability");
const currentCategoryName = document.getElementById("current-category-name");
const backToCatalogBtn = document.getElementById("back-to-catalog-btn");
const productDetailView = document.getElementById("product-detail-view");
const productDetailContent = document.getElementById("product-detail-content");

let products = [];
let categories = [];
let selectedProduct = null;
let isAdmin = false;

axios.defaults.withCredentials = true;

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

const renderProducts = (items) => {
  productsContainer.innerHTML = "";

  if (isAdmin) {
    addProductCard.classList.remove("hidden");
  } else {
    addProductCard.classList.add("hidden");
  }

  if (items.length === 0) {
    productsContainer.innerHTML = `<div class="col-span-1 sm:col-span-2 lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-400 font-mono text-center">No hay productos para mostrar.</div>`;
    return;
  }

  items.forEach((product) => {
    const pictures = product.pictures || [];
    const imageUrl = pictures[0] || null;
    const hasCarousel = pictures.length > 1;
    const card = document.createElement("article");
    card.className =
      "bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:border-amber-500 transition-all cursor-pointer";

    card.innerHTML = `
      ${
        imageUrl
          ? `
        <div class="relative h-44 w-full overflow-hidden bg-zinc-900">
          <img id="product-card-image-${product.id}" src="${imageUrl}" alt="${product.name}" class="h-full w-full object-cover object-center" />
          ${
            hasCarousel
              ? `
            <div class="absolute inset-x-0 top-2 flex items-center justify-between px-3">
              <button type="button" class="carousel-prev-btn inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">←</button>
              <button type="button" class="carousel-next-btn inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">→</button>
            </div>
            <span class="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-100">1/${pictures.length}</span>
          `
              : ""
          }
        </div>
      `
          : ""
      }
      <div class="p-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 class="text-base sm:text-lg font-bold uppercase tracking-wide text-zinc-100">${product.name}</h3>
            <p class="text-[12px] sm:text-sm uppercase tracking-wide text-zinc-400">${product.category_id?.name || "Sin categoría"}</p>
          </div>
          <span class="text-[11px] sm:text-sm font-bold uppercase px-3 py-1 rounded-full ${product.available ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-300 border border-red-500/20"}">${product.available ? "Disponible" : "No disponible"}</span>
        </div>
        <p class="text-sm leading-6 text-zinc-300 mb-4">${product.description || "Sin descripción."}</p>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span class="font-black text-amber-400 text-lg sm:text-xl">$${product.price?.toFixed(2) || "0.00"}</span>
          <span class="text-[11px] uppercase tracking-wide text-zinc-500">Stock: ${product.stock || 0}</span>
        </div>
      </div>
    `;

    if (hasCarousel) {
      let currentIndex = 0;
      const imgEl = card.querySelector(`#product-card-image-${product.id}`);
      const indicator = card.querySelector("span.absolute");
      const prevBtn = card.querySelector(".carousel-prev-btn");
      const nextBtn = card.querySelector(".carousel-next-btn");

      const updateImage = (index) => {
        currentIndex = index;
        imgEl.src = pictures[currentIndex];
        if (indicator) {
          indicator.textContent = `${currentIndex + 1}/${pictures.length}`;
        }
      };

      prevBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        updateImage((currentIndex - 1 + pictures.length) % pictures.length);
      });
      nextBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        updateImage((currentIndex + 1) % pictures.length);
      });
    }

    card.addEventListener("click", () => showProductDetail(product));
    productsContainer.appendChild(card);
  });
};

const clearForm = () => {
  selectedProduct = null;
  newProductForm.reset();
  prodAvailability.value = "available";
};

const openForm = (product = null) => {
  if (!isAdmin) {
    createNotification(true, "Solo admin puede editar o crear productos.");
    return;
  }

  selectedProduct = product;
  createProductCard.classList.remove("hidden");

  if (!product) {
    clearForm();
    return;
  }

  prodName.value = product.name || "";
  prodSku.value = product.sku || "";
  prodDesc.value = product.description || "";
  prodPrice.value = product.price || 0;
  prodStock.value = product.stock || 0;
  prodCategory.value = product.category_id?.name || "";
  prodImg.value = (product.pictures || []).join(", ");
  prodAvailability.value = product.available ? "available" : "unavailable";
};

const closeForm = () => {
  createProductCard.classList.add("hidden");
  clearForm();
};

const showProductDetail = (product) => {
  productDetailView.classList.remove("hidden");
  const pictures = product.pictures || [];
  const productImage = pictures[0] || null;
  const hasCarousel = pictures.length > 1;

  productDetailContent.innerHTML = `
    <div class="w-full lg:w-1/2 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
      ${
        productImage
          ? `
        <div class="relative h-80 w-full overflow-hidden bg-zinc-900">
          <img id="product-detail-image" src="${productImage}" alt="${product.name}" class="h-full w-full object-cover object-center" />
          ${
            hasCarousel
              ? `
            <div class="absolute inset-x-0 top-3 flex items-center justify-between px-3">
              <button id="detail-prev-btn" type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">←</button>
              <button id="detail-next-btn" type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">→</button>
            </div>
            <span id="detail-image-indicator" class="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-100">1/${pictures.length}</span>
          `
              : ""
          }
        </div>
      `
          : ""
      }
      <div class="p-5">
        <h2 class="font-sans text-xl font-bold text-zinc-100 mb-2">${product.name}</h2>
        <p class="text-sm text-zinc-400 mb-4">${product.description || "Sin descripción disponible."}</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="bg-zinc-900 rounded-3xl p-4">
            <p class="text-[10px] uppercase tracking-widest text-zinc-500">Precio</p>
            <p class="font-black text-lg text-amber-400">$${product.price?.toFixed(2) || "0.00"}</p>
          </div>
          <div class="bg-zinc-900 rounded-3xl p-4">
            <p class="text-[10px] uppercase tracking-widest text-zinc-500">Stock</p>
            <p class="font-black text-lg text-zinc-100">${product.stock || 0}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full lg:w-1/2 flex flex-col gap-4">
      <div class="bg-zinc-900 rounded-3xl p-5">
        <p class="text-[10px] uppercase tracking-widest text-zinc-500">Categoría</p>
        <p class="font-bold text-zinc-100">${product.category_id?.name || "Sin categoría"}</p>
      </div>
      <div class="bg-zinc-900 rounded-3xl p-5">
        <p class="text-[10px] uppercase tracking-widest text-zinc-500">Disponibilidad</p>
        <p class="font-bold text-zinc-100">${product.available ? "Disponible" : "No disponible"}</p>
      </div>
      ${
        isAdmin
          ? `
        <div class="flex gap-3">
          <button id="edit-product-btn" class="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 uppercase text-xs font-black py-3 rounded-2xl transition-all">Editar</button>
          <button id="delete-product-btn" class="flex-1 bg-red-500 hover:bg-red-400 text-zinc-950 uppercase text-xs font-black py-3 rounded-2xl transition-all">Eliminar</button>
        </div>
      `
          : ""
      }
    </div>
  `;

  const editBtn = document.getElementById("edit-product-btn");
  const deleteBtn = document.getElementById("delete-product-btn");

  if (hasCarousel) {
    let detailIndex = 0;
    const detailImage = document.getElementById("product-detail-image");
    const prevDetailBtn = document.getElementById("detail-prev-btn");
    const nextDetailBtn = document.getElementById("detail-next-btn");
    const detailIndicator = document.getElementById("detail-image-indicator");

    const updateDetailImage = (newIndex) => {
      detailIndex = newIndex;
      detailImage.src = pictures[detailIndex];
      if (detailIndicator) {
        detailIndicator.textContent = `${detailIndex + 1}/${pictures.length}`;
      }
    };

    if (prevDetailBtn) {
      prevDetailBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        updateDetailImage(
          (detailIndex - 1 + pictures.length) % pictures.length,
        );
      });
    }

    if (nextDetailBtn) {
      nextDetailBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        updateDetailImage((detailIndex + 1) % pictures.length);
      });
    }
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      openForm(product);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      await deleteProduct(product.id);
    });
  }
};

const createProductPayload = () => {
  const pictures = prodImg.value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  return {
    sku: prodSku.value.trim(),
    name: prodName.value.trim(),
    description: prodDesc.value.trim(),
    price: Number(prodPrice.value) || 0,
    stock: Number(prodStock.value) || 0,
    available: prodAvailability.value === "available",
    categoryName: prodCategory.value.trim(),
    pictures,
  };
};

const saveProduct = async () => {
  const payload = createProductPayload();

  if (!payload.sku || !payload.name || !payload.categoryName) {
    createNotification(true, "SKU, nombre y categoría son obligatorios.");
    return;
  }

  try {
    if (selectedProduct) {
      const { data } = await axios.put(
        `${API.products}/${selectedProduct.id}`,
        payload,
      );
      createNotification(false, "Producto actualizado correctamente.");
      selectedProduct = data;
    } else {
      await axios.post(API.products, payload);
      createNotification(false, "Producto creado correctamente.");
    }

    await fetchProducts();
    closeForm();
  } catch (error) {
    const message =
      error.response?.data?.error || "No se pudo guardar el producto.";
    createNotification(true, message);
  }
};

const deleteProduct = async (productId) => {
  try {
    await axios.delete(`${API.products}/${productId}`);
    createNotification(false, "Producto eliminado correctamente.");
    productDetailView.classList.add("hidden");
    await fetchProducts();
  } catch (error) {
    const message =
      error.response?.data?.error || "No se pudo eliminar el producto.";
    createNotification(true, message);
  }
};

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

addProductCard.addEventListener("click", () => openForm());
closeFormBtn.addEventListener("click", closeForm);
backToCatalogBtn.addEventListener("click", () => {
  productDetailView.classList.add("hidden");
});
newProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveProduct();
});
searchInput.addEventListener("input", handleSearch);

const init = async () => {
  await fetchUser();
  await fetchCategories();
  await fetchProducts();
};

init();

import { isAdmin } from "../catalogo/index.js";
import { createNotification } from "../components/notification.js";
import { renderProducts } from "./renderProduct.js";
import { fetchProducts } from "../catalogo/index.js";
import { showFormEdit } from "../editProd/index.js";

const productDetailContent = document.getElementById("product-detail-content");
const productDetailView = document.getElementById("product-detail-view");
const backToCatalogBtn = document.getElementById("back-to-catalog-btn");

axios.defaults.withCredentials = true;

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
        <p class="font-bold text-zinc-100">${product.category_id?.name || product.category || "Sin categoría"}</p>
      </div>
      <div class="bg-zinc-900 rounded-3xl p-5">
        <p class="text-[10px] uppercase tracking-widest text-zinc-500">Disponibilidad</p>
        <p class="font-bold text-zinc-100">${product.available || product.availability === 'available' ? "Disponible" : "No disponible"}</p>
      </div>
      ${
        isAdmin
          ? `
        <div class="flex gap-3">
          <button id="edit-product-btn" class="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 uppercase text-xs font-black py-3 rounded-2xl transition-all cursor-pointer">Editar</button>
          <button id="delete-product-btn" class="flex-1 bg-red-500 hover:bg-red-400 text-zinc-950 uppercase text-xs font-black py-3 rounded-2xl transition-all cursor-pointer">Eliminar</button>
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

  // Manejar Click de Editar
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      // 1. Ocultar la tarjeta de detalles
      productDetailView.classList.add("hidden");
      // 2. Ejecutar la función de edición importada
      showFormEdit(product);
    });
  }

  // Manejar Click de Eliminar
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        await deleteProduct(product.id);
      }
    });
  }
};

// Botón para volver al catálogo
if (backToCatalogBtn) {
  backToCatalogBtn.addEventListener("click", () => {
    productDetailView.classList.add("hidden");
  });
}

export const deleteProduct = async (productId) => {
  try {
    await axios.delete(`/api/products/${productId}`);
    createNotification(false, "Producto eliminado correctamente.");
    productDetailView.classList.add("hidden");
    await fetchProducts();
  } catch (error) {
    const message =
      error.response?.data?.error || "No se pudo eliminar el producto.";
    // Notificación de error (true)
    createNotification(true, message);
  }
};

export { showProductDetail };
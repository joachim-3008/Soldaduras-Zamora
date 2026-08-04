import { isAdmin, fetchProducts } from "../catalogo/index.js";
import { createNotification } from "../components/notification.js";
import { cardSeccion } from "../catalogo/index.js";

export const showFormEdit = (product) => {
  // 1. Obtener o crear dinámicamente el contenedor en el DOM
  let formEditContainer = document.getElementById("fromEdit");

  if (!formEditContainer) {
    formEditContainer = document.createElement("div");
    formEditContainer.id = "fromEdit";
    document.body.appendChild(formEditContainer);
  }

  // Determine el estado inicial de disponibilidad (Booleano)
  const isAvailable = product.available === true || product.availability === "available";

  // 2. Inyectar el HTML con los datos del producto
  formEditContainer.innerHTML = `
    <main class="flex-1 flex items-center justify-center p-6 fixed inset-0 bg-black/70 z-50 overflow-y-auto">
      <div
        id="new-create-product-card"
        class="bg-zinc-950 border border-amber-500/60 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl w-full max-w-2xl mx-auto my-auto"
      >
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 class="font-sans font-bold text-xs uppercase tracking-wider text-amber-500">
            Editar Producto
          </h3>
          <button
            id="new-close-form-btn"
            type="button"
            class="text-zinc-500 hover:text-zinc-200 text-sm font-mono p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form id="new-product-form" class="grid gap-4 md:grid-cols-2">
          <!-- Input Nombre -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-[11px] sm:text-sm font-mono uppercase tracking-wider text-zinc-400">Nombre</label>
            <input
              type="text"
              id="new-prod-name"
              value="${product.name || ''}"
              required
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-sans"
            />
          </div>

          <!-- Input SKU -->
          <div class="flex flex-col gap-1 md:col-span-1">
            <label class="text-[11px] sm:text-sm font-mono uppercase tracking-wider text-zinc-400">SKU</label>
            <input
              type="text"
              id="new-prod-sku"
              value="${product.sku || ''}"
              required
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-sans"
            />
          </div>

          <!-- Input Precio -->
          <div class="flex flex-col gap-1 md:col-span-1">
            <label class="text-[11px] sm:text-sm font-mono uppercase tracking-wider text-zinc-400">Precio ($)</label>
            <input
              type="number"
              step="0.01"
              id="new-prod-price"
              value="${product.price || 0}"
              required
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-mono"
            />
          </div>

          <!-- Input Stock -->
          <div class="flex flex-col gap-1 md:col-span-1">
            <label class="text-[11px] sm:text-sm font-mono uppercase tracking-wider text-zinc-400">Stock</label>
            <input
              type="number"
              id="new-prod-stock"
              value="${product.stock ?? 0}"
              min="0"
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-mono"
            />
          </div>

          <!-- Input Categoría -->
          <div class="flex flex-col gap-1 md:col-span-1">
            <label class="text-[11px] sm:text-sm font-mono uppercase tracking-wider text-zinc-400">Categoría</label>
            <input
              type="text"
              id="new-prod-category"
              value="${product.category_id?.name || product.category || ''}"
              required
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-sans"
            />
          </div>

          <!-- Input Disponibilidad -->
          <div class="flex flex-col gap-1 md:col-span-1">
            <label class="text-[11px] sm:text-sm font-mono uppercase tracking-wider text-zinc-400">Disponibilidad</label>
            <select
              id="new-prod-availability"
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm rounded-xl p-3 outline-none transition-all font-sans"
            >
              <option value="true" ${isAvailable ? 'selected' : ''}>Disponible</option>
              <option value="false" ${!isAvailable ? 'selected' : ''}>No disponible</option>
            </select>
          </div>

          <!-- Input Breve Descripción -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Descripción</label>
            <textarea
              id="new-prod-desc"
              rows="3"
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-xs rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-sans resize-none"
            >${product.description || ''}</textarea>
          </div>

          <!-- Input URL de Imagen -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Imágenes (URLs separadas por coma)</label>
            <textarea
              id="new-prod-img"
              rows="2"
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-xs rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-mono resize-none min-h-[90px]"
            >${Array.isArray(product.pictures) ? product.pictures.join(', ') : (Array.isArray(product.images) ? product.images.join(', ') : product.image || '')}</textarea>
          </div>

          <!-- Botón Submit -->
          <button
            type="submit"
            class="md:col-span-2 mt-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            Actualizar Producto
          </button>
        </form>
      </div>
    </main>`;

  // Función para cerrar el modal
  const hideModal = () => {
    formEditContainer.innerHTML = "";
  };

  // Asignar evento al botón de cerrar
  const closeBtn = document.getElementById("new-close-form-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", ()=>{
      hideModal();
      cardSeccion.classList.remove("hidden");
    });
  
  }

  // Manejar el submit del formulario
  const form = document.getElementById("new-product-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (typeof isAdmin !== "undefined" && !isAdmin) {
        createNotification(true, "No tienes permisos de administrador.");
        return;
      }

      // Convertir las URLs de imágenes a un Array
      const imagesValue = document.getElementById("new-prod-img").value;
      const imagesArray = imagesValue
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      // Obtener el valor booleano del select de disponibilidad
      const availabilityBool = document.getElementById("new-prod-availability").value === "true";

      const updatedData = {
        name: document.getElementById("new-prod-name").value.trim(),
        sku: document.getElementById("new-prod-sku").value.trim(),
        price: parseFloat(document.getElementById("new-prod-price").value),
        stock: parseInt(document.getElementById("new-prod-stock").value, 10),
        category: document.getElementById("new-prod-category").value.trim(),
        
        // Mapeamos ambas claves por compatibilidad con el backend
        available: availabilityBool,
        availability: availabilityBool ? "available" : "unavailable",

        description: document.getElementById("new-prod-desc").value.trim(),
        pictures: imagesArray,
        images: imagesArray,
      };

      try {
        await axios.put(`/api/products/${product.id}`, updatedData);
        createNotification(false, "Producto actualizado correctamente.");
        
        hideModal();
        await fetchProducts(); // Refresca el catálogo en la interfaz
      } catch (error) {
        console.error("Error al actualizar el producto:", error);
        createNotification(
          true,
          error.response?.data?.message || error.response?.data?.error || "Error al actualizar el producto."
        );
      }
    });
  }
};
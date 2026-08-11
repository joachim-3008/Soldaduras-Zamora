// Importamos herramientas necesarias: funciones para verificar si eres admin, recargar productos, notificaciones y la sección de tarjetas visuales.
import { isAdmin, fetchProducts } from "../catalogo/index.js";
import { createNotification } from "../components/notification.js";
import { cardSeccion } from "../catalogo/index.js";

// Creamos y exportamos una función mágica que dibuja el formulario para editar un producto existente en la pantalla.
export const showFormEdit = (product) => {
  // 1. Buscamos si ya existe una cajita en la página para el formulario de edición; si no existe, la creamos y la agregamos al documento.
  let formEditContainer = document.getElementById("fromEdit");

  if (!formEditContainer) {
    formEditContainer = document.createElement("div");
    formEditContainer.id = "fromEdit";
    document.body.appendChild(formEditContainer);
  }

  // Verificamos si el producto está disponible mirando si su propiedad es verdadera o si dice "available".
  const isAvailable = product.available === true || product.availability === "available";

  // 2. Llenamos la cajita con todo el diseño visual (HTML) y rellenamos los espacios con los datos actuales del producto.
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
          <!-- Espacio para escribir el Nombre del producto -->
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

          <!-- Espacio para escribir el código SKU -->
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

          <!-- Espacio para poner el Precio -->
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

          <!-- Espacio para poner cuántos hay guardados (Stock) -->
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

          <!-- Espacio para escribir la Categoría -->
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

          <!-- Menú desplegable para elegir si está Disponible o No -->
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

          <!-- Espacio para escribir la Descripción del producto -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Descripción</label>
            <textarea
              id="new-prod-desc"
              rows="3"
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-xs rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-sans resize-none"
            >${product.description || ''}</textarea>
          </div>

          <!-- Espacio para poner las direcciones web (URLs) de las imágenes -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Imágenes (URLs separadas por coma)</label>
            <textarea
              id="new-prod-img"
              rows="2"
              class="bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-xs rounded-xl p-3 outline-none placeholder:text-zinc-600 transition-all font-mono resize-none min-h-[90px]"
            >${Array.isArray(product.pictures) ? product.pictures.join(', ') : (Array.isArray(product.images) ? product.images.join(', ') : product.image || '')}</textarea>
          </div>

          <!-- Botón para guardar los cambios -->
          <button
            type="submit"
            class="md:col-span-2 mt-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-lg cursor-pointer"
          >
            Actualizar Producto
          </button>
        </form>
      </div>
    </main>`;

  // Una pequeña función para limpiar la pantalla y cerrar la ventana de edición.
  const hideModal = () => {
    formEditContainer.innerHTML = "";
  };

  // Buscamos el botón de cerrar ("X") y le decimos que al tocarlo borre el formulario y vuelva a mostrar el catálogo.
  const closeBtn = document.getElementById("new-close-form-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", ()=>{
      hideModal();
      cardSeccion.classList.remove("hidden");
    });
  }

  // Buscamos el formulario para estar pendientes de cuándo le den al botón de enviar.
  const form = document.getElementById("new-product-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evitamos que la página se recargue sola de forma brusca.

      // Si intentan editar pero no tienen permisos de jefe (administrador), les mostramos un aviso y paramos aquí.
      if (typeof isAdmin !== "undefined" && !isAdmin) {
        createNotification(true, "No tienes permisos de administrador.");
        return;
      }

      // Convertimos el texto de las imágenes en una lista separada por comas.
      const imagesValue = document.getElementById("new-prod-img").value;
      const imagesArray = imagesValue
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      // Revisamos qué opción eligieron en el menú de disponibilidad (Verdadero o Falso).
      const availabilityBool = document.getElementById("new-prod-availability").value === "true";

      // Armamos un paquete ordenado con toda la información nueva escrita en el formulario.
      const updatedData = {
        name: document.getElementById("new-prod-name").value.trim(),
        sku: document.getElementById("new-prod-sku").value.trim(),
        price: parseFloat(document.getElementById("new-prod-price").value),
        stock: parseInt(document.getElementById("new-prod-stock").value, 10),
        category: document.getElementById("new-prod-category").value.trim(),
        
        // Ponemos ambas versiones de disponibilidad para que el servidor las entienda sin problemas.
        available: availabilityBool,
        availability: availabilityBool ? "available" : "unavailable",

        description: document.getElementById("new-prod-desc").value.trim(),
        pictures: imagesArray,
        images: imagesArray,
      };

      try {
        // Le mandamos los datos nuevos al servidor usando una petición PUT.
        await axios.put(`/api/products/${product.id}`, updatedData);
        createNotification(false, "Producto actualizado correctamente."); // ¡Todo salió bien!
        
        hideModal(); // Cerramos el formulario.
        await fetchProducts(); // Recargamos los productos para que se vea el cambio reflejado en la tienda.
      } catch (error) {
        // Si algo falla al guardar, mostramos un aviso en la pantalla con el error exacto.
        console.error("Error al actualizar el producto:", error);
        createNotification(
          true,
          error.response?.data?.message || error.response?.data?.error || "Error al actualizar el producto."
        );
      }
    });
  }
};
import { showProductDetail } from "../components/productDetail.js";
import { isAdmin } from "../catalogo/index.js";


const productsContainer = document.getElementById("products-container");
const addProductCard = document.getElementById("add-product-card");





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



export {
    renderProducts,
}
document.addEventListener("DOMContentLoaded", () => {
  renderCart(); // <--- ESTO ES LO QUE PINTA LOS PRODUCTOS AL CARGAR LA VISTA

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }
});

// Obtener los productos del carrito desde localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Guardar cambios en el carrito
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Renderizar los productos en la vista
function renderCart() {
  const cartContainer = document.getElementById("cart-items-container");
  const breakdownContainer = document.getElementById("order-breakdown-container");
  const cartTotalElement = document.getElementById("cart-total");
  const whatsappBtn = document.getElementById("whatsapp-checkout-btn");

  const cart = getCart();

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="font-mono text-xs sm:text-sm text-zinc-400 py-4">Tu carrito está vacío.</p>`;
    breakdownContainer.innerHTML = `<div class="text-zinc-500 italic">No hay productos agregados</div>`;
    cartTotalElement.textContent = "$0.00";
    whatsappBtn.href = `https://wa.me/584242667278?text=Hola,%20quiero%20información%20sobre%20sus%20productos%20en%20Soldaduras%20Zamora.`;
    return;
  }

  let total = 0;
  let cartHtml = "";
  let breakdownHtml = "";
  let whatsappMessage = "Hola, quiero realizar el siguiente pedido en Soldaduras Zamora:%0A";

  cart.forEach((item, index) => {
    const subtotal = item.unit_price * item.product_quantity;
    total += subtotal;

    whatsappMessage += `- ${item.product_quantity}x ${item.product_name} ($${subtotal.toFixed(2)})%0A`;

    // Tarjeta del producto en la lista principal
    cartHtml += `
      <div class="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl gap-4">
        <div class="flex flex-col gap-1">
          <span class="font-sans font-bold text-sm text-zinc-100">${item.product_name}</span>
          <span class="font-mono text-xs text-amber-500">$${item.unit_price.toFixed(2)} c/u</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-950">
            <button type="button" onclick="updateQuantity(${index}, -1)" class="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">-</button>
            <span class="px-3 font-mono text-xs text-zinc-200">${item.product_quantity}</span>
            <button type="button" onclick="updateQuantity(${index}, 1)" class="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">+</button>
          </div>
          <button type="button" onclick="removeItem(${index})" class="text-zinc-500 hover:text-red-400 transition-colors p-1" title="Eliminar producto">
            ✕
          </button>
        </div>
      </div>
    `;

    // Resumen lateral por producto
    breakdownHtml += `
      <div class="flex justify-between items-center border-b border-zinc-900 pb-1">
        <span class="truncate max-w-[150px]">${item.product_quantity}x ${item.product_name}</span>
        <span class="text-amber-500/90">$${subtotal.toFixed(2)}</span>
      </div>
    `;
  });

  whatsappMessage += `%0ATotal a pagar: $${total.toFixed(2)}`;

  cartContainer.innerHTML = cartHtml;
  breakdownContainer.innerHTML = breakdownHtml;
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
  
  // Actualizar enlace de WhatsApp
  const phoneNumber = "584242667278"; 
  whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
}

// Funciones globales para manipular el carrito desde los botones inyectados en HTML
window.updateQuantity = function (index, change) {
  let cart = getCart();
  if (cart[index]) {
    const newQuantity = cart[index].product_quantity + change;
    const maxStock = cart[index].stock ?? 99999; // Si por alguna razón no tiene stock definido, se protege

    // Si intenta sumar y supera el stock
    if (change > 0 && newQuantity > maxStock) {
      alert(`Has alcanzado el límite máximo de stock disponible (${maxStock} unidades).`);
      return;
    }

    cart[index].product_quantity = newQuantity;

    if (cart[index].product_quantity <= 0) {
      cart.splice(index, 1);
    }
    
    saveCart(cart);
    renderCart();
  }
};

window.removeItem = function (index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
};


// Cuando la página web termine de cargar por completo, ejecutamos dos cosas:
// 1. Mostramos los productos que tengas en el carrito.
// 2. Empezamos a revisar si el botón de PayPal ya está listo para aparecer.
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  esperarPayPal();
});

// Esta cajita mágica (función) va a la memoria del navegador (localStorage)
// a buscar si hay un carrito guardado. Si no hay nada, te regresa una lista vacía [].
const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

// Esta función toma el carrito de compras y lo guarda ordenadito
// en la memoria del navegador para que no se borre si recargas la página.
const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

const showNotification = (message, isError = false) => {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.innerHTML = `
    <div class="${isError ? "bg-red-600 border-red-500 text-white" : "bg-emerald-600 border-emerald-500 text-white"} rounded-xl border px-4 py-3 shadow-lg max-w-xl mx-auto mb-4">
      <p class="font-semibold">${message}</p>
    </div>
  `;

  setTimeout(() => {
    notification.innerHTML = "";
  }, 5000);
};

// Como PayPal a veces tarda un segundito en cargar desde internet,
// esta función se queda esperando pacientemente hasta que aparezca.
const esperarPayPal = () => {
  // Si la herramienta de PayPal ya existe y está lista...
  if (typeof paypal !== "undefined") {
    inicializarPayPal(); // ¡Dibujamos el botón!
  } else {
    // Si todavía no carga, esperamos un poquito (0.1 segundos) y volvemos a preguntar.
    setTimeout(esperarPayPal, 100);
  }
};

// Una variable para recordar si ya dibujamos el botón de PayPal
// y no dibujarlo dos veces por accidente.
let paypalInstanceRendered = false;

// Aquí es donde armamos y dibujamos el botón mágico de PayPal en la pantalla.
const inicializarPayPal = () => {
  // Buscamos el espacio en la página web donde debe ir el botón.
  const container = document.getElementById("paypal-button-container");
  if (!container) return; // Si no existe ese espacio, nos detenemos aquí.

  // Revisamos tu carrito y sumamos los precios de todo para saber cuánto vas a pagar en total.
  const cart = getCart();
  const total = cart.reduce(
    (acc, item) => acc + item.unit_price * item.product_quantity,
    0,
  );

  // Si el total es 0 (no hay nada que pagar)...
  if (total <= 0) {
    // Mostramos un mensajito diciendo que agregues cosas.
    container.innerHTML = `<p class="text-xs text-zinc-500 italic text-center">Agrega productos para pagar con PayPal</p>`;
    paypalInstanceRendered = false; // Decimos que el botón no está dibujado.
    return;
  }

  // Si el botón ya estaba dibujado en la pantalla, no hacemos nada y salimos.
  if (paypalInstanceRendered) return;

  // Limpiamos el espacio por si había algo viejo escrito allí.
  container.innerHTML = "";

  try {
    // Le pedimos a PayPal que cree el botón de pago oficial.
    paypal
      .Buttons({
        // Paso 1: Cuando le das clic al botón, le decimos a nuestro servidor que prepare la orden de pago.
        createOrder: function (data, actions) {
          return fetch("/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total.toFixed(2) }), // Mandamos el precio total.
          })
            .then((res) => res.json())
            .then((data) => {
              // Si el servidor no nos da un número de orden, explotamos un error.
              if (!data.id) {
                throw new Error(
                  data.error || "No se generó el ID de orden en el servidor",
                );
              }
              return data.id; // Devolvemos el número de orden que nos dio PayPal.
            });
        },
        // Paso 2: Cuando pagas con éxito en la ventanita de PayPal...
        onApprove: function(data, actions) {
          const cartData = JSON.parse(localStorage.getItem("cart")) || [];

          return fetch("/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderID: data.orderID,
              cart: cartData,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                return res.json().then((errorBody) => {
                  throw new Error(errorBody.error || `Error del servidor: ${res.status}`);
                });
              }
              return res.json();
            })
            .then((details) => {
              console.log("¡Pago exitoso y guardado!", details);
              localStorage.removeItem("cart");

              const cartContainer = document.getElementById("cart-items-container");
              if (cartContainer) {
                cartContainer.innerHTML = `<div class="bg-emerald-600/10 border border-emerald-500 text-emerald-100 p-4 rounded-xl text-center font-bold">¡Pago completado con éxito! Tu pedido se guardó y el stock se actualizó.</div>`;
              }

              const breakdownContainer = document.getElementById("order-breakdown-container");
              if (breakdownContainer) {
                breakdownContainer.innerHTML = "";
              }

              showNotification("Pago exitoso! Pedido registrado y stock actualizado.");

              setTimeout(() => {
                window.location.reload();
              }, 2500);
            })
            .catch((err) => {
              console.error("Error al capturar la orden:", err);
              showNotification(
                err.message || "Hubo un problema al procesar el pago con el servidor.",
                true,
              );
            });
        }
      })
      .render("#paypal-button-container"); // Pintamos el botón dentro de su cajita en la página.

    paypalInstanceRendered = true; // Anotamos que ya dibujamos el botón con éxito.
  } catch (error) {
    // Si pasa un error raro al dibujar el botón, lo anotamos en la consola secreta.
    console.error("Error al renderizar los botones de PayPal:", error);
  }
};

// Esta función se encarga de dibujar todos los productos que tienes en el carrito
// para que los puedas ver en la pantalla.
const renderCart = () => {
  const cartContainer = document.getElementById("cart-items-container");
  const breakdownContainer = document.getElementById(
    "order-breakdown-container",
  );
  const cartTotalElement = document.getElementById("cart-total");
  const whatsappBtn = document.getElementById("whatsapp-checkout-btn");

  const cart = getCart(); // Traemos lo que hay guardado en el carrito.

  // Si el carrito está completamente vacío...
  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="font-mono text-xs sm:text-sm text-zinc-400 py-4">Tu carrito está vacío.</p>`;
    breakdownContainer.innerHTML = `<div class="text-zinc-500 italic">No hay productos agregados</div>`;
    cartTotalElement.textContent = "$0.00"; // El total es cero.
    // El botón de WhatsApp manda un mensaje genérico de saludo.
    whatsappBtn.href = `https://wa.me/584242667278?text=Hola,%20quiero%20información%20sobre%20sus%20productos%20en%20Soldaduras%20Zamora.`;

    inicializarPayPal(); // Llamamos a PayPal para que se actualice y muestre que no hay nada.
    return;
  }

  let total = 0; // Empezamos a contar la plata desde cero.
  let cartHtml = "";
  let breakdownHtml = "";
  let whatsappMessage =
    "Hola, quiero realizar el siguiente pedido en Soldaduras Zamora:%0A";

  // Revisamos cada producto uno por uno dentro del carrito.
  cart.forEach((item, index) => {
    const subtotal = item.unit_price * item.product_quantity; // Precio por cantidad.
    total += subtotal; // Sumamos al gran total.
    whatsappMessage += `- ${item.product_quantity}x ${item.product_name} ($${subtotal.toFixed(2)})%0A`;

    // Creamos el diseño visual para cada producto en el carrito (con sus botones de + y -).
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
          <button type="button" onclick="removeItem(${index})" class="text-zinc-500 hover:text-red-400 transition-colors p-1">✕</button>
        </div>
      </div>
    `;

    // Creamos el resumen pequeño de la compra.
    breakdownHtml += `
      <div class="flex justify-between items-center border-b border-zinc-900 pb-1">
        <span class="truncate max-w-[150px]">${item.product_quantity}x ${item.product_name}</span>
        <span class="text-amber-500/90">$${subtotal.toFixed(2)}</span>
      </div>
    `;
  });

  whatsappMessage += `%0ATotal a pagar: $${total.toFixed(2)}`;
  // Metemos todo el diseño que armamos dentro de la página web.
  cartContainer.innerHTML = cartHtml;
  breakdownContainer.innerHTML = breakdownHtml;
  cartTotalElement.textContent = `$${total.toFixed(2)}`;

  // Ponemos listo el enlace para comprar directamente por WhatsApp con el pedido armado.
  whatsappBtn.href = `https://wa.me/584242667278?text=${whatsappMessage}`;
};

// Esta función sirve para sumar o restar la cantidad de un producto cuando le das a los botones + o -.
window.updateQuantity = function (index, change) {
  let cart = getCart();
  if (cart[index]) {
    cart[index].product_quantity += change; // Cambiamos la cantidad.
    if (cart[index].product_quantity <= 0) cart.splice(index, 1); // Si llega a 0, borramos el producto del carrito.
    saveCart(cart); // Guardamos los cambios.
    renderCart(); // Volvemos a dibujar el carrito en la pantalla.
    inicializarPayPal(); // Actualizamos los botones de PayPal con el nuevo precio total.
  }
};

// Esta función borra un producto por completo del carrito cuando tocas la "X".
window.removeItem = function (index) {
  let cart = getCart();
  cart.splice(index, 1); // Sacamos el producto de la lista.
  saveCart(cart); // Guardamos los cambios.
  renderCart(); // Volvemos a dibujar el carrito.
  inicializarPayPal(); // Actualizamos PayPal con el precio nuevo.
};

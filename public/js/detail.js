import {
  updateCartCounter,
  addToCart,
  getCart,
  isInCart,
  removeFromCart,
} from "./cart.js";

document.addEventListener("DOMContentLoaded", () => {
  updateCartCounter();
  const addProductCart = document.querySelector(".btn-addcart");

  if (addProductCart) {
    addProductCart.addEventListener("click", () => {
      const productId = parseInt(addProductCart.dataset.productId);
      if (isInCart(productId)) {
        // Ya existe en el carrito
        addProductCart.textContent = "✖ Ya en carrito";
        addProductCart.style.backgroundColor = "#f24848ff";
        setTimeout(() => {
          addProductCart.textContent = "🛒 Añadir al carrito";
          addProductCart.style.backgroundColor = "";
        }, 1000);
        return;
      }

      // Añadir al carrito
      addToCart(productId);

      // Actualizar contador
      updateCartCounter();

      // No existe en el carrito - Añadir con feedback visual
      addProductCart.textContent = "✓ Añadido";
      addProductCart.style.backgroundColor = "#4CAF50";
      setTimeout(() => {
        addProductCart.textContent = "🛒 Añadir al carrito";
        addProductCart.style.backgroundColor = "";
      }, 1000);
    });
  }

  /************************************************* 
      GESTIÓN DEL MAPA LEAFLET
  **************************************************/
  updateCartCounter();
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const lat = parseFloat(mapDiv.dataset.latitud);
  const lon = parseFloat(mapDiv.dataset.longitud);
  const vendedor = mapDiv.dataset.nombre;

  // Inicializar mapa
  const map = L.map("map").setView([lat, lon], 13);

  // Añadir capa base de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Añadir marcador
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`<b>${vendedor}</b><br>Ubicación del vendedor.`)
    .openPopup();
});

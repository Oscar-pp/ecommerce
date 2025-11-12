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
    addProductCart.addEventListener("click", async () => {
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

      try {
        // Obtener los detalles completos del producto desde el backend
        const response = await fetch(`/api/productos/${productId}`);
        if (!response.ok) {
          throw new Error("No se pudo obtener el producto.");
        }
        const product = await response.json();

        // Añadir el producto completo al carrito
        addToCart(product);

        // Actualizar contador
        updateCartCounter();

        // Feedback visual
        addProductCart.textContent = "✓ Añadido";
        addProductCart.style.backgroundColor = "#4CAF50";
        setTimeout(() => {
          addProductCart.textContent = "🛒 Añadir al carrito";
          addProductCart.style.backgroundColor = "";
        }, 1000);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        showError("Hubo un error al añadir el producto al carrito.");
      }
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

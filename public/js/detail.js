import { updateCartCounter, addToCart, isInCart } from "./cart.js";

document.addEventListener("DOMContentLoaded", () => {
  updateCartCounter();

   // -----------------------------
  // BOTÓN VOLVER A LA GALERIA
  // -----------------------------
  document.querySelector(".volver").addEventListener("click", async () => {
    window.location.href = '/';
  });

  // -----------------------------
  // BOTÓN AÑADIR AL CARRITO
  // -----------------------------
  const addProductCart = document.querySelector(".btn-addcart");

  if (addProductCart) {
    addProductCart.addEventListener("click", async () => {
      const productId = parseInt(addProductCart.dataset.productId);

      if (isInCart(productId)) {
        addProductCart.textContent = "✖ Ya en carrito";
        addProductCart.style.backgroundColor = "#f24848ff";
        setTimeout(() => {
          addProductCart.textContent = "🛒 Añadir al carrito";
          addProductCart.style.backgroundColor = "";
        }, 1000);
        return;
      }

      try {
        const response = await fetch(`/api/productos/${productId}`);
        if (!response.ok) throw new Error("No se pudo obtener el producto");

        const product = await response.json();
        addToCart(product);
        updateCartCounter();

        addProductCart.textContent = "✓ Añadido";
        addProductCart.style.backgroundColor = "#4CAF50";
        setTimeout(() => {
          addProductCart.textContent = "🛒 Añadir al carrito";
          addProductCart.style.backgroundColor = "";
        }, 1000);
      } catch (error) {
        console.error("Error al añadir al carrito:", error);
        alert("Hubo un error al añadir el producto al carrito.");
      }
    });

  }

  // -----------------------------
  // MAPA LEAFLET
  // -----------------------------
  const mapDiv = document.getElementById("map");
  if (mapDiv) {
    const lat = parseFloat(mapDiv.dataset.latitud);
    const lon = parseFloat(mapDiv.dataset.longitud);
    const vendedor = mapDiv.dataset.nombre;

    const map = L.map("map").setView([lat, lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${vendedor}</b><br>Ubicación del vendedor.`)
      .openPopup();
  }

});

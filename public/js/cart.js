// Toggle del dropdown del carrito y cierre al hacer clic fuera
(function () {
  const btn = document.getElementById("cartButton");
  const dropdown = document.getElementById("cartDropdown");
  const cartItemsContainer = dropdown.querySelector(".cart-items");
  const cart = document.getElementById("cart");

  // Maneja apertura/cierre visual y aria
  function setExpanded(val) {
    btn.setAttribute("aria-expanded", String(val));
    dropdown.style.display = val ? "block" : "none";
  }

  // Evento para abrir/cerrar el dropdown
  btn.addEventListener("click", async function (e) {
    e.stopPropagation();
    const opened = btn.getAttribute("aria-expanded") === "true";
    setExpanded(!opened);

    // Si se abre el dropdown, cargar contenido del carrito
    if (!opened) {
      const cartItems = getCart(); // función que obtiene los ids guardados
      cartItemsContainer.innerHTML = ""; // limpia solo los productos

      if (cartItems.length > 0) {
        await renderCartItems(cartItems);
      } else {
        cartItemsContainer.innerHTML = "<li>El carrito está vacío</li>";
      }
    }
  });

  // Renderiza los productos dentro del dropdown
  async function renderCartItems(cartItems) {
    for (const id of cartItems) {
      try {
        const res = await fetch(`/api/productos/${id}`);
        const product = await res.json();

        const card = document.createElement("li");
        card.className = "cart-item";
        card.innerHTML = `
          <button class="cart-item-remove" data-id="${product.id_producto}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          <img src="/images/${product.imagen_url}" alt="${product.nombre}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${product.nombre}</h4>
            <p class="cart-item-price">$${product.precio}</p>
          </div>
        `;

        // Agregar la card al contenedor
        cartItemsContainer.appendChild(card);

        // Listener de eliminar producto
        const btnRemove = card.querySelector(".cart-item-remove");
        btnRemove.addEventListener("click", function (e) {
          e.stopPropagation(); // no cerrar el dropdown
          removeFromCart(product.id_producto);
          card.remove();
          updateCartCounter();
        });
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      }
    }
  }

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      setExpanded(false);
    }
  });

  // Cerrar con tecla ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setExpanded(false);
  });

  // Iniciar cerrado
  setExpanded(false);
})();

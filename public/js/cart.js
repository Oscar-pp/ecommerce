// Toggle del dropdown del carrito y cierre al hacer clic fuera
(function () {
  const btn = document.getElementById("cartButton");
  const dropdown = document.getElementById("cartDropdown");
  const cartItemsContainer = dropdown.querySelector(".cart-items");

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

/* -------------------------------
   RENDERIZADO DEL CARRITO
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {

  // Ocultao icono del carrito en la página del carrito
  if (window.location.pathname.includes("/cart")) {
    const cart = document.querySelector(".header-actions #cart");
    if (cart) cart.style.display = "none";
  }

  const cartBody = document.getElementById("cartBody");
  const totalPriceEl = document.getElementById("totalPrice");

  if (cartBody && totalPriceEl) {
    async function renderCart() {
      const cart = getCart();
      if (cart.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="6">Tu carrito está vacío.</td></tr>`;
        totalPriceEl.textContent = "0.00 €";

        // Disable botón pagar si el carrito está vacío
        const checkoutBtn = document.getElementById("checkout-button");
        if (checkoutBtn) {
          checkoutBtn.classList.add("disabled");
        } else {
          checkoutBtn.classList.remove("disabled");
        }
        return;
      }

      // 🔹 Una sola llamada al backend con todos los IDs
      const res = await fetch(`/api/allProductos?ids=${cart.join(",")}`);
      const productos = await res.json();

      cartBody.innerHTML = "";
      let total = 0;

      productos.forEach((producto) => {
        const quantity = 1;
        const precio = parseFloat(producto.precio);
        const subtotal = precio * quantity;
        const cantidad_disponible = parseInt(producto.cantidad_disponible);
        total += subtotal;

        const row = document.createElement("tr");
        row.setAttribute("data-stock", producto.cantidad_disponible);
        row.innerHTML = `<td><img src="/images/${
          producto.imagen_producto
        }" width="50"></td>
                    <td>${producto.nombre_producto}</td>
                    <td class="cell-price">${precio.toFixed(2)} €</td>
                    <td>${cantidad_disponible}</td>
                    <td><input type="number" min="1" max="${cantidad_disponible}" step="1" value="${quantity}" data-id="${
          producto.id_producto
        }" class="qty-input"></td>
                    <td class="cell-subtotal">${subtotal.toFixed(2)} €</td>
                    <td><button class="remove-btn" data-id="${
                      producto.id_producto
                    }">❌</button></td>
                    `;

        cartBody.appendChild(row);
      });

      totalPriceEl.textContent = `${total.toFixed(2)} €`;
    }

    // Evento: cambio de cantidad
    cartBody.addEventListener("input", (e) => {
      if (e.target.classList.contains("qty-input")) {
        const input = e.target;
        const row = input.closest("tr");
        const maxStock = parseInt(row.dataset.stock);

        const priceEl = row.querySelector(".cell-price");
        const subtotalEl = row.querySelector(".cell-subtotal");

        const price = parseFloat(priceEl.textContent.replace("€", "").trim());
        let quantity = parseInt(input.value) || 1;

        // Aseguramos número entero
        quantity = Math.floor(quantity);

        // Limitar cantidad al stock disponible
        if (quantity > maxStock) {
          quantity = maxStock;
        } else if (quantity < 1) {
          quantity = 1;
        }

        input.value = quantity;

        // recalcular subtotal de esta fila
        const newSubtotal = price * quantity;
        subtotalEl.textContent = `${newSubtotal.toFixed(2)} €`;

        // recalcular total general
        let total = 0;
        document.querySelectorAll("#cartBody tr").forEach((tr) => {
          const subCell = tr.querySelector(".cell-subtotal");
          if (subCell) {
            const subText = subCell.textContent.replace("€", "").trim();
            const subValue = parseFloat(subText);
            if (!isNaN(subValue)) total += subValue;
          }
        });

        totalPriceEl.textContent = `${total.toFixed(2)} €`;
      }
    });

    // Evento: eliminar producto
    cartBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const productId = parseInt(e.target.dataset.id);
        removeFromCart(productId);
        renderCart();
        updateCartCounter();
      }
    });

    renderCart();
  } // cierre if cartBody y totalPriceEl

});

/* -------------------------------
   FUNCIONES PARA GESTIONAR CARRITO
--------------------------------*/
export function addToCart(productId) {
  const cart = getCart();
  if (!cart.includes(productId)) {
    cart.push(productId);
    localStorage.setItem("cart_items", JSON.stringify(cart));
  }
  return cart;
}

export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((id) => id !== productId);
  localStorage.setItem("cart_items", JSON.stringify(cart));
  return cart;
}

export function getCart() {
  const cart = localStorage.getItem("cart_items");
  return cart ? JSON.parse(cart) : [];
}

export function isInCart(productId) {
  const cart = getCart();
  return cart.includes(productId);
}

export function updateCartCounter() {
  const productosCarrito = document.getElementById("cartCount");
  const goToCartLink = document.getElementById("goToCartBtn");

  if (!productosCarrito || !goToCartLink) return; // Si falta alguno, salimos

  const count = getCart().length;

  // Actualizamos el contador visual
  productosCarrito.textContent = count;
  productosCarrito.style.display = count > 0 ? "inline-block" : "none";

  // Actualizamos el estado del botón
  if (count === 0) {
    goToCartLink.classList.add("disabled");
    goToCartLink.classList.remove("btn-primary");
  } else {
    goToCartLink.classList.remove("disabled");
    goToCartLink.classList.add("btn-primary");
  }

  // Evitamos navegación si el enlace está desactivado (solo agregamos el listener una vez)
  if (!goToCartLink.dataset.listenerAdded) {
    goToCartLink.addEventListener("click", (e) => {
      if (goToCartLink.classList.contains("disabled")) {
        e.preventDefault(); // Evita la navegación
      }
    });
    goToCartLink.dataset.listenerAdded = "true"; // Marcamos que ya tiene el listener
  }
}

export function updateQuantity(productId, newQty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.quantity = Math.max(1, newQty);
  }
  saveCart(cart);
}

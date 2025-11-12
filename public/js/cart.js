function initCartDropdown() {
  const btn = document.getElementById("cartButton");
  const dropdown = document.getElementById("cartDropdown");
  const cartItemsContainer = dropdown.querySelector(".cart-items");

  function setExpanded(val) {
    btn.setAttribute("aria-expanded", String(val));
    dropdown.style.display = val ? "block" : "none";
  }

  btn.addEventListener("click", async function (e) {
    e.stopPropagation();
    const opened = btn.getAttribute("aria-expanded") === "true";
    setExpanded(!opened);

    if (!opened) {
      const cartItems = getCart();
      cartItemsContainer.innerHTML = "";

      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = "<li>El carrito está vacío</li>";
        return;
      }

      // Mostrar indicador de carga
      cartItemsContainer.innerHTML = "<li>Cargando productos...</li>";

      try {
        await renderCartItems(cartItems);
      } catch (error) {
        console.error("Error al renderizar el carrito:", error);
        cartItemsContainer.innerHTML = "<li>Error al cargar los productos.</li>";
      }
    }
  });

  async function renderCartItems(cartItems) {
  // Realiza todas las solicitudes en paralelo
  const productPromises = cartItems.map(async (item) => {
    const res = await fetch(`/api/productos/${item.id_producto}`);
    if (!res.ok) throw new Error(`Error al obtener producto ${item.id_producto}`);
    return res.json();
  });

  const products = await Promise.allSettled(productPromises);
  const fragment = document.createDocumentFragment();
  cartItemsContainer.innerHTML = ""; // limpia el loader

  for (const result of products) {
    if (result.status !== "fulfilled") {
      const errorItem = document.createElement("li");
      errorItem.textContent = "Error al cargar un producto.";
      fragment.appendChild(errorItem);
      continue;
    }

    const product = result.value;
    const cartItem = cartItems.find(item => item.id_producto === product.id_producto);
    if (!cartItem) continue; // Si no está en el carrito, saltar

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
        <p class="cart-item-quantity">Cantidad: ${cartItem.cantidad}</p>
      </div>
    `;

    const btnRemove = card.querySelector(".cart-item-remove");
    btnRemove.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromCart(product.id_producto);
      card.remove();
      updateCartCounter();
      // Si ya no quedan ítems, mostrar mensaje vacío
      if (!cartItemsContainer.querySelector(".cart-item")) {
        cartItemsContainer.innerHTML = "<li>El carrito está vacío</li>";
      }
    });

    fragment.appendChild(card);
  }

  cartItemsContainer.appendChild(fragment);
}


  // Cierra al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) setExpanded(false);
  });

  // Cierra con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setExpanded(false);
  });

  setExpanded(false);
}


/* -------------------------------
   RENDERIZADO DEL CARRITO
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  initCartDropdown();
  // Oculto icono del carrito en la página del carrito
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
    const checkoutBtn = document.getElementById("checkout-button");
    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
    }
    return;
  }

  // Obtener los IDs de los productos en el carrito
  const productIds = cart.map(item => item.id_producto);

  // Obtener los detalles de los productos desde el backend
  const res = await fetch(`/api/allProductos?ids=${productIds.join(",")}`);
  const productos = await res.json();

  cartBody.innerHTML = "";
  let total = 0;

  // Renderizar cada producto en el carrito
  productos.forEach((producto) => {
    const cartItem = cart.find(item => item.id_producto === producto.id_producto);
    if (!cartItem) return; // Si no está en el carrito, saltar

    const quantity = cartItem.cantidad;
    const precio = parseFloat(producto.precio);
    const subtotal = precio * quantity;
    const cantidad_disponible = parseInt(producto.cantidad_disponible);

    total += subtotal;

    const row = document.createElement("tr");
    row.setAttribute("data-stock", producto.cantidad_disponible);
    row.innerHTML = `
      <td><img src="/images/${producto.imagen_producto}" width="50"></td>
      <td>${producto.nombre_producto}</td>
      <td class="cell-price">${precio.toFixed(2)} €</td>
      <td>${cantidad_disponible}</td>
      <td>
        <input
          type="number"
          min="1"
          max="${cantidad_disponible}"
          step="1"
          value="${quantity}"
          data-id="${producto.id_producto}"
          class="qty-input"
        >
      </td>
      <td class="cell-subtotal">${subtotal.toFixed(2)} €</td>
      <td><button class="remove-btn" data-id="${producto.id_producto}">❌</button></td>
    `;
    cartBody.appendChild(row);
  });

  totalPriceEl.textContent = `${total.toFixed(2)} €`;
  localStorage.setItem("total_price", total.toFixed(2));

  // Habilitar el botón de checkout
  const checkoutBtn = document.getElementById("checkout-button");
  if (checkoutBtn) {
    checkoutBtn.classList.remove("disabled");
  }
}



    // Evento: cambio de cantidad
cartBody.addEventListener("input", (e) => {
  if (e.target.classList.contains("qty-input")) {
    const input = e.target;
    const productId = parseInt(input.dataset.id);
    const newQty = parseInt(input.value) || 1;

    // Actualizar la cantidad en el carrito
    updateQuantity(productId, newQty);

    // Recalcular el subtotal y el total
    const row = input.closest("tr");
    const priceEl = row.querySelector(".cell-price");
    const subtotalEl = row.querySelector(".cell-subtotal");
    const price = parseFloat(priceEl.textContent.replace("€", "").trim());
    const maxStock = parseInt(row.dataset.stock);

    let quantity = newQty;
    if (quantity > maxStock) {
      quantity = maxStock;
      input.value = quantity;
    } else if (quantity < 1) {
      quantity = 1;
      input.value = quantity;
    }

    const newSubtotal = price * quantity;
    subtotalEl.textContent = `${newSubtotal.toFixed(2)} €`;

    // Recalcular total general
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
    localStorage.setItem("total_price", total.toFixed(2));
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
export function addToCart(product) {
  const cart = getCart();
  // Verificar si el producto ya está en el carrito
  const existingProductIndex = cart.findIndex(item => item.id_producto === product.id_producto);

  if (existingProductIndex >= 0) {
    // Si el producto ya está en el carrito, no incrementar la cantidad automáticamente
    // (el usuario modificará la cantidad en el carrito si lo desea)
    return cart;
  } else {
    // Si no está en el carrito, agregarlo con cantidad 1
    cart.push({
      id_producto: product.id_producto,
      cantidad: 1,
      precio: product.precio,
      nombre: product.nombre, // Opcional, para mostrar en el carrito
    });
  }

  // Guardar el carrito actualizado en localStorage
  saveCart(cart);
  updateCartCounter();
  return cart;
}

function saveCart(cart) {
  localStorage.setItem("cart_items", JSON.stringify(cart));
}

export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id_producto !== productId);
  saveCart(cart);
  updateCartCounter();
  return cart;
}

export function getCart() {
  const cart = localStorage.getItem("cart_items");
  return cart ? JSON.parse(cart) : [];
}

export function isInCart(productId) {
  const cart = getCart();
  return cart.some(item => item.id_producto === productId);
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
  const item = cart.find((i) => i.id_producto === productId);
  if (item) {
    item.cantidad = Math.max(1, newQty); // Asegurar que la cantidad sea al menos 1
    saveCart(cart);
  }
}


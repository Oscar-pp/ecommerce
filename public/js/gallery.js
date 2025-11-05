/* 
Gallery.js - Gestión de filtros y visualización de productos

EVENTOS:
- DOMContentLoaded: Inicialización de componentes y carga inicial de productos

FILTROS:
1. Botón Toggle: Muestra/oculta panel de filtros en móvil
2. Buscador: Autocompleta nombres de productos desde la BD
3. Precio: Validación de rango mín/máx con feedback de error
4. Estrellas: Sistema de rating con hover y selección/deselección
5. Categoría: Selector de categoría de productos
6. Botón Aplicar: Ejecuta filtrado combinado sin recargar página
7. Funciones para gestionar el carrito de compras (añadir, eliminar, obtener) en localStorage

PRODUCTOS:
- Carga asíncrona desde API (/api/filtrarValores)
- Render dinámico de cards con lazy loading de imágenes
- Interactividad: enlaces a detalle y botón añadir al carrito

ACCESIBILIDAD:
- Labels asociados con inputs mediante for/id
- Inputs radio ocultos para navegación por teclado
- Mensajes de error y estados visuales
*/

/* -------------------------------
   FUNCIONES PARA GESTIONAR CARRITO
--------------------------------*/
function addToCart(productId) {
  const cart = getCart();
  if (!cart.includes(productId)) {
    cart.push(productId);
    localStorage.setItem("cart_items", JSON.stringify(cart));
  }
  return cart;
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(id => id !== productId);
  localStorage.setItem("cart_items", JSON.stringify(cart));
  return cart;
}

function getCart() {
  const cart = localStorage.getItem("cart_items");
  return cart ? JSON.parse(cart) : [];
}

function isInCart(productId) {
  const cart = getCart();
  return cart.includes(productId);
}

function updateCartCounter() {
  const productosCarrito = document.getElementById("cartCount");
  if (productosCarrito) {
    const count = getCart().length;
    productosCarrito.textContent = count;
    productosCarrito.style.display = count > 0 ? "inline-block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-filtros");
  const filtros = document.querySelector(".filtros");
  const inputMin = document.getElementById("precio-min");
  const inputMax = document.getElementById("precio-max");
  const errorMsg = document.getElementById("error-precio");
  const stars = document.querySelectorAll(".stars-filter label");
  const btnFiltrar = document.querySelector(".btn-filtrar");
  const inputNombre = document.getElementById("nombreProducto");
  const datalist = document.getElementById("productos");
  const catalogo = document.querySelector(".catalogo");
  const categoria = document.getElementById("option-category");
  
  // Primera carga del contador del carrito
  updateCartCounter();

  let currentValue = 0; // Valor actual de estrellas

  // Objeto que guarda todos los filtros activos
  const filtrosActivos = {
    estrellas: 0,
    precioMin: inputMin.value,
    precioMax: inputMax.value,
    nombreProducto: "",
    categoria: categoria.value,
  };

  /* -------------------------------
     TOGGLE CERRAR / MOSTRAR FILTROS
  --------------------------------*/
  if (toggleBtn && filtros) {
    toggleBtn.addEventListener("click", () => {
      filtros.classList.toggle("activo");
      toggleBtn.textContent = filtros.classList.contains("activo")
        ? "❌ Ocultar filtros"
        : "🧩 Mostrar filtros";
    });
  }

  /* -------------------------------
     AUTOCOMPLETAR NOMBRES
  --------------------------------*/
  inputNombre.addEventListener("input", async () => {
    const texto = inputNombre.value.trim();
    if (texto.length === 0) return;

    const response = await fetch(
      `/api/productos?search=${encodeURIComponent(texto)}`
    );
    const nombres = await response.json();
    datalist.innerHTML = "";

    nombres.forEach((nombre) => {
      const option = document.createElement("option");
      option.value = nombre;
      datalist.appendChild(option);
    });
  });

  /* -------------------------------
     RANGE DE PRECIO
  --------------------------------*/
  function validarRango() {
    const min = parseFloat(inputMin.value) || 0;
    const max = parseFloat(inputMax.value) || 0;

    if (min > max) {
      errorMsg.textContent =
        "⚠️ El precio mínimo no puede ser mayor que el máximo.";
      errorMsg.style.display = "block";
      return false;
    } else {
      errorMsg.style.display = "none";
      filtrosActivos.precioMin = min;
      filtrosActivos.precioMax = max;
      return true;
    }
  }

  // Valida solo cuando el usuario termina de editar (blur : pierde el foco),
  // comprobamos que los rangos son correctos
  inputMin.addEventListener("blur", validarRango);
  inputMax.addEventListener("blur", validarRango);

  /* -------------------------------
     STARS FILTRO
  --------------------------------*/
  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      const value = parseInt(star.getAttribute("data-value"));
      stars.forEach((s) => {
        if (parseInt(s.getAttribute("data-value")) <= value) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });

    star.addEventListener("mouseleave", () => {
      stars.forEach((s) => {
        if (parseInt(s.getAttribute("data-value")) <= currentValue) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });

    star.addEventListener("click", () => {
      const value = parseInt(star.getAttribute("data-value"));
      
      if (value === currentValue) {
        // Deseleccionar todo cuando se hace clic en la estrella actual
        currentValue = 0;
        filtrosActivos.estrellas = 0;
        // Desmarcar todos los inputs radio
        document.querySelectorAll('.star-input').forEach(input => {
          input.checked = false;
        });
      } else {
        // Seleccionar la estrella clickeada
        currentValue = value;
        filtrosActivos.estrellas = value;
        // Marcar el input radio correspondiente
        const input = document.querySelector(`.star-input[value="${value}"]`);
        if (input) input.checked = true;
      }

      // Actualizar visual de estrellas
      stars.forEach((s) => {
        if (parseInt(s.getAttribute("data-value")) <= currentValue) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });

  /* ---------------------------------------------------------
     FUNCIÓN PARA RENDERIZAR PRODUCTOS EN LA GALERIA PRINCIPAL
  ------------------------------------------------------------*/
  function renderProductos(productos) {
    catalogo.innerHTML = "";

    if (!productos.length) {
      catalogo.innerHTML = "<p>No se encontraron productos.</p>";
      return;
    }

    productos.forEach((p) => {
      const card = document.createElement("section");
      card.className = "product-card";
      card.innerHTML = `
        <a href="/detail/${p.id_producto}">
          <img src="images/${p.imagen_url}" loading="lazy" decoding="async" width="110" height="150" alt="${
        p.descripcion
      }" class="product-img" />
        </a>
        <div class="product-info">
          <a href="/detail/${p.id_producto}">
            <h2 class="product-title">${p.nombre}</h2>
          </a>
          <p class="product-price">${p.precio} €</p>
          <div class="product-rating">
            ${[1, 2, 3, 4, 5]
              .map((i) => (i <= p.star_product ? "⭐" : "☆"))
              .join("")}
          </div>
          <button class="btn-add" data-id="${p.id_producto}">Añadir al carrito</button>
        </div>
      `;
      catalogo.appendChild(card);

      // Añadir funcionalidad al botón "Añadir al carrito"
      const btnAdd = card.querySelector(".btn-add");
      btnAdd.addEventListener("click", () => {
        if (isInCart(p.id_producto)) {
          // Ya existe en el carrito
          btnAdd.textContent = "✖ Ya en carrito";
          btnAdd.style.backgroundColor = "#f24848ff";
          setTimeout(() => {
            btnAdd.textContent = "Añadir al carrito";
            btnAdd.style.backgroundColor = "";
          }, 1000);
          return;
        }
          
        // Añadir al carrito
        addToCart(p.id_producto);
        
        // Actualizar contador
        updateCartCounter();
        
        // No existe en el carrito - Añadir con feedback visual
        btnAdd.textContent = "✓ Añadido";
        btnAdd.style.backgroundColor = "#4CAF50";
        setTimeout(() => {
          btnAdd.textContent = "Añadir al carrito";
          btnAdd.style.backgroundColor = "";
        }, 1000);

      });
    });
  };

  /* -------------------------------
     FUNCIÓN PARA CARGAR PRODUCTOS
  --------------------------------*/
  async function cargarProductos() {
    const query = new URLSearchParams(filtrosActivos).toString();
    const res = await fetch(`/api/filtrarValores?${query}`);
    const data = await res.json();
    renderProductos(data);
  }

  /* -------------------------------
     BOTÓN FILTRAR (sin recargar)
  --------------------------------*/
  btnFiltrar.addEventListener("click", async () => {
    if (!validarRango()) return; // evita aplicar si los valores del rango estan mal.
    filtrosActivos.nombreProducto = inputNombre.value.trim();
    filtrosActivos.categoria = categoria.value;
    await cargarProductos();
  });

  /* -------------------------------
     CARGAR TODOS AL INICIO
  --------------------------------*/
  cargarProductos();
});

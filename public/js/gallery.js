/* 
Gallery.js

- Toggle cerrar o mostrar filtros en gallery
- Autocompleta el input dependiendo de palabras coincidentes en la bbdd 
- Input Range para filtrar valor de precio
- Stars mínimas que filtrará
- Button Filtrar (sin recargar página)
- Render dinámico de cards en el main
*/

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-filtros");
  const filtros = document.querySelector(".filtros");
  const input = document.getElementById("pi_input");
  const currentPrice = document.getElementById("value");
  const stars = document.querySelectorAll(".stars-filter label");
  const btnFiltrar = document.querySelector(".btn-filtrar");
  const inputNombre = document.getElementById("nombreProducto");
  const datalist = document.getElementById("productos");
  const catalogo = document.querySelector(".catalogo"); 
  const categoria = document.getElementById("option-category");

  let currentValue = 0; // Valor actual de estrellas

  // Objeto que guarda todos los filtros activos
  const filtrosActivos = {
    estrellas: 0,
    precio: input.value,
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

    const response = await fetch(`/api/productos?search=${encodeURIComponent(texto)}`);
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
  currentPrice.textContent = input.value;
  input.addEventListener("input", () => {
    currentPrice.textContent = input.value;
    filtrosActivos.precio = input.value;
  });

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
      currentValue = 0;
      filtrosActivos.estrellas = 0;
    } else {
      currentValue = value;
      filtrosActivos.estrellas = value;
    }

    stars.forEach((s) => {
      if (parseInt(s.getAttribute("data-value")) <= currentValue) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });
  });
});




  /* -------------------------------
     FUNCIÓN PARA RENDERIZAR PRODUCTOS
  --------------------------------*/
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
        <a href="/detail">
          <img src="${p.imagen_url}" alt="${p.descripcion}" class="product-img" />
        </a>
        <div class="product-info">
          <a href="/detail"><h2 class="product-title">${p.nombre}</h2></a>
          <p class="product-price">${p.precio} €</p>
          <div class="product-rating">
            ${[1, 2, 3, 4, 5].map(i => i <= p.star_product ? "⭐" : "☆").join("")}
          </div>
          <button class="btn-add">Añadir al carrito</button>
        </div>
      `;
      catalogo.appendChild(card);
    });
  }

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
    filtrosActivos.nombreProducto = inputNombre.value.trim();
    filtrosActivos.categoria = categoria.value;
    await cargarProductos();
  });

  /* -------------------------------
     CARGAR TODOS AL INICIO
  --------------------------------*/
  cargarProductos();
});

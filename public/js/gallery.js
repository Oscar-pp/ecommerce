/* 
Gallery.js - Gestión de filtros y visualización de productos
*/

import { addToCart, isInCart, updateCartCounter } from "./cart.js";

/* ---------------------------------------------------------
   FUNCIÓN PARA RENDERIZAR PRODUCTOS EN LA GALERIA PRINCIPAL
------------------------------------------------------------*/
export function renderProductos(productos, container) {
  container.innerHTML = "";

  if (!productos.length) {
    container.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  productos.forEach((p) => {
    const card = document.createElement("section");
    card.className = "product-card";
    card.innerHTML = `
  <a href="/detail/${p.id_producto}" aria-label="Ver detalles de ${p.nombre}">
    <img
      src="images/${p.imagen_url}"
      loading="lazy"
      decoding="async"
      width="110"
      height="150"
      alt="${p.descripcion}"
      class="product-img"
    />
  </a>
  <div class="product-info">
    <a href="/detail/${p.id_producto}" aria-label="Ver detalles de ${p.nombre}">
      <h2 class="product-title">${p.nombre}</h2>
    </a>
    <p class="product-price" aria-label="Precio: ${p.precio} euros">${p.precio} €</p>
    <div class="product-rating" aria-label="Valoración: ${p.star_product} de 5 estrellas" style="background:black;border-radius:8px;padding:.5rem;">
    ${[1, 2, 3, 4, 5].map(i =>
      `<span aria-hidden="true" class="star">${i <= p.star_product ? "⭐" : "☆"}</span>`
    ).join("")}
      <span class="sr-only">(${p.star_product} estrellas)</span>
    </div>
    <button class="btn-add" data-id="${p.id_producto}" aria-label="Añadir ${p.nombre} al carrito">
      Añadir al carrito
    </button>
  </div>
`;

    container.appendChild(card);

    const btnAdd = card.querySelector(".btn-add");
    btnAdd.addEventListener("click", () => {
      if (isInCart(p.id_producto)) {
        btnAdd.textContent = "✖ Ya en carrito";
        btnAdd.style.backgroundColor = "#f24848ff";
        setTimeout(() => {
          btnAdd.textContent = "Añadir al carrito";
          btnAdd.style.backgroundColor = "";
        }, 1000);
        return;
      }
      addToCart(p);
      updateCartCounter();
      btnAdd.textContent = "✓ Añadido";
      btnAdd.style.backgroundColor = "#4CAF50";
      setTimeout(() => {
        btnAdd.textContent = "Añadir al carrito";
        btnAdd.style.backgroundColor = "";
      }, 1000);
    });
  });
}

/* ---------------------------------------------------------
   FUNCIÓN PARA CARGAR PRODUCTOS DESDE LA API
------------------------------------------------------------*/
export async function cargarProductos(filtros, container) {
  const query = new URLSearchParams(filtros).toString();
  const res = await fetch(`/api/filtrarValores?${query}`);
  const data = await res.json();
  renderProductos(data, container);
}

/* ---------------------------------------------------------
   FUNCIÓN PARA INICIALIZAR EL NAVBAR (DELEGACIÓN DE EVENTOS)
------------------------------------------------------------*/


export function initNavbar(container) {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  navbar.addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
      e.preventDefault();
      const categoria = e.target.textContent.trim();
      const res = await fetch(`/api/filtrarValores?categoria=${categoria}`);
      const productos = await res.json();
      renderProductos(productos, container);
    }
  });
}

/* ---------------------------------------------------------
   LÓGICA PRINCIPAL AL CARGAR LA PÁGINA
------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
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

  if (!catalogo) return;

  // Contador del carrito
  updateCartCounter();
  /* -------------------------------
     INICIALIZAR NAVBAR
  --------------------------------*/
  initNavbar(catalogo);

  let currentValue = 0;

  const filtrosActivos = {
    estrellas: 0,
    precioMin: inputMin.value,
    precioMax: inputMax.value,
    nombreProducto: "",
    categoria: categoria.value,
  };

  /* -------------------------------
     TOGGLE FILTROS
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
    if (!texto) return;

    const response = await fetch(`/api/productos?search=${encodeURIComponent(texto)}`);
    const nombres = await response.json();
    datalist.innerHTML = "";

    nombres.forEach(nombre => {
      const option = document.createElement("option");
      option.value = nombre;
      datalist.appendChild(option);
    });
  });

  /* -------------------------------
     VALIDAR RANGO DE PRECIO
  --------------------------------*/
  function validarRango() {
    const min = parseFloat(inputMin.value) || 0;
    const max = parseFloat(inputMax.value) || 0;

    if (min > max) {
      errorMsg.textContent = "⚠️ El precio mínimo no puede ser mayor que el máximo.";
      errorMsg.style.display = "block";
      return false;
    }
    errorMsg.style.display = "none";
    filtrosActivos.precioMin = min;
    filtrosActivos.precioMax = max;
    return true;
  }

  inputMin.addEventListener("blur", validarRango);
  inputMax.addEventListener("blur", validarRango);

  /* -------------------------------
     STARS FILTRO
  --------------------------------*/
  stars.forEach(star => {
    star.addEventListener("mouseenter", () => {
      const value = parseInt(star.dataset.value);
      stars.forEach(s => s.classList.toggle("active", parseInt(s.dataset.value) <= value));
    });
    star.addEventListener("mouseleave", () => {
      stars.forEach(s => s.classList.toggle("active", parseInt(s.dataset.value) <= currentValue));
    });
    star.addEventListener("click", () => {
      const value = parseInt(star.dataset.value);
      if (value === currentValue) {
        currentValue = 0;
        filtrosActivos.estrellas = 0;
        document.querySelectorAll(".star-input").forEach(input => input.checked = false);
      } else {
        currentValue = value;
        filtrosActivos.estrellas = value;
        const input = document.querySelector(`.star-input[value="${value}"]`);
        if (input) input.checked = true;
      }
      stars.forEach(s => s.classList.toggle("active", parseInt(s.dataset.value) <= currentValue));
    });
  });

  /* -------------------------------
     BOTÓN FILTRAR
  --------------------------------*/
  btnFiltrar.addEventListener("click", async () => {
    if (!validarRango()) return;
    filtrosActivos.nombreProducto = inputNombre.value.trim();
    filtrosActivos.categoria = categoria.value;
    await cargarProductos(filtrosActivos, catalogo);
  });

  

  /* -------------------------------
     CARGAR PRODUCTOS INICIALES
  --------------------------------*/
  await cargarProductos(filtrosActivos, catalogo);
});

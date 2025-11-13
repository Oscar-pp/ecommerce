document.addEventListener("DOMContentLoaded", async () => {
  const id_vendedor = 1;
  const catalogo = document.getElementById("grid-container");
  const res = await fetch(`/api/todosProductos?id_vendedor=${id_vendedor}`);
  const productos = await res.json();

  catalogo.innerHTML = "";

  if (!productos.length) {
    catalogo.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  let selectedCard = null; // card actualmente seleccionada

  productos.forEach((p) => {
    const card = document.createElement("section");
    card.className = "product-card-admin";
    card.setAttribute("data-id_producto", p.id_producto);

    card.innerHTML = `
      <img src="images/${p.imagen_url}" loading="lazy" decoding="async"
           width="110" height="150" alt="${p.descripcion}" class="product-img-admin" />

      <div class="product-info-admin">
        <h2 class="product-title-admin">${p.nombre}</h2>
        <p class="product-price-admin">${p.precio} €</p>
        <div class="product-rating-admin">
          ${[1,2,3,4,5].map(i => i <= p.star_product ? "⭐" : "☆").join("")}
        </div>
      </div>
    `;

    // click para seleccionar/desmarcar
    card.addEventListener("click", () => {
      if (selectedCard === card) {
        // si ya está seleccionada, desmarcar
        card.classList.remove("selected");
        selectedCard = null;
      } else {
        // desmarcar la anterior
        if (selectedCard) selectedCard.classList.remove("selected");

        // marcar la nueva
        card.classList.add("selected");
        selectedCard = card;
      }

      alert(card.dataset.id_producto);
    });

    catalogo.appendChild(card);
  });
});

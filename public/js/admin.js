document.addEventListener("DOMContentLoaded", async () => {
  const id_vendedor = 2;
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
        <p class="product-price-admin">${p.precio} €  --  ${p.cantidad_disponible} Uds.</p>

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
        // si se deselecciona limpio el formulario
        document.getElementById('product-form').reset();
      } else {
        // desmarcar la anterior
        if (selectedCard) selectedCard.classList.remove("selected");

        // marcar la nueva
        card.classList.add("selected");
        selectedCard = card;
        // selecciono el producto y lo envio al formulario
        const producto = productos.find(p => p.id_producto == card.dataset.id_producto);
        llenarFormulario(producto);
      }

      // alert(card.dataset.id_producto);
    });

    catalogo.appendChild(card);
  });
});


function llenarFormulario(p) {
  document.getElementById('id_producto').value = p.id_producto;
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('descripcion').value = p.descripcion;
  document.getElementById('categoria').value = p.categoria;
  document.getElementById('precio').value = p.precio;
  document.getElementById('uds').value = p.cantidad_disponible;
  // document.getElementById('imagen').value = p.imagen_url;  ERROR POR EL TIPO DE CAMPO
}

function botodisabled(){
  
}
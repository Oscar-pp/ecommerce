document.addEventListener("DOMContentLoaded", async () => {

  const id_vendedor = 2;
  const catalogo = document.getElementById("grid-container");
  const btnNuevo = document.getElementById("btnNuevo");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnCambiarImagen = document.getElementById("btnCambiarImagen");
  const inputImagen = document.getElementById("imagen");
  const imgPreview = document.getElementById("imagenProducto");

  let selectedCard = null;
  let modo = "insert"; // insert | update

  // -----------------------------------------
  // 1. Cargar productos
  // -----------------------------------------
  const res = await fetch(`/api/todosProductos?id_vendedor=${id_vendedor}`);
  const productos = await res.json();

  catalogo.innerHTML = "";

  productos.forEach((p) => {
    const card = document.createElement("section");
    card.className = "product-card-admin";
    card.setAttribute("data-id_producto", p.id_producto);

    card.innerHTML = `
      <img src="images/${p.imagen_url}" loading="lazy" width="110"
           height="150" class="product-img-admin" />
      <div class="product-info-admin">
        <h2 class="product-title-admin">${p.nombre}</h2>
        <p class="product-price-admin">${p.precio} € — ${p.cantidad_disponible} Uds.</p>
        <div class="product-rating-admin"> 
            ${[1, 2, 3, 4, 5] .map((i) => (i <= p.star_product ? "⭐" : "☆")) .join("")}
        </div> 
      </div>
    `;

    // click para seleccionar producto
    card.addEventListener("click", () => {
      if (selectedCard === card) {
        card.classList.remove("selected");
        selectedCard = null;
        limpiarFormulario();
        return;
      }

      if (selectedCard) selectedCard.classList.remove("selected");
      card.classList.add("selected");
      selectedCard = card;

      const producto = productos.find(
        (x) => x.id_producto == card.dataset.id_producto
      );

      llenarFormulario(producto);
      modo = "update";
    });

    catalogo.appendChild(card);
  });

  // -----------------------------------------
  // 2. Llenar formulario para EDITAR
  // -----------------------------------------
  function llenarFormulario(p) {
    document.getElementById("id_producto").value = p.id_producto;
    document.getElementById("id_vendedor").value = p.id_vendedor;
    document.getElementById("nombre").value = p.nombre;
    document.getElementById("descripcion").value = p.descripcion;
    document.getElementById("categoria").value = p.categoria;
    document.getElementById("precio").value = p.precio;
    document.getElementById("uds").value = p.cantidad_disponible;

    // Guardamos la imagen original
    document.getElementById("imagen_actual").value = p.imagen_url;

    imgPreview.src = "images/" + p.imagen_url;
    inputImagen.style.display = "none"; // se oculta si ya tiene imagen
  }

  // -----------------------------------------
  // 3. Previsualizar imagen cuando se selecciona
  // -----------------------------------------
  inputImagen.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      imgPreview.src = URL.createObjectURL(this.files[0]);
    }
  });

  // -----------------------------------------
  // 4. Cambiar imagen → muestra input file
  // -----------------------------------------
  btnCambiarImagen.addEventListener("click", () => {
    inputImagen.style.display = "block";
    inputImagen.value = "";
    imgPreview.src = "";
  });

  // -----------------------------------------
  // 5. NUEVO PRODUCTO
  // -----------------------------------------
  btnNuevo.addEventListener("click", () => {
  limpiarFormulario();
  modo = "insert";
  // Establecer el id_vendedor para nuevos productos
  document.getElementById("id_vendedor").value = id_vendedor; 
  if (selectedCard) selectedCard.classList.remove("selected");
  selectedCard = null;
});

  function limpiarFormulario() {
  const form = document.getElementById("product-form");
  form.reset();

  // Restablecer los valores que no deben borrarse
  document.getElementById("id_vendedor").value = id_vendedor;

  imgPreview.src = "";
  inputImagen.style.display = "block";
}

  // -----------------------------------------
  // 6. GUARDAR (INSERT o UPDATE)
  // -----------------------------------------
  btnGuardar.addEventListener("click", async () => {
  const formData = new FormData(document.getElementById("product-form"));
  formData.append("modo", modo);

  // Verificar el contenido del formulario
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const res = await fetch("/api/producto/save", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  alert(data.message);
  location.reload();
});


});

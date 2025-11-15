document.addEventListener("DOMContentLoaded", async () => {
  const id_vendedor = 2;
  const catalogo = document.getElementById("grid-container");
  // const btnNuevo = document.getElementById("btnNuevo");
  const btnDelete = document.getElementById("btnDelete");
  const btnClean = document.getElementById("btnClean");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnCambiarImagen = document.getElementById("btnCambiarImagen");
  const inputImagen = document.getElementById("imagen");
  const imgPreview = document.getElementById("imagenProducto");

  let selectedCard = null;
  let modo = "insert"; // insert | update

  // -----------------------------------------
  // Función para recargar el catálogo de productos
  // -----------------------------------------
  async function recargarCatalogo() {
    const res = await fetch(`/api/todosProductos?id_vendedor=${id_vendedor}`);
    const productos = await res.json();

    catalogo.innerHTML = ""; // vaciamos el grid
    limpiarFormulario(); // limpiamos formulario y deseleccionamos card

    productos.forEach((p) => {
      const card = document.createElement("section");
      card.className = "product-card-admin";
      card.setAttribute("data-id_producto", p.id_producto);

      card.innerHTML = `
        <img src="images/${
          p.imagen_url
        }" loading="lazy" width="110" height="150" class="product-img-admin" />
        <div class="product-info-admin">
          <h2 class="product-title-admin">${p.nombre}</h2>
          <p class="product-price-admin">${p.precio} € — ${
        p.cantidad_disponible
      } Uds.</p>
          <div class="product-rating-admin"> 
            ${[1, 2, 3, 4, 5]
              .map((i) => (i <= p.star_product ? "⭐" : "☆"))
              .join("")}
          </div>
        </div>
      `;

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

        llenarFormulario(p);
        modo = "update";
      });

      catalogo.appendChild(card);
    });
  }

  // -----------------------------------------
  // 1. Cargar productos
  // -----------------------------------------
  await recargarCatalogo(); // Inicial carga del catálogo

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
  // 5. LIMPIAR FORMULARIO
  // -----------------------------------------
  function limpiarFormulario() {
    const form = document.getElementById("product-form");

    // Guardar el valor de id_vendedor
    const idVendedorValue = document.getElementById("id_vendedor").value;

    // Restablecer el formulario
    form.reset();

    // Restaurar solo el id_vendedor
    document.getElementById("id_vendedor").value = idVendedorValue;

    // Limpiar la previsualización de la imagen
    imgPreview.src = "";

    // Mostrar el input de imagen
    inputImagen.style.display = "block";

    // Desactivar el producto seleccionado
    if (selectedCard) {
      selectedCard.classList.remove("selected");
      selectedCard = null;
    }
  }

  // -----------------------------------------
  // 6. GUARDAR (INSERT o UPDATE)
  // -----------------------------------------
  btnGuardar.addEventListener("click", async () => {
    const formData = new FormData(document.getElementById("product-form"));
    console.log(" boton guardar tiene estos datos del form :", formData);
    formData.set("id_vendedor", id_vendedor);
    formData.append("modo", modo);

    // VALIDACIÓN: campos obligatorios
    const requiredFields = [
      "nombre",
      "descripcion",
      "categoria",
      "precio",
      "uds",
    ];
    for (let field of requiredFields) {
      if (!formData.get(field) || formData.get(field).trim() === "") {
        mostrarMensaje(`El campo "${field}" es obligatorio`, "error");
        return; // si falta algún campo, detenemos la función
      }
    }

    const res = await fetch("/api/producto/save", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      mostrarMensaje(data.error, "error");
    } else {
      mostrarMensaje(data.message, data.tipo || "success");
      await recargarCatalogo();
    }
  });

  // -----------------------------------------
  // 7. LIMPIAR FORMULARIO BOTON
  // -----------------------------------------
  btnClean.addEventListener("click", async () => {
    limpiarFormulario();
  });

  // Función para mostrar mensajes
  function mostrarMensaje(mensaje, tipo) {
    const mensajeElement = document.getElementById("mensaje");
    mensajeElement.textContent = mensaje;
    mensajeElement.className = `mensaje ${tipo}`;
    mensajeElement.style.display = "block";

    // Oculto el mensaje después de unos segundos
    setTimeout(() => {
      mensajeElement.style.display = "none";
    }, 2000);
  }

  // Función para mostrar el modal de confirmación
  function mostrarConfirmacion(mensaje, callback) {
    const modal = document.getElementById("confirmModal");
    const confirmMessage = document.getElementById("confirmMessage");
    confirmMessage.textContent = mensaje;
    modal.style.display = "block";

    document.getElementById("confirmYes").onclick = () => {
      modal.style.display = "none";
      callback(true);
    };

    document.getElementById("confirmNo").onclick = () => {
      modal.style.display = "none";
      callback(false);
    };
  }

  // -----------------------------------------
  // 8. ELIMINAR PRODUCTO
  // -----------------------------------------
  btnDelete.addEventListener("click", async () => {
    const id_producto = document.getElementById("id_producto").value;
    if (!selectedCard || !id_producto) {
      mostrarMensaje("Selecciona un producto para eliminar", "error");
      return;
    }

    mostrarConfirmacion(
      "¿Estás seguro de que deseas eliminar este producto?",
      async (confirmado) => {
        if (!confirmado) return;

        try {
          const res = await fetch("/api/producto/delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id_producto }),
          });

          const data = await res.json();
          if (data.error) {
            mostrarMensaje(data.error, "error");
          } else {
            mostrarMensaje(data.message, "success");
            await recargarCatalogo();
          }
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
          mostrarMensaje("Error al eliminar el producto", "error");
        }
      }
    );
  });
}); // scope DOM

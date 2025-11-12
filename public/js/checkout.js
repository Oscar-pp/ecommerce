import {
  updateCartCounter,
  addToCart,
  getCart,
  isInCart,
  removeFromCart,
} from "./cart.js";


// Oculto icono del carrito en la página del carrito
if (window.location.pathname.includes("/checkout")) {
  const cart = document.querySelector(".header-actions #cart");
  if (cart) cart.style.display = "none";
}

// Función para mostrar/ocultar el GIF de carga
function loadingGIF(show) {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (show) {
    loadingOverlay.classList.remove("loading-hidden");
    loadingOverlay.classList.add("visible");
  } else {
    loadingOverlay.classList.remove("visible");
    loadingOverlay.classList.add("loading-hidden");
  }
}

// Función de validación genérica de valores y tipos de campo
function validarCampo(tipo, valor) {
  valor = valor.trim();
  const validadores = {
    string: (v) => v.length > 0,
    numero: (v) => /^\d+$/.test(v),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    telefono: (v) => /^\d{9}$/.test(v),
    cp: (v) => /^\d{5}$/.test(v),
    password: (v) => v.length >= 6,
    fecha: (v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v), // formato MM/AA
  };
  if (!validadores[tipo]) {
    console.warn(`⚠️ Tipo de validación desconocido: "${tipo}"`);
    return true;
  }
  return validadores[tipo](valor);
}

// Función para obtener el total a pagar
function totalPagar() {
  const total = localStorage.getItem("total_price") || "0.00";
  return total;
}

function showError(message) {
  const errorBox = document.querySelector(".error-message");
  const errorMessage = document.getElementById("error-message-text");
  errorMessage.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  const errorBox = document.querySelector(".error-message");
  errorBox.hidden = true;
}

document.getElementById("close-error")?.addEventListener("click", hideError);

document.addEventListener("DOMContentLoaded", () => {
  const btnPagar = document.querySelector(".btn-pagar");
  // Secciones de pago
  const tarjetaSection = document.querySelector(".tarjeta-info");
  const paypalSection = document.querySelector(".paypal");
  const efectivoSection = document.querySelector(".efectivo-info");
  const tarjetaInputs = tarjetaSection.querySelectorAll("input");
  const paypalInputs = paypalSection.querySelectorAll("input");
  const efectivoInputs = efectivoSection.querySelectorAll("input");

  // Actualiza el total al cargar la página
  document.getElementById(
    "totalPriceCheckout"
  ).textContent = `${totalPagar()} €`;

  // Función para mostrar/ocultar secciones y gestionar required
  function togglePaymentSection(metodo) {
    tarjetaSection.style.display = "none";
    paypalSection.style.display = "none";
    efectivoSection.style.display = "none";

    // Quitar required de todos los inputs
    [...tarjetaInputs, ...paypalInputs, ...efectivoInputs].forEach(
      (i) => (i.required = false)
    );

    // Mostrar sección seleccionada y activar required
    if (metodo === "tarjeta-info") {
      tarjetaSection.style.display = "grid";
      tarjetaInputs.forEach((i) => (i.required = true));
    } else if (metodo === "paypal") {
      paypalSection.style.display = "grid";
      paypalInputs.forEach((i) => (i.required = true));
    } else if (metodo === "efectivo-info") {
      efectivoSection.style.display = "grid";
    }
  }

  // Manejo de cambio en los radios
  document.querySelectorAll('input[name="pago"]').forEach((radio) => {
    radio.addEventListener("change", (e) =>
      togglePaymentSection(e.target.value)
    );
  });

  // Inicializar la sección según el radio seleccionado al cargar
  togglePaymentSection(
    document.querySelector('input[name="pago"]:checked').value
  );

  // Clic en "Realizar pago"
  btnPagar.addEventListener("click", (e) => {
    e.preventDefault();
    hideError(); // Ocultar errores previos

    // Validar todos los campos visibles
    const data = {};
    let hasError = false;

    document.querySelectorAll("[data-field]").forEach((input) => {
      if (input.offsetParent === null) return; // Saltar campos ocultos
      const key = input.dataset.field;
      const value = input.value.trim();
      const tipo = input.dataset.type || "string";

      if (!validarCampo(tipo, value)) {
        hasError = true;
        input.classList.add("error");
      } else {
        input.classList.remove("error");
        data[key] = value;
      }
    });

    if (hasError) {
      showError(
        "Por favor, completa todos los campos obligatorios correctamente."
      );
      return; // Detener el flujo si hay errores
    }

    // Si no hay errores, mostrar spinner y procesar
    loadingGIF(true);

    // Enviar datos a procesar al backend
    // GUARDAR PEDIDO, USUARIO, PEDIDOS_PRODUCTOS, RESTAR STOCK PRODUCTO, ...
    // Orden lógico de inserts:
    // usuarios;
    // pedidos;
    // pedidos_productos;
    // valoraciones; Pendiente!!!!....................



    // Simular procesamiento 
    setTimeout(() => {
      loadingGIF(false); // Ocultar spinner
      console.log("Datos válidos:", data);

      // Limpiar carrito y mostrar confirmación
      localStorage.removeItem("cart_items");
      localStorage.removeItem("total_price");

      // Mostrar mensaje de confirmación
      const mensajeConfirmacion = document.getElementById(
        "mensaje-confirmacion"
      );
      mensajeConfirmacion.classList.remove("confirmacion-oculta");
      mensajeConfirmacion.classList.add("visible");
    }, 3000); // Simular 3 segundos de procesamiento
  });
});


// INSERTS USUARIO
async function registrarUsuario(event) {
  event.preventDefault();
  const formData = {
    nombre: document.getElementById("nombre").value,
    apellidos: document.getElementById("apellidos").value,
    email: document.getElementById("email").value,
    contrasenya: document.getElementById("contrasenya").value,
    telefono: document.getElementById("telefono").value,
    direccion: document.getElementById("direccion").value,
    cp: document.getElementById("cp").value,
  };

  // Validar campos obligatorios
  if (!formData.nombre || !formData.apellidos || !formData.email || !formData.contrasenya) {
    showError("Por favor, completa todos los campos obligatorios.");
    return;
  }

  try {
    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        showError(errorData.error || "Contraseña incorrecta.");
      } else {
        throw new Error(`Error al procesar el usuario: ${response.statusText}`);
      }
      return;
    }

    const { id_usuario } = await response.json();
    // Guardar el ID del usuario en localStorage
    localStorage.setItem("id_usuario", id_usuario);

    // Continuar con el registro del pedido
    await registrarPedido();
  } catch (error) {
    console.error("Error:", error);
    showError("Hubo un error al procesar el usuario. Inténtalo de nuevo.");
  }
}

// INSERT PEDIDOS
async function registrarPedido() {
  // Obtener el ID del usuario de localStorage
  const id_usuario = localStorage.getItem("id_usuario");
  if (!id_usuario) {
    showError("Debes iniciar sesión para realizar un pedido.");
    return;
  }

  // Obtener el total del carrito
  const total = parseFloat(localStorage.getItem("total_price")) || 0;
  if (total <= 0) {
    showError("El total del pedido no es válido.");
    return;
  }

  // Obtener los productos del carrito con sus cantidades y precios
  const productos = getCart();
  if (productos.length === 0) {
    showError("No hay productos en el carrito.");
    return;
  }

  // Preparar los datos para el backend
  const pedidoData = {
    id_usuario: parseInt(id_usuario),
    total,
    productos: productos.map((producto) => ({
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio,
    })),
  };

  console.log("Datos del pedido:", pedidoData); // Verificar los datos antes de enviarlos

  try {
    const response = await fetch("/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedidoData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error al registrar el pedido: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Pedido registrado:", result);

    // Limpiar el carrito y mostrar mensaje de éxito
    localStorage.removeItem("cart_items");
    localStorage.removeItem("total_price");
    alert("Pedido registrado correctamente.");
  } catch (error) {
    console.error("Error:", error);
    showError(error.message || "Hubo un error al registrar el pedido. Inténtalo de nuevo.");
  }
}








// Disparadores click al crear el checkout
document.querySelector(".btn-pagar").addEventListener("click", registrarUsuario);


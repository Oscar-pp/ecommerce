// Oculto icono del carrito en la página del carrito
  if (window.location.pathname.includes("/checkout")) {
    const cart = document.querySelector(".header-actions #cart");
    if (cart) cart.style.display = "none";
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

// Función para obtener el total a pagar y limpiar el almacenamiento
// para que sea invisible el valor al cargar el /checkout
function totalPagar(){
  const total = localStorage.getItem("total_price") || "0.00";
  localStorage.removeItem("total_price");
  return total;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnPagar = document.querySelector(".btn-pagar");

  // Secciones de pago
  const tarjetaSection = document.querySelector(".tarjeta-info");
  const paypalSection = document.querySelector(".paypal");
  const efectivoSection = document.querySelector(".efectivo-info");

  const tarjetaInputs = tarjetaSection.querySelectorAll("input");
  const paypalInputs = paypalSection.querySelectorAll("input");
  const efectivoInputs = efectivoSection.querySelectorAll("input");

  // Función para mostrar/ocultar secciones y gestionar required
  function togglePaymentSection(metodo) {
    // Ocultar todas
    tarjetaSection.style.display = "none";
    paypalSection.style.display = "none";
    efectivoSection.style.display = "none";

    // Quitar required de todos los inputs
    [...tarjetaInputs, ...paypalInputs, ...efectivoInputs].forEach(
      (i) => (i.required = false)
    );

    // Mostrar sección seleccionada y activar required en sus inputs
    if (metodo === "tarjeta-info") {
      tarjetaSection.style.display = "grid";
      tarjetaInputs.forEach((i) => (i.required = true));
    } else if (metodo === "paypal") {
      paypalSection.style.display = "grid";
      paypalInputs.forEach((i) => (i.required = true));
    } else if (metodo === "efectivo-info") {
      efectivoSection.style.display = "grid";
      // no required
    }


    document.getElementById("totalPriceCheckout").textContent = totalPagar();
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

    // Ocultar el mensaje de confirmación al iniciar
    const mensaje = document.getElementById("mensaje-confirmacion");
    mensaje.classList.add("confirmacion-oculta");

    const data = {};
    let hasError = false;

    document.querySelectorAll("[data-field]").forEach((input) => {
      // Solo validar campos visibles
      if (input.offsetParent === null) return;

      const key = input.dataset.field;
      const value = input.value.trim();
      const tipo = input.dataset.type || "string";

      if (!validarCampo(tipo, value)) {
        hasError = true;
        input.classList.add("error");
        console.error(`Error: El campo "${key}" no es válido (${tipo}).`);
      } else {
        input.classList.remove("error");
        data[key] = value;
      }
    });

    if (hasError) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    console.log("Datos válidos:", data);
    document
      .getElementById("mensaje-confirmacion")
      .classList.remove("confirmacion-oculta");
  });
});


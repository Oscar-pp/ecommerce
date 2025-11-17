import { getCart } from "./cart.js";

/* ---------------------------
   Utilidades y helpers
--------------------------- */
function loadingGIF(show) {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) return;
  overlay.classList.toggle("visible", show);
  overlay.classList.toggle("loading-hidden", !show);
}

function validarCampo(tipo, valor) {
  valor = String(valor || "").trim();
  const reglas = {
    string: v => v.length > 0,
    numero: v => /^\d+$/.test(v),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    telefono: v => /^\d{9}$/.test(v),
    cp: v => /^\d{5}$/.test(v),
    password: v => v.length >= 6,
    fecha: v => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v),
  };
  return reglas[tipo] ? reglas[tipo](valor) : true;
}

function totalPagar() {
  return localStorage.getItem("total_price") || "0.00";
}

function showError(msg) {
  const box = document.querySelector(".error-message");
  if (!box) {
    alert(msg);
    return;
  }
  const text = document.getElementById("error-message-text");
  if (text) text.textContent = msg;
  box.hidden = false;
}

function hideError() {
  const box = document.querySelector(".error-message");
  if (box) box.hidden = true;
}

document.getElementById("close-error")?.addEventListener("click", hideError);

/* ---------------------------
   DOMContentLoaded - inicialización
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const tarjetaSection = document.querySelector(".tarjeta-info");
  const paypalSection = document.querySelector(".paypal");
  const efectivoSection = document.querySelector(".efectivo-info");

  const tarjetaInputs = tarjetaSection ? tarjetaSection.querySelectorAll("input, select, textarea") : [];
  const paypalInputs = paypalSection ? paypalSection.querySelectorAll("input, select, textarea") : [];
  const efectivoInputs = efectivoSection ? efectivoSection.querySelectorAll("input, select, textarea") : [];

  const totalElem = document.getElementById("totalPriceCheckout");
  if (totalElem) totalElem.textContent = `${totalPagar()} €`;

  function togglePaymentSection(metodo) {
    if (tarjetaSection) tarjetaSection.style.display = "none";
    if (paypalSection) paypalSection.style.display = "none";
    if (efectivoSection) efectivoSection.style.display = "none";

    [...tarjetaInputs, ...paypalInputs, ...efectivoInputs].forEach(i => i.required = false);

    if (metodo === "tarjeta-info" && tarjetaSection) {
      tarjetaSection.style.display = "grid";
      tarjetaInputs.forEach(i => i.required = true);
    } else if (metodo === "paypal" && paypalSection) {
      paypalSection.style.display = "grid";
      paypalInputs.forEach(i => i.required = true);
    } else if (metodo === "efectivo-info" && efectivoSection) {
      efectivoSection.style.display = "grid";
      efectivoInputs.forEach(i => i.required = true);
    }
  }

  document.querySelectorAll('input[name="pago"]').forEach(radio => {
    radio.addEventListener("change", e => togglePaymentSection(e.target.value));
  });

  const checkedRadio = document.querySelector('input[name="pago"]:checked');
  togglePaymentSection(checkedRadio ? checkedRadio.value : null);

  const btnPagar = document.querySelector(".btn-pagar");
  if (btnPagar) btnPagar.addEventListener("click", procesarCheckout);
});

/* ---------------------------
   Flujo principal: registro usuario + pedido
--------------------------- */
async function procesarCheckout(e) {
  e.preventDefault();
  hideError();

  const data = {};
  let hasError = false;

  document.querySelectorAll("[data-field]").forEach(input => {
    if (input.offsetParent === null) return;
    const key = input.dataset.field;
    const tipo = input.dataset.type || "string";
    const value = (input.value || "").trim();

    if (!validarCampo(tipo, value)) {
      hasError = true;
      input.classList.add("error");
    } else {
      input.classList.remove("error");
      data[key] = value;
    }
  });

  if (hasError) {
    showError("Por favor, completa todos los campos obligatorios correctamente.");
    return;
  }

  loadingGIF(true);

  try {
    // 1) Registrar o reutilizar usuario
    const id_usuario = await registrarUsuario(data);

    // 2) Registrar pedido
    const pedidoRes = await registrarPedido(id_usuario);

    if (pedidoRes && pedidoRes.success) {
      localStorage.removeItem("cart_items");
      localStorage.removeItem("total_price");

      const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");
      if (mensajeConfirmacion) {
        mensajeConfirmacion.classList.remove("confirmacion-oculta");
        mensajeConfirmacion.classList.add("visible");
      }
    } else {
      throw new Error(pedidoRes?.error || "Error procesando el pedido");
    }
  } catch (err) {
    console.error("Error checkout:", err);
    showError(err.message || "Error al procesar el pedido.");
  } finally {
    loadingGIF(false);
  }
}

/* ---------------------------
   API: registrar usuario
--------------------------- */
async function registrarUsuario(formData) {
  const payload = {
    nombre: formData.nombre || "",
    apellidos: formData.apellidos || "",
    email: formData.email || "",
    contrasenya: formData.contrasenya || "",
    telefono: formData.telefono || "",
    direccion: formData.direccion || "",
    cp: formData.cp || ""
  };

  const res = await fetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error registrando usuario");

  return json.id_usuario;
}

/* ---------------------------
   API: registrar pedido
--------------------------- */
async function registrarPedido(id_usuario) {
  const carrito = getCart();
  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const productos = carrito.map(p => ({
    id_producto: p.id_producto,
    cantidad: p.cantidad,
    precio_unitario: p.precio
  }));

  const total = parseFloat(localStorage.getItem("total_price") || 0);

  const payload = {
    id_usuario: parseInt(id_usuario, 10),
    total,
    productos
  };

  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error registrando pedido");

  return json; // { success: true, id_pedido }
}

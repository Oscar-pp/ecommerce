const modal = document.getElementById("modalAgregar");
const abrirModal = document.getElementById("abrirModal");
const cerrarModal = document.getElementById("cerrarModal");
const mensajeExito = document.getElementById("mensajeExito");

// Abrir modal
abrirModal.onclick = () => {
  modal.style.display = "flex";
  mensajeExito.style.display = "none";
};

// Cerrar modal
cerrarModal.onclick = () => {
  modal.style.display = "none";
};

// Cerrar si se hace clic fuera
// window.onclick = (e) => {
//   if (e.target === modal) modal.style.display = "none";
// };

// Simulación de guardar producto
function guardarProducto() {
  mensajeExito.style.display = "block";
  setTimeout(() => {
    modal.style.display = "none";
  }, 1500);
}

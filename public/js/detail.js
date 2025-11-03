document.addEventListener("DOMContentLoaded", () => {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const lat = parseFloat(mapDiv.dataset.latitud);
  const lon = parseFloat(mapDiv.dataset.longitud);
  const vendedor = mapDiv.dataset.nombre;

  // Inicializar mapa
  const map = L.map("map").setView([lat, lon], 13);

  // Añadir capa base de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Añadir marcador
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`<b>${vendedor}</b><br>Ubicación del vendedor.`)
    .openPopup();
});

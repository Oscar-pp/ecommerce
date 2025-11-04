# MyShop (ecommerce)

Pequeño proyecto ecommerce construido con Htlm, Css, Javascript, Node.js, Express y un sistema de plantillas EJS. Base de datos MySql.

Intención: 
- Catálogo de productos con filtros, galería y un carrito de compra.
- Con la posibilidad de realizar el pago (simulado).
- Integración de una sección para añadir productos por parte de los vendedores registrados.

## Características principales
- Render de productos en galería dinámica.
- Filtros (precio, categoría, estrellas y búsqueda con autocompletado).
- Partial de header con logo y carrito desplegable.
- Interacciones modernas con JS (añadir al carrito, toggles, fetch a API).
- Estilos responsivos y base para UX del listado y dropdown del carrito.

## Estructura (resumen)
- views/ — plantillas EJS (partials como `header.ejs`)
- public/
  - css/style.css — estilos principales
  - js/gallery.js — lógica de galería y renderizado
  - js/cart.js — (recomendado) control del dropdown del carrito
  - img/ — imágenes (logo, capturas, productos)
- routes/ & controllers/ — endpoints API para productos y carrito
- app.js / server.js — arranque de la app

## Ejecutar localmente
1. Instalar dependencias:
   npm install
2. Variables de entorno (si aplica): crea `.env` según tu configuración (puerto, BD).
3. Levantar servidor:
   npm start
4. Abrir en el navegador:
   http://localhost:3000 (o el puerto configurado)

## Capturas / diagramas

> Estructura EER de la base de datos
![ER Diagram](/EER_Diagram.png)


> Galería principal con panel lateral de filtrado
![Galería](/gallery.png)


> Vista detalle del producto
![Vista detalle](/detail.png)


## Notas rápidas (Issues)


## Contribuir
Opiniones aceptadas gratamente. 

## Licencia
MIT

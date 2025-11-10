import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Cargar variables de entorno
dotenv.config();

// Configurar la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Express
const app = express();

// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crear un pool de conexiones
const pool = mysql.createPool(dbConfig);

// Ruta principal
app.get("/", async (req, res, next) => {
  try {
    res.render("index", {
      titulo: "MyShop - Plataforma de E-commerce",
      mensaje: "¡Bienvenido a MyShop!",
      filecss: "../css/gallery.css",
      zonaMain: "body",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/detail/:id_producto", async (req, res) => {
  try {
    const { id_producto } = req.params;
    console.log("ID recibido:", req.params.id_producto);
    // Obtenemos los productos y la ubicacion del vendedor
    const [rows] = await pool.query(
      `SELECT p.*, 
          v.nombre_tienda AS nombre_vendedor, 
          v.latitud AS lat_vendedor, 
          v.longitud AS lon_vendedor
        FROM productos p
        LEFT JOIN vendedores v ON p.id_vendedor = v.id_vendedor
        WHERE p.id_producto = ?`,
      [id_producto]
    );

    console.log("Resultado SQL:", rows);
    // Si no hay resultados
    if (!rows || rows.length === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    // Obtenemos el producto (primer resultado)
    const producto = rows[0];

    // Renderizamos la vista
    res.render("index", {
      titulo: `Detalle de ${producto.nombre}`,
      zonaMain: "detail",
      filecss: "/css/detail.css",
      producto,
    });
  } catch (error) {
    console.error("Error al cargar el detalle:", error);
    res.status(500).send("Error al cargar los datos del producto");
  }
});

app.get("/cart", async (req, res) => {
  try {    
    // Renderizamos la vista
    res.render("index", {
      titulo: `Carrito compras`,
      zonaMain: "cart",
      filecss: "/css/cart.css",
    });
  } catch (error) {
    console.error("Error al cargar el detalle:", error);
    res.status(500).send("Error al cargar los datos del producto");
  }
});

app.get("/checkout", async (req, res) => {
  try {
    res.render("index", { 
      titulo: `Realizar pago`,
      zonaMain: "checkout",
      filecss: "/css/checkout.css", 
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).send("Error realizar el checkout");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    res.render("dashboard", {
      titulo: "Dashboard",
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).send("Error al cargar dashboard");
  }
});



/*
    API 
*/

app.get("/api/productos", async (req, res) => {
  try {
    const search = req.query.search || "";

    const query = `SELECT nombre FROM productos WHERE nombre LIKE ? LIMIT 10`;
    const values = [`%${search}%`];
    const [rows] = await pool.query(query, values);

    // rows es un array de objetos { nombre: '...' }
    res.json(rows.map((row) => row.nombre));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/api/allProductos", async (req, res) => {
  try {
    const ids = req.query.ids;
    console.log(ids);
    if (!ids) {
      return res.status(400).json({ error: "Faltan IDs de productos" });
    };

    const idArray = ids.split(",").map(Number);
    console.log(idArray);
    const [productos] = await pool.query(`SELECT 
                                            p.id_producto,
                                            p.nombre AS nombre_producto,
                                            p.descripcion,
                                            p.precio,
                                            p.cantidad_disponible,
                                            p.categoria,
                                            p.imagen_url AS imagen_producto,
                                            p.star_product,
                                            v.id_vendedor,
                                            v.nombre_tienda,
                                            v.direccion_tienda,
                                            v.latitud,
                                            v.longitud,
                                            v.reputacion
                                          FROM productos p
                                          INNER JOIN vendedores v ON p.id_vendedor = v.id_vendedor
                                          WHERE p.id_producto IN (?)
                                        `, [idArray]);

      console.log(productos);

    if (!productos.length) {
      return res.status(404).json({ error: "No se encontraron productos" });
    }

    res.json(productos);
    
  } catch (error) {
    console.error("❌ Error en /api/allProductos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/api/filtrarValores", async (req, res) => {
  try {
    const { estrellas, precioMin, precioMax, nombreProducto, categoria } =
      req.query;

    const query = `
      SELECT * FROM productos
      WHERE (? = 0 OR star_product >= ?)
            AND precio BETWEEN ? AND ?
            AND nombre LIKE ?
            AND (? = '' OR categoria = ?)
          LIMIT 50
    `;
    const values = [
      parseInt(estrellas) || 0,
      parseInt(estrellas) || 0,
      parseFloat(precioMin) || 0,
      parseFloat(precioMax) || 9999999,
      `%${nombreProducto || ""}%`,
      categoria || "",
      categoria || "",
    ];

    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM productos WHERE id_producto = ?`;
    const values = [id];
    const [rows] = await pool.query(query, values);

    if (!rows || rows.length === 0) {
      return res.status(404).send("Producto no encontrado");
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});







/* 
    ZONA FINAL, Errores, Listener Server
*/

// Middleware para manejar errores 404
app.use((req, res) => {
  res.status(404).render("404", { mensaje: "Página no encontrada" });
});

// Middleware para manejar errores 500
app.use((error, req, res, next) => {
  console.error("Error 500:", error);
  res.status(500).send("Error interno del servidor");
});

// Iniciar el servidor
const PORT = process.env.PORTSERVER || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

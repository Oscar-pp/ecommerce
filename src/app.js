import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import upload from "./multer.js";
// import { mostrarMensaje } from "../public/js/admin.js";

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/admin", async (req, res) => {
  try {
    res.render("admin", {
      titulo: `Zona administrativa negocio`,
      zonaMain: "admin",
      filecss: "/css/admin.css",
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).send("Error al cargar admin");
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
    }

    const idArray = ids.split(",").map(Number);
    console.log(idArray);
    const [productos] = await pool.query(
      `SELECT 
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
                                        `,
      [idArray]
    );

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
 
app.get("/api/todosProductos", async (req, res) => {
  const id_vendedor = req.query.id_vendedor; 
  try {
    const [productos] = await pool.query(`SELECT * FROM productos WHERE id_vendedor = ?`, id_vendedor);
    res.json(productos);
  } catch (error) {
    console.error(error);
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

// -------------------------------
// INSERT / UPDATE PRODUCTO ADMIN
// -------------------------------
app.post("/api/producto/save", upload.single("imagen"), async (req, res) => {
  try {
    const {
      modo,
      id_producto,
      id_vendedor,
      nombre,
      descripcion,
      categoria,
      precio,
      uds,
      imagen_actual
    } = req.body;
console.log(req.body);
console.log(req.file);
    // Validar que los valores numéricos sean correctos
    const idProd = id_producto ? Number(id_producto) : 0;
    // const idVendedor = Number(id_vendedor);
    const cantidad = Number(uds);
    const precioNum = Number(precio);

    // Validar que los valores numéricos no sean NaN
    if (isNaN(id_vendedor) || isNaN(cantidad) || isNaN(precioNum)) {
      console.error("Valores numéricos inválidos:", { id_vendedor, cantidad, precioNum });
      return res.status(400).json({ error: "Los valores numéricos no son válidos." });
    }

    // Determinar imagen a usar
    let imagen = imagen_actual; // imagen actual por defecto
    if (req.file) imagen = req.file.filename; // si sube archivo nuevo

    if (modo === "insert" || idProd === 0) {
      // INSERT
      const sql = `
        INSERT INTO productos
        (id_vendedor, nombre, descripcion, categoria, precio, cantidad_disponible, imagen_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      console.log("id del vendedor es : " , id_vendedor);
      await pool.query(sql, [
        id_vendedor,
        nombre,
        descripcion,
        categoria,
        precioNum,
        cantidad,
        imagen
      ]);
      return res.json({ message: "Producto insertado correctamente" , tipo: "success"});
    }

    if (modo === "update" && idProd > 0) {
      // UPDATE
      const sql = `
        UPDATE productos SET
        nombre=?, descripcion=?, categoria=?, precio=?, cantidad_disponible=?, imagen_url=?
        WHERE id_producto=?
      `;
      await pool.query(sql, [
        nombre,
        descripcion,
        categoria,
        precioNum,
        cantidad,
        imagen,
        idProd
      ]);
      return res.json({ message: "Producto actualizado correctamente" });
    }

    return res.status(400).json({ error: "Petición no válida" });
  } catch (err) {
    console.error("Error al guardar producto:", err);
    res.status(500).json({ error: "Error al guardar producto" });
  }
});

app.delete("/api/producto/delete", async (req, res) => {
  try {
    const { id_producto } = req.body;

    if (!id_producto) {
      return res.status(400).json({ error: "ID de producto no proporcionado." });
    }

    // Eliminar el producto
    await pool.query("DELETE FROM productos WHERE id_producto = ?", [id_producto]);

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});












/* -----------------------------------------------------
  INSERT UPDATE DE USUARIO Y AÑADIR A PEDIDOS REALIZADOS
  ------------------------------------------------------*/
// Endpoint para registrar un usuario
app.post("/api/usuarios", async (req, res) => {
  const { nombre, apellidos, email, contrasenya, telefono, direccion, cp } = req.body;

  try {
    // Verificar si el email ya existe
    const [existingUsers] = await pool.query(
      "SELECT id_usuario, contraseña FROM usuarios WHERE email = ?",
      [email]
    );

    let id_usuario;

    if (existingUsers.length > 0) {
      // El usuario ya existe, validar la contraseña
      const user = existingUsers[0];
      const isPasswordValid = await bcrypt.compare(contrasenya, user.contraseña);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      // Si la contraseña es válida, usar el ID del usuario existente
      id_usuario = user.id_usuario;
    } else {
      // El usuario no existe, registrarlo
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(contrasenya, saltRounds);

      const [result] = await pool.query(
        "INSERT INTO usuarios (nombre, apellidos, email, contraseña, telefono, direccion, cp) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [nombre, apellidos, email, hashedPassword, telefono, direccion, cp]
      );

      id_usuario = result.insertId;
    }

    // Devolver el ID del usuario (existente o recién registrado)
    res.status(200).json({ id_usuario });
  } catch (error) {
    console.error("Error al manejar el usuario:", error);
    res.status(500).json({ error: "Error al procesar el usuario." });
  }
});

// Endpoint para registrar un pedido
app.post("/api/pedidos", async (req, res) => {
  // 1. Obtener los datos del cuerpo de la solicitud
  const { id_usuario, total, productos } = req.body;

  // 2. Validar que los datos requeridos estén presentes
  if (!id_usuario || !total || !productos || !Array.isArray(productos)) {
    return res.status(400).json({
      error: "Faltan datos requeridos o el formato de los productos es inválido."
    });
  }

  // 3. Validar que el array de productos no esté vacío
  if (productos.length === 0) {
    return res.status(400).json({
      error: "No se pueden registrar pedidos sin productos."
    });
  }

  // 4. Obtener una conexión del pool y comenzar una transacción
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 5. Insertar el pedido en la tabla `pedidos`
    const [pedidoResult] = await connection.query(
      "INSERT INTO pedidos (id_usuario, total, estado) VALUES (?, ?, 'pendiente')",
      [id_usuario, total]
    );
    const id_pedido = pedidoResult.insertId;

    // 6. Insertar cada producto en la tabla `pedidos_productos`
    for (const producto of productos) {
      const { id_producto, cantidad, precio_unitario } = producto;

      // Validar que los datos del producto estén completos
      if (!id_producto || !cantidad || !precio_unitario) {
        await connection.rollback();
        return res.status(400).json({
          error: `Datos incompletos para el producto con ID ${id_producto}.`
        });
      }

      // Insertar el producto en `pedidos_productos`
      await connection.query(
        "INSERT INTO pedidos_productos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [id_pedido, id_producto, cantidad, precio_unitario]
      );
    }

    // 7. Confirmar la transacción si todo salió bien
    await connection.commit();
    res.status(201).json({
      id_pedido,
      message: "Pedido registrado correctamente."
    });
  } catch (error) {
    // 8. Revertir la transacción si ocurre un error
    await connection.rollback();
    console.error("Error al registrar el pedido:", error);
    res.status(500).json({
      error: "Ocurrió un error al registrar el pedido. Inténtalo de nuevo."
    });
  } finally {
    // 9. Liberar la conexión de vuelta al pool
    connection.release();
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

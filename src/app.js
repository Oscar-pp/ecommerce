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
      hideNavbar: false,
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
      hideNavbar: true,
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
      hideNavbar: true,
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
      hideNavbar: true,
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

app.get("/login", async (req, res) => {
  try {
    res.render("login", {
      titulo: `Login`,
      filecss: "/css/login.css",
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).send("Error al cargar login");
  }
});

app.get("/register", async (req, res) => {
  try {
    res.render("register", {
      titulo: "Register",
      filecss: "/css/register.css",
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.status(500).send("Error al cargar register");
  }
});

/*
    API 
*/

app.post("/api/register", async (req, res) => {
  const { nombre_tienda, password, direccion, descripcion } = req.body;

  try {
    if (!nombre_tienda || !password || !direccion || !descripcion) {
      return res.render("register", {
        error: "Todos los campos son obligatorios",
        nombre_tienda,
        direccion,
        descripcion,
      });
    }

    const [tienda] = await pool.query(
      "SELECT id_vendedor FROM vendedores WHERE nombre_tienda = ?",
      [nombre_tienda]
    );

    if (tienda.length > 0) {
      return res.render("register", {
        error: "El nombre de tienda ya está registrado. Elige otro.",
        nombre_tienda,
        direccion,
        descripcion,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO vendedores (nombre_tienda, password, direccion_tienda, descripcion)
       VALUES (?, ?, ?, ?)`,
      [nombre_tienda, hashedPassword, direccion, descripcion]
    );

    res.redirect("/api/login");
  } catch (err) {
    console.error("Error en registro de vendedor:", err);
    res.render("register", {
      error: "Error interno del servidor. Inténtalo de nuevo.",
      nombre_tienda,
      direccion,
      descripcion,
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { nombreEmpresa, password } = req.body;

  // Validación de campos obligatorios
  if (!nombreEmpresa || !password) {
    return res.render("login", {
      titulo: "Login",
      filecss: "/css/login.css",
      error: "Todos los campos son obligatorios"
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_vendedor, password FROM vendedores WHERE nombre_tienda = ?",
      [nombreEmpresa]
    );

    if (rows.length === 0) {
      return res.render("login", {
        titulo: "Login",
        filecss: "/css/login.css",
        error: "Vendedor no encontrado"
      });
    }

    const vendedor = rows[0];
    const passwordMatch = await bcrypt.compare(password, vendedor.password);

    if (!passwordMatch) {
      return res.render("login", {
        titulo: "Login",
        filecss: "/css/login.css",
        error: "Contraseña incorrecta"
      });
    }

    // Login correcto → render de redirección
    res.render("login-success", {
      vendedorId: vendedor.id_vendedor,
      nombreEmpresa
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.render("login", {
      titulo: "Login",
      filecss: "/css/login.css",
      error: "Error interno del servidor. Inténtalo de nuevo."
    });
  }
});


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
    const [productos] = await pool.query(
      `SELECT * FROM productos WHERE id_vendedor = ?`,
      id_vendedor
    );
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

app.post("/api/pedido", async (req, res) => {
  const { usuarioId, carrito, total, datos } = req.body;

  if (!usuarioId || !Array.isArray(carrito) || carrito.length === 0) {
    return res.json({ success: false, message: "Datos incompletos para procesar el pedido." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insertar pedido
    const [pedidoResult] = await conn.query(
      "INSERT INTO pedidos (id_usuario, total, fecha) VALUES (?, ?, NOW())",
      [usuarioId, total]
    );
    const pedidoId = pedidoResult.insertId;

    // Insertar productos del pedido y actualizar stock
    for (const item of carrito) {
      // Insertar en pedidos_productos
      await conn.query(
        "INSERT INTO pedidos_productos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [pedidoId, item.id, item.cantidad, item.precio]
      );

      // Restar stock
      await conn.query(
        "UPDATE productos SET stock = stock - ? WHERE id_producto = ?",
        [item.cantidad, item.id]
      );
    }

    await conn.commit();
    res.json({ success: true, pedidoId });
  } catch (err) {
    await conn.rollback();
    console.error("Error procesando pedido:", err);
    res.json({ success: false, message: "Error interno del servidor al procesar el pedido." });
  } finally {
    conn.release();
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
      imagen_actual,
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
      console.error("Valores numéricos inválidos:", {
        id_vendedor,
        cantidad,
        precioNum,
      });
      return res
        .status(400)
        .json({ error: "Los valores numéricos no son válidos." });
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
      console.log("id del vendedor es : ", id_vendedor);
      await pool.query(sql, [
        id_vendedor,
        nombre,
        descripcion,
        categoria,
        precioNum,
        cantidad,
        imagen,
      ]);
      return res.json({
        message: "Producto insertado correctamente",
        tipo: "success",
      });
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
        idProd,
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
      return res
        .status(400)
        .json({ error: "ID de producto no proporcionado." });
    }

    // Eliminar el producto
    await pool.query("DELETE FROM productos WHERE id_producto = ?", [
      id_producto,
    ]);

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
console.log(req.body);
console.log(nombre, apellidos, email, contrasenya);
  try {
    // ¿El email ya existe?
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    // Si existe → devolver id_usuario
    if (rows.length > 0) {
      return res.json({ id_usuario: rows[0].id_usuario });
    }

    // Si no existe → crear usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, apellidos, email, contrasenya, telefono, direccion, cp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos, email, contrasenya, telefono, direccion, cp]
    );

    res.json({ id_usuario: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario." });
  }
});


// Endpoint para registrar un pedido
app.post("/api/pedidos", async (req, res) => {
  const { id_usuario, total, productos } = req.body;

  if (!id_usuario || !productos || productos.length === 0) {
    return res.status(400).json({ error: "Datos incompletos." });
  }

  try {
    // Crear pedido
    const [pedido] = await pool.query(
      "INSERT INTO pedidos (id_usuario, total, fecha_pedido) VALUES (?, ?, NOW())",
      [id_usuario, total]
    );

    const id_pedido = pedido.insertId;

    // Insertar productos y restar stock
    for (const p of productos) {
      // Insertar producto del pedido
      await pool.query(
        "INSERT INTO pedidos_productos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [id_pedido, p.id_producto, p.cantidad, p.precio_unitario]
      );

      // Restar stock
      await pool.query(
        "UPDATE productos SET cantidad_disponible = cantidad_disponible - ? WHERE id_producto = ?",
        [p.cantidad, p.id_producto]
      );
    }

    res.json({ success: true, id_pedido });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registrando pedido." });
  }
});


/* 
    ZONA FINAL, Errores, Listener Server
*/

// Middleware para manejar errores 404
app.use((req, res) => {
  res.status(404).render("404", {
    titulo: "Página no encontrada",
    mensaje: "¡Bienvenido a MyShop!",
    filecss: "../css/gallery.css",
    hideNavbar: true,
  });
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

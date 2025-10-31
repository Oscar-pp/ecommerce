import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';


// Cargar variables de entorno
dotenv.config();

// Configurar la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Express
const app = express();

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log(dbConfig);
// Crear un pool de conexiones
const pool = mysql.createPool(dbConfig);

// Ruta principal
app.get('/', async (req, res, next) => {
  try {
    res.render('index', {
      titulo: 'MyShop - Plataforma de E-commerce',
      mensaje: '¡Bienvenido a MyShop!'
    });
  } catch (error) {
    next(error);
  }
});

app.get('/checkout', async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT * FROM Productos');
        res.render('checkout', { productos });
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error realizar el checkout');
    }
});


app.get('/detail', async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT * FROM Productos');
        res.render('producto_detalle', { productos });
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error al cargar los productos');
    }
});

app.get('/gallery', async (req,res) => {
    try {
        res.render('cliente_catalogo', {
            titulo: "Cliente"
        });
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error al cargar los productos');
    }
});

app.get('/dashboard', async (req,res) => {
    try {
        res.render('dashboard', {
            titulo: "Dashboard"
        });
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error al cargar dashboard');
    }
});

/*
    API 
*/

app.get('/api/productos', async (req, res) => {
  try {
    const search = req.query.search || '';

    const query = `SELECT nombre FROM productos WHERE nombre LIKE ? LIMIT 10`;
    const values = [`%${search}%`];
    const [rows] = await pool.query(query, values);

    // rows es un array de objetos { nombre: '...' }
    res.json(rows.map(row => row.nombre));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/filtrarValores', async (req, res) => {
  try {
    const { estrellas, precio, nombreProducto, categoria } = req.query;

    console.log("Categoría:",categoria);
    console.log("Estrellas:", estrellas);
    console.log("Precio:", precio);
    console.log("Nombre:", nombreProducto);

    // Aquí haces tu consulta SQL usando los valores recibidos
    // Ejemplo (MySQL con placeholders):
    const query = `
      SELECT * FROM productos
      WHERE (? = 0 OR star_product >= ?)
            AND precio >= ?
            AND nombre LIKE ?
            AND (? = '' OR categoria = ?)
          LIMIT 50
    `;
    const values = [
      parseInt(estrellas), parseInt(estrellas),
      parseFloat(precio),
      `%${nombreProducto}%`,
      categoria, categoria
    ];

    const [rows] = await pool.query(query, values);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});







/* 
    ZONA FINAL, Errores, Listener Server
*/

// Middleware para manejar errores 404
app.use((req, res) => {
    res.status(404).render('404', { mensaje: 'Página no encontrada' });
});

// Middleware para manejar errores 500
app.use((error, req, res, next) => {
    console.error('Error 500:', error);
    res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor
const PORT = process.env.PORTSERVER || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

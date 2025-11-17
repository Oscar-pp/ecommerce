CREATE DATABASE  IF NOT EXISTS `ecommerce` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ecommerce`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','completado','cancelado') DEFAULT 'pendiente',
  `total` decimal(10,2) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_ultima_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pedido`),
  KEY `idx_usuario` (`id_usuario`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (7,9,'2025-11-17 19:03:40','pendiente',1749.95,'2025-11-17 19:03:40','2025-11-17 19:03:40'),(8,10,'2025-11-17 19:10:12','pendiente',1749.95,'2025-11-17 19:10:12','2025-11-17 19:10:12');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos_productos`
--

DROP TABLE IF EXISTS `pedidos_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos_productos` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_ultima_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_detalle`),
  KEY `idx_pedido` (`id_pedido`),
  KEY `idx_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos_productos`
--

LOCK TABLES `pedidos_productos` WRITE;
/*!40000 ALTER TABLE `pedidos_productos` DISABLE KEYS */;
INSERT INTO `pedidos_productos` VALUES (16,7,1,5,29.99,'2025-11-17 19:03:40','2025-11-17 19:03:40'),(17,8,1,5,29.99,'2025-11-17 19:10:12','2025-11-17 19:10:12'),(18,8,5,1,650.00,'2025-11-17 19:10:12','2025-11-17 19:10:12'),(19,8,4,1,450.00,'2025-11-17 19:10:12','2025-11-17 19:10:12'),(20,8,16,1,500.00,'2025-11-17 19:10:12','2025-11-17 19:10:12');
/*!40000 ALTER TABLE `pedidos_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_vendedor` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `cantidad_disponible` int NOT NULL DEFAULT '0',
  `categoria` varchar(50) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_publicacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_ultima_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `star_product` tinyint DEFAULT '0',
  PRIMARY KEY (`id_producto`),
  KEY `idx_vendedor` (`id_vendedor`),
  CONSTRAINT `fk_producto_vendedor` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedores` (`id_vendedor`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,1,'Libro JavaScript','Guía completa para aprender JS desde cero.',29.99,5,'Tecnología','libro_js.jpg','2025-11-03 18:57:53','2025-11-03 18:57:53','2025-11-17 19:13:57',1),(4,1,'TV 43\'\' curva','Televisión pantalla Led de 43\'\' curva con dolby sorround',450.00,4,'Tecnología','tv43.jpg','2025-11-03 19:02:13','2025-11-03 19:02:13','2025-11-17 19:10:12',5),(5,1,'Roomba','Limpia y frega automáticamente',650.00,2,'Tecnología','roomba.jpg','2025-11-07 09:41:04','2025-11-07 09:41:04','2025-11-17 19:10:12',4),(9,2,'Libro Python','libro',13.00,13,'Cultura','1763145004840.jpg','2025-11-14 21:05:37','2025-11-14 21:05:37','2025-11-15 20:11:06',4),(11,2,'Libro python','Libro python molón',45.00,98,'Cultura','1763208127730.webp','2025-11-15 13:02:07','2025-11-15 13:02:07','2025-11-15 20:11:06',3),(12,2,'Monitor 27\'\'','Monitor led. Nuevo de trinca',120.00,11,'Tecnología','1763208799170.avif','2025-11-15 13:13:19','2025-11-15 13:13:19','2025-11-15 20:11:06',2),(13,2,'Batidora 500w','Batidora de ultima generación con aspas de acero inox . 5000 revoluciones y 500w de potencia. ',40.00,202,'Hogar','1763209531319.jpg_md','2025-11-15 13:25:31','2025-11-15 13:25:31','2025-11-15 20:11:06',4),(16,2,'Producto2','Producto2 caro',500.00,3,'Tecnología','1763227561680.jpg','2025-11-15 18:26:01','2025-11-15 18:26:01','2025-11-17 19:10:12',3),(18,2,'Producto 5','producto3',4534.00,444,'Cultura','1763230680060.jpg','2025-11-15 19:18:00','2025-11-15 19:18:00','2025-11-15 20:18:35',0),(21,2,'Producto1','Producto1',3.00,4,'Hogar','1763235198754.jpg','2025-11-15 20:33:18','2025-11-15 20:33:18','2025-11-15 20:33:18',0),(22,2,'Producto4','Es un producto 3 pero mejorado',7.00,4,'Tecnología','1763237183506.jpg','2025-11-15 21:06:08','2025-11-15 21:06:08','2025-11-15 21:06:23',0),(23,2,'Bufanda','Bufanda de algodón de piel de rana totalmente acabada y con wifi. Se adapta a cualquier medida de cama',1.00,1,'Hogar','1763311005370.jpeg','2025-11-16 17:36:45','2025-11-16 17:36:45','2025-11-16 17:36:45',0),(24,1,'Pantalon tejano','Pantalon talla 12 .. es para delgaditos XD',25.00,1000,'Ropa','1763403160571.avif','2025-11-17 19:12:40','2025-11-17 19:12:40','2025-11-17 19:12:40',0),(25,1,'Pantalon de vestir','Pantalones de vestir de muchos colores',22.00,500,'Ropa','1763403218324.jpeg','2025-11-17 19:13:38','2025-11-17 19:13:38','2025-11-17 19:13:38',0);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `contrasenya` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_ultima_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cp` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (7,'Pep','Guardiola','Pep@gmail.com','12345678','555443333','Carrer la bonaigua',NULL,NULL,NULL,'2025-11-17 18:56:41','2025-11-17 18:56:41','2025-11-17 18:56:41','32423'),(8,'Elisa','Misa Felisa','elisa@gmail.com','23423235','225253252','Calle abajo 44',NULL,NULL,NULL,'2025-11-17 18:59:33','2025-11-17 18:59:33','2025-11-17 18:59:33','12545'),(9,'Enma','Garrido','enma@gmail.com','5434554','123456783','Almansa 21',NULL,NULL,NULL,'2025-11-17 19:03:40','2025-11-17 19:03:40','2025-11-17 19:03:40','45345'),(10,'Boira','Frida Kalo','frida@gmail.com','4324543','234234234','3000 viviendas',NULL,NULL,NULL,'2025-11-17 19:10:12','2025-11-17 19:10:12','2025-11-17 19:10:12','43453');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valoraciones`
--

DROP TABLE IF EXISTS `valoraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valoraciones` (
  `id_valoracion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_vendedor` int NOT NULL,
  `id_pedido` int NOT NULL,
  `puntuacion` int DEFAULT NULL,
  `comentario` text,
  `fecha_valoracion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_ultima_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_valoracion`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_vendedor` (`id_vendedor`),
  KEY `idx_pedido` (`id_pedido`),
  CONSTRAINT `fk_valoracion_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE,
  CONSTRAINT `fk_valoracion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_valoracion_vendedor` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedores` (`id_vendedor`) ON DELETE CASCADE,
  CONSTRAINT `valoraciones_chk_1` CHECK ((`puntuacion` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valoraciones`
--

LOCK TABLES `valoraciones` WRITE;
/*!40000 ALTER TABLE `valoraciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `valoraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendedores`
--

DROP TABLE IF EXISTS `vendedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendedores` (
  `id_vendedor` int NOT NULL AUTO_INCREMENT,
  `nombre_tienda` varchar(100) NOT NULL,
  `direccion_tienda` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `reputacion` decimal(3,2) DEFAULT '0.00',
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_vendedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendedores`
--

LOCK TABLES `vendedores` WRITE;
/*!40000 ALTER TABLE `vendedores` DISABLE KEYS */;
INSERT INTO `vendedores` VALUES (1,'Librería Central','Calle Mayor 1, Madrid',40.41677500,-3.70379000,'libreria_central.jpg','Especialistas en libros técnicos y de programación.',4.80,'2025-11-03 20:21:29','$2b$12$linRsbu5QneBUlaVXEfPHO/K7Zm5dmMjW9wR7WGx9HIG5Soh7I0qK'),(2,'Moda Urbana','Calle Serrano 15, Madrid',40.42175000,-3.68490000,'moda_urbana.jpg','Ropa moderna y sostenible para jóvenes.',4.50,'2025-11-03 20:21:29','$2b$12$CFflZ3tUj2IuEguHN6PPHOJ1B76EyFgXLL1I2ve16HMX.hC48obfO'),(3,'Pokemon World','Calle Balmes 4 Barcelona',NULL,NULL,NULL,'Tienda de venta/intercambio de cartas pokemon.',0.00,'2025-11-17 16:36:32','$2b$10$mYzbumdOeZUONCq5t9mQ7.3zK2lE1IHk.4iYjwE7ZqvGzds7oYlbC');
/*!40000 ALTER TABLE `vendedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ecommerce'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-17 19:19:07

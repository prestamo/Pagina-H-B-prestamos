-- =============================================
-- Script de Creación de Base de Datos: prueva
-- Objetivo: Réplica de esquema para H&B Racing
-- =============================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'prueva')
BEGIN
    CREATE DATABASE [prueva];
END
GO

USE [prueva];
GO

-- 1. Tablas de Configuración y Negocio
CREATE TABLE [negocio] (
    cod_negocio INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    rnc VARCHAR(20)
);

CREATE TABLE [usuario] (
    cod_usuario INT PRIMARY KEY IDENTITY(1,1),
    usuario VARCHAR(50) UNIQUE,
    contraseña VARCHAR(200),
    tipo_usuario VARCHAR(20),
    estado CHAR(1) DEFAULT '1'
);

-- 2. Tablas de Inventario
CREATE TABLE [categoria] (
    cod_categoria CHAR(10) PRIMARY KEY,
    descripcion VARCHAR(100),
    estado CHAR(1) DEFAULT '1'
);

CREATE TABLE [Proveedores] (
    id_proveedor INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE [Producto] (
    cod_producto CHAR(10) PRIMARY KEY,
    nombre VARCHAR(100),
    Descripcion_producto VARCHAR(200),
    stock INT DEFAULT 0,
    cod_categoria CHAR(10) REFERENCES categoria(cod_categoria),
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    id_proveedor INT REFERENCES Proveedores(id_proveedor),
    estado CHAR(1) DEFAULT '1'
);

-- 3. Tablas de Clientes y Finanzas
CREATE TABLE [cliente] (
    cod_cliente CHAR(10) PRIMARY KEY,
    nombres VARCHAR(50),
    apellidos VARCHAR(50),
    dni VARCHAR(20),
    sexo CHAR(1),
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    estado CHAR(1) DEFAULT '1'
);

CREATE TABLE [Facturas] (
    numero_factura VARCHAR(20) PRIMARY KEY,
    nombre_negocio VARCHAR(100),
    direccion_negocio VARCHAR(200),
    telefono_negocio VARCHAR(20),
    rnc_negocio VARCHAR(20),
    direccion_cliente VARCHAR(200),
    telefono_cliente VARCHAR(20),
    usuario_logueado VARCHAR(50),
    fecha DATETIME,
    cliente VARCHAR(100),
    dni_cliente VARCHAR(20),
    subtotal DECIMAL(10,2),
    itbis DECIMAL(10,2),
    total_con_descuento DECIMAL(10,2),
    descuento DECIMAL(10,2),
    monto_pagado DECIMAL(10,2),
    cambio DECIMAL(10,2)
);

CREATE TABLE [DetallesFactura] (
    id_detalle INT PRIMARY KEY IDENTITY(1,1),
    numero_factura VARCHAR(20) REFERENCES Facturas(numero_factura),
    cod_producto CHAR(10),
    nombre_producto VARCHAR(100),
    precio_venta DECIMAL(10,2),
    cantidad INT,
    total DECIMAL(10,2)
);

-- 4. Procedimientos Almacenados Core (Muestra)

GO
CREATE PROCEDURE [dbo].[insertar_cliente]
    @cod_cliente CHAR(10), @nombres VARCHAR(50), @apellidos VARCHAR(50),
    @dni VARCHAR(20), @sexo CHAR(1), @direccion VARCHAR(200), @telefeono VARCHAR(20)
AS
BEGIN
    INSERT INTO cliente (cod_cliente, nombres, apellidos, dni, sexo, direccion, telefono, estado)
    VALUES (@cod_cliente, @nombres, @apellidos, @dni, @sexo, @direccion, @telefeono, '1');
END
GO

CREATE PROCEDURE [dbo].[insertar_producto]
    @cod_producto CHAR(10) OUTPUT, @nombre VARCHAR(100), @Description_producto VARCHAR(200),
    @stock INT, @cod_categoria CHAR(10), @precio_compra DECIMAL(10,2), 
    @precio_venta DECIMAL(10,2), @id_proveedor INT
AS
BEGIN
    -- Lógica simple de generación de código si no existe
    DECLARE @max INT;
    SELECT @max = ISNULL(MAX(CAST(SUBSTRING(cod_producto, 4, 7) AS INT)), 0) FROM Producto;
    SET @cod_producto = 'PRO' + RIGHT('0000000' + CAST(@max + 1 AS VARCHAR), 7);
    
    INSERT INTO Producto (cod_producto, nombre, Descripcion_producto, stock, cod_categoria, precio_compra, precio_venta, id_proveedor, estado)
    VALUES (@cod_producto, @nombre, @Description_producto, @stock, @cod_categoria, @precio_compra, @precio_venta, @id_proveedor, '1');
END
GO

CREATE PROCEDURE [dbo].[InsertarFactura]
    @numero_factura VARCHAR(20), @nombre_negocio VARCHAR(100), @direccion_negocio VARCHAR(200),
    @telefono_negocio VARCHAR(20), @rnc_negocio VARCHAR(20), @direccion_cliente VARCHAR(200),
    @telefono_cliente VARCHAR(20), @usuario_logueado VARCHAR(50), @fecha DATETIME,
    @cliente VARCHAR(100), @dni_cliente VARCHAR(20), @subtotal DECIMAL(10,2),
    @itbis DECIMAL(10,2), @total_con_descuento DECIMAL(10,2), @descuento DECIMAL(10,2),
    @monto_pagado DECIMAL(10,2), @cambio DECIMAL(10,2)
AS
BEGIN
    INSERT INTO Facturas (numero_factura, nombre_negocio, direccion_negocio, telefono_negocio, rnc_negocio, direccion_cliente, telefono_cliente, usuario_logueado, fecha, cliente, dni_cliente, subtotal, itbis, total_con_descuento, descuento, monto_pagado, cambio)
    VALUES (@numero_factura, @nombre_negocio, @direccion_negocio, @telefono_negocio, @rnc_negocio, @direccion_cliente, @telefono_cliente, @usuario_logueado, @fecha, @cliente, @dni_cliente, @subtotal, @itbis, @total_con_descuento, @descuento, @monto_pagado, @cambio);
END
GO

CREATE PROCEDURE [dbo].[InsertarDetalleFactura]
    @numero_factura VARCHAR(20), @cod_producto CHAR(10), @nombre_producto VARCHAR(100),
    @precio_venta DECIMAL(10,2), @cantidad INT, @total DECIMAL(10,2)
AS
BEGIN
    INSERT INTO DetallesFactura (numero_factura, cod_producto, nombre_producto, precio_venta, cantidad, total)
    VALUES (@numero_factura, @cod_producto, @nombre_producto, @precio_venta, @cantidad, @total);
END
GO

CREATE PROCEDURE [dbo].[bajar_stock]
    @cod_producto CHAR(10), @cantidad INT
AS
BEGIN
    UPDATE Producto SET stock = stock - @cantidad WHERE cod_producto = @cod_producto;
END
GO

-- 5. Insertar Datos de Prueba (Negocio y Usuario Admin)
INSERT INTO negocio (nombre, direccion, telefono, rnc) VALUES ('H&B Racing (Pruevas)', 'Calle Prueba 123', '809-000-0000', '123-45678-9');
INSERT INTO usuario (usuario, contraseña, tipo_usuario, estado) VALUES ('admin', 'admin123', 'admin', '1');
GO

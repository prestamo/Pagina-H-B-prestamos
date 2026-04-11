-- =======================================================
-- MASTER SETUP SCRIPT - H&B RACING (ESTRUCTURA TOTAL)
-- Versión: 2.0 (Modernizada - Solo Esquema)
-- =======================================================
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BDRepuesto')
BEGIN
    CREATE DATABASE [BDRepuesto];
END
GO

USE [BDRepuesto];
GO

-- 1. SEGURIDAD Y USUARIOS
CREATE TABLE [tipo_usuario] (
    cod_tipo CHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50)
);

CREATE TABLE [usuario] (
    cod_usuario CHAR(10) PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE,
    contrasena VARCHAR(200),
    tipo_usuario CHAR(10) REFERENCES tipo_usuario(cod_tipo),
    estado CHAR(1) DEFAULT '1'
);

-- 2. CAJA Y FINANZAS
CREATE TABLE [Cajas] (
    id_caja INT PRIMARY KEY IDENTITY(1,1),
    nombre_caja VARCHAR(50),
    estado CHAR(1) DEFAULT '0',
    id_usuario CHAR(10) REFERENCES usuario(cod_usuario)
);

CREATE TABLE [HistorialCaja] (
    id_historial INT PRIMARY KEY IDENTITY(1,1),
    id_caja INT REFERENCES Cajas(id_caja),
    monto_apertura DECIMAL(10,2),
    monto_cierre DECIMAL(10,2),
    diferencia DECIMAL(10,2),
    id_usuario CHAR(10) REFERENCES usuario(cod_usuario),
    fecha DATETIME DEFAULT GETDATE(),
    ventas_efectivo DECIMAL(10,2) DEFAULT 0,
    ventas_tarjeta DECIMAL(10,2) DEFAULT 0,
    ventas_transferencia DECIMAL(10,2) DEFAULT 0,
    egresos DECIMAL(10,2) DEFAULT 0,
    total_ventas DECIMAL(10,2) DEFAULT 0,
    total_sistema DECIMAL(10,2) DEFAULT 0,
    efectivo_contado DECIMAL(10,2) DEFAULT 0,
    observaciones NVARCHAR(MAX) NULL,
    estado_cierre NVARCHAR(20) DEFAULT 'PND'
);

CREATE TABLE [EstadoCaja] (
    id_caja INT PRIMARY KEY REFERENCES Cajas(id_caja),
    estado NVARCHAR(10) NOT NULL,
    monto_inicial DECIMAL(10,2) DEFAULT 0,
    monto_actual DECIMAL(10,2) DEFAULT 0,
    fecha_apertura DATETIME DEFAULT GETDATE(),
    fecha_cierre DATETIME
);

CREATE TABLE [DistribucionDenominaciones] (
    id_dist INT PRIMARY KEY IDENTITY(1,1),
    id_caja INT REFERENCES Cajas(id_caja),
    id_historial INT REFERENCES HistorialCaja(id_historial),
    denominacion DECIMAL(10,2),
    cantidad INT,
    total DECIMAL(10,2)
);

-- 3. INVENTARIO Y CORE
    rnc VARCHAR(20),
    logo_url VARCHAR(500)
);

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
    email VARCHAR(100),
    fecha_registro DATETIME DEFAULT GETDATE()
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
    estado CHAR(1) DEFAULT '1',
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- 4. VENTAS Y CLIENTES
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

    monto_pagado DECIMAL(10,2),
    cambio DECIMAL(10,2),
    metodo_pago NVARCHAR(20) DEFAULT 'EFECTIVO',
    es_fiscal BIT DEFAULT 0
);

CREATE TABLE [DetallesFactura] (
    id_detalle INT PRIMARY KEY IDENTITY(1,1),
    numero_factura VARCHAR(20) REFERENCES Facturas(numero_factura),
    cod_producto CHAR(10) REFERENCES Producto(cod_producto),
    nombre_producto VARCHAR(100),
    precio_venta DECIMAL(10,2),
    cantidad INT,
    total DECIMAL(10,2)
);

CREATE TABLE [venta] (
    num_documento CHAR(20) PRIMARY KEY,
    serie CHAR(4),
    fecha DATETIME DEFAULT GETDATE(),
    cod_cliente CHAR(10) REFERENCES cliente(cod_cliente),
    dni VARCHAR(20),
    total DECIMAL(10,2),
    id_usuario CHAR(10) REFERENCES usuario(cod_usuario),
    id_caja INT REFERENCES Cajas(id_caja),
    estado CHAR(1) DEFAULT '1',
    metodo_pago NVARCHAR(20) DEFAULT 'EFECTIVO'
);

-- 5. PROCEDIMIENTOS ALMACENADOS
GO

CREATE OR ALTER PROCEDURE [dbo].[insertar_producto]
    @cod_producto CHAR(10) OUTPUT, @nombre VARCHAR(100), @Descripcion_producto VARCHAR(200),
    @stock INT, @cod_categoria CHAR(10), @precio_compra DECIMAL(10,2), 
    @precio_venta DECIMAL(10,2), @id_proveedor INT
AS
BEGIN
    DECLARE @max INT;
    SELECT @max = ISNULL(MAX(CAST(SUBSTRING(cod_producto, 4, 7) AS INT)), 0) FROM Producto;
    SET @cod_producto = 'PRO' + RIGHT('0000000' + CAST(@max + 1 AS VARCHAR), 7);
    INSERT INTO Producto (cod_producto, nombre, Descripcion_producto, stock, cod_categoria, precio_compra, precio_venta, id_proveedor, estado, fecha_registro)
    VALUES (@cod_producto, @nombre, @Descripcion_producto, @stock, @cod_categoria, @precio_compra, @precio_venta, @id_proveedor, '1', GETDATE());
END
GO

CREATE OR ALTER PROCEDURE [dbo].[insertar_cliente]
    @cod_cliente CHAR(10), @nombres VARCHAR(50), @apellidos VARCHAR(50),
    @dni VARCHAR(20), @sexo CHAR(1), @direccion VARCHAR(200), @telefono VARCHAR(20)
AS
BEGIN
    INSERT INTO cliente (cod_cliente, nombres, apellidos, dni, sexo, direccion, telefono, estado)
    VALUES (@cod_cliente, @nombres, @apellidos, @dni, @sexo, @direccion, @telefono, '1');
END
GO

CREATE OR ALTER PROCEDURE [dbo].[generar_num_factura]
AS
BEGIN
    DECLARE @nuevo_num_documento INT;
    DECLARE @num_documento VARCHAR(20);
    SELECT @nuevo_num_documento = ISNULL(MAX(ultimo_num_documento), 0) FROM control_factura;
    SET @num_documento = 'FAC-' + RIGHT('0000000000' + CAST(@nuevo_num_documento + 1 AS VARCHAR), 10);
    
    IF EXISTS (SELECT 1 FROM control_factura)
        UPDATE control_factura SET ultimo_num_documento = @nuevo_num_documento + 1;
    ELSE
        INSERT INTO control_factura (ultimo_num_documento) VALUES (@nuevo_num_documento + 1);
        
    SELECT @num_documento AS num_factura;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[InsertarFactura]
    @numero_factura VARCHAR(20), @nombre_negocio VARCHAR(100), @direccion_negocio VARCHAR(200),
    @telefono_negocio VARCHAR(20), @rnc_negocio VARCHAR(20), @direccion_cliente VARCHAR(200),
    @telefono_cliente VARCHAR(20), @usuario_logueado VARCHAR(50), @fecha DATETIME,
    @cliente VARCHAR(100), @dni_cliente VARCHAR(20), @subtotal DECIMAL(10,2),
    @itbis DECIMAL(10,2), @total_con_descuento DECIMAL(10,2), @descuento DECIMAL(10,2),
    @monto_pagado DECIMAL(10,2), @cambio DECIMAL(10,2), @metodo_pago NVARCHAR(20) = 'EFECTIVO',
    @es_fiscal BIT = 0
AS
BEGIN
    INSERT INTO Facturas (numero_factura, nombre_negocio, direccion_negocio, telefono_negocio, rnc_negocio, direccion_cliente, telefono_cliente, usuario_logueado, fecha, cliente, dni_cliente, subtotal, itbis, total_con_descuento, descuento, monto_pagado, cambio, metodo_pago, es_fiscal)
    VALUES (@numero_factura, @nombre_negocio, @direccion_negocio, @telefono_negocio, @rnc_negocio, @direccion_cliente, @telefono_cliente, @usuario_logueado, @fecha, @cliente, @dni_cliente, @subtotal, @itbis, @total_con_descuento, @descuento, @monto_pagado, @cambio, @metodo_pago, @es_fiscal);
END
GO

CREATE OR ALTER PROCEDURE [dbo].[InsertarDetalleFactura]
    @numero_factura VARCHAR(20), @cod_producto CHAR(10), @nombre_producto VARCHAR(100),
    @precio_venta DECIMAL(10,2), @cantidad INT, @total DECIMAL(10,2)
AS
BEGIN
    INSERT INTO DetallesFactura (numero_factura, cod_producto, nombre_producto, precio_venta, cantidad, total)
    VALUES (@numero_factura, @cod_producto, @nombre_producto, @precio_venta, @cantidad, @total);
END
GO

CREATE OR ALTER PROCEDURE [dbo].[bajar_stock]
    @cod_producto CHAR(10), @cantidad INT
AS
BEGIN
    UPDATE Producto SET stock = stock - @cantidad WHERE cod_producto = @cod_producto;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_verificar_caja_activa]
    @id_usuario CHAR(10) = NULL
AS
BEGIN
    SELECT TOP 1 ec.id_caja, ec.monto_inicial AS fondo_inicial, ec.fecha_apertura, hc.id_historial
    FROM EstadoCaja ec
    JOIN HistorialCaja hc ON ec.id_caja = hc.id_caja
    WHERE ec.fecha_cierre IS NULL AND hc.monto_cierre IS NULL
    ORDER BY ec.fecha_apertura DESC;
END
GO

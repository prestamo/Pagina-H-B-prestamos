-- =======================================================
-- SCRIPT DE REPLICACIÓN TOTAL - H&B RACING (27 TABLAS)
-- =======================================================
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'prueva')
BEGIN
    CREATE DATABASE [prueva];
END
GO

USE [prueva];
GO

-- 1. SEGURIDAD Y USUARIOS
IF OBJECT_ID('Usuario_Permisos') IS NOT NULL DROP TABLE [Usuario_Permisos];
IF OBJECT_ID('usuario') IS NOT NULL DROP TABLE [usuario];
IF OBJECT_ID('tipo_usuario') IS NOT NULL DROP TABLE [tipo_usuario];
IF OBJECT_ID('permisos') IS NOT NULL DROP TABLE [permisos];
IF OBJECT_ID('UsuariosLogueadosHistorial') IS NOT NULL DROP TABLE [UsuariosLogueadosHistorial];
IF OBJECT_ID('UsuariosLogueados') IS NOT NULL DROP TABLE [UsuariosLogueados];

CREATE TABLE [permisos] (
    cod_permiso INT PRIMARY KEY,
    descripcion VARCHAR(100)
);

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

CREATE TABLE [Usuario_Permisos] (
    id_usr_perm INT PRIMARY KEY IDENTITY(1,1),
    cod_usuario CHAR(10) REFERENCES usuario(cod_usuario),
    cod_permiso INT REFERENCES permisos(cod_permiso)
);

CREATE TABLE [UsuariosLogueados] (
    id INT PRIMARY KEY IDENTITY(1,1),
    usuario VARCHAR(50),
    fecha_login DATETIME DEFAULT GETDATE(),
    ip_addres VARCHAR(50)
);

CREATE TABLE [UsuariosLogueadosHistorial] (
    id_historial INT PRIMARY KEY IDENTITY(1,1),
    id_sesion INT,
    usuario VARCHAR(50),
    fecha_logout DATETIME DEFAULT GETDATE()
);

-- 2. CAJA Y FINANZAS
IF OBJECT_ID('Transacciones') IS NOT NULL DROP TABLE [Transacciones];
IF OBJECT_ID('DistribucionDenominaciones') IS NOT NULL DROP TABLE [DistribucionDenominaciones];
IF OBJECT_ID('HistorialCaja') IS NOT NULL DROP TABLE [HistorialCaja];
IF OBJECT_ID('EstadoCaja') IS NOT NULL DROP TABLE [EstadoCaja];
IF OBJECT_ID('Cajas') IS NOT NULL DROP TABLE [Cajas];

CREATE TABLE [Cajas] (
    id_caja INT PRIMARY KEY IDENTITY(1,1),
    nombre_caja VARCHAR(50),
    estado CHAR(1) DEFAULT '0'
);

CREATE TABLE [EstadoCaja] (
    id_caja INT PRIMARY KEY REFERENCES Cajas(id_caja),
    estado NVARCHAR(10) NOT NULL,
    fecha_apertura DATETIME DEFAULT GETDATE(),
    fecha_cierre DATETIME
);

CREATE TABLE [Transacciones] (
    id_transaccion INT PRIMARY KEY IDENTITY(1,1),
    id_caja INT REFERENCES Cajas(id_caja),
    tipo VARCHAR(20),
    monto DECIMAL(10,2),
    descripcion VARCHAR(200),
    fecha DATETIME DEFAULT GETDATE()
);

CREATE TABLE [HistorialCaja] (
    id_historial INT PRIMARY KEY IDENTITY(1,1),
    id_caja INT REFERENCES Cajas(id_caja),
    fecha_apertura DATETIME,
    fecha_cierre DATETIME,
    fondo_inicial DECIMAL(10,2),
    fondo_final DECIMAL(10,2),
    id_usuario INT
);

CREATE TABLE [DistribucionDenominaciones] (
    id_dist INT PRIMARY KEY IDENTITY(1,1),
    id_caja INT REFERENCES Cajas(id_caja),
    denominacion DECIMAL(10,2),
    cantidad INT,
    total DECIMAL(10,2)
);

-- 3. INVENTARIO Y CORE
IF OBJECT_ID('Producto') IS NOT NULL DROP TABLE [Producto];
IF OBJECT_ID('Proveedores') IS NOT NULL DROP TABLE [Proveedores];
IF OBJECT_ID('categoria') IS NOT NULL DROP TABLE [categoria];
IF OBJECT_ID('negocio') IS NOT NULL DROP TABLE [negocio];

CREATE TABLE [negocio] (
    cod_negocio INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    rnc VARCHAR(20)
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

-- 4. VENTAS, CLIENTES Y CRÉDITOS
IF OBJECT_ID('DetalleproductoCredito') IS NOT NULL DROP TABLE [DetalleproductoCredito];
IF OBJECT_ID('PagosCredito') IS NOT NULL DROP TABLE [PagosCredito];
IF OBJECT_ID('ClienteCredito') IS NOT NULL DROP TABLE [ClienteCredito];
IF OBJECT_ID('detalleventa') IS NOT NULL DROP TABLE [detalleventa];
IF OBJECT_ID('venta') IS NOT NULL DROP TABLE [venta];
IF OBJECT_ID('ventas_eliminadas') IS NOT NULL DROP TABLE [ventas_eliminadas];
IF OBJECT_ID('DetallesFactura') IS NOT NULL DROP TABLE [DetallesFactura];
IF OBJECT_ID('Facturas') IS NOT NULL DROP TABLE [Facturas];
IF OBJECT_ID('cliente') IS NOT NULL DROP TABLE [cliente];
IF OBJECT_ID('control_factura') IS NOT NULL DROP TABLE [control_factura];
IF OBJECT_ID('Descuentos') IS NOT NULL DROP TABLE [Descuentos];
IF OBJECT_ID('TotalDescuento') IS NOT NULL DROP TABLE [TotalDescuento];

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

CREATE TABLE [venta] (
    num_documento CHAR(20) PRIMARY KEY,
    serie CHAR(4),
    fecha DATETIME DEFAULT GETDATE(),
    cod_cliente CHAR(10) REFERENCES cliente(cod_cliente),
    dni VARCHAR(20),
    total DECIMAL(10,2),
    id_usuario INT,
    id_caja INT REFERENCES Cajas(id_caja),
    estado CHAR(1) DEFAULT '1'
);

CREATE TABLE [detalleventa] (
    id_detalle_v INT PRIMARY KEY IDENTITY(1,1),
    num_documento CHAR(20) REFERENCES venta(num_documento),
    cod_producto CHAR(10),
    cantidad INT,
    precio DECIMAL(10,2),
    fecha_registro DATETIME DEFAULT GETDATE()
);

CREATE TABLE [ventas_eliminadas] (
    id_elim INT PRIMARY KEY IDENTITY(1,1),
    num_documento VARCHAR(20),
    fecha_eliminacion DATETIME DEFAULT GETDATE(),
    motivo VARCHAR(200),
    usuario VARCHAR(50)
);

CREATE TABLE [ClienteCredito] (
    id_credito INT PRIMARY KEY IDENTITY(1,1),
    cod_cliente CHAR(10) REFERENCES cliente(cod_cliente),
    limite DECIMAL(10,2),
    balance_pendiente DECIMAL(10,2),
    estado CHAR(1) DEFAULT '1'
);

CREATE TABLE [DetalleproductoCredito] (
    id_det_cred INT PRIMARY KEY IDENTITY(1,1),
    id_credito INT REFERENCES ClienteCredito(id_credito),
    cod_producto CHAR(10),
    cantidad INT
);

CREATE TABLE [PagosCredito] (
    id_pago INT PRIMARY KEY IDENTITY(1,1),
    id_credito INT REFERENCES ClienteCredito(id_credito),
    monto DECIMAL(10,2),
    fecha DATETIME DEFAULT GETDATE()
);

CREATE TABLE [control_factura] (
    ultimo_num_documento INT
);

CREATE TABLE [Descuentos] (
    id_desc INT PRIMARY KEY IDENTITY(1,1),
    descripcion VARCHAR(50),
    porcentaje DECIMAL(5,2)
);

CREATE TABLE [TotalDescuento] (
    id INT PRIMARY KEY IDENTITY(1,1),
    total_acumulado DECIMAL(15,2)
);

-- 5. PROCEDIMIENTOS ALMACENADOS (CENTRALIZADOS)
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_insertar_proveedor]
    @nombre NVARCHAR(100), @direccion NVARCHAR(200), @telefono NVARCHAR(15), @email NVARCHAR(100)
AS
BEGIN
    INSERT INTO Proveedores (nombre, direccion, telefono, email, fecha_registro)
    VALUES (@nombre, @direccion, @telefono, @email, GETDATE());
END
GO

CREATE OR ALTER PROCEDURE [dbo].[generar_num_factura]
    @num_documento VARCHAR(20) OUTPUT
AS
BEGIN
    DECLARE @nuevo_num_documento INT;
    SELECT @nuevo_num_documento = ISNULL(MAX(ultimo_num_documento), 0) FROM control_factura;
    SET @num_documento = 'FAC-' + RIGHT('0000000000' + CAST(@nuevo_num_documento + 1 AS VARCHAR), 10);
    IF EXISTS (SELECT 1 FROM control_factura)
        UPDATE control_factura SET ultimo_num_documento = @nuevo_num_documento + 1;
    ELSE
        INSERT INTO control_factura (ultimo_num_documento) VALUES (@nuevo_num_documento + 1);
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

CREATE OR ALTER PROCEDURE [dbo].[insertar_producto]
    @cod_producto CHAR(10) OUTPUT, @nombre VARCHAR(100), @Description_producto VARCHAR(200),
    @stock INT, @cod_categoria CHAR(10), @precio_compra DECIMAL(10,2), 
    @precio_venta DECIMAL(10,2), @id_proveedor INT
AS
BEGIN
    DECLARE @max INT;
    SELECT @max = ISNULL(MAX(CAST(SUBSTRING(cod_producto, 4, 7) AS INT)), 0) FROM Producto;
    SET @cod_producto = 'PRO' + RIGHT('0000000' + CAST(@max + 1 AS VARCHAR), 7);
    INSERT INTO Producto (cod_producto, nombre, Descripcion_producto, stock, cod_categoria, precio_compra, precio_venta, id_proveedor, estado, fecha_registro)
    VALUES (@cod_producto, @nombre, @Description_producto, @stock, @cod_categoria, @precio_compra, @precio_venta, @id_proveedor, '1', GETDATE());
END
GO

CREATE OR ALTER PROCEDURE [dbo].[edita_producto]
    @cod_producto CHAR(10), @nombre VARCHAR(100), @Description_producto VARCHAR(200),
    @stock INT, @cod_categoria CHAR(10), @precio_compra DECIMAL(10,2), @precio_venta DECIMAL(10,2)
AS
BEGIN
    UPDATE Producto SET nombre=@nombre, Descripcion_producto=@Description_producto, stock=@stock, cod_categoria=@cod_categoria, precio_compra=@precio_compra, precio_venta=@precio_venta
    WHERE cod_producto=@cod_producto;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[InsertarFactura]
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

-- --- DATOS INICIALES ---
INSERT INTO negocio (nombre, direccion, telefono, rnc) VALUES ('H&B Racing (PRO)', 'Sede Central', '809-123-4567', '1-23-45678-9');
INSERT INTO tipo_usuario (cod_tipo, descripcion) VALUES ('ADMIN', 'Administrador Total');
INSERT INTO usuario (cod_usuario, usuario, contrasena, tipo_usuario, estado) VALUES ('001', 'admin', 'admin123', 'ADMIN', '1');
IF NOT EXISTS (SELECT 1 FROM control_factura) INSERT INTO control_factura (ultimo_num_documento) VALUES (0);
GO

-- =======================================================
-- CUMULATIVE MIGRATION - H&B RACING (MODO SEGURO)
-- Destino: BDRepuesto (Producción)
-- =======================================================
USE [BDRepuesto];
GO

-- 1. ACTUALIZACIÓN DE TABLAS EXISTENTES (COLUMNAS NUEVAS)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facturas') AND name = 'metodo_pago')
    ALTER TABLE Facturas ADD metodo_pago NVARCHAR(20) DEFAULT ('EFECTIVO');

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('venta') AND name = 'metodo_pago')
    ALTER TABLE venta ADD metodo_pago NVARCHAR(20) DEFAULT ('EFECTIVO');

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Cajas') AND name = 'id_usuario')
    ALTER TABLE Cajas ADD id_usuario CHAR(10);

-- Sincronización de tipos para id_usuario (CHAR 10)
ALTER TABLE HistorialCaja ALTER COLUMN id_usuario CHAR(10);
ALTER TABLE Cajas ALTER COLUMN id_usuario CHAR(10);

-- 1.1 Soporte para LOGO y Facturación FISCAL
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('negocio') AND name = 'logo_url')
    ALTER TABLE negocio ADD logo_url VARCHAR(500);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facturas') AND name = 'es_fiscal')
    ALTER TABLE Facturas ADD es_fiscal BIT DEFAULT 0;
GO

-- 2. AMPLIACIÓN DEL MÓDULO DE CAJA (SI NO EXISTEN LAS COLUMNAS)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('HistorialCaja') AND name = 'ventas_efectivo')
BEGIN
    ALTER TABLE HistorialCaja ADD 
        monto_apertura DECIMAL(10,2) NULL,
        monto_cierre DECIMAL(10,2) NULL,
        diferencia DECIMAL(10,2) NULL,
        ventas_efectivo DECIMAL(10,2) DEFAULT 0,
        ventas_tarjeta DECIMAL(10,2) DEFAULT 0,
        ventas_transferencia DECIMAL(10,2) DEFAULT 0,
        egresos DECIMAL(10,2) DEFAULT 0,
        total_ventas DECIMAL(10,2) DEFAULT 0,
        total_sistema DECIMAL(10,2) DEFAULT 0,
        efectivo_contado DECIMAL(10,2) DEFAULT 0,
        observaciones NVARCHAR(MAX) NULL,
        estado_cierre NVARCHAR(20) DEFAULT 'PND',
        fecha DATETIME DEFAULT GETDATE();
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('EstadoCaja') AND name = 'monto_inicial')
BEGIN
    ALTER TABLE EstadoCaja ADD 
        monto_inicial DECIMAL(10,2) DEFAULT 0,
        monto_actual DECIMAL(10,2) DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DistribucionDenominaciones') AND name = 'id_historial')
    ALTER TABLE DistribucionDenominaciones ADD id_historial INT REFERENCES HistorialCaja(id_historial);
GO

-- 3. ASEGURAR CAJA POR DEFECTO
IF NOT EXISTS (SELECT * FROM Cajas WHERE id_caja = 1)
BEGIN
    SET IDENTITY_INSERT Cajas ON;
    INSERT INTO Cajas (id_caja, nombre_caja, estado) VALUES (1, 'CAJA PRINCIPAL 01', '0');
    SET IDENTITY_INSERT Cajas OFF;
END
GO

-- 4. PROCEDIMIENTOS ALMACENADOS (CENTRALIZACIÓN)
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

CREATE OR ALTER PROCEDURE [dbo].[sp_insertar_proveedor]
    @nombre NVARCHAR(100), @direccion NVARCHAR(200), @telefono NVARCHAR(15), @email NVARCHAR(100)
AS
BEGIN
    INSERT INTO Proveedores (nombre, direccion, telefono, email, fecha_registro)
    VALUES (@nombre, @direccion, @telefono, @email, GETDATE());
END
GO

-- MIGRACIÓN CAJA REAL V1 (FIXED)
USE [prueva];
GO

-- 1. Actualizar tabla Facturas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Facturas') AND name = 'metodo_pago')
BEGIN
    ALTER TABLE Facturas ADD metodo_pago NVARCHAR(20) DEFAULT ('EFECTIVO');
END
GO

-- 2. Actualizar tabla venta
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('venta') AND name = 'metodo_pago')
BEGIN
    ALTER TABLE venta ADD metodo_pago NVARCHAR(20) DEFAULT ('EFECTIVO');
END
GO

-- 3. Expandir HistorialCaja
-- Ya tiene: id_historial, id_caja, monto_apertura, monto_cierre, diferencia, id_usuario, fecha
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('HistorialCaja') AND name = 'ventas_efectivo')
BEGIN
    ALTER TABLE HistorialCaja ADD 
        ventas_efectivo DECIMAL(10,2) DEFAULT 0,
        ventas_tarjeta DECIMAL(10,2) DEFAULT 0,
        ventas_transferencia DECIMAL(10,2) DEFAULT 0,
        egresos DECIMAL(10,2) DEFAULT 0,
        total_ventas DECIMAL(10,2) DEFAULT 0,
        total_sistema DECIMAL(10,2) DEFAULT 0,
        efectivo_contado DECIMAL(10,2) DEFAULT 0,
        observaciones NVARCHAR(MAX) NULL,
        estado_cierre NVARCHAR(20) DEFAULT 'PND' -- PND: Pendiente, OK, ERROR
END
GO

-- 4. Actualizar DistribucionDenominaciones para linkear a Historial
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DistribucionDenominaciones') AND name = 'id_historial')
BEGIN
    ALTER TABLE DistribucionDenominaciones ADD id_historial INT REFERENCES HistorialCaja(id_historial);
END
GO

-- 5. Procedimiento para verificar caja activa
CREATE OR ALTER PROCEDURE [dbo].[sp_verificar_caja_activa]
    @id_usuario INT = NULL
AS
BEGIN
    -- Busca en EstadoCaja si hay una fila con fecha_cierre NULL
    SELECT TOP 1 ec.id_caja, ec.monto_inicial AS fondo_inicial, ec.fecha_apertura, hc.id_historial
    FROM EstadoCaja ec
    JOIN HistorialCaja hc ON ec.id_caja = hc.id_caja
    WHERE ec.fecha_cierre IS NULL AND hc.monto_cierre IS NULL
    ORDER BY ec.fecha_apertura DESC;
END
GO

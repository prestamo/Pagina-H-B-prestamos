-- REPARACIÓN DE ESQUEMA CAJA V1.2 (SUPER FIX CONSTRAINTS)
USE [prueva];
GO

-- 1. Eliminar restricciones de llave foránea que bloquean el cambio de tipo
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__Historial__id_us__5629CD9C')
    ALTER TABLE HistorialCaja DROP CONSTRAINT [FK__Historial__id_us__5629CD9C];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK__Cajas__id_usuari__4AB81AF0')
    ALTER TABLE Cajas DROP CONSTRAINT [FK__Cajas__id_usuari__4AB81AF0];

-- Otras posibles restricciones automáticas en estas columnas (limpieza preventiva)
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_NAME(parent_object_id)) + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys 
WHERE parent_object_id IN (OBJECT_ID('HistorialCaja'), OBJECT_ID('Cajas')) 
  AND referenced_object_id = OBJECT_ID('usuario');
EXEC sp_executesql @sql;
GO

-- 2. Asegurar que exista la Caja #1
IF NOT EXISTS (SELECT * FROM Cajas WHERE id_caja = 1)
BEGIN
    SET IDENTITY_INSERT Cajas ON;
    INSERT INTO Cajas (id_caja, nombre_caja, estado) VALUES (1, 'CAJA PRINCIPAL 01', '0');
    SET IDENTITY_INSERT Cajas OFF;
END
GO

-- 3. Cambiar tipos de datos a CHAR(10) para coincidir con tabla 'usuario'
ALTER TABLE HistorialCaja ALTER COLUMN id_usuario CHAR(10);
ALTER TABLE Cajas ALTER COLUMN id_usuario CHAR(10);
GO

-- 4. Re-crear las restricciones correctamente
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Historial_Usuario')
    ALTER TABLE HistorialCaja ADD CONSTRAINT FK_Historial_Usuario FOREIGN KEY (id_usuario) REFERENCES usuario(cod_usuario);

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Cajas_Usuario')
    ALTER TABLE Cajas ADD CONSTRAINT FK_Cajas_Usuario FOREIGN KEY (id_usuario) REFERENCES usuario(cod_usuario);
GO

-- 5. Resetear estado de la caja de pruebas
UPDATE Cajas SET estado = '0', id_usuario = NULL WHERE id_caja = 1;
GO

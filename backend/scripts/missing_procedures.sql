
---- procedimiento de almacenado para el nuevo formulario proveedor
-- insertar proveedor
CREATE PROCEDURE sp_insertar_proveedor
    @nombre NVARCHAR(100),
    @direccion NVARCHAR(200),
    @telefono NVARCHAR(15),
    @email NVARCHAR(100)
AS
BEGIN
    INSERT INTO Proveedores (nombre, direccion, telefono, email, fecha_registro)
    VALUES (@nombre, @direccion, @telefono, @email, GETDATE());
END

GO

----- editar proveedor 
CREATE PROCEDURE sp_editar_proveedor
    @id_proveedor INT,
    @nombre NVARCHAR(100),
    @direccion NVARCHAR(200),
    @telefono NVARCHAR(15),
    @email NVARCHAR(100)
AS
BEGIN
    UPDATE Proveedores
    SET nombre = @nombre,
        direccion = @direccion,
        telefono = @telefono,
        email = @email
    WHERE id_proveedor = @id_proveedor
END
GO

---eliminar proveedores
CREATE PROCEDURE sp_eliminar_proveedor
    @id_proveedor INT
AS
BEGIN
    DELETE FROM Proveedores
    WHERE id_proveedor = @id_proveedor
END

GO


------proc insertar categoria
create proc insertar_categoria(
@cod_categoria char(10) output,
@descripcion varchar(50))
as
declare @num int
	begin
		if(select max(CONVERT(int,substring(cod_categoria,4,10))) from categoria) is not null
			begin
				select @num=max(CONVERT(int,substring(cod_categoria,4,10))) from categoria
				select @cod_categoria='CAT' + REPLICATE('0',7-
				DATALENGTH(convert(varchar,@num+1)))+
					CONVERT(varchar,@num+1)
		end
		else
			select @cod_categoria = 'CAT0000001'
			insert into categoria(cod_categoria,descripcion,estado)
			values(@cod_categoria,@descripcion,'1')
	end

GO

-- editar categoria
create proc edita_categoria(
@cod_categoria char(10),
@descripcion varchar(50)
)
as
update categoria set descripcion=@descripcion
where cod_categoria=@cod_categoria

GO

--prc eliminar categoria
create proc elimina_categoria(
@cod_categoria char(10)
)
as
update categoria set estado='0'
where cod_categoria=@cod_categoria

GO

--procedimiento almacenado para insertar productos 
CREATE PROCEDURE insertar_producto(
    @cod_producto CHAR(10) OUTPUT,
    @nombre VARCHAR(50),
    @Descripcion_producto VARCHAR(100),
    @stock INT,
    @cod_categoria CHAR(10),
    @precio_compra DECIMAL(9,2),
    @precio_venta DECIMAL(9,2),
    @id_proveedor INT -- Nuevo parámetro para el proveedor
)
AS
DECLARE @num INT
BEGIN
    -- Verificar si ya existen productos en la tabla
    IF (SELECT MAX(CONVERT(INT, SUBSTRING(cod_producto, 4, 10))) FROM producto) IS NOT NULL
    BEGIN
        SELECT @num = MAX(CONVERT(INT, SUBSTRING(cod_producto, 4, 10))) FROM producto;
        SELECT @cod_producto = 'PRO' + REPLICATE('0', 7 - DATALENGTH(CONVERT(VARCHAR, @num + 1))) + CONVERT(VARCHAR, @num + 1);
    END
    ELSE
    BEGIN
        SELECT @cod_producto = 'PRO0000001';
    END

    -- Insertar el nuevo producto con el ID del proveedor
    INSERT INTO producto(cod_producto, nombre, Descripcion_producto, stock, cod_categoria, estado, precio_compra, precio_venta, id_proveedor, fecha_registro)
    VALUES(@cod_producto, @nombre, @Descripcion_producto, @stock, @cod_categoria, '1', @precio_compra, @precio_venta, @id_proveedor, GETDATE());
END;
GO

-- Editar producto
CREATE PROCEDURE edita_producto(
    @cod_producto CHAR(10),
    @nombre VARCHAR(50),
    @Descripcion_producto VARCHAR(100),
    @stock INT,
    @cod_categoria CHAR(10),
    @precio_compra DECIMAL(9,2),
    @precio_venta DECIMAL(9,2)
)
AS
BEGIN
    UPDATE producto 
    SET nombre = @nombre, Descripcion_producto = @Descripcion_producto, stock = @stock, cod_categoria = @cod_categoria, 
        precio_compra = @precio_compra, precio_venta = @precio_venta
    WHERE cod_producto = @cod_producto;
END;
GO

-------Eliminar producto-----------------------
create proc eliminar_producto(
@cod_producto char(10))
as
update producto set estado='0' where cod_producto=@cod_producto

GO


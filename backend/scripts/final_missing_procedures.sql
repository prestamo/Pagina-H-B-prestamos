GO


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

CREATE   PROCEDURE insertar_cliente(
    @cod_cliente CHAR(10) OUTPUT,
    @nombres VARCHAR(50),
    @apellidos VARCHAR(50),
    @dni VARCHAR(10),
    @sexo VARCHAR(15),
    @direccion VARCHAR(50),
    @telefeono VARCHAR(10) -- Debe recibir solo los dígitos
)
AS
BEGIN
    DECLARE @num INT
    DECLARE @telefono_formateado VARCHAR(14)

    -- Generar código del cliente
    IF (SELECT MAX(CONVERT(INT, SUBSTRING(cod_cliente, 4, 10))) FROM cliente) IS NOT NULL
    BEGIN
        SELECT @num = MAX(CONVERT(INT, SUBSTRING(cod_cliente, 4, 10))) FROM cliente
        SELECT @cod_cliente = 'CLI' + REPLICATE('0', 7 - DATALENGTH(CONVERT(VARCHAR, @num + 1))) + CONVERT(VARCHAR, @num + 1)
    END
    ELSE
    BEGIN
        SELECT @cod_cliente = 'CLI0000001'
    END

    -- Formatear el número de teléfono
    SET @telefono_formateado = '(' + LEFT(@telefeono, 3) + ') ' + SUBSTRING(@telefeono, 4, 3) + '-' + RIGHT(@telefeono, 4)

    -- Insertar datos en la tabla
    INSERT INTO cliente (cod_cliente, nombres, apellidos, dni, sexo, direccion, telefono, estado)
    VALUES (@cod_cliente, @nombres, @apellidos, @dni, @sexo, @direccion, @telefono_formateado, '1')
END

GO

--editar cliente
create proc editar_cliente(
@cod_cliente char(10) ,
@nombres varchar(50),
@apellidos varchar(50),
@dni varchar(10),
@sexo varchar(15),
@direccion varchar(50),
@telefeono varchar(10)
)
as
update cliente set nombres=@nombres,apellidos=@apellidos,dni=@dni,sexo=@sexo,direccion=@direccion,telefono=@telefeono
where cod_cliente=@cod_cliente

GO


---eliminar cliente
create proc eliminar_cliente(
@cod_cliente char(10))
as
update cliente set estado='0' where cod_cliente=@cod_cliente

GO


CREATE PROCEDURE generar_num_factura
    @num_documento VARCHAR(20) OUTPUT
AS
BEGIN
    DECLARE @nuevo_num_documento INT;
    -- Obtener el último número de documento
    SELECT @nuevo_num_documento = ISNULL(MAX(ultimo_num_documento), 0) FROM control_factura;
    -- Asignar el nuevo número de documento con el prefijo "FACTURA-"
    SET @num_documento = 'FACTURA-' + RIGHT('0000000000' + CAST(@nuevo_num_documento + 1 AS VARCHAR), 10);
    -- Actualizar el número en la tabla de control
    IF EXISTS (SELECT 1 FROM control_factura)
    BEGIN
        UPDATE control_factura SET ultimo_num_documento = @nuevo_num_documento + 1;
    END
    ELSE
    BEGIN
        INSERT INTO control_factura (ultimo_num_documento) VALUES (@nuevo_num_documento + 1);
    END
END;
GO

CREATE PROCEDURE InsertarFactura
    @numero_factura VARCHAR(50),
    @nombre_negocio VARCHAR(255),
    @direccion_negocio VARCHAR(255),
    @telefono_negocio VARCHAR(50),
    @rnc_negocio VARCHAR(50),
    @direccion_cliente VARCHAR(255) = NULL,
    @telefono_cliente VARCHAR(50) = NULL,
    @usuario_logueado VARCHAR(100),
    @fecha DATETIME,
    @cliente VARCHAR(255),
    @dni_cliente VARCHAR(50) = NULL,
    @subtotal DECIMAL(10, 2) = NULL,
    @itbis DECIMAL(10, 2) = NULL,
    @total_con_descuento DECIMAL(10, 2),
    @descuento DECIMAL(10, 2) = NULL,
    @monto_pagado DECIMAL(10, 2),
    @cambio DECIMAL(10, 2)
AS
BEGIN
    INSERT INTO Facturas (
        numero_factura, nombre_negocio, direccion_negocio, telefono_negocio, rnc_negocio,
        direccion_cliente, telefono_cliente, usuario_logueado, fecha, cliente, dni_cliente,
        subtotal, itbis, total_con_descuento, descuento, monto_pagado, cambio
    ) VALUES (
        @numero_factura, @nombre_negocio, @direccion_negocio, @telefono_negocio, @rnc_negocio,
        @direccion_cliente, @telefono_cliente, @usuario_logueado, @fecha, @cliente, @dni_cliente,
        @subtotal, @itbis, @total_con_descuento, @descuento, @monto_pagado, @cambio
    );
END;

GO

CREATE PROCEDURE InsertarDetalleFactura
    @numero_factura VARCHAR(50),
    @cod_producto VARCHAR(50),
    @nombre_producto VARCHAR(255),
    @precio_venta DECIMAL(10, 2),
    @cantidad INT,
    @total DECIMAL(10, 2)
AS
BEGIN
    INSERT INTO DetallesFactura (
        numero_factura, cod_producto, nombre_producto, precio_venta, cantidad, total
    ) VALUES (
        @numero_factura, @cod_producto, @nombre_producto, @precio_venta, @cantidad, @total
    );
END;

GO

--- bajar el stop del producto cuando se reaiza una venta 

CREATE PROCEDURE bajar_stock
    @cod_producto CHAR(10),
    @stock INT
AS
BEGIN
    -- Verificar si el producto existe
    IF EXISTS (SELECT 1 FROM producto WHERE cod_producto = @cod_producto)
    BEGIN
        -- Reducir el stock del producto
        UPDATE producto
        SET stock = stock - @stock
        WHERE cod_producto = @cod_producto;
    END
    ELSE
    BEGIN
        -- Manejar el caso donde el producto no existe
        RAISERROR ('El producto no existe.', 16, 1);
    END
END;
GO


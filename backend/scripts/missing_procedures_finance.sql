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


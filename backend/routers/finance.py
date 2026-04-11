from fastapi import APIRouter, HTTPException
from database import get_connection
from datetime import datetime
from models.schemas import ClienteBase, FacturaCreate

router = APIRouter(
    tags=["Finance"]
)

@router.get("/creditos")
def get_creditos():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id_credito, nombre_cliente, monto_adeudado, fecha_vencimiento, estado FROM ClienteCredito")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/caja/transacciones")
def get_transacciones():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 50 id_transaccion, id_caja, tipo, monto, fecha FROM Transacciones ORDER BY fecha DESC")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/facturas")
def get_facturas():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 50 numero_factura, cliente, total_con_descuento, fecha FROM Facturas ORDER BY fecha DESC")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clientes")
def get_clientes():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT cod_cliente, nombres, apellidos, dni, sexo, direccion, telefono, estado FROM cliente")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clientes")
def create_cliente(item: ClienteBase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Generar código si no viene
        cod = item.cod_cliente
        if not cod:
            cursor.execute("SELECT MAX(cod_cliente) FROM cliente")
            res = cursor.fetchone()
            if res and res[0]:
                num = int(res[0].replace('CLI', '')) + 1
                cod = f"CLI{num:07d}"
            else:
                cod = "CLI0000001"
        cursor.execute("""
            EXEC [dbo].[insertar_cliente] @cod_cliente = ?, @nombres = ?, @apellidos = ?, 
                @dni = ?, @sexo = ?, @direccion = ?, @telefono = ?
        """, (cod, item.nombres, item.apellidos, item.dni, item.sexo, item.direccion, item.telefono))
        conn.commit()
        conn.close()
        return {"status": "success", "cod_cliente": cod}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/clientes/{cod_cliente}")
def update_cliente(cod_cliente: str, item: ClienteBase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[editar_cliente] @cod_cliente = ?, @nombres = ?, @apellidos = ?, 
                @dni = ?, @sexo = ?, @direccion = ?, @telefono = ?
        """, (cod_cliente, item.nombres, item.apellidos, item.dni, item.sexo, item.direccion, item.telefono))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clientes/{cod_cliente}")
def delete_cliente(cod_cliente: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC [dbo].[eliminar_cliente] @cod_cliente = ?", (cod_cliente,))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/facturas")
def create_factura(item: FacturaCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 1. Obtener datos del negocio
        cursor.execute("SELECT TOP 1 nombre, direccion, telefono, rnc FROM negocio")
        negocio = cursor.fetchone()
        n_nombre = negocio[0] if negocio else "H&B Racing"
        n_dir = negocio[1] if negocio else "N/A"
        n_tel = negocio[2] if negocio else "N/A"
        n_rnc = negocio[3] if negocio else "N/A"

        # 2. Generar número de factura
        cursor.execute("SET NOCOUNT ON; EXEC dbo.generar_num_factura")
        row_num = cursor.fetchone()
        num_factura = str(row_num[0]) if row_num else f"FAC-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # 3. Insertar Factura Header
        cursor.execute("""
            EXEC [dbo].[InsertarFactura] 
                @numero_factura = ?, @nombre_negocio = ?, @direccion_negocio = ?, @telefono_negocio = ?, 
                @rnc_negocio = ?, @direccion_cliente = ?, @telefono_cliente = ?, @usuario_logueado = ?, 
                @fecha = ?, @cliente = ?, @dni_cliente = ?, @subtotal = ?, @itbis = ?, 
                @total_con_descuento = ?, @descuento = ?, @monto_pagado = ?, @cambio = ?,
                @metodo_pago = ?, @es_fiscal = ?
        """, (
            num_factura, n_nombre, n_dir, n_tel, n_rnc, 
            item.direccion_cliente, item.telefono_cliente, item.usuario_logueado,
            datetime.now(), item.cliente, item.dni_cliente, 
            item.subtotal, item.itbis, item.total_con_descuento, item.descuento,
            item.monto_pagado, item.cambio, item.metodo_pago, int(item.es_fiscal)
        ))

        # 4. Insertar Detalles y Bajar Stock
        for detail in item.items:
            # Insertar Detalle
            cursor.execute("""
                EXEC [dbo].[InsertarDetalleFactura] 
                    @numero_factura = ?, @cod_producto = ?, @nombre_producto = ?, 
                    @precio_venta = ?, @cantidad = ?, @total = ?
            """, (num_factura, detail.cod_producto, detail.nombre_producto, detail.precio_venta, detail.cantidad, detail.total))
            
            # Bajar Stock
            cursor.execute("EXEC [dbo].[bajar_stock] @cod_producto = ?, @cantidad = ?", (detail.cod_producto, detail.cantidad))

        conn.commit()
        return {"status": "success", "numero_factura": num_factura}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")
    finally:
        if conn: conn.close()

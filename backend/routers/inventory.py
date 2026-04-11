from fastapi import APIRouter, HTTPException
from database import get_connection
from models.schemas import ProductoItem, CategoryBase, SupplierBase

router = APIRouter(
    tags=["Inventory"]
)


@router.get("/productos")
def get_productos():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Incluimos precio_compra y cod_categoria que estaban faltando en el diseño
        cursor.execute("""
            SELECT p.cod_producto, p.nombre, p.Descripcion_producto, p.precio_compra, 
                   p.precio_venta, p.stock, p.cod_categoria, p.id_proveedor,
                   c.descripcion as categoria_nombre,
                   pv.nombre as proveedor_nombre
            FROM Producto p
            LEFT JOIN categoria c ON p.cod_categoria = c.cod_categoria
            LEFT JOIN Proveedores pv ON p.id_proveedor = pv.id_proveedor
            WHERE p.estado = '1'
        """)
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        print(f"ERROR in get_productos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/productos")
def create_producto(item: ProductoItem):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Usamos una llamada directa al procedimiento para mayor compatibilidad
        query = """
            SET NOCOUNT ON;
            DECLARE @new_cod CHAR(10);
            EXEC [dbo].[insertar_producto] 
                @cod_producto = @new_cod OUTPUT, 
                @nombre = ?, 
                @Description_producto = ?, 
                @stock = ?, 
                @cod_categoria = ?, 
                @precio_compra = ?, 
                @precio_venta = ?, 
                @id_proveedor = ?;
            SELECT @new_cod as code;
        """
        params = (
            item.nombre, 
            item.Descripcion_producto, 
            item.stock, 
            item.cod_categoria, 
            item.precio_compra, 
            item.precio_venta, 
            item.id_proveedor
        )
        
        cursor.execute(query, params)
        row = cursor.fetchone()
        conn.commit()
        
        if not row:
            raise Exception("La base de datos no devolvió el código del nuevo producto.")
            
        new_id = row[0]
        conn.close()
        
        return {"status": "success", "cod_producto": str(new_id).strip()}
    except Exception as e:
        print(f"CRITICAL ERROR in create_producto: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al registrar producto: {str(e)}")

@router.put("/productos/{cod_producto}")
def update_producto(cod_producto: str, item: ProductoItem):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[edita_producto] @cod_producto = ?, @nombre = ?, 
                @Description_producto = ?, @stock = ?, @cod_categoria = ?, 
                @precio_compra = ?, @precio_venta = ?;
        """, (cod_producto, item.nombre, item.Descripcion_producto, item.stock, item.cod_categoria, item.precio_compra, item.precio_venta))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/productos/{cod_producto}")
def delete_producto(cod_producto: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC [dbo].[eliminar_producto] @cod_producto = ?", (cod_producto,))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/proveedores")
def get_proveedores():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id_proveedor, nombre, direccion, telefono, email FROM Proveedores")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/proveedores")
def create_proveedor(item: SupplierBase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[sp_insertar_proveedor] @nombre = ?, @direccion = ?, @telefono = ?, @email = ?
        """, (item.nombre, item.direccion, item.telefono, item.email))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/proveedores/{id_proveedor}")
def update_proveedor(id_proveedor: int, item: SupplierBase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[sp_editar_proveedor] @id_proveedor = ?, @nombre = ?, @direccion = ?, @telefono = ?, @email = ?
        """, (id_proveedor, item.nombre, item.direccion, item.telefono, item.email))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/proveedores/{id_proveedor}")
def delete_proveedor(id_proveedor: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC [dbo].[sp_eliminar_proveedor] @id_proveedor = ?", (id_proveedor,))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categorias")
def get_categorias():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT cod_categoria, descripcion FROM categoria WHERE estado = '1'")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/categorias")
def create_categoria(item: CategoryBase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Generar código si no viene
        cod = item.cod_categoria
        if not cod:
            cursor.execute("SELECT MAX(cod_categoria) FROM categoria")
            res = cursor.fetchone()
            if res and res[0]:
                num = int(res[0].replace('CAT', '')) + 1
                cod = f"CAT{num:07d}"
            else:
                cod = "CAT0000001"

        cursor.execute("""
            EXEC [dbo].[insertar_categoria] @cod_categoria = ?, @descripcion = ?
        """, (cod, item.descripcion))
        conn.commit()
        conn.close()
        return {"status": "success", "cod_categoria": cod}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/categorias/{cod_categoria}")
def update_categoria(cod_categoria: str, item: CategoryBase):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            EXEC [dbo].[edita_categoria] @cod_categoria = ?, @descripcion = ?
        """, (cod_categoria, item.descripcion))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/categorias/{cod_categoria}")
def delete_categoria(cod_categoria: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC [dbo].[elimina_categoria] @cod_categoria = ?", (cod_categoria,))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

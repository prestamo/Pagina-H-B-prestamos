from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from database import get_connection
import os
import shutil
import traceback
from models.schemas import NegocioSchema

router = APIRouter(
    tags=["Settings"]
)

@router.get("/usuarios")
def get_usuarios():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT cod_usuario, usuario, tipo_usuario, estado FROM usuario WHERE estado = '1'")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audit/anulaciones")
def get_anulaciones():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT num_documento, nombre_producto, total, fecha_eliminacion FROM ventas_eliminadas")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/negocio")
def get_negocio():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT cod_negocio, nombre, direccion, telefono, rnc, logo_url FROM negocio")
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results[0] if results else {"nombre": "H&B Racing", "logo_url": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/negocio")
def update_negocio(item: NegocioSchema):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE negocio SET nombre = ?, direccion = ?, telefono = ?, rnc = ?
            WHERE cod_negocio = ?
        """, (item.nombre, item.direccion, item.telefono, item.rnc, item.cod_negocio))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/negocio/logo")
async def upload_logo(cod_negocio: str = Form(...), file: UploadFile = File(...)):
    try:
        if not os.path.exists("uploads"):
            os.makedirs("uploads")
        
        file_extension = file.filename.split(".")[-1]
        file_name = f"logo_{cod_negocio}.{file_extension}"
        file_path = os.path.join("uploads", file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logo_url = f"/uploads/{file_name}"
        
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE negocio SET logo_url = ? WHERE cod_negocio = ?", (logo_url, cod_negocio))
        conn.commit()
        conn.close()
        
        return {"status": "success", "logo_url": logo_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

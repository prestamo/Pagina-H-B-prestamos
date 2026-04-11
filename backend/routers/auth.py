from fastapi import APIRouter, HTTPException, Depends
from database import get_connection
from models.schemas import UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # SCRIPT SQL indica: [usuario], [contrasena], [tipo_usuario], [estado]
        query = "SELECT cod_usuario, usuario, contrasena, tipo_usuario, estado FROM usuario WHERE usuario = ?"
        cursor.execute(query, (credentials.usuario,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=401, detail="CRITICAL:USUARIO_NO_REGISTRADO")
        
        db_cod, db_user, db_pass, db_tipo, db_estado = row

        # DEBUG LOGGING (Temporarily for debugging)
        print(f"DEBUG: Comparing Input='|{credentials.contraseña}|' with DB='|{str(db_pass).strip()}|'")

        # VALIDACIÓN DE CONTRASEÑA
        if credentials.contraseña != str(db_pass).strip():
            raise HTTPException(status_code=401, detail="CRITICAL:CONTRASEÑA_INCORRECTA")

        if db_estado == '0':
            raise HTTPException(status_code=403, detail="CRITICAL:USUARIO_INACTIVO")

        return {
            "cod_usuario": str(db_cod).strip() if db_cod else "",
            "usuario": db_user,
            "tipo_usuario": db_tipo,
            "estado": db_estado,
            "token": "mock-jwt-token-for-now"
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        detail = str(e)
        # Gestionar errores de base de datos redirigidos desde database.py
        if "DATABASE_NOT_FOUND" in detail:
            raise HTTPException(status_code=503, detail=f"DB:ERROR_INSTANCIA|{detail}")
        elif "SERVER_UNREACHABLE" in detail:
            raise HTTPException(status_code=503, detail=f"DB:ERROR_CONEXION|{detail}")
            
        raise HTTPException(status_code=500, detail=detail)

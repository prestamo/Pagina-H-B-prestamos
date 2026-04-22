import pyodbc
from contextvars import ContextVar
import os
from dotenv import load_dotenv

load_dotenv()  # Carga las variables del archivo .env

# ContextVars para manejar la instancia del servidor y nombre de la DB de manera aislada por petición
server_instance_context: ContextVar[str] = ContextVar("server_instance", default="localhost")
db_name_context: ContextVar[str] = ContextVar("db_name", default="BDRepuesto")

# Credenciales SQL Server (autenticación remota)
SQL_USER = os.getenv("SQL_USER", "sa")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "TU_PASSWORD_AQUI")

def get_connection():
    server = server_instance_context.get()
    db = db_name_context.get()

    conn_str = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={server};"
        f"DATABASE={db};"
        f"UID={SQL_USER};"
        f"PWD={SQL_PASSWORD};"
        "Encrypt=no;"
        "TrustServerCertificate=yes;"
    )
    try:
        return pyodbc.connect(conn_str, timeout=5)
    except pyodbc.Error as e:
        error_msg = str(e)
        if "4060" in error_msg:
            raise Exception(f"DATABASE_NOT_FOUND: La base de datos '{db}' no existe en la instancia.")
        elif "18456" in error_msg:
            raise Exception(f"LOGIN_FAILED: Credenciales incorrectas para SQL Server en '{server}'.")
        elif "08001" in error_msg or "HYT00" in error_msg:
            raise Exception(f"SERVER_UNREACHABLE: No se pudo conectar a '{server}'. Verifique que esté encendida y acepte conexiones remotas.")
        else:
            raise Exception(f"DB_CONNECTION_ERROR: {error_msg}")

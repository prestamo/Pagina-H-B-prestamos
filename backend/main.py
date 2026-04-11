from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import get_connection, db_name_context, server_instance_context
from routers import auth, inventory, finance, settings, cash

app = FastAPI(title="H&B Racing API")

# Crear carpeta de uploads si no existe
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configuración de CORS para permitir conexiones desde Ionic/Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def db_selector_middleware(request: Request, call_next):
    # Obtener el nombre de la DB y la instancia del servidor de los headers
    db_name = request.headers.get("X-Database", "BDRepuesto")
    server_instance = request.headers.get("X-Server", "YERY-PEREZ")
    
    # Establecer el contexto para esta petición
    token_db = db_name_context.set(db_name)
    token_server = server_instance_context.set(server_instance)
    try:
        response = await call_next(request)
    finally:
        # Limpiar el contexto al terminar la petición
        db_name_context.reset(token_db)
        server_instance_context.reset(token_server)
    return response

# Inclusión de Routers Modulares
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(finance.router)
app.include_router(settings.router)
app.include_router(cash.router)

@app.get("/")
def read_root():
    return {"status": "Online", "empresa": "H&B Racing", "version": "2.0.0"}

@app.get("/test-db")
def test_db():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        row = cursor.fetchone()
        conn.close()
        return {"database_version": row[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

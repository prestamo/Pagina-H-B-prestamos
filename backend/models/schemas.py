from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# --- AUTH SCHEMAS ---
class UserLogin(BaseModel):
    usuario: str
    contraseña: str

class UserResponse(BaseModel):
    cod_usuario: str
    usuario: str
    tipo_usuario: str
    estado: str
    token: Optional[str] = None

# --- INVENTORY SCHEMAS ---
class ProductoItem(BaseModel):
    cod_producto: Optional[str] = None
    nombre: str
    Descripcion_producto: str
    stock: int
    cod_categoria: str
    precio_compra: float
    precio_venta: float
    id_proveedor: int

class CategoryBase(BaseModel):
    cod_categoria: Optional[str] = None
    descripcion: str
    estado: Optional[str] = "1"

class SupplierBase(BaseModel):
    id_proveedor: Optional[int] = None
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    estado: Optional[str] = "1"

# --- FINANCE SCHEMAS ---
class ClienteBase(BaseModel):
    cod_cliente: Optional[str] = None
    nombres: str
    apellidos: str
    dni: Optional[str] = None
    sexo: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    estado: Optional[str] = "1"

class FacturaItem(BaseModel):
    cod_producto: str
    nombre_producto: str
    precio_venta: float
    cantidad: int
    total: float

class FacturaCreate(BaseModel):
    cliente: Optional[str] = "Mostrador"
    dni_cliente: Optional[str] = None
    direccion_cliente: Optional[str] = None
    telefono_cliente: Optional[str] = None
    usuario_logueado: str
    subtotal: float
    itbis: float
    total_con_descuento: float
    descuento: float
    monto_pagado: float
    cambio: float
    metodo_pago: Optional[str] = "EFECTIVO"
    es_fiscal: Optional[bool] = False
    items: List[FacturaItem]

class TransactionBase(BaseModel):
    cod_transaccion: Optional[str] = None
    fecha: Optional[datetime] = None
    tipo: str
    monto: float
    descripcion: str

# --- CASH MANAGEMENT SCHEMAS ---
class DenominationItem(BaseModel):
    denominacion: float
    cantidad: int
    total: float

class CashOpening(BaseModel):
    id_caja: int
    monto_inicial: float
    id_usuario: str

class CashStatusResponse(BaseModel):
    id_historial: int
    id_caja: int
    fondo_inicial: float
    ventas_efectivo: float
    ventas_tarjeta: float
    ventas_transferencia: float
    egresos: float
    total_sistema: float
    active: bool

class CashClosing(BaseModel):
    id_historial: int
    id_caja: int
    efectivo_contado: float
    observaciones: Optional[str] = None
    denominaciones: List[DenominationItem]

# --- SETTINGS SCHEMAS ---
class UsuarioSchema(BaseModel):
    cod_usuario: Optional[str] = None
    usuario: str
    contraseña: Optional[str] = None
    tipo_usuario: str
    estado: Optional[str] = "1"

class NegocioSchema(BaseModel):
    cod_negocio: str
    nombre: str
    direccion: str
    telefono: str
    rnc: str
    logo_url: Optional[str] = None

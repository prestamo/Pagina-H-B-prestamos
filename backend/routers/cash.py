from fastapi import APIRouter, HTTPException
from database import get_connection
from datetime import datetime
from models.schemas import CashOpening, CashClosing, CashStatusResponse, DenominationItem
from typing import List

router = APIRouter(
    prefix="/cash",
    tags=["Cash Management"]
)

@router.get("/status", response_model=CashStatusResponse)
def get_current_status():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # 1. Verificar si hay caja activa
        cursor.execute("EXEC [dbo].[sp_verificar_caja_activa]")
        active_row = cursor.fetchone()
        
        if not active_row:
            conn.close()
            return CashStatusResponse(
                id_historial=0, id_caja=1, fondo_inicial=0,
                ventas_efectivo=0, ventas_tarjeta=0, ventas_transferencia=0,
                egresos=0, total_sistema=0, active=False
            )
        
        # id_caja, fondo_inicial, fecha_apertura, id_historial
        id_caja, fondo_inicial, fecha_apertura, id_historial = active_row
        
        # 2. Calcular ventas desde la fecha de apertura
        # Buscamos en Facturas con metodo_pago
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN metodo_pago = 'EFECTIVO' THEN total_con_descuento ELSE 0 END) as efectivo,
                SUM(CASE WHEN metodo_pago = 'TARJETA' THEN total_con_descuento ELSE 0 END) as tarjeta,
                SUM(CASE WHEN metodo_pago = 'TRANSFERENCIA' THEN total_con_descuento ELSE 0 END) as transferencia
            FROM Facturas
            WHERE fecha >= ?
        """, (fecha_apertura,))
        sales = cursor.fetchone()
        
        v_efectivo = float(sales[0] or 0)
        v_tarjeta = float(sales[1] or 0)
        v_transferencia = float(sales[2] or 0)
        
        # Calcular egresos (de la tabla Transacciones)
        cursor.execute("SELECT SUM(monto) FROM Transacciones WHERE tipo = 'EGRESO' AND fecha >= ?", (fecha_apertura,))
        egresos_row = cursor.fetchone()
        egresos = float(egresos_row[0] or 0)
        
        total_sistema = float(fondo_inicial) + v_efectivo - egresos
        
        conn.close()
        return CashStatusResponse(
            id_historial=id_historial,
            id_caja=id_caja,
            fondo_inicial=float(fondo_inicial),
            ventas_efectivo=v_efectivo,
            ventas_tarjeta=v_tarjeta,
            ventas_transferencia=v_transferencia,
            egresos=egresos,
            total_sistema=total_sistema,
            active=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/open")
def open_cash(item: CashOpening):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Verificar si ya está abierta
        cursor.execute("SELECT id_estado FROM EstadoCaja WHERE fecha_cierre IS NULL AND id_caja = ?", (item.id_caja,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="La caja ya se encuentra abierta.")
            
        now = datetime.now()
        
        # 1. Insertar en HistorialCaja
        cursor.execute("""
            INSERT INTO HistorialCaja (id_caja, monto_apertura, id_usuario, fecha)
            OUTPUT INSERTED.id_historial
            VALUES (?, ?, ?, ?)
        """, (item.id_caja, item.monto_inicial, item.id_usuario, now))
        id_historial = cursor.fetchone()[0]
        
        # 2. Actualizar/Insertar en EstadoCaja
        cursor.execute("SELECT id_estado FROM EstadoCaja WHERE id_caja = ?", (item.id_caja,))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE EstadoCaja SET 
                    monto_inicial = ?, monto_actual = ?, fecha_apertura = ?, fecha_cierre = NULL
                WHERE id_caja = ?
            """, (item.monto_inicial, item.monto_inicial, now, item.id_caja))
        else:
            cursor.execute("""
                INSERT INTO EstadoCaja (id_caja, monto_inicial, monto_actual, fecha_apertura)
                VALUES (?, ?, ?, ?)
            """, (item.id_caja, item.monto_inicial, item.monto_inicial, now))
            
        # 3. Actualizar estado en tabla Cajas
        cursor.execute("UPDATE Cajas SET estado = '1', id_usuario = ? WHERE id_caja = ?", (item.id_usuario, item.id_caja))
        
        conn.commit()
        conn.close()
        return {"status": "success", "id_historial": id_historial}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/close")
def close_cash(item: CashClosing):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        now = datetime.now()
        
        # 1. Obtener datos actuales para el historial final
        cursor.execute("SELECT fecha_apertura, monto_inicial FROM EstadoCaja WHERE id_caja = ?", (item.id_caja,))
        row = cursor.fetchone()
        fa = row[0]
        f_ini = float(row[1])
        
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN metodo_pago = 'EFECTIVO' THEN total_con_descuento ELSE 0 END) as e,
                SUM(CASE WHEN metodo_pago = 'TARJETA' THEN total_con_descuento ELSE 0 END) as t,
                SUM(CASE WHEN metodo_pago = 'TRANSFERENCIA' THEN total_con_descuento ELSE 0 END) as tr
            FROM Facturas WHERE fecha >= ?
        """, (fa,))
        res = cursor.fetchone()
        v_e = float(res[0] or 0)
        v_t = float(res[1] or 0)
        v_tr = float(res[2] or 0)
        
        cursor.execute("SELECT SUM(monto) FROM Transacciones WHERE tipo = 'EGRESO' AND fecha >= ?", (fa,))
        eg = float(cursor.fetchone()[0] or 0)
        
        total_sis = f_ini + v_e - eg
        dif = item.efectivo_contado - total_sis
        estado_c = 'OK' if abs(dif) < 0.01 else ('SOBRANTE' if dif > 0 else 'FALTANTE')
        
        # 2. Actualizar HistorialCaja
        cursor.execute("""
            UPDATE HistorialCaja SET
                monto_cierre = ?,
                ventas_efectivo = ?,
                ventas_tarjeta = ?,
                ventas_transferencia = ?,
                egresos = ?,
                total_ventas = ?,
                total_sistema = ?,
                efectivo_contado = ?,
                diferencia = ?,
                observaciones = ?,
                estado_cierre = ?
            WHERE id_historial = ?
        """, (item.efectivo_contado, v_e, v_t, v_tr, eg, (v_e + v_t + v_tr), total_sis, item.efectivo_contado, dif, item.observaciones, estado_c, item.id_historial))
        
        # 3. Guardar Denominaciones
        for d in item.denominaciones:
            cursor.execute("""
                INSERT INTO DistribucionDenominaciones (id_caja, denominacion, cantidad, total, id_historial)
                VALUES (?, ?, ?, ?, ?)
            """, (item.id_caja, d.denominacion, d.cantidad, d.total, item.id_historial))
            
        # 4. Cerrar en EstadoCaja
        cursor.execute("UPDATE EstadoCaja SET fecha_cierre = ?, monto_actual = ? WHERE id_caja = ?", (now, item.efectivo_contado, item.id_caja))
        
        # 5. Liberar Cajas
        cursor.execute("UPDATE Cajas SET estado = '0', id_usuario = NULL WHERE id_caja = ?", (item.id_caja,))
        
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_cash_history(start_date: str = None, end_date: str = None):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM HistorialCaja"
        params = []
        if start_date and end_date:
            query += " WHERE fecha >= ? AND fecha <= ?"
            params = [start_date, end_date]
        
        query += " ORDER BY fecha DESC"
        cursor.execute(query, params)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

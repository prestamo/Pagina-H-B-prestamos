-- SCRIPT DE CREACIÓN PARA CLIENTES Y SOLICITUDES DE CRÉDITO
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Solicitudes de Crédito
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Aprobado, Rechazado, Completado
    loan_type TEXT, -- personal, garante, hipotecario, vehiculo
    applicant_name TEXT, -- For quick visibility
    applicant_cedula TEXT, -- For quick visibility
    monto NUMERIC(15,2),
    tiempo INTEGER, -- Meses
    cuota NUMERIC(15,2),
    data JSONB NOT NULL, -- Almacena todos los campos detallados (Solicitante, Cónyuge, Referencias)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso (Gestión para Autenticados y envío público para Anónimos)

-- Políticas para la tabla 'clients'
DROP POLICY IF EXISTS "Authenticated can manage clients" ON clients;
CREATE POLICY "Authenticated can manage clients" ON clients 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to select clients" ON clients;
CREATE POLICY "Allow anon to select clients" ON clients
FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon to insert clients" ON clients;
CREATE POLICY "Allow anon to insert clients" ON clients
FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to update clients" ON clients;
CREATE POLICY "Allow anon to update clients" ON clients
FOR UPDATE TO anon USING (true) WITH CHECK (true);


-- Políticas para la tabla 'loan_applications'
DROP POLICY IF EXISTS "Authenticated can manage applications" ON loan_applications;
CREATE POLICY "Authenticated can manage applications" ON loan_applications 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to insert applications" ON loan_applications;
CREATE POLICY "Allow anon to insert applications" ON loan_applications
FOR INSERT TO anon WITH CHECK (true);

-- 5. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_clients_cedula ON clients(cedula);
CREATE INDEX IF NOT EXISTS idx_loan_applications_client ON loan_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);

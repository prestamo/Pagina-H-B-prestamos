-- SCRIPT DE CREACIÓN PARA CLIENTES Y SOLICITUDES DE CRÉDITO
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Tabla de Clientes (Unión del sistema viejo y nuevo)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cod_cliente VARCHAR(20) UNIQUE, -- Para compatibilidad con CLI0000001
    full_name TEXT NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    cedula VARCHAR(20) UNIQUE NOT NULL, -- DNI en el sistema viejo
    apodo VARCHAR(50),
    estado_civil VARCHAR(50),
    fecha_nacimiento DATE,
    edad INTEGER,
    sexo VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(100),
    profesion VARCHAR(100),
    lugar_trabajo VARCHAR(100),
    cargo VARCHAR(100),
    ingresos NUMERIC(15,2),
    otros_ingresos NUMERIC(15,2),
    tipo_casa VARCHAR(50),
    sector VARCHAR(100),
    ciudad VARCHAR(100),
    direccion TEXT,
    superior_inmediato VARCHAR(100),
    tel_trabajo VARCHAR(20),
    tiempo_laborando VARCHAR(100),
    destino_credito TEXT,
    is_cliente BOOLEAN DEFAULT TRUE,
    is_empleado BOOLEAN DEFAULT FALSE,
    is_funcionario BOOLEAN DEFAULT FALSE,
    is_accionista BOOLEAN DEFAULT FALSE,
    estado VARCHAR(10) DEFAULT '1', -- Del sistema viejo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Cónyuges
CREATE TABLE IF NOT EXISTS spouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    apodo VARCHAR(50),
    fecha_nacimiento DATE,
    edad INTEGER,
    estado_civil VARCHAR(50),
    telefono VARCHAR(20),
    ocupacion VARCHAR(100),
    lugar_trabajo VARCHAR(100),
    sector VARCHAR(100),
    direccion TEXT,
    superior_inmediato VARCHAR(100),
    tel_trabajo VARCHAR(20),
    tiempo_laborando VARCHAR(100),
    ingresos NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Garantes
CREATE TABLE IF NOT EXISTS guarantors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    apodo VARCHAR(50),
    estado_civil VARCHAR(50),
    fecha_nacimiento DATE,
    edad INTEGER,
    telefono VARCHAR(20),
    profesion VARCHAR(100),
    lugar_trabajo VARCHAR(100),
    cargo VARCHAR(100),
    ingresos NUMERIC(15,2),
    otros_ingresos NUMERIC(15,2),
    tipo_casa VARCHAR(50),
    sector VARCHAR(100),
    ciudad VARCHAR(100),
    direccion TEXT,
    superior_inmediato VARCHAR(100),
    tel_trabajo VARCHAR(20),
    tiempo_laborando VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Solicitudes de Crédito
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    guarantor_id UUID REFERENCES guarantors(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Pendiente',
    loan_type TEXT, -- personal, garante, hipotecario, vehiculo
    monto NUMERIC(15,2),
    tiempo INTEGER,
    cuota NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Referencias Personales/Comerciales
CREATE TABLE IF NOT EXISTS client_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    guarantor_id UUID REFERENCES guarantors(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    parentesco VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row-Level Security (RLS) en todas las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE spouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_references ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO PARA 'clients'
DROP POLICY IF EXISTS "Authenticated can manage clients" ON clients;
CREATE POLICY "Authenticated can manage clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to select clients" ON clients;
CREATE POLICY "Allow anon to select clients" ON clients FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon to insert clients" ON clients;
CREATE POLICY "Allow anon to insert clients" ON clients FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to update clients" ON clients;
CREATE POLICY "Allow anon to update clients" ON clients FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- POLÍTICAS DE ACCESO PARA 'spouses'
DROP POLICY IF EXISTS "Authenticated can manage spouses" ON spouses;
CREATE POLICY "Authenticated can manage spouses" ON spouses FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to select spouses" ON spouses;
CREATE POLICY "Allow anon to select spouses" ON spouses FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon to insert spouses" ON spouses;
CREATE POLICY "Allow anon to insert spouses" ON spouses FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to update spouses" ON spouses;
CREATE POLICY "Allow anon to update spouses" ON spouses FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- POLÍTICAS DE ACCESO PARA 'guarantors'
DROP POLICY IF EXISTS "Authenticated can manage guarantors" ON guarantors;
CREATE POLICY "Authenticated can manage guarantors" ON guarantors FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to select guarantors" ON guarantors;
CREATE POLICY "Allow anon to select guarantors" ON guarantors FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon to insert guarantors" ON guarantors;
CREATE POLICY "Allow anon to insert guarantors" ON guarantors FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to update guarantors" ON guarantors;
CREATE POLICY "Allow anon to update guarantors" ON guarantors FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- POLÍTICAS DE ACCESO PARA 'loan_applications'
DROP POLICY IF EXISTS "Authenticated can manage applications" ON loan_applications;
CREATE POLICY "Authenticated can manage applications" ON loan_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to select applications" ON loan_applications;
CREATE POLICY "Allow anon to select applications" ON loan_applications FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon to insert applications" ON loan_applications;
CREATE POLICY "Allow anon to insert applications" ON loan_applications FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to update applications" ON loan_applications;
CREATE POLICY "Allow anon to update applications" ON loan_applications FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- POLÍTICAS DE ACCESO PARA 'client_references'
DROP POLICY IF EXISTS "Authenticated can manage references" ON client_references;
CREATE POLICY "Authenticated can manage references" ON client_references FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to select references" ON client_references;
CREATE POLICY "Allow anon to select references" ON client_references FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon to insert references" ON client_references;
CREATE POLICY "Allow anon to insert references" ON client_references FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to update references" ON client_references;
CREATE POLICY "Allow anon to update references" ON client_references FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Índices de optimización
CREATE INDEX IF NOT EXISTS idx_clients_cedula ON clients(cedula);
CREATE INDEX IF NOT EXISTS idx_clients_cod ON clients(cod_cliente);
CREATE INDEX IF NOT EXISTS idx_loan_applications_client ON loan_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_client_references_client ON client_references(client_id);

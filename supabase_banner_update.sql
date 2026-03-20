-- SCRIPT DE ACTUALIZACIÓN FINAL PARA TABLA BANNERS Y HISTORIAL
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Asegurar esquema en tabla banners (Producción)
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_size INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_size INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS scroll_speed INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS line_height DECIMAL DEFAULT 1.2,
ADD COLUMN IF NOT EXISTS image_mode TEXT DEFAULT 'icon',
ADD COLUMN IF NOT EXISTS loop_delay INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS image_height INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS font_scale_y DECIMAL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS show_image BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'left',
ADD COLUMN IF NOT EXISTS text_align TEXT DEFAULT 'center';

-- 2. Crear tabla banner_history (Historial Reservado)
CREATE TABLE IF NOT EXISTS banner_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT,
    bg_color TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    scroll_text BOOLEAN DEFAULT FALSE,
    show_stripes BOOLEAN DEFAULT FALSE,
    height INTEGER DEFAULT 60,
    position TEXT DEFAULT 'bottom',
    font_family TEXT DEFAULT 'Inter',
    font_size INTEGER DEFAULT 14,
    line_height DECIMAL DEFAULT 1.2,
    font_scale_y DECIMAL DEFAULT 1.0,
    text_align TEXT DEFAULT 'center',
    image_url TEXT,
    image_mode TEXT DEFAULT 'icon',
    image_position TEXT DEFAULT 'left',
    image_size INTEGER DEFAULT 40,
    image_height INTEGER DEFAULT 100,
    show_image BOOLEAN DEFAULT TRUE,
    scroll_speed INTEGER DEFAULT 20,
    loop_delay INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Permisos RLS
ALTER TABLE banner_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view history" ON banner_history;
DROP POLICY IF EXISTS "Authenticated users can manage history" ON banner_history;

CREATE POLICY "Public can view history" ON banner_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage history" ON banner_history 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Mantener permisos en banners
CREATE POLICY "Authenticated users can manage banners" ON banners 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

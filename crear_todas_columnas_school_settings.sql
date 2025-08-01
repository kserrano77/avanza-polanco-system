-- =====================================================
-- CREAR TODAS LAS COLUMNAS NECESARIAS - SCHOOL_SETTINGS - INSTITUTO POLANCO
-- =====================================================
-- Este script agrega TODAS las columnas que el frontend necesita
-- para evitar errores PGRST204 de columnas faltantes
-- =====================================================

-- 1. AGREGAR COLUMNAS BÁSICAS DE INFORMACIÓN
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS school_name TEXT DEFAULT 'Avanza Polanco';
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS school_address TEXT DEFAULT '';
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS school_phone TEXT DEFAULT '';
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS school_email TEXT DEFAULT '';

-- 2. AGREGAR COLUMNAS DE APARIENCIA
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '262, 83%, 58%';

-- 3. COLUMNAS DE NOTIFICACIONES (ya deberían existir del script anterior)
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS notifications_overdue_payments BOOLEAN DEFAULT true;
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS notifications_upcoming_payments BOOLEAN DEFAULT true;

-- 4. COLUMNA DE TEMA DE FONDO (ya debería existir del script anterior)
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS background_theme TEXT DEFAULT 'default';

-- 5. COLUMNAS DE TIMESTAMPS (si no existen)
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. AGREGAR COMENTARIOS A LAS COLUMNAS
COMMENT ON COLUMN school_settings.school_name IS 'Nombre de la institución educativa';
COMMENT ON COLUMN school_settings.school_address IS 'Dirección física de la escuela';
COMMENT ON COLUMN school_settings.school_phone IS 'Teléfono de contacto principal';
COMMENT ON COLUMN school_settings.school_email IS 'Email de contacto institucional';
COMMENT ON COLUMN school_settings.logo_url IS 'URL del logo de la institución';
COMMENT ON COLUMN school_settings.primary_color IS 'Color primario del tema (formato HSL)';
COMMENT ON COLUMN school_settings.background_theme IS 'Tema de fondo seleccionado';
COMMENT ON COLUMN school_settings.notifications_overdue_payments IS 'Activar notificaciones para pagos vencidos';
COMMENT ON COLUMN school_settings.notifications_upcoming_payments IS 'Activar notificaciones para pagos próximos';

-- 7. CREAR CONSTRAINT PARA background_theme (recrear por si acaso)
ALTER TABLE school_settings DROP CONSTRAINT IF EXISTS check_background_theme_values;
ALTER TABLE school_settings ADD CONSTRAINT check_background_theme_values 
CHECK (background_theme IN ('default', 'sunset', 'ocean', 'forest', 'lavender'));

-- 8. INSERTAR CONFIGURACIÓN POR DEFECTO SI NO EXISTE
INSERT INTO school_settings (
    school_name,
    school_address,
    school_phone,
    school_email,
    logo_url,
    primary_color,
    background_theme,
    notifications_overdue_payments,
    notifications_upcoming_payments,
    created_at,
    updated_at
) 
SELECT 
    'Avanza Polanco',
    'Dirección de Avanza Polanco',
    '555-0123',
    'contacto@avanzapolanco.edu',
    '',
    '262, 83%, 58%',
    'default',
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM school_settings LIMIT 1);

-- 9. ACTUALIZAR REGISTROS EXISTENTES CON VALORES POR DEFECTO
UPDATE school_settings SET
    school_name = COALESCE(school_name, 'Avanza Polanco'),
    school_address = COALESCE(school_address, ''),
    school_phone = COALESCE(school_phone, ''),
    school_email = COALESCE(school_email, ''),
    logo_url = COALESCE(logo_url, ''),
    primary_color = COALESCE(primary_color, '262, 83%, 58%'),
    background_theme = COALESCE(background_theme, 'default'),
    notifications_overdue_payments = COALESCE(notifications_overdue_payments, true),
    notifications_upcoming_payments = COALESCE(notifications_upcoming_payments, true),
    updated_at = NOW()
WHERE id IS NOT NULL;

-- =====================================================
-- VERIFICACIÓN COMPLETA DE LA TABLA
-- =====================================================
-- Ejecuta esta consulta para verificar que todas las columnas existen:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'school_settings' 
-- ORDER BY column_name;

-- =====================================================
-- VERIFICAR DATOS COMPLETOS
-- =====================================================
-- Ejecuta esta consulta para ver la configuración completa:
-- SELECT * FROM school_settings;

-- =====================================================
-- TESTING DESPUÉS DE EJECUTAR:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Recarga la página del sistema Instituto Polanco (Ctrl + F5)
-- 3. Ve a Configuración → todas las pestañas
-- 4. Cambia configuraciones en Información, Apariencia y Notificaciones
-- 5. Haz clic en "Guardar Toda la Configuración"
-- 6. Confirma que NO aparece ningún error PGRST204
-- 7. Verifica que aparece mensaje de éxito
-- =====================================================

-- =====================================================
-- COLUMNAS INCLUIDAS EN ESTE SCRIPT:
-- =====================================================
-- ✅ school_name          - Nombre de la escuela
-- ✅ school_address       - Dirección
-- ✅ school_phone         - Teléfono
-- ✅ school_email         - Email
-- ✅ logo_url             - URL del logo
-- ✅ primary_color        - Color primario
-- ✅ background_theme     - Tema de fondo
-- ✅ notifications_overdue_payments - Notificaciones pagos vencidos
-- ✅ notifications_upcoming_payments - Notificaciones pagos próximos
-- ✅ created_at           - Fecha de creación
-- ✅ updated_at           - Fecha de actualización
-- =====================================================

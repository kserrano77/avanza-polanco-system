-- =====================================================
-- AGREGAR COLUMNA 'background_theme' A SCHOOL_SETTINGS - INSTITUTO POLANCO
-- =====================================================
-- Este script agrega la columna 'background_theme' faltante
-- en la tabla 'school_settings' para permitir el guardado
-- de configuración global sin errores PGRST204
-- =====================================================

-- 1. AGREGAR COLUMNA background_theme
-- Permite almacenar el tema de fondo seleccionado por el usuario
ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS background_theme TEXT DEFAULT 'default';

-- 2. AGREGAR COMENTARIO A LA COLUMNA
COMMENT ON COLUMN school_settings.background_theme IS 'Tema de fondo seleccionado: default, sunset, ocean, forest, lavender';

-- 3. CREAR CONSTRAINT PARA VALORES PERMITIDOS
-- Asegura que solo se puedan usar temas válidos
ALTER TABLE school_settings 
ADD CONSTRAINT check_background_theme_values 
CHECK (background_theme IN ('default', 'sunset', 'ocean', 'forest', 'lavender'));

-- 4. ACTUALIZAR REGISTROS EXISTENTES (si los hay)
-- Asigna valor por defecto a registros que ya existen
UPDATE school_settings 
SET background_theme = 'default' 
WHERE background_theme IS NULL;

-- =====================================================
-- VERIFICACIÓN DE LA COLUMNA CREADA
-- =====================================================
-- Ejecuta esta consulta para verificar que la columna se creó correctamente:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'school_settings' AND column_name = 'background_theme';

-- =====================================================
-- VALORES PERMITIDOS PARA background_theme:
-- =====================================================
-- 'default'  - Púrpura Nocturno (tema por defecto)
-- 'sunset'   - Atardecer
-- 'ocean'    - Océano Profundo  
-- 'forest'   - Bosque Místico
-- 'lavender' - Lavanda Relajante
-- =====================================================

-- =====================================================
-- TESTING DESPUÉS DE EJECUTAR:
-- =====================================================
-- 1. Recarga la página del sistema Instituto Polanco
-- 2. Ve a Configuración → Apariencia
-- 3. Cambia el tema de fondo
-- 4. Haz clic en "Guardar Toda la Configuración"
-- 5. Verifica que NO aparece error PGRST204
-- 6. Confirma que el tema se guarda correctamente
-- =====================================================

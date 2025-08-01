-- =====================================================
-- LIMPIEZA Y CORRECCIÓN DE CONFIGURACIÓN - INSTITUTO POLANCO
-- =====================================================
-- Este script limpia y corrige datos corruptos en school_settings
-- que pueden estar causando el error "Could not find background value payments"
-- =====================================================

-- 1. VERIFICAR DATOS ACTUALES EN SCHOOL_SETTINGS
-- Ejecuta esta consulta primero para ver qué datos tienes:
-- SELECT * FROM school_settings;

-- 2. LIMPIAR DATOS CORRUPTOS O INVÁLIDOS
-- Eliminar cualquier valor inválido de background_theme
UPDATE school_settings 
SET background_theme = 'default' 
WHERE background_theme NOT IN ('default', 'sunset', 'ocean', 'forest', 'lavender')
   OR background_theme IS NULL;

-- 3. ASEGURAR CONFIGURACIÓN BÁSICA VÁLIDA
-- Si no existe configuración, crear una por defecto
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
    'Instituto Polanco',
    'Dirección de Instituto Polanco',
    '555-0123',
    'contacto@institutopolanco.edu',
    '',
    '262, 83%, 58%',
    'default',
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM school_settings LIMIT 1);

-- 4. LIMPIAR CONSTRAINT ANTERIOR SI EXISTE
-- Eliminar constraint anterior que podría estar causando conflictos
ALTER TABLE school_settings DROP CONSTRAINT IF EXISTS check_background_theme_values;

-- 5. CREAR CONSTRAINT CORRECTO
-- Asegurar que solo se permitan valores válidos
ALTER TABLE school_settings 
ADD CONSTRAINT check_background_theme_values 
CHECK (background_theme IN ('default', 'sunset', 'ocean', 'forest', 'lavender'));

-- 6. VERIFICAR CONFIGURACIÓN FINAL
-- Ejecuta esta consulta para confirmar que todo está correcto:
-- SELECT id, school_name, background_theme, primary_color, created_at 
-- FROM school_settings;

-- =====================================================
-- POSIBLES CAUSAS DEL ERROR "payments":
-- =====================================================
-- 1. Valor corrupto en background_theme
-- 2. Configuración inicial incorrecta  
-- 3. Datos mezclados de otra tabla
-- 4. Error en migración de datos
-- 5. Constraint mal configurado
-- =====================================================

-- =====================================================
-- TESTING DESPUÉS DE EJECUTAR:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Recarga la página del sistema Instituto Polanco
-- 3. Ve a Configuración → Apariencia
-- 4. Verifica que los temas se muestran correctamente
-- 5. Cambia el tema y guarda la configuración
-- 6. Confirma que NO aparece error "payments" o similar
-- =====================================================

-- =====================================================
-- VALORES VÁLIDOS PARA background_theme:
-- =====================================================
-- 'default'  - Púrpura Nocturno (tema por defecto)
-- 'sunset'   - Atardecer
-- 'ocean'    - Océano Profundo  
-- 'forest'   - Bosque Místico
-- 'lavender' - Lavanda Relajante
-- =====================================================

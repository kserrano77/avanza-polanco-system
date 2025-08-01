-- =====================================================
-- ACTUALIZAR NOMBRE EXISTENTE A "AVANZA POLANCO"
-- =====================================================
-- Este script actualiza el nombre de la escuela en el registro
-- existente de la tabla school_settings
-- =====================================================

-- 1. VERIFICAR DATOS ACTUALES
-- Ejecuta esta consulta para ver el estado actual:
-- SELECT id, school_name, school_address, school_email FROM school_settings;

-- 2. ACTUALIZAR NOMBRE DE LA ESCUELA EN REGISTRO EXISTENTE
UPDATE school_settings 
SET 
    school_name = 'Avanza Polanco',
    school_address = CASE 
        WHEN school_address LIKE '%Instituto Polanco%' THEN REPLACE(school_address, 'Instituto Polanco', 'Avanza Polanco')
        WHEN school_address = '' OR school_address IS NULL THEN 'Dirección de Avanza Polanco'
        ELSE school_address
    END,
    school_email = CASE 
        WHEN school_email LIKE '%institutopolanco%' THEN REPLACE(school_email, 'institutopolanco', 'avanzapolanco')
        WHEN school_email = '' OR school_email IS NULL THEN 'contacto@avanzapolanco.edu'
        ELSE school_email
    END,
    updated_at = NOW()
WHERE id IS NOT NULL;

-- 3. VERIFICAR CAMBIOS APLICADOS
-- Ejecuta esta consulta para confirmar los cambios:
-- SELECT id, school_name, school_address, school_email, updated_at FROM school_settings;

-- =====================================================
-- ALTERNATIVA: SI NO HAY REGISTROS EXISTENTES
-- =====================================================
-- Si la tabla está vacía, insertar registro con "Avanza Polanco":
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

-- =====================================================
-- TESTING DESPUÉS DE EJECUTAR:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Ve al sistema Instituto Polanco en el navegador
-- 3. Presiona Ctrl + F5 para recargar completamente
-- 4. Verifica que en la parte superior izquierda aparece "Avanza Polanco"
-- 5. Ve a Configuración → Información para confirmar el cambio
-- =====================================================

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script actualiza el registro EXISTENTE en school_settings
-- 2. También actualiza direcciones y emails que contengan "Instituto Polanco"
-- 3. Si no hay registros, crea uno nuevo con "Avanza Polanco"
-- 4. El cambio será visible inmediatamente tras recargar (Ctrl + F5)
-- =====================================================

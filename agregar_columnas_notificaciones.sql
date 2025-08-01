-- =====================================================
-- AGREGAR COLUMNAS DE NOTIFICACIONES - INSTITUTO POLANCO
-- =====================================================
-- Este script agrega las columnas de notificaciones faltantes
-- en la tabla 'school_settings' para permitir el guardado
-- de configuración global sin errores PGRST204
-- =====================================================

-- 1. AGREGAR COLUMNA notifications_overdue_payments
-- Permite configurar notificaciones para pagos vencidos
ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS notifications_overdue_payments BOOLEAN DEFAULT true;

-- 2. AGREGAR COLUMNA notifications_upcoming_payments
-- Permite configurar notificaciones para pagos próximos a vencer
ALTER TABLE school_settings 
ADD COLUMN IF NOT EXISTS notifications_upcoming_payments BOOLEAN DEFAULT true;

-- 3. AGREGAR COMENTARIOS A LAS COLUMNAS
COMMENT ON COLUMN school_settings.notifications_overdue_payments IS 'Activar notificaciones para pagos vencidos';
COMMENT ON COLUMN school_settings.notifications_upcoming_payments IS 'Activar notificaciones para pagos próximos a vencer';

-- 4. ACTUALIZAR REGISTROS EXISTENTES (si los hay)
-- Asigna valores por defecto a registros que ya existen
UPDATE school_settings 
SET 
    notifications_overdue_payments = true,
    notifications_upcoming_payments = true
WHERE 
    notifications_overdue_payments IS NULL 
    OR notifications_upcoming_payments IS NULL;

-- =====================================================
-- VERIFICACIÓN DE LAS COLUMNAS CREADAS
-- =====================================================
-- Ejecuta esta consulta para verificar que las columnas se crearon correctamente:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'school_settings' 
-- AND column_name IN ('notifications_overdue_payments', 'notifications_upcoming_payments');

-- =====================================================
-- VERIFICAR CONFIGURACIÓN COMPLETA
-- =====================================================
-- Ejecuta esta consulta para ver toda la configuración:
-- SELECT id, background_theme, notifications_overdue_payments, notifications_upcoming_payments, created_at, updated_at 
-- FROM school_settings;

-- =====================================================
-- TESTING DESPUÉS DE EJECUTAR:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Recarga la página del sistema Instituto Polanco
-- 3. Ve a Configuración → Notificaciones
-- 4. Verifica que los switches de notificaciones aparecen
-- 5. Cambia alguna configuración y haz clic en "Guardar Toda la Configuración"
-- 6. Confirma que NO aparece error PGRST204 de notifications_overdue_payments
-- 7. Verifica que aparece mensaje de éxito
-- =====================================================

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Estas columnas permiten:
--    ✅ Configurar notificaciones para pagos vencidos
--    ✅ Configurar notificaciones para pagos próximos
--    ✅ Guardar configuración global sin errores
--
-- 2. Valores por defecto:
--    - notifications_overdue_payments: true (activado)
--    - notifications_upcoming_payments: true (activado)
--
-- 3. Tipo de datos: BOOLEAN (true/false)
-- =====================================================

-- =====================================================
-- CONFIGURAR POLÍTICAS RLS PARA SCHOOL_SETTINGS - INSTITUTO POLANCO
-- =====================================================
-- Este script configura las políticas de Row Level Security
-- para permitir operaciones en la tabla school_settings
-- sin comprometer la seguridad
-- =====================================================

-- 1. VERIFICAR SI RLS ESTÁ HABILITADO
-- Ejecuta esta consulta para verificar el estado actual:
-- SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'school_settings';

-- 2. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- Limpiar políticas anteriores que puedan estar causando conflictos
DROP POLICY IF EXISTS "Enable read access for all users" ON school_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON school_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON school_settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON school_settings;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON school_settings;

-- 3. POLÍTICA DE LECTURA PÚBLICA
-- Permite que cualquier usuario pueda leer la configuración de la escuela
CREATE POLICY "Enable read access for all users" ON school_settings
FOR SELECT USING (true);

-- 4. POLÍTICA DE INSERT PARA USUARIOS AUTENTICADOS
-- Permite que usuarios autenticados creen configuración inicial
CREATE POLICY "Enable insert for authenticated users" ON school_settings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. POLÍTICA DE UPDATE PARA USUARIOS AUTENTICADOS
-- Permite que usuarios autenticados actualicen la configuración
CREATE POLICY "Enable update for authenticated users" ON school_settings
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 6. POLÍTICA DE DELETE PARA USUARIOS AUTENTICADOS (OPCIONAL)
-- Permite que usuarios autenticados eliminen configuración si es necesario
CREATE POLICY "Enable delete for authenticated users" ON school_settings
FOR DELETE USING (auth.role() = 'authenticated');

-- 7. ASEGURAR QUE RLS ESTÁ HABILITADO
-- Habilitar RLS en la tabla si no está habilitado
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

-- 8. VERIFICAR POLÍTICAS CREADAS
-- Ejecuta esta consulta para confirmar que las políticas se crearon:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'school_settings';

-- =====================================================
-- ALTERNATIVA SIMPLE (SI LAS POLÍTICAS ANTERIORES NO FUNCIONAN)
-- =====================================================
-- Si las políticas anteriores siguen causando problemas,
-- puedes usar esta política más permisiva temporalmente:

-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON school_settings;
-- CREATE POLICY "Allow all operations for authenticated users" ON school_settings
-- FOR ALL USING (auth.role() = 'authenticated') 
-- WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- TESTING DESPUÉS DE EJECUTAR:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Recarga la página del sistema Instituto Polanco (Ctrl + F5)
-- 3. Ve a Configuración → cualquier pestaña
-- 4. Modifica alguna configuración
-- 5. Haz clic en "Guardar Toda la Configuración"
-- 6. Confirma que NO aparece error 42501 (RLS policy)
-- 7. Verifica que aparece mensaje de éxito
-- =====================================================

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Estas políticas permiten:
--    ✅ Lectura pública de configuración escolar
--    ✅ INSERT/UPDATE/DELETE para usuarios autenticados
--    ✅ Seguridad mantenida (solo usuarios autenticados pueden modificar)
--
-- 2. Si necesitas políticas más restrictivas:
--    - Puedes limitar por rol específico (ej: solo admins)
--    - Puedes agregar condiciones adicionales
--    - Puedes restringir DELETE si no es necesario
--
-- 3. El error 42501 indica que RLS está bloqueando la operación
--    Estas políticas resuelven el problema manteniendo seguridad
-- =====================================================

-- =====================================================
-- CONFIGURACIÓN RLS POLICIES PARA STORAGE - INSTITUTO POLANCO
-- =====================================================
-- Este script configura las políticas de Row Level Security
-- para permitir upload, lectura, actualización y eliminación
-- de archivos en el bucket 'schoolassets'
-- =====================================================

-- 1. POLÍTICA DE LECTURA PÚBLICA
-- Permite que cualquier usuario (autenticado o no) pueda leer archivos
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'schoolassets');

-- 2. POLÍTICA DE INSERT PARA USUARIOS AUTENTICADOS
-- Permite que usuarios autenticados suban archivos al bucket
CREATE POLICY "Enable insert for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'schoolassets' 
    AND auth.role() = 'authenticated'
);

-- 3. POLÍTICA DE UPDATE PARA PROPIETARIOS
-- Permite que usuarios actualicen solo sus propios archivos
CREATE POLICY "Enable update for users based on user_id" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'schoolassets' 
    AND auth.uid() = owner
) WITH CHECK (
    bucket_id = 'schoolassets' 
    AND auth.uid() = owner
);

-- 4. POLÍTICA DE DELETE PARA PROPIETARIOS
-- Permite que usuarios eliminen solo sus propios archivos
CREATE POLICY "Enable delete for users based on user_id" ON storage.objects
FOR DELETE USING (
    bucket_id = 'schoolassets' 
    AND auth.uid() = owner
);

-- 5. POLÍTICA ESPECIAL PARA ADMINISTRADORES
-- Permite que administradores gestionen todos los archivos del bucket
CREATE POLICY "Enable all operations for admin users" ON storage.objects
FOR ALL USING (
    bucket_id = 'schoolassets' 
    AND auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
    bucket_id = 'schoolassets' 
    AND auth.jwt() ->> 'role' = 'admin'
);

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS CREADAS
-- =====================================================
-- Ejecuta esta consulta para verificar que las políticas se crearon correctamente:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Estas políticas permiten:
--    ✅ Lectura pública de archivos (logos visibles para todos)
--    ✅ Upload de archivos por usuarios autenticados
--    ✅ Gestión de archivos por sus propietarios
--    ✅ Gestión completa por administradores
--
-- 2. El bucket 'schoolassets' debe estar marcado como público
--    para que las URLs públicas funcionen correctamente
--
-- 3. Si hay errores, verifica que:
--    - El bucket 'schoolassets' existe
--    - RLS está habilitado en storage.objects
--    - El usuario tiene permisos de autenticación válidos
-- =====================================================

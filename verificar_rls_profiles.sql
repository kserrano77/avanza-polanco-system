-- Script para verificar las políticas RLS de la tabla profiles
-- y diagnosticar problemas de permisos en la lista de usuarios

-- 1. Verificar si RLS está habilitado en la tabla profiles
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
JOIN pg_class ON pg_class.relname = pg_tables.tablename
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE tablename = 'profiles';

-- 2. Ver todas las políticas RLS de la tabla profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Intentar hacer una consulta directa a profiles como el usuario actual
SELECT 'Consulta directa a profiles:' as info;
SELECT id, email, full_name, role, created_at
FROM profiles 
LIMIT 5;

-- 4. Verificar el usuario actual autenticado
SELECT 'Usuario actual:' as info;
SELECT auth.uid() as current_user_id, auth.email() as current_user_email;

-- 5. Crear un perfil para el usuario actual si no existe (ROL ADMIN)
-- Este usuario será el administrador principal con permisos completos
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    auth.uid(),
    auth.email(),
    COALESCE(auth.email(), 'Administrador Principal'),
    'admin', -- ROL ADMIN: puede eliminar pagos, cortes de caja y usuarios
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
ON CONFLICT (id) DO NOTHING;

-- 5.1. Si ya existe el perfil, asegurar que tenga rol admin
UPDATE profiles 
SET role = 'admin', 
    full_name = COALESCE(full_name, 'Administrador Principal'),
    updated_at = NOW()
WHERE id = auth.uid() AND auth.uid() IS NOT NULL;

-- 6. Verificar que el perfil se creó correctamente
SELECT 'Perfil después de inserción:' as info;
SELECT id, email, full_name, role, created_at
FROM profiles 
WHERE id = auth.uid();

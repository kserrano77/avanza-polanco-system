-- Script para configurar políticas RLS completas en la tabla profiles
-- Permitir que el admin pueda crear/invitar usuarios y que todos puedan ver perfiles

-- 1. Verificar el estado actual de RLS y políticas
SELECT 'Estado actual de RLS en profiles:' as info;
SELECT schemaname, tablename, pg_class.relrowsecurity as rowsecurity, pg_class.relforcerowsecurity as forcerowsecurity
FROM pg_tables 
JOIN pg_class ON pg_class.relname = pg_tables.tablename
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE tablename = 'profiles';

-- 2. Ver políticas existentes
SELECT 'Políticas existentes:' as info;
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update" ON profiles;

-- 4. Habilitar RLS en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS correctas para el sistema de roles

-- POLÍTICA 1: Permitir lectura pública (para que todos puedan ver la lista de usuarios)
CREATE POLICY "Allow public read access to profiles" ON profiles
    FOR SELECT USING (true);

-- POLÍTICA 2: Permitir inserción para usuarios autenticados (para crear nuevos usuarios)
CREATE POLICY "Allow authenticated users to insert profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- POLÍTICA 3: Permitir actualización para usuarios autenticados de su propio perfil
CREATE POLICY "Allow users to update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- POLÍTICA 4: Permitir eliminación solo para administradores
CREATE POLICY "Allow admin to delete profiles" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Verificar que las políticas se crearon correctamente
SELECT 'Políticas después de configuración:' as info;
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. Probar inserción de un usuario de prueba
SELECT 'Probando inserción de usuario de prueba:' as info;
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'test.recepcionista@avanzapolanco.com',
    'Usuario Recepcionista - Prueba',
    'receptionist',
    NOW(),
    NOW()
);

-- 8. Verificar que el usuario de prueba se insertó
SELECT 'Usuario de prueba insertado:' as info;
SELECT id, email, full_name, role, created_at
FROM profiles 
WHERE email = 'test.recepcionista@avanzapolanco.com';

-- 9. Mensaje de confirmación
SELECT 'POLÍTICAS RLS CONFIGURADAS EXITOSAMENTE' as resultado,
       'Admin puede crear usuarios, todos pueden ver perfiles' as detalle;

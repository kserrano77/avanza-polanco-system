-- Script para configurar SOLO las políticas RLS en la tabla profiles
-- Sin intentar insertar usuarios de prueba (para evitar error de foreign key)

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
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow admin to delete profiles" ON profiles;

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

-- 7. Verificar constraint de foreign key
SELECT 'Constraint de foreign key en profiles:' as info;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'profiles';

-- 8. Mensaje de confirmación
SELECT 'POLÍTICAS RLS CONFIGURADAS EXITOSAMENTE' as resultado,
       'Admin puede crear usuarios desde la UI, sin errores de foreign key' as detalle;

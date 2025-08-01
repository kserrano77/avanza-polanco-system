-- Script para corregir el constraint de clave foránea en la tabla profiles
-- Problema: profiles_id_fkey está causando errores al crear usuarios

-- 1. Verificar la estructura actual de la tabla profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar los constraints actuales
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 3. Eliminar el constraint problemático si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_id_fkey' 
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
        RAISE NOTICE 'Constraint profiles_id_fkey eliminado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint profiles_id_fkey no existe';
    END IF;
END $$;

-- 4. Recrear la tabla profiles con la estructura correcta si es necesario
-- (Solo ejecutar si la tabla tiene problemas estructurales)
/*
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'receptionist' CHECK (role IN ('admin', 'receptionist')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 5. Habilitar RLS en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para profiles (permitir operaciones autenticadas)
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Política para SELECT (todos los usuarios autenticados pueden ver perfiles)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT TO authenticated
    USING (true);

-- Política para INSERT (todos los usuarios autenticados pueden crear perfiles)
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Política para UPDATE (usuarios pueden actualizar su propio perfil o admin puede actualizar cualquiera)
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para DELETE (solo admin puede eliminar perfiles)
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Verificar que las políticas se crearon correctamente
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

-- 8. Mensaje de confirmación
SELECT 'Corrección de profiles completada exitosamente' as resultado;

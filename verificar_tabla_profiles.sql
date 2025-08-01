-- Script para verificar el contenido de la tabla profiles
-- y diagnosticar por qué la lista de usuarios está vacía

-- 1. Verificar si la tabla profiles existe y su estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Contar cuántos registros hay en profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 3. Mostrar todos los usuarios en profiles (si los hay)
SELECT id, email, full_name, role, created_at, updated_at
FROM profiles 
ORDER BY created_at DESC;

-- 4. Verificar usuarios en auth.users (tabla de autenticación de Supabase)
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- 5. Verificar si hay usuarios en auth.users pero no en profiles
SELECT au.id, au.email, au.created_at as auth_created,
       p.id as profile_id, p.full_name, p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

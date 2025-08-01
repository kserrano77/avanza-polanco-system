-- Verificar políticas RLS en la tabla cash_cuts
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cash_cuts' AND schemaname = 'public';

-- 2. Ver todas las políticas de la tabla cash_cuts
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
WHERE tablename = 'cash_cuts' AND schemaname = 'public';

-- 3. Verificar si el usuario actual puede eliminar
-- (Ejecutar como el usuario admin actual)
SELECT 
    current_user,
    session_user,
    current_setting('role') as current_role;

-- 4. Probar eliminación manual (solo para testing)
-- DELETE FROM cash_cuts WHERE cut_number = 'NUMERO_DEL_CORTE_A_PROBAR';
-- SELECT * FROM cash_cuts ORDER BY created_at DESC LIMIT 5;

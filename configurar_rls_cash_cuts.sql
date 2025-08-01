-- Configurar políticas RLS para la tabla cash_cuts
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cash_cuts' AND schemaname = 'public';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE cash_cuts ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes si las hay (para empezar limpio)
DROP POLICY IF EXISTS "cash_cuts_select_policy" ON cash_cuts;
DROP POLICY IF EXISTS "cash_cuts_insert_policy" ON cash_cuts;
DROP POLICY IF EXISTS "cash_cuts_update_policy" ON cash_cuts;
DROP POLICY IF EXISTS "cash_cuts_delete_policy" ON cash_cuts;

-- 4. Crear políticas para SELECT (todos los usuarios autenticados pueden ver)
CREATE POLICY "cash_cuts_select_policy" ON cash_cuts
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Crear políticas para INSERT (todos los usuarios autenticados pueden crear)
CREATE POLICY "cash_cuts_insert_policy" ON cash_cuts
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 6. Crear políticas para UPDATE (todos los usuarios autenticados pueden actualizar)
CREATE POLICY "cash_cuts_update_policy" ON cash_cuts
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Crear políticas para DELETE (solo admin puede eliminar)
CREATE POLICY "cash_cuts_delete_policy" ON cash_cuts
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 8. Verificar que las políticas se crearon correctamente
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
WHERE tablename = 'cash_cuts' AND schemaname = 'public'
ORDER BY cmd, policyname;

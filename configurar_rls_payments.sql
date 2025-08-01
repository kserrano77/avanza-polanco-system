-- Configurar políticas RLS para la tabla payments
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estado actual de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'payments' AND schemaname = 'public';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes si las hay (para empezar limpio)
DROP POLICY IF EXISTS "payments_select_policy" ON payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;
DROP POLICY IF EXISTS "payments_update_policy" ON payments;
DROP POLICY IF EXISTS "payments_delete_policy" ON payments;

-- 4. Crear políticas para SELECT (todos los usuarios autenticados pueden ver)
CREATE POLICY "payments_select_policy" ON payments
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Crear políticas para INSERT (todos los usuarios autenticados pueden crear)
CREATE POLICY "payments_insert_policy" ON payments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 6. Crear políticas para UPDATE (todos los usuarios autenticados pueden actualizar)
CREATE POLICY "payments_update_policy" ON payments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Crear políticas para DELETE (solo admin puede eliminar)
CREATE POLICY "payments_delete_policy" ON payments
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
WHERE tablename = 'payments' AND schemaname = 'public'
ORDER BY cmd, policyname;

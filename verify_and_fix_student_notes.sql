-- Script de verificación y corrección para tabla student_notes

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'student_notes'
);

-- 2. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_notes'
ORDER BY ordinal_position;

-- 3. VERIFICAR FOREIGN KEYS
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
WHERE tc.table_name = 'student_notes' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 4. VERIFICAR POLÍTICAS RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'student_notes';

-- 5. SI HAY PROBLEMAS, EJECUTAR ESTO:
-- (Descomenta las líneas que necesites)

-- Eliminar tabla si existe (¡CUIDADO! Esto borra todos los datos)
-- DROP TABLE IF EXISTS student_notes CASCADE;

-- Recrear tabla desde cero
-- CREATE TABLE student_notes (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
--   category VARCHAR(50) NOT NULL DEFAULT 'general',
--   content TEXT NOT NULL,
--   is_important BOOLEAN DEFAULT FALSE,
--   created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'student_notes';

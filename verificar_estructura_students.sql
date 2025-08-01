-- =====================================================
-- VERIFICAR ESTRUCTURA REAL DE LA TABLA STUDENTS - AVANZA POLANCO
-- =====================================================
-- Este script verifica cuál es la estructura real de la tabla students
-- para alinear el código frontend con las columnas que realmente existen
-- =====================================================

-- 1. VERIFICAR SI LA TABLA STUDENTS EXISTE
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'students'
) AS table_exists;

-- 2. OBTENER TODAS LAS COLUMNAS DE LA TABLA STUDENTS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR CONSTRAINTS Y CLAVES
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'students'
AND tc.table_schema = 'public';

-- 4. VERIFICAR RELACIONES (FOREIGN KEYS)
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'students'
AND tc.table_schema = 'public';

-- 5. VERIFICAR DATOS EXISTENTES (PRIMEROS 3 REGISTROS)
SELECT * FROM students LIMIT 3;

-- 6. CONTAR REGISTROS TOTALES
SELECT COUNT(*) as total_students FROM students;

-- =====================================================
-- RESULTADOS ESPERADOS:
-- =====================================================
-- Después de ejecutar este script, tendrás:
-- 1. Confirmación de que la tabla existe
-- 2. Lista completa de columnas reales con sus tipos
-- 3. Constraints y claves primarias/foráneas
-- 4. Relaciones con otras tablas
-- 5. Muestra de datos existentes
-- 6. Total de registros
-- =====================================================

-- =====================================================
-- POSIBLES NOMBRES DE COLUMNAS REALES:
-- =====================================================
-- Basado en errores anteriores, es probable que la tabla tenga:
-- - first_name, last_name (en lugar de name)
-- - student_number (en lugar de name como identificador)
-- - email, phone, address, birth_date
-- - enrollment_date, status
-- - course_id (en lugar de course)
-- - schedule_id (si existe relación con schedules)
-- =====================================================

-- =====================================================
-- PRÓXIMOS PASOS TRAS EJECUTAR:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Anota EXACTAMENTE qué columnas existen
-- 3. Compara con el código de StudentsSection.jsx
-- 4. Crea script de corrección para alinear código con esquema real
-- 5. Actualiza formularios, queries y lógica de estudiantes
-- =====================================================

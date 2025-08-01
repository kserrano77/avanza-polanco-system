-- Script para verificar la estructura real de las tablas courses y schedules
-- Identificar columnas existentes para corregir el código frontend

-- 1. Verificar estructura de la tabla courses
SELECT 'Estructura de la tabla COURSES:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estructura de la tabla schedules
SELECT 'Estructura de la tabla SCHEDULES:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar constraints de courses
SELECT 'Constraints de la tabla COURSES:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'courses';

-- 4. Verificar constraints de schedules
SELECT 'Constraints de la tabla SCHEDULES:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'schedules';

-- 5. Verificar datos de ejemplo en courses (si existen)
SELECT 'Datos de ejemplo en COURSES:' as info;
SELECT * FROM courses LIMIT 3;

-- 6. Verificar datos de ejemplo en schedules (si existen)
SELECT 'Datos de ejemplo en SCHEDULES:' as info;
SELECT * FROM schedules LIMIT 3;

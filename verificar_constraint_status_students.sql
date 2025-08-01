-- Script para verificar el constraint de status en la tabla students
-- Esto nos mostrará qué valores son permitidos para el campo status

-- Verificar el constraint de status
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname = 'students_status_check';

-- También verificar todos los constraints de la tabla students
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'students');

-- Verificar los valores únicos actuales en la columna status
SELECT DISTINCT status, COUNT(*) as count
FROM students 
GROUP BY status
ORDER BY status;

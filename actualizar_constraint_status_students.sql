-- Script para actualizar el constraint de status en la tabla students
-- Permitir valores: active, inactive, temporary_leave, definitive_leave, graduated

-- Primero eliminar el constraint existente
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check;

-- Crear el nuevo constraint con todos los valores permitidos
ALTER TABLE students ADD CONSTRAINT students_status_check 
CHECK (status IN ('active', 'inactive', 'temporary_leave', 'definitive_leave', 'graduated'));

-- Verificar que el constraint se aplicó correctamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname = 'students_status_check';

-- Mostrar mensaje de confirmación
SELECT 'Constraint de status actualizado exitosamente. Ahora permite: active, inactive, temporary_leave, definitive_leave, graduated' AS resultado;

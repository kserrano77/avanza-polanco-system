-- SCRIPT DE LIMPIEZA COMPLETA DE DATOS DE PRUEBA
-- Sistema Avanza Polanco
-- Elimina todos los datos de prueba manteniendo la integridad referencial

-- ⚠️ IMPORTANTE: Este script eliminará TODOS los datos de prueba
-- Ejecutar solo si quieres limpiar completamente el sistema

BEGIN;

-- 1. Eliminar documentos emitidos (issued_documents)
DELETE FROM issued_documents 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE student_number LIKE 'EST-%' 
  OR email LIKE '%@test.com' 
  OR email LIKE '%@ejemplo.com'
  OR first_name = 'Juan' 
  OR first_name = 'María'
  OR first_name = 'Carlos'
  OR first_name = 'Ana'
  OR first_name = 'Luis'
);

-- 2. Eliminar pagos asociados a estudiantes de prueba
DELETE FROM payments 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE student_number LIKE 'EST-%' 
  OR email LIKE '%@test.com' 
  OR email LIKE '%@ejemplo.com'
  OR first_name = 'Juan' 
  OR first_name = 'María'
  OR first_name = 'Carlos'
  OR first_name = 'Ana'
  OR first_name = 'Luis'
);

-- 3. Eliminar estudiantes de prueba
DELETE FROM students 
WHERE student_number LIKE 'EST-%' 
OR email LIKE '%@test.com' 
OR email LIKE '%@ejemplo.com'
OR first_name = 'Juan' 
OR first_name = 'María'
OR first_name = 'Carlos'
OR first_name = 'Ana'
OR first_name = 'Luis';

-- 4. Eliminar cursos de prueba (opcional)
DELETE FROM courses 
WHERE name LIKE '%PRUEBA%' 
OR name LIKE '%TEST%'
OR name LIKE '%Ejemplo%';

-- 5. Eliminar horarios de prueba asociados a cursos eliminados
DELETE FROM schedules 
WHERE course_id NOT IN (SELECT id FROM courses);

-- 6. Limpiar cortes de caja de prueba (opcional)
DELETE FROM cash_cuts 
WHERE notes LIKE '%prueba%' 
OR notes LIKE '%test%';

-- 7. Limpiar auditoría de prueba (opcional)
DELETE FROM audit_log 
WHERE table_name = 'students' 
AND operation = 'INSERT' 
AND created_at > '2025-07-01';

COMMIT;

-- Verificar limpieza
SELECT 'Estudiantes restantes:' as tabla, COUNT(*) as cantidad FROM students
UNION ALL
SELECT 'Pagos restantes:', COUNT(*) FROM payments
UNION ALL
SELECT 'Documentos restantes:', COUNT(*) FROM issued_documents
UNION ALL
SELECT 'Cursos restantes:', COUNT(*) FROM courses
UNION ALL
SELECT 'Horarios restantes:', COUNT(*) FROM schedules;

-- Mensaje de confirmación
SELECT '✅ LIMPIEZA COMPLETA FINALIZADA' as resultado;

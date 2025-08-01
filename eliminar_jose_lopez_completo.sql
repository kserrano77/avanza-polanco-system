-- SCRIPT COMPLETO PARA ELIMINAR JOSÉ LÓPEZ
-- Sistema Avanza Polanco
-- Estudiante: José López (#POL20250730004908)
-- Email: josé.lópez4@institutopolanco.edu.mx

BEGIN;

-- Primero, encontrar el ID del estudiante por sus datos
-- (Usaremos múltiples criterios para asegurar que encontramos el correcto)

-- 1. Eliminar de issued_documents usando email y número de estudiante
DELETE FROM issued_documents 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
  OR student_number = 'POL20250730004908'
  OR (first_name = 'José' AND last_name = 'López')
);

-- 2. Eliminar de payments
DELETE FROM payments 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
  OR student_number = 'POL20250730004908'
  OR (first_name = 'José' AND last_name = 'López')
);

-- 3. Eliminar de audit_log (si existe)
DELETE FROM audit_log 
WHERE record_id IN (
  SELECT id FROM students 
  WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
  OR student_number = 'POL20250730004908'
  OR (first_name = 'José' AND last_name = 'López')
);

-- 4. Eliminar de cualquier otra tabla que pueda referenciar estudiantes
-- (Agregar más según sea necesario)

-- 5. Finalmente eliminar el estudiante
DELETE FROM students 
WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
OR student_number = 'POL20250730004908'
OR (first_name = 'José' AND last_name = 'López');

COMMIT;

-- Verificar eliminación
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ José López eliminado exitosamente'
    ELSE CONCAT('❌ Aún quedan ', COUNT(*), ' registros de José López')
  END as resultado
FROM students 
WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
OR student_number = 'POL20250730004908'
OR (first_name = 'José' AND last_name = 'López');

-- Verificar que no quedan referencias
SELECT 'issued_documents' as tabla, COUNT(*) as referencias_restantes
FROM issued_documents 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
  OR student_number = 'POL20250730004908'
)
UNION ALL
SELECT 'payments', COUNT(*)
FROM payments 
WHERE student_id IN (
  SELECT id FROM students 
  WHERE email = 'josé.lópez4@institutopolanco.edu.mx'
  OR student_number = 'POL20250730004908'
);

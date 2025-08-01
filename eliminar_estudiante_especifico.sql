-- SCRIPT PARA ELIMINAR ESTUDIANTE ESPECÍFICO CON DOCUMENTOS ASOCIADOS
-- Sistema Avanza Polanco
-- ID del estudiante problemático: 58921e87-f380-43cc-ae47-02b8236d7bbe

BEGIN;

-- 1. Primero eliminar TODOS los documentos emitidos para este estudiante específico
DELETE FROM issued_documents 
WHERE student_id = '58921e87-f380-43cc-ae47-02b8236d7bbe';

-- 2. Eliminar pagos asociados a este estudiante específico
DELETE FROM payments 
WHERE student_id = '58921e87-f380-43cc-ae47-02b8236d7bbe';

-- 3. Eliminar cualquier otro registro que pueda referenciar a este estudiante
-- (Agregar más tablas si es necesario)

-- 4. Finalmente eliminar el estudiante
DELETE FROM students 
WHERE id = '58921e87-f380-43cc-ae47-02b8236d7bbe';

COMMIT;

-- Verificar que se eliminó correctamente
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Estudiante eliminado exitosamente'
    ELSE '❌ El estudiante aún existe'
  END as resultado
FROM students 
WHERE id = '58921e87-f380-43cc-ae47-02b8236d7bbe';

-- Verificar que no quedan documentos huérfanos
SELECT 
  COUNT(*) as documentos_huerfanos
FROM issued_documents 
WHERE student_id = '58921e87-f380-43cc-ae47-02b8236d7bbe';

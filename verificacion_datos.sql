-- =====================================================
-- VERIFICACIÓN COMPLETA DE DATOS - INSTITUTO POLANCO
-- =====================================================
-- Script para verificar inserción exitosa y unicidad
-- Conteo de registros y validación de constraints
-- Verificación de integridad referencial

-- =====================================================
-- 1. CONTEO COMPLETO DE REGISTROS
-- =====================================================
SELECT 
  '🎯 RESUMEN COMPLETO DE DATOS - INSTITUTO POLANCO' as descripcion,
  '' as tabla,
  null as registros,
  '' as estado
UNION ALL
SELECT '', 'school_settings', count(*), 
  CASE WHEN count(*) = 1 THEN '✅ OK' ELSE '❌ ERROR' END
FROM school_settings
UNION ALL
SELECT '', 'courses', count(*), 
  CASE WHEN count(*) = 8 THEN '✅ OK' ELSE '❌ ERROR' END
FROM courses
UNION ALL
SELECT '', 'schedules', count(*), 
  CASE WHEN count(*) = 8 THEN '✅ OK' ELSE '❌ ERROR' END
FROM schedules
UNION ALL
SELECT '', 'students', count(*), 
  CASE WHEN count(*) = 24 THEN '✅ OK' ELSE '❌ ERROR' END
FROM students
UNION ALL
SELECT '', 'payments', count(*), 
  CASE WHEN count(*) = 48 THEN '✅ OK' ELSE '❌ ERROR' END
FROM payments
UNION ALL
SELECT '', 'cash_cuts', count(*), 
  CASE WHEN count(*) = 3 THEN '✅ OK' ELSE '❌ ERROR' END
FROM cash_cuts
UNION ALL
SELECT '', 'document_templates', count(*), 
  CASE WHEN count(*) = 3 THEN '✅ OK' ELSE '❌ ERROR' END
FROM document_templates
UNION ALL
SELECT '', 'issued_documents', count(*), 
  CASE WHEN count(*) = 10 THEN '✅ OK' ELSE '❌ ERROR' END
FROM issued_documents
UNION ALL
SELECT '', 'audit_log', count(*), 
  CASE WHEN count(*) = 5 THEN '✅ OK' ELSE '❌ ERROR' END
FROM audit_log;

-- =====================================================
-- 2. VERIFICACIÓN DE UNICIDAD EN CAMPOS ÚNICOS
-- =====================================================

-- Verificar student_number únicos
SELECT 
  '🔍 VERIFICACIÓN DE UNICIDAD' as verificacion,
  'student_number' as campo,
  count(*) as total_registros,
  count(DISTINCT student_number) as valores_unicos,
  CASE 
    WHEN count(*) = count(DISTINCT student_number) THEN '✅ ÚNICOS'
    ELSE '❌ DUPLICADOS DETECTADOS'
  END as estado
FROM students
UNION ALL
-- Verificar receipt_number únicos
SELECT 
  '',
  'receipt_number',
  count(*),
  count(DISTINCT receipt_number),
  CASE 
    WHEN count(*) = count(DISTINCT receipt_number) THEN '✅ ÚNICOS'
    ELSE '❌ DUPLICADOS DETECTADOS'
  END
FROM payments
UNION ALL
-- Verificar cut_number únicos
SELECT 
  '',
  'cut_number',
  count(*),
  count(DISTINCT cut_number),
  CASE 
    WHEN count(*) = count(DISTINCT cut_number) THEN '✅ ÚNICOS'
    ELSE '❌ DUPLICADOS DETECTADOS'
  END
FROM cash_cuts;

-- =====================================================
-- 3. VERIFICACIÓN DE INTEGRIDAD REFERENCIAL
-- =====================================================

-- Verificar que todos los estudiantes tienen course_id válido
SELECT 
  '🔗 INTEGRIDAD REFERENCIAL' as verificacion,
  'students -> courses' as relacion,
  count(*) as total_estudiantes,
  count(c.id) as cursos_encontrados,
  CASE 
    WHEN count(*) = count(c.id) THEN '✅ INTEGRIDAD OK'
    ELSE '❌ REFERENCIAS ROTAS'
  END as estado
FROM students s
LEFT JOIN courses c ON s.course_id = c.id
UNION ALL
-- Verificar que todos los pagos tienen student_id válido
SELECT 
  '',
  'payments -> students',
  count(*),
  count(s.id),
  CASE 
    WHEN count(*) = count(s.id) THEN '✅ INTEGRIDAD OK'
    ELSE '❌ REFERENCIAS ROTAS'
  END
FROM payments p
LEFT JOIN students s ON p.student_id = s.id
UNION ALL
-- Verificar que todos los horarios tienen course_id válido
SELECT 
  '',
  'schedules -> courses',
  count(*),
  count(c.id),
  CASE 
    WHEN count(*) = count(c.id) THEN '✅ INTEGRIDAD OK'
    ELSE '❌ REFERENCIAS ROTAS'
  END
FROM schedules sc
LEFT JOIN courses c ON sc.course_id = c.id;

-- =====================================================
-- 4. VERIFICACIÓN DE DATOS ESPECÍFICOS
-- =====================================================

-- Verificar configuración de Instituto Polanco
SELECT 
  '🏫 CONFIGURACIÓN INSTITUTO POLANCO' as verificacion,
  school_name,
  school_code,
  CASE 
    WHEN school_name = 'Instituto Polanco' AND school_code = 'INSTITUTO_POLANCO' 
    THEN '✅ CONFIGURACIÓN CORRECTA'
    ELSE '❌ CONFIGURACIÓN INCORRECTA'
  END as estado
FROM school_settings;

-- Verificar estudiantes activos
SELECT 
  '👥 ESTUDIANTES ACTIVOS' as verificacion,
  count(*) as total_activos,
  CASE 
    WHEN count(*) = 24 THEN '✅ TODOS ACTIVOS'
    ELSE '❌ ESTADOS INCORRECTOS'
  END as estado
FROM students 
WHERE status = 'active';

-- Verificar cursos activos
SELECT 
  '📚 CURSOS ACTIVOS' as verificacion,
  count(*) as total_activos,
  CASE 
    WHEN count(*) = 8 THEN '✅ TODOS ACTIVOS'
    ELSE '❌ ESTADOS INCORRECTOS'
  END as estado
FROM courses 
WHERE is_active = true;

-- =====================================================
-- 5. MUESTRA DE DATOS INSERTADOS
-- =====================================================

-- Mostrar algunos estudiantes como ejemplo
SELECT 
  '📋 MUESTRA DE ESTUDIANTES INSERTADOS' as muestra,
  student_number,
  first_name || ' ' || last_name as nombre_completo,
  email,
  status
FROM students 
LIMIT 5;

-- Mostrar algunos pagos como ejemplo
SELECT 
  '💰 MUESTRA DE PAGOS INSERTADOS' as muestra,
  receipt_number,
  amount,
  concept,
  payment_method,
  payment_date
FROM payments 
LIMIT 5;

-- =====================================================
-- 6. RESULTADO FINAL
-- =====================================================
SELECT 
  CASE 
    WHEN (SELECT count(*) FROM students) = 24 
     AND (SELECT count(*) FROM payments) = 48
     AND (SELECT count(*) FROM courses) = 8
     AND (SELECT count(*) FROM schedules) = 8
     AND (SELECT count(DISTINCT student_number) FROM students) = 24
     AND (SELECT count(DISTINCT receipt_number) FROM payments) = 48
    THEN '🎉 INSERCIÓN COMPLETAMENTE EXITOSA - INSTITUTO POLANCO LISTO'
    ELSE '❌ PROBLEMAS DETECTADOS - REVISAR DATOS'
  END as resultado_final;

-- =====================================================
-- ✅ VERIFICACIÓN COMPLETA - INSTITUTO POLANCO
-- ✅ Conteo de registros
-- ✅ Verificación de unicidad
-- ✅ Integridad referencial
-- ✅ Configuración correcta
-- ✅ Muestra de datos
-- =====================================================

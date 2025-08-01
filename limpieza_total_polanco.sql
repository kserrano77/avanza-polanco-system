-- =====================================================
-- LIMPIEZA TOTAL AGRESIVA - INSTITUTO POLANCO
-- =====================================================
-- Script para limpiar COMPLETAMENTE todas las tablas
-- Orden correcto respetando foreign keys
-- Solución definitiva para errores de duplicados

-- =====================================================
-- PASO 1: DESHABILITAR VERIFICACIONES TEMPORALMENTE
-- =====================================================
SET session_replication_role = replica;

-- =====================================================
-- PASO 2: TRUNCATE TODAS LAS TABLAS (ORDEN CORRECTO)
-- =====================================================

-- Tablas dependientes primero (con foreign keys)
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE issued_documents CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE schedules CASCADE;
TRUNCATE TABLE cash_cuts CASCADE;

-- Tablas independientes
TRUNCATE TABLE document_templates CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE school_settings CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- =====================================================
-- PASO 3: RESTABLECER VERIFICACIONES
-- =====================================================
SET session_replication_role = DEFAULT;

-- =====================================================
-- PASO 4: VERIFICACIÓN DE LIMPIEZA
-- =====================================================

-- Verificar que todas las tablas están vacías
SELECT 
  'VERIFICACIÓN DE LIMPIEZA TOTAL' as status,
  '' as tabla,
  null as registros
UNION ALL
SELECT '', 'profiles', count(*) FROM profiles
UNION ALL
SELECT '', 'school_settings', count(*) FROM school_settings
UNION ALL
SELECT '', 'courses', count(*) FROM courses
UNION ALL
SELECT '', 'schedules', count(*) FROM schedules
UNION ALL
SELECT '', 'students', count(*) FROM students
UNION ALL
SELECT '', 'payments', count(*) FROM payments
UNION ALL
SELECT '', 'cash_cuts', count(*) FROM cash_cuts
UNION ALL
SELECT '', 'document_templates', count(*) FROM document_templates
UNION ALL
SELECT '', 'issued_documents', count(*) FROM issued_documents
UNION ALL
SELECT '', 'audit_log', count(*) FROM audit_log;

-- =====================================================
-- RESULTADO ESPERADO: TODAS LAS TABLAS EN 0
-- =====================================================
-- profiles: 0
-- school_settings: 0
-- courses: 0
-- schedules: 0
-- students: 0
-- payments: 0
-- cash_cuts: 0
-- document_templates: 0
-- issued_documents: 0
-- audit_log: 0
-- =====================================================

SELECT 'LIMPIEZA TOTAL COMPLETADA - INSTITUTO POLANCO' as mensaje;

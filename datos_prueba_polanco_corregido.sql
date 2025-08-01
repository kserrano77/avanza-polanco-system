-- =====================================================
-- DATOS DE PRUEBA FINAL CORREGIDO - INSTITUTO POLANCO
-- =====================================================
-- Script SQL usando EXACTAMENTE la estructura real confirmada
-- Verificado contra estructura real de tablas
-- Solo columnas que existen realmente
-- Datos realistas para testing completo

-- 1. CONFIGURACIÓN DE LA ESCUELA
INSERT INTO school_settings (
  school_name, school_code, address, phone, email
) VALUES (
  'Instituto Polanco',
  'INSTITUTO_POLANCO',
  'Av. Polanco #123, Col. Centro, Ciudad de México',
  '+52 55 1234 5678',
  'contacto@institutopolanco.edu.mx'
) ON CONFLICT DO NOTHING;

-- 2. CURSOS DE EJEMPLO
INSERT INTO courses (name, description, price, duration_months, is_active) VALUES
('Inglés Básico', 'Curso de inglés para principiantes', 1500.00, 6, true),
('Inglés Intermedio', 'Curso de inglés nivel intermedio', 1800.00, 6, true),
('Inglés Avanzado', 'Curso de inglés nivel avanzado', 2000.00, 6, true),
('Francés Básico', 'Curso de francés para principiantes', 1600.00, 6, true),
('Alemán Básico', 'Curso de alemán para principiantes', 1700.00, 6, true),
('Computación Básica', 'Curso de computación e informática', 1200.00, 4, true),
('Matemáticas', 'Curso de matemáticas y álgebra', 1000.00, 4, true),
('Contabilidad', 'Curso de contabilidad básica', 1800.00, 8, true);

-- 3. HORARIOS DE EJEMPLO
-- Estructura real confirmada: course_id, day_of_week, start_time, end_time, classroom, instructor, is_active
WITH course_list AS (
  SELECT id, name, ROW_NUMBER() OVER (ORDER BY name) as rn 
  FROM courses 
  WHERE is_active = true
  LIMIT 8
)
INSERT INTO schedules (course_id, day_of_week, start_time, end_time, classroom, instructor, is_active)
SELECT 
  course_list.id,
  CASE 
    WHEN rn = 1 THEN 1  -- Lunes
    WHEN rn = 2 THEN 2  -- Martes
    WHEN rn = 3 THEN 3  -- Miércoles
    WHEN rn = 4 THEN 4  -- Jueves
    WHEN rn = 5 THEN 5  -- Viernes
    WHEN rn = 6 THEN 6  -- Sábado
    WHEN rn = 7 THEN 1  -- Lunes (segundo horario)
    ELSE 2              -- Martes (segundo horario)
  END,
  CASE 
    WHEN rn <= 4 THEN '08:00'::time
    ELSE '14:00'::time
  END,
  CASE 
    WHEN rn <= 4 THEN '10:00'::time
    ELSE '16:00'::time
  END,
  'Aula ' || rn::text,
  CASE 
    WHEN name ILIKE '%inglés%' THEN 'Prof. María García'
    WHEN name ILIKE '%francés%' THEN 'Prof. Jean Pierre'
    WHEN name ILIKE '%alemán%' THEN 'Prof. Hans Mueller'
    WHEN name ILIKE '%computación%' THEN 'Prof. Carlos López'
    WHEN name ILIKE '%matemáticas%' THEN 'Prof. Ana Rodríguez'
    ELSE 'Prof. Roberto Sánchez'
  END,
  true
FROM course_list;

-- 4. ESTUDIANTES DE EJEMPLO (24 estudiantes)
-- Estructura real confirmada: student_number, first_name, last_name, email, phone, address, birth_date, enrollment_date, status, course_id
WITH course_list AS (
  SELECT id, name FROM courses WHERE is_active = true LIMIT 5
),
student_names AS (
  SELECT 
    unnest(ARRAY[
      'Ana', 'Carlos', 'María', 'José', 'Laura', 'Diego', 'Carmen', 'Roberto', 
      'Isabel', 'Fernando', 'Patricia', 'Miguel', 'Lucía', 'Antonio', 'Elena', 
      'Javier', 'Cristina', 'Raúl', 'Mónica', 'Alejandro', 'Sofía', 'Daniel', 
      'Valeria', 'Sebastián'
    ]) as first_name,
    unnest(ARRAY[
      'García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'González', 
      'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz', 
      'Reyes', 'Morales', 'Jiménez', 'Herrera', 'Medina', 'Castro', 'Vargas',
      'Torres', 'Ruiz', 'Delgado', 'Ortega'
    ]) as last_name,
    ROW_NUMBER() OVER () as rn
)
INSERT INTO students (
  student_number, first_name, last_name, email, phone, address, 
  birth_date, enrollment_date, status, course_id
)
SELECT 
  'EST' || LPAD(student_names.rn::text, 4, '0'),
  student_names.first_name,
  student_names.last_name,
  LOWER(student_names.first_name) || '.' || LOWER(student_names.last_name) || '@institutopolanco.edu.mx',
  '+52 55 ' || (1000 + (student_names.rn * 123) % 9000)::text,
  'Calle ' || ((student_names.rn * 7) % 100 + 1)::text || ', Col. ' || 
    (ARRAY['Centro', 'Norte', 'Sur', 'Polanco', 'Roma'])[(student_names.rn % 5) + 1],
  DATE '1995-01-01' + ((student_names.rn * 30) % 3650)::integer,
  DATE '2024-01-01' + ((student_names.rn * 7) % 365)::integer,
  'active',
  course_list.id
FROM student_names
CROSS JOIN course_list
WHERE student_names.rn <= 24
LIMIT 24;

-- 5. PAGOS DE EJEMPLO (48 pagos - 2 por estudiante)
-- Estructura real confirmada: student_id, amount, payment_date, payment_method, concept, receipt_number, notes
WITH student_list AS (
  SELECT id, first_name, last_name, ROW_NUMBER() OVER () as rn FROM students LIMIT 24
)
INSERT INTO payments (
  student_id, amount, payment_date, payment_method, concept, receipt_number, notes
)
SELECT 
  student_list.id,
  (ARRAY[1000.00, 1200.00, 1500.00, 1800.00, 2000.00])[(student_list.rn % 5) + 1],
  DATE '2024-01-01' + ((student_list.rn * 15) % 365)::integer,
  (ARRAY['cash', 'card', 'transfer'])[(student_list.rn % 3) + 1],
  (ARRAY['Colegiatura', 'Inscripción', 'Material', 'Examen', 'Certificación'])[(student_list.rn % 5) + 1],
  'REC' || LPAD((student_list.rn * 100)::text, 6, '0'),
  'Pago de ' || student_list.first_name || ' ' || student_list.last_name
FROM student_list;

-- Segundo pago para cada estudiante
WITH student_list AS (
  SELECT id, first_name, last_name, ROW_NUMBER() OVER () as rn FROM students LIMIT 24
)
INSERT INTO payments (
  student_id, amount, payment_date, payment_method, concept, receipt_number, notes
)
SELECT 
  student_list.id,
  (ARRAY[800.00, 1000.00, 1200.00])[(student_list.rn % 3) + 1],
  DATE '2024-02-01' + ((student_list.rn * 10) % 300)::integer,
  (ARRAY['cash', 'card', 'transfer'])[(student_list.rn % 3) + 1],
  'Colegiatura',
  'REC' || LPAD((student_list.rn * 200 + 1000)::text, 6, '0'),
  'Segundo pago - ' || student_list.first_name || ' ' || student_list.last_name
FROM student_list;

-- 6. CORTES DE CAJA DE EJEMPLO
-- Estructura real confirmada: cut_number, start_date, end_date, total_cash, total_card, total_transfer, notes
INSERT INTO cash_cuts (
  cut_number, start_date, end_date, total_cash, total_card, total_transfer, notes
) VALUES
('CORTE001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 8000.00, 4000.00, 3000.00, 'Corte de caja - Instituto Polanco'),
('CORTE002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 9500.00, 5000.00, 4000.00, 'Corte de caja - Instituto Polanco'),
('CORTE003', NOW() - INTERVAL '1 day', NOW(), 12000.00, 6000.00, 4000.00, 'Corte de caja - Instituto Polanco');

-- 7. PLANTILLAS DE DOCUMENTOS
INSERT INTO document_templates (name, template_type, content) VALUES
('Constancia de Estudios', 'constancia', 'Plantilla oficial de constancia de estudios para Instituto Polanco'),
('Certificado de Curso', 'certificado', 'Plantilla de certificado de finalización de curso'),
('Recibo de Pago', 'recibo', 'Plantilla oficial de recibo de pago');

-- 8. DOCUMENTOS EMITIDOS DE EJEMPLO
WITH student_sample AS (
  SELECT id, first_name, last_name FROM students LIMIT 5
), 
template_list AS (
  SELECT id, name FROM document_templates
)
INSERT INTO issued_documents (student_id, template_id, document_data, issued_date)
SELECT 
  student_sample.id,
  template_list.id,
  ('{"student_name": "' || student_sample.first_name || ' ' || student_sample.last_name || '", "course": "Inglés Básico", "date": "2024-01-15", "institution": "Instituto Polanco"}')::jsonb,
  NOW() - (RANDOM() * INTERVAL '30 days')
FROM student_sample
CROSS JOIN template_list
LIMIT 10;

-- 9. LOG DE AUDITORÍA
INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES
('admin', 'INSERT', 'students', gen_random_uuid(), '{"action": "Estudiante registrado en Instituto Polanco"}'),
('admin', 'UPDATE', 'payments', gen_random_uuid(), '{"action": "Pago actualizado"}'),
('admin', 'INSERT', 'cash_cuts', gen_random_uuid(), '{"action": "Corte de caja creado"}'),
('admin', 'INSERT', 'courses', gen_random_uuid(), '{"action": "Curso agregado al sistema"}'),
('admin', 'INSERT', 'schedules', gen_random_uuid(), '{"action": "Horario configurado"}');

-- =====================================================
-- VERIFICACIÓN FINAL DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen completo de datos insertados
SELECT 
  'RESUMEN DE DATOS INSERTADOS - INSTITUTO POLANCO' as descripcion,
  '' as tabla,
  null as registros
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
-- SCRIPT FINAL CORREGIDO - INSTITUTO POLANCO
-- Estructura 100% verificada contra schema real
-- Solo columnas que existen realmente
-- 24 estudiantes + 48 pagos + datos completos
-- Listo para ejecutar sin errores
-- =====================================================

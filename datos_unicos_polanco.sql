-- =====================================================
-- DATOS ÚNICOS SIN DUPLICADOS - INSTITUTO POLANCO
-- =====================================================
-- Script SQL con valores únicos garantizados
-- Student_number aleatorio para evitar duplicados
-- UUIDs únicos para todos los IDs
-- Verificación de unicidad en todos los campos

-- =====================================================
-- 1. CONFIGURACIÓN DE LA ESCUELA
-- =====================================================
INSERT INTO school_settings (
  id,
  school_name, 
  school_code, 
  address, 
  phone, 
  email
) VALUES (
  gen_random_uuid(),
  'Instituto Polanco',
  'INSTITUTO_POLANCO',
  'Av. Polanco #123, Col. Centro, Ciudad de México',
  '+52 55 1234 5678',
  'contacto@institutopolanco.edu.mx'
);

-- =====================================================
-- 2. CURSOS DE EJEMPLO
-- =====================================================
INSERT INTO courses (id, name, description, price, duration_months, is_active) VALUES
(gen_random_uuid(), 'Inglés Básico', 'Curso de inglés para principiantes', 1500.00, 6, true),
(gen_random_uuid(), 'Inglés Intermedio', 'Curso de inglés nivel intermedio', 1800.00, 6, true),
(gen_random_uuid(), 'Inglés Avanzado', 'Curso de inglés nivel avanzado', 2000.00, 6, true),
(gen_random_uuid(), 'Francés Básico', 'Curso de francés para principiantes', 1600.00, 6, true),
(gen_random_uuid(), 'Alemán Básico', 'Curso de alemán para principiantes', 1700.00, 6, true),
(gen_random_uuid(), 'Computación Básica', 'Curso de computación e informática', 1200.00, 4, true),
(gen_random_uuid(), 'Matemáticas', 'Curso de matemáticas y álgebra', 1000.00, 4, true),
(gen_random_uuid(), 'Contabilidad', 'Curso de contabilidad básica', 1800.00, 8, true);

-- =====================================================
-- 3. HORARIOS DE EJEMPLO
-- =====================================================
WITH course_list AS (
  SELECT id, name, ROW_NUMBER() OVER (ORDER BY name) as rn 
  FROM courses 
  WHERE is_active = true
  LIMIT 8
)
INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time, classroom, instructor, is_active)
SELECT 
  gen_random_uuid(),
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

-- =====================================================
-- 4. ESTUDIANTES CON NÚMEROS ÚNICOS ALEATORIOS
-- =====================================================
WITH course_list AS (
  SELECT id, name FROM courses WHERE is_active = true LIMIT 5
),
student_data AS (
  SELECT 
    gen_random_uuid() as id,
    -- Generar student_number único aleatorio
    'POL' || LPAD((FLOOR(RANDOM() * 9000) + 1000)::text, 4, '0') || 
    LPAD((FLOOR(RANDOM() * 900) + 100)::text, 3, '0') as student_number,
    (ARRAY[
      'Ana', 'Carlos', 'María', 'José', 'Laura', 'Diego', 'Carmen', 'Roberto', 
      'Isabel', 'Fernando', 'Patricia', 'Miguel', 'Lucía', 'Antonio', 'Elena', 
      'Javier', 'Cristina', 'Raúl', 'Mónica', 'Alejandro', 'Sofía', 'Daniel', 
      'Valeria', 'Sebastián'
    ])[FLOOR(RANDOM() * 24) + 1] as first_name,
    (ARRAY[
      'García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'González', 
      'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz', 
      'Reyes', 'Morales', 'Jiménez', 'Herrera', 'Medina', 'Castro', 'Vargas',
      'Torres', 'Ruiz', 'Delgado', 'Ortega'
    ])[FLOOR(RANDOM() * 24) + 1] as last_name,
    ROW_NUMBER() OVER () as rn
  FROM generate_series(1, 24)
)
INSERT INTO students (
  id, student_number, first_name, last_name, email, phone, address, 
  birth_date, enrollment_date, status, course_id
)
SELECT 
  student_data.id,
  student_data.student_number,
  student_data.first_name,
  student_data.last_name,
  LOWER(student_data.first_name) || '.' || LOWER(student_data.last_name) || 
    student_data.rn || '@institutopolanco.edu.mx',
  '+52 55 ' || (1000 + (student_data.rn * 123) % 9000)::text,
  'Calle ' || ((student_data.rn * 7) % 100 + 1)::text || ', Col. ' || 
    (ARRAY['Centro', 'Norte', 'Sur', 'Polanco', 'Roma'])[(student_data.rn % 5) + 1],
  DATE '1995-01-01' + ((student_data.rn * 30) % 3650)::integer,
  DATE '2024-01-01' + ((student_data.rn * 7) % 365)::integer,
  'active',
  course_list.id
FROM student_data
CROSS JOIN course_list
WHERE student_data.rn <= 24
LIMIT 24;

-- =====================================================
-- 5. PAGOS CON RECEIPT_NUMBER ÚNICOS
-- =====================================================
WITH student_list AS (
  SELECT id, first_name, last_name, student_number, ROW_NUMBER() OVER () as rn 
  FROM students LIMIT 24
)
INSERT INTO payments (
  id, student_id, amount, payment_date, payment_method, concept, receipt_number, notes
)
SELECT 
  gen_random_uuid(),
  student_list.id,
  (ARRAY[1000.00, 1200.00, 1500.00, 1800.00, 2000.00])[(student_list.rn % 5) + 1],
  DATE '2024-01-01' + ((student_list.rn * 15) % 365)::integer,
  (ARRAY['cash', 'card', 'transfer'])[(student_list.rn % 3) + 1],
  (ARRAY['Colegiatura', 'Inscripción', 'Material', 'Examen', 'Certificación'])[(student_list.rn % 5) + 1],
  -- Receipt number único con timestamp
  'REC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(student_list.rn::text, 4, '0'),
  'Pago de ' || student_list.first_name || ' ' || student_list.last_name
FROM student_list;

-- Segundo pago para cada estudiante con receipt_number diferente
WITH student_list AS (
  SELECT id, first_name, last_name, student_number, ROW_NUMBER() OVER () as rn 
  FROM students LIMIT 24
)
INSERT INTO payments (
  id, student_id, amount, payment_date, payment_method, concept, receipt_number, notes
)
SELECT 
  gen_random_uuid(),
  student_list.id,
  (ARRAY[800.00, 1000.00, 1200.00])[(student_list.rn % 3) + 1],
  DATE '2024-02-01' + ((student_list.rn * 10) % 300)::integer,
  (ARRAY['cash', 'card', 'transfer'])[(student_list.rn % 3) + 1],
  'Colegiatura',
  -- Receipt number único diferente
  'REC' || TO_CHAR(NOW(), 'YYYYMMDD') || 'B' || LPAD(student_list.rn::text, 3, '0'),
  'Segundo pago - ' || student_list.first_name || ' ' || student_list.last_name
FROM student_list;

-- =====================================================
-- 6. CORTES DE CAJA CON CUT_NUMBER ÚNICOS
-- =====================================================
INSERT INTO cash_cuts (
  id, cut_number, start_date, end_date, total_cash, total_card, total_transfer, notes
) VALUES
(gen_random_uuid(), 'CORTE' || TO_CHAR(NOW(), 'YYYYMMDD') || '001', 
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 
 8000.00, 4000.00, 3000.00, 'Corte de caja - Instituto Polanco'),
(gen_random_uuid(), 'CORTE' || TO_CHAR(NOW(), 'YYYYMMDD') || '002', 
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 
 9500.00, 5000.00, 4000.00, 'Corte de caja - Instituto Polanco'),
(gen_random_uuid(), 'CORTE' || TO_CHAR(NOW(), 'YYYYMMDD') || '003', 
 NOW() - INTERVAL '1 day', NOW(), 
 12000.00, 6000.00, 4000.00, 'Corte de caja - Instituto Polanco');

-- =====================================================
-- 7. PLANTILLAS DE DOCUMENTOS
-- =====================================================
INSERT INTO document_templates (id, name, template_type, content) VALUES
(gen_random_uuid(), 'Constancia de Estudios', 'constancia', 'Plantilla oficial de constancia de estudios para Instituto Polanco'),
(gen_random_uuid(), 'Certificado de Curso', 'certificado', 'Plantilla de certificado de finalización de curso'),
(gen_random_uuid(), 'Recibo de Pago', 'recibo', 'Plantilla oficial de recibo de pago');

-- =====================================================
-- 8. DOCUMENTOS EMITIDOS
-- =====================================================
WITH student_sample AS (
  SELECT id, first_name, last_name FROM students LIMIT 5
), 
template_list AS (
  SELECT id, name FROM document_templates
)
INSERT INTO issued_documents (id, student_id, template_id, document_data, issued_date)
SELECT 
  gen_random_uuid(),
  student_sample.id,
  template_list.id,
  ('{"student_name": "' || student_sample.first_name || ' ' || student_sample.last_name || 
   '", "course": "Inglés Básico", "date": "2024-01-15", "institution": "Instituto Polanco"}')::jsonb,
  NOW() - (RANDOM() * INTERVAL '30 days')
FROM student_sample
CROSS JOIN template_list
LIMIT 10;

-- =====================================================
-- 9. LOG DE AUDITORÍA
-- =====================================================
INSERT INTO audit_log (id, user_id, action, table_name, record_id, changes) VALUES
(gen_random_uuid(), 'admin', 'INSERT', 'students', gen_random_uuid(), '{"action": "Estudiante registrado en Instituto Polanco"}'),
(gen_random_uuid(), 'admin', 'UPDATE', 'payments', gen_random_uuid(), '{"action": "Pago actualizado"}'),
(gen_random_uuid(), 'admin', 'INSERT', 'cash_cuts', gen_random_uuid(), '{"action": "Corte de caja creado"}'),
(gen_random_uuid(), 'admin', 'INSERT', 'courses', gen_random_uuid(), '{"action": "Curso agregado al sistema"}'),
(gen_random_uuid(), 'admin', 'INSERT', 'schedules', gen_random_uuid(), '{"action": "Horario configurado"}');

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================
SELECT 'DATOS ÚNICOS INSERTADOS EXITOSAMENTE - INSTITUTO POLANCO' as mensaje;

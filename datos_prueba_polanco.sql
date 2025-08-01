-- =====================================================
-- DATOS DE PRUEBA PARA INSTITUTO POLANCO
-- =====================================================
-- Este script inserta datos de ejemplo para testing completo del sistema

-- 1. CONFIGURACIÓN DE LA ESCUELA
INSERT INTO school_settings (
  id, school_name, school_code, address, phone, email, logo_url,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Instituto Polanco',
  'INSTITUTO_POLANCO',
  'Av. Polanco #123, Col. Centro, Ciudad de México',
  '+52 55 1234 5678',
  'contacto@institutopolanco.edu.mx',
  null,
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- 2. CURSOS DE EJEMPLO
INSERT INTO courses (id, name, description, price, duration_months, created_at) VALUES
(gen_random_uuid(), 'Inglés Básico', 'Curso de inglés para principiantes', 1500.00, 6, now()),
(gen_random_uuid(), 'Inglés Intermedio', 'Curso de inglés nivel intermedio', 1800.00, 6, now()),
(gen_random_uuid(), 'Inglés Avanzado', 'Curso de inglés nivel avanzado', 2000.00, 6, now()),
(gen_random_uuid(), 'Francés Básico', 'Curso de francés para principiantes', 1600.00, 6, now()),
(gen_random_uuid(), 'Alemán Básico', 'Curso de alemán para principiantes', 1700.00, 6, now()),
(gen_random_uuid(), 'Computación Básica', 'Curso de computación e informática', 1200.00, 4, now()),
(gen_random_uuid(), 'Matemáticas', 'Curso de matemáticas y álgebra', 1000.00, 4, now()),
(gen_random_uuid(), 'Contabilidad', 'Curso de contabilidad básica', 1800.00, 8, now());

-- 3. HORARIOS DE EJEMPLO
WITH course_ids AS (
  SELECT id, name FROM courses LIMIT 8
)
INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time, max_students, created_at)
SELECT 
  gen_random_uuid(),
  course_ids.id,
  (ARRAY[1,2,3,4,5,6])[floor(random() * 6 + 1)], -- Días 1-6 (Lunes-Sábado)
  (ARRAY['08:00', '10:00', '14:00', '16:00', '18:00'])[floor(random() * 5 + 1)],
  (ARRAY['09:30', '11:30', '15:30', '17:30', '19:30'])[floor(random() * 5 + 1)],
  20,
  now()
FROM course_ids;

-- 4. ESTUDIANTES DE EJEMPLO
WITH schedule_ids AS (
  SELECT id FROM schedules LIMIT 8
)
INSERT INTO students (
  id, name, email, phone, address, birth_date, course, 
  enrollment_date, status, schedule_id, created_at
) 
SELECT 
  gen_random_uuid(),
  (ARRAY[
    'Ana García López', 'Carlos Rodríguez Martín', 'María Fernández Silva',
    'José Luis Hernández', 'Laura Martínez Ruiz', 'Diego Sánchez Torres',
    'Carmen López Jiménez', 'Roberto González Vega', 'Isabel Moreno Castro',
    'Fernando Díaz Romero', 'Patricia Ruiz Delgado', 'Miguel Ángel Serrano',
    'Lucía Jiménez Morales', 'Antonio Vega Castillo', 'Elena Castro Herrera',
    'Javier Delgado Ramos', 'Cristina Herrera Peña', 'Raúl Peña Guerrero',
    'Mónica Guerrero Luna', 'Alejandro Luna Ortega'
  ])[floor(random() * 20 + 1)],
  'estudiante' || floor(random() * 1000 + 1) || '@institutopolanco.edu.mx',
  '+52 55 ' || floor(random() * 9000 + 1000) || ' ' || floor(random() * 9000 + 1000),
  'Calle ' || floor(random() * 100 + 1) || ', Col. ' || (ARRAY['Centro', 'Norte', 'Sur', 'Polanco', 'Roma'])[floor(random() * 5 + 1)],
  date '1990-01-01' + (random() * (date '2005-12-31' - date '1990-01-01'))::int,
  (ARRAY['Inglés Básico', 'Inglés Intermedio', 'Francés Básico', 'Computación Básica', 'Matemáticas'])[floor(random() * 5 + 1)],
  date '2024-01-01' + (random() * 365)::int,
  'active',
  schedule_ids.id,
  now()
FROM schedule_ids, generate_series(1, 3); -- 3 estudiantes por horario = 24 estudiantes

-- 5. PAGOS DE EJEMPLO
WITH student_ids AS (
  SELECT id, name FROM students WHERE status = 'active'
)
INSERT INTO payments (
  id, student_id, amount, concept, payment_method, status,
  paid_date, due_date, created_at
)
SELECT 
  gen_random_uuid(),
  student_ids.id,
  (ARRAY[1000, 1200, 1500, 1800, 2000])[floor(random() * 5 + 1)],
  (ARRAY['Colegiatura', 'Inscripción', 'Material', 'Examen', 'Certificación'])[floor(random() * 5 + 1)],
  (ARRAY['efectivo', 'tarjeta', 'transferencia'])[floor(random() * 3 + 1)],
  (ARRAY['paid', 'pending'])[floor(random() * 2 + 1)],
  date '2024-01-01' + (random() * 365)::int,
  date '2024-01-01' + (random() * 365)::int,
  now()
FROM student_ids, generate_series(1, 2); -- 2 pagos por estudiante

-- 6. CORTES DE CAJA DE EJEMPLO
INSERT INTO cash_cuts (
  id, cut_number, total_amount, cash_amount, card_amount, 
  transfer_amount, notes, created_at, created_by
) VALUES
(gen_random_uuid(), 1, 15000.00, 8000.00, 4000.00, 3000.00, 'Corte de caja del día', now() - interval '1 day', 'admin'),
(gen_random_uuid(), 2, 18500.00, 9500.00, 5000.00, 4000.00, 'Corte de caja del día', now() - interval '2 days', 'admin'),
(gen_random_uuid(), 3, 22000.00, 12000.00, 6000.00, 4000.00, 'Corte de caja del día', now() - interval '3 days', 'admin');

-- 7. PLANTILLAS DE DOCUMENTOS
INSERT INTO document_templates (
  id, name, template_type, content, created_at
) VALUES
(gen_random_uuid(), 'Constancia de Estudios', 'constancia', 'Plantilla de constancia de estudios para Instituto Polanco', now()),
(gen_random_uuid(), 'Certificado de Curso', 'certificado', 'Plantilla de certificado de finalización de curso', now()),
(gen_random_uuid(), 'Recibo de Pago', 'recibo', 'Plantilla de recibo de pago oficial', now());

-- 8. DOCUMENTOS EMITIDOS DE EJEMPLO
WITH student_ids AS (
  SELECT id, name FROM students LIMIT 5
), template_ids AS (
  SELECT id, name FROM document_templates
)
INSERT INTO issued_documents (
  id, student_id, template_id, document_data, issued_date, created_at
)
SELECT 
  gen_random_uuid(),
  student_ids.id,
  template_ids.id,
  '{"student_name": "' || student_ids.name || '", "course": "Inglés Básico", "date": "2024-01-15"}',
  now() - (random() * interval '30 days'),
  now()
FROM student_ids, template_ids
LIMIT 10;

-- 9. LOG DE AUDITORÍA
INSERT INTO audit_log (
  id, user_id, action, table_name, record_id, changes, created_at
) VALUES
(gen_random_uuid(), 'admin', 'INSERT', 'students', gen_random_uuid(), '{"action": "Estudiante registrado"}', now() - interval '1 hour'),
(gen_random_uuid(), 'admin', 'UPDATE', 'payments', gen_random_uuid(), '{"action": "Pago actualizado"}', now() - interval '2 hours'),
(gen_random_uuid(), 'admin', 'INSERT', 'cash_cuts', gen_random_uuid(), '{"action": "Corte de caja creado"}', now() - interval '3 hours');

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen de datos insertados
SELECT 'school_settings' as tabla, count(*) as registros FROM school_settings
UNION ALL
SELECT 'courses', count(*) FROM courses
UNION ALL
SELECT 'schedules', count(*) FROM schedules
UNION ALL
SELECT 'students', count(*) FROM students
UNION ALL
SELECT 'payments', count(*) FROM payments
UNION ALL
SELECT 'cash_cuts', count(*) FROM cash_cuts
UNION ALL
SELECT 'document_templates', count(*) FROM document_templates
UNION ALL
SELECT 'issued_documents', count(*) FROM issued_documents
UNION ALL
SELECT 'audit_log', count(*) FROM audit_log;

-- =====================================================
-- DATOS DE PRUEBA COMPLETOS - INSTITUTO POLANCO
-- =====================================================

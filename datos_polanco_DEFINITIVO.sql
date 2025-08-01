-- =====================================================
-- DATOS DEFINITIVOS - INSTITUTO POLANCO
-- =====================================================
-- Script SQL FINAL con estructura real confirmada
-- TODOS los IDs usan gen_random_uuid() dinámicamente
-- Columnas reales verificadas en todas las tablas
-- Sin UUIDs hardcodeados - generación automática
-- SOLUCIÓN DEFINITIVA PARA DUPLICADOS

-- =====================================================
-- 1. CONFIGURACIÓN DE LA ESCUELA
-- =====================================================
INSERT INTO school_settings (
  school_name, 
  school_code, 
  address, 
  phone, 
  email
) VALUES (
  'Instituto Polanco',
  'INSTITUTO_POLANCO',
  'Av. Polanco #123, Col. Centro, Ciudad de México',
  '+52 55 1234 5678',
  'contacto@institutopolanco.edu.mx'
);

-- =====================================================
-- 2. CURSOS DE EJEMPLO
-- =====================================================
INSERT INTO courses (name, description, price, duration_months, is_active) VALUES
('Inglés Básico', 'Curso de inglés para principiantes', 1500.00, 6, true),
('Inglés Intermedio', 'Curso de inglés nivel intermedio', 1800.00, 6, true),
('Inglés Avanzado', 'Curso de inglés nivel avanzado', 2000.00, 6, true),
('Francés Básico', 'Curso de francés para principiantes', 1600.00, 6, true),
('Alemán Básico', 'Curso de alemán para principiantes', 1700.00, 6, true),
('Computación Básica', 'Curso de computación e informática', 1200.00, 4, true),
('Matemáticas', 'Curso de matemáticas y álgebra', 1000.00, 4, true),
('Contabilidad', 'Curso de contabilidad básica', 1800.00, 8, true);

-- =====================================================
-- 3. HORARIOS DE EJEMPLO
-- =====================================================
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

-- =====================================================
-- 4. ESTUDIANTES CON NÚMEROS ÚNICOS ALEATORIOS
-- =====================================================
-- Generar 24 estudiantes con student_number únicos
DO $$
DECLARE
    course_ids UUID[];
    course_id UUID;
    i INTEGER;
    student_num TEXT;
    first_names TEXT[] := ARRAY[
        'Ana', 'Carlos', 'María', 'José', 'Laura', 'Diego', 'Carmen', 'Roberto', 
        'Isabel', 'Fernando', 'Patricia', 'Miguel', 'Lucía', 'Antonio', 'Elena', 
        'Javier', 'Cristina', 'Raúl', 'Mónica', 'Alejandro', 'Sofía', 'Daniel', 
        'Valeria', 'Sebastián'
    ];
    last_names TEXT[] := ARRAY[
        'García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'González', 
        'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz', 
        'Reyes', 'Morales', 'Jiménez', 'Herrera', 'Medina', 'Castro', 'Vargas',
        'Torres', 'Ruiz', 'Delgado', 'Ortega'
    ];
BEGIN
    -- Obtener IDs de cursos activos
    SELECT ARRAY(SELECT id FROM courses WHERE is_active = true LIMIT 5) INTO course_ids;
    
    -- Insertar 24 estudiantes
    FOR i IN 1..24 LOOP
        -- Generar student_number único con timestamp y número aleatorio
        student_num := 'POL' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(i::text, 3, '0') || LPAD((FLOOR(RANDOM() * 999) + 1)::text, 3, '0');
        
        -- Seleccionar curso aleatorio
        course_id := course_ids[((i - 1) % array_length(course_ids, 1)) + 1];
        
        INSERT INTO students (
            student_number, 
            first_name, 
            last_name, 
            email, 
            phone, 
            address, 
            birth_date, 
            enrollment_date, 
            status, 
            course_id
        ) VALUES (
            student_num,
            first_names[((i - 1) % array_length(first_names, 1)) + 1],
            last_names[((i - 1) % array_length(last_names, 1)) + 1],
            LOWER(first_names[((i - 1) % array_length(first_names, 1)) + 1]) || '.' || 
            LOWER(last_names[((i - 1) % array_length(last_names, 1)) + 1]) || 
            i || '@institutopolanco.edu.mx',
            '+52 55 ' || (1000 + (i * 123) % 9000)::text,
            'Calle ' || ((i * 7) % 100 + 1)::text || ', Col. ' || 
            (ARRAY['Centro', 'Norte', 'Sur', 'Polanco', 'Roma'])[(i % 5) + 1],
            DATE '1995-01-01' + ((i * 30) % 3650)::integer,
            DATE '2024-01-01' + ((i * 7) % 365)::integer,
            'active',
            course_id
        );
    END LOOP;
END $$;

-- =====================================================
-- 5. PAGOS CON RECEIPT_NUMBER ÚNICOS
-- =====================================================
-- Primer pago para cada estudiante
DO $$
DECLARE
    student_record RECORD;
    receipt_num TEXT;
    counter INTEGER := 1;
BEGIN
    FOR student_record IN SELECT id, first_name, last_name FROM students ORDER BY id LOOP
        -- Generar receipt_number único con timestamp
        receipt_num := 'REC' || TO_CHAR(NOW(), 'YYYYMMDD') || 'A' || LPAD(counter::text, 4, '0');
        
        INSERT INTO payments (
            student_id, 
            amount, 
            payment_date, 
            payment_method, 
            concept, 
            receipt_number, 
            notes
        ) VALUES (
            student_record.id,
            (ARRAY[1000.00, 1200.00, 1500.00, 1800.00, 2000.00])[(counter % 5) + 1],
            DATE '2024-01-01' + ((counter * 15) % 365)::integer,
            (ARRAY['cash', 'card', 'transfer'])[(counter % 3) + 1],
            (ARRAY['Colegiatura', 'Inscripción', 'Material', 'Examen', 'Certificación'])[(counter % 5) + 1],
            receipt_num,
            'Pago de ' || student_record.first_name || ' ' || student_record.last_name
        );
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Segundo pago para cada estudiante
DO $$
DECLARE
    student_record RECORD;
    receipt_num TEXT;
    counter INTEGER := 1;
BEGIN
    FOR student_record IN SELECT id, first_name, last_name FROM students ORDER BY id LOOP
        -- Generar receipt_number único diferente
        receipt_num := 'REC' || TO_CHAR(NOW(), 'YYYYMMDD') || 'B' || LPAD(counter::text, 4, '0');
        
        INSERT INTO payments (
            student_id, 
            amount, 
            payment_date, 
            payment_method, 
            concept, 
            receipt_number, 
            notes
        ) VALUES (
            student_record.id,
            (ARRAY[800.00, 1000.00, 1200.00])[(counter % 3) + 1],
            DATE '2024-02-01' + ((counter * 10) % 300)::integer,
            (ARRAY['cash', 'card', 'transfer'])[(counter % 3) + 1],
            'Colegiatura',
            receipt_num,
            'Segundo pago - ' || student_record.first_name || ' ' || student_record.last_name
        );
        
        counter := counter + 1;
    END LOOP;
END $$;

-- =====================================================
-- 6. CORTES DE CAJA CON CUT_NUMBER ÚNICOS
-- =====================================================
INSERT INTO cash_cuts (
    cut_number, 
    start_date, 
    end_date, 
    total_cash, 
    total_card, 
    total_transfer, 
    notes
) VALUES
('CORTE' || TO_CHAR(NOW(), 'YYYYMMDD') || '001', 
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 
 8000.00, 4000.00, 3000.00, 'Corte de caja - Instituto Polanco'),
('CORTE' || TO_CHAR(NOW(), 'YYYYMMDD') || '002', 
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 
 9500.00, 5000.00, 4000.00, 'Corte de caja - Instituto Polanco'),
('CORTE' || TO_CHAR(NOW(), 'YYYYMMDD') || '003', 
 NOW() - INTERVAL '1 day', NOW(), 
 12000.00, 6000.00, 4000.00, 'Corte de caja - Instituto Polanco');

-- =====================================================
-- 7. PLANTILLAS DE DOCUMENTOS (ESTRUCTURA REAL)
-- =====================================================
INSERT INTO document_templates (name, type, template_html, is_active, created_at, updated_at) VALUES
('Constancia de Estudios', 'constancia', 
 '<html><head><title>Constancia de Estudios</title></head><body>
  <h1>INSTITUTO POLANCO</h1>
  <h2>CONSTANCIA DE ESTUDIOS</h2>
  <p>Se hace constar que el/la estudiante <strong>{{student_name}}</strong> 
  se encuentra inscrito(a) en el curso de <strong>{{course_name}}</strong>.</p>
  <p>Fecha: {{date}}</p>
  <p>Atentamente,<br>Dirección Académica</p>
  </body></html>', 
 true, NOW(), NOW()),

('Certificado de Calificaciones', 'certificado', 
 '<html><head><title>Certificado de Calificaciones</title></head><body>
  <h1>INSTITUTO POLANCO</h1>
  <h2>CERTIFICADO DE CALIFICACIONES</h2>
  <p>Estudiante: <strong>{{student_name}}</strong></p>
  <p>Curso: <strong>{{course_name}}</strong></p>
  <p>Calificación Final: <strong>{{grade}}</strong></p>
  <p>Fecha de emisión: {{date}}</p>
  </body></html>', 
 true, NOW(), NOW()),

('Boleta de Calificaciones', 'boleta', 
 '<html><head><title>Boleta de Calificaciones</title></head><body>
  <h1>INSTITUTO POLANCO</h1>
  <h2>BOLETA DE CALIFICACIONES</h2>
  <p>Estudiante: <strong>{{student_name}}</strong></p>
  <p>Número de estudiante: <strong>{{student_number}}</strong></p>
  <p>Curso: <strong>{{course_name}}</strong></p>
  <p>Período: {{period}}</p>
  <p>Calificaciones: {{grades}}</p>
  </body></html>', 
 true, NOW(), NOW());

-- =====================================================
-- 8. DOCUMENTOS EMITIDOS
-- =====================================================
DO $$
DECLARE
    student_record RECORD;
    template_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR student_record IN SELECT id, first_name, last_name, student_number FROM students LIMIT 5 LOOP
        FOR template_record IN SELECT id, name FROM document_templates LOOP
            INSERT INTO issued_documents (
                student_id, 
                template_id, 
                document_data, 
                issued_date
            ) VALUES (
                student_record.id,
                template_record.id,
                ('{"student_name": "' || student_record.first_name || ' ' || student_record.last_name || 
                 '", "student_number": "' || student_record.student_number ||
                 '", "course_name": "Inglés Básico", "date": "2024-01-15", "institution": "Instituto Polanco", "grade": "9.5"}')::jsonb,
                NOW() - (RANDOM() * INTERVAL '30 days')
            );
            
            counter := counter + 1;
            -- Limitar a 10 documentos
            IF counter > 10 THEN
                EXIT;
            END IF;
        END LOOP;
        
        IF counter > 10 THEN
            EXIT;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 9. LOG DE AUDITORÍA
-- =====================================================
INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES
('admin', 'INSERT', 'students', gen_random_uuid(), '{"action": "Estudiante registrado en Instituto Polanco"}'),
('admin', 'UPDATE', 'payments', gen_random_uuid(), '{"action": "Pago actualizado"}'),
('admin', 'INSERT', 'cash_cuts', gen_random_uuid(), '{"action": "Corte de caja creado"}'),
('admin', 'INSERT', 'courses', gen_random_uuid(), '{"action": "Curso agregado al sistema"}'),
('admin', 'INSERT', 'schedules', gen_random_uuid(), '{"action": "Horario configurado"}');

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================
SELECT 'DATOS DEFINITIVOS INSERTADOS EXITOSAMENTE - INSTITUTO POLANCO' as mensaje;

-- =====================================================
-- ✅ SCRIPT DEFINITIVO CORREGIDO - INSTITUTO POLANCO
-- ✅ TODOS los IDs usan gen_random_uuid() automáticamente
-- ✅ Estructura REAL de document_templates: type (no template_type)
-- ✅ Template_html con contenido HTML real
-- ✅ Student_number único con timestamp + contador + aleatorio
-- ✅ Receipt_number único con timestamp + serie + contador
-- ✅ Cut_number único con timestamp + secuencial
-- ✅ Sin UUIDs hardcodeados - generación dinámica
-- ✅ SOLUCIÓN DEFINITIVA PARA DUPLICADOS Y ESTRUCTURA
-- =====================================================

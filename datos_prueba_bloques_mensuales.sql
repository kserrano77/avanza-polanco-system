-- Script para agregar datos de prueba para demostrar bloques mensuales
-- Datos del mes pasado (Junio 2025) y mes actual (Julio 2025)

-- Insertar pagos de JUNIO 2025 (mes pasado)
INSERT INTO payments (id, student_id, amount, concept, due_date, paid_date, status, created_at, updated_at) VALUES
-- Pagos pagados de junio
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 1500.00, 'Colegiatura Junio 2025', '2025-06-15', '2025-06-10', 'paid', '2025-06-01 10:00:00', '2025-06-10 14:30:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 1500.00, 'Colegiatura Junio 2025', '2025-06-15', '2025-06-12', 'paid', '2025-06-01 10:00:00', '2025-06-12 16:45:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 2), 800.00, 'Material Didáctico Junio', '2025-06-20', '2025-06-18', 'paid', '2025-06-05 09:00:00', '2025-06-18 11:20:00'),

-- Pagos vencidos de junio (no pagados)
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 3), 1500.00, 'Colegiatura Junio 2025', '2025-06-15', NULL, 'overdue', '2025-06-01 10:00:00', '2025-06-01 10:00:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 4), 500.00, 'Actividades Extracurriculares Junio', '2025-06-25', NULL, 'overdue', '2025-06-08 15:00:00', '2025-06-08 15:00:00');

-- Insertar pagos de JULIO 2025 (mes actual)
INSERT INTO payments (id, student_id, amount, concept, due_date, paid_date, status, created_at, updated_at) VALUES
-- Pagos pagados de julio
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 1500.00, 'Colegiatura Julio 2025', '2025-07-15', '2025-07-08', 'paid', '2025-07-01 10:00:00', '2025-07-08 13:15:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 1500.00, 'Colegiatura Julio 2025', '2025-07-15', '2025-07-14', 'paid', '2025-07-01 10:00:00', '2025-07-14 17:30:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 2), 300.00, 'Seguro Escolar Julio', '2025-07-10', '2025-07-09', 'paid', '2025-07-02 11:00:00', '2025-07-09 10:45:00'),

-- Pagos pendientes de julio (aún no vencidos)
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 3), 1500.00, 'Colegiatura Julio 2025', '2025-07-15', NULL, 'pending', '2025-07-01 10:00:00', '2025-07-01 10:00:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 4), 1500.00, 'Colegiatura Julio 2025', '2025-07-15', NULL, 'pending', '2025-07-01 10:00:00', '2025-07-01 10:00:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 5), 800.00, 'Material Didáctico Julio', '2025-07-20', NULL, 'pending', '2025-07-03 14:00:00', '2025-07-03 14:00:00'),

-- Pagos vencidos de julio (fechas pasadas)
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 6), 1500.00, 'Colegiatura Julio 2025', '2025-07-05', NULL, 'overdue', '2025-07-01 10:00:00', '2025-07-01 10:00:00'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 7), 400.00, 'Transporte Julio', '2025-07-10', NULL, 'overdue', '2025-07-02 12:00:00', '2025-07-02 12:00:00');

-- Verificar que se insertaron correctamente
SELECT 
    COUNT(*) as total_pagos,
    COUNT(CASE WHEN EXTRACT(MONTH FROM due_date) = 6 THEN 1 END) as pagos_junio,
    COUNT(CASE WHEN EXTRACT(MONTH FROM due_date) = 7 THEN 1 END) as pagos_julio,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as pagados,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END) as vencidos
FROM payments 
WHERE EXTRACT(YEAR FROM due_date) = 2025;

-- Mostrar resumen por mes
SELECT 
    EXTRACT(YEAR FROM due_date) as año,
    EXTRACT(MONTH FROM due_date) as mes,
    CASE EXTRACT(MONTH FROM due_date)
        WHEN 6 THEN 'Junio'
        WHEN 7 THEN 'Julio'
        ELSE 'Otro'
    END as nombre_mes,
    COUNT(*) as total_pagos,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as pagados,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'overdue' THEN 1 END) as vencidos,
    SUM(amount) as monto_total,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as monto_pagado,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as monto_pendiente,
    SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as monto_vencido
FROM payments 
WHERE EXTRACT(YEAR FROM due_date) = 2025 
  AND EXTRACT(MONTH FROM due_date) IN (6, 7)
GROUP BY EXTRACT(YEAR FROM due_date), EXTRACT(MONTH FROM due_date)
ORDER BY año DESC, mes DESC;

-- 🛠️ CORRECCIÓN: Cambiar grupos 3 y 5 de viernes a sábado
-- Sistema: Polanco

-- =====================================================
-- PASO 1: Verificar datos actuales de grupos 3 y 5
-- =====================================================
SELECT 
    s.id,
    s.classroom as grupo,
    c.name as curso,
    s.day_of_week as dia_actual,
    CASE s.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
        ELSE 'Día inválido'
    END as dia_nombre_actual,
    s.start_time,
    s.end_time
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
WHERE s.classroom IN ('3', '5')
ORDER BY s.classroom;

-- =====================================================
-- PASO 2: ACTUALIZAR grupos 3 y 5 a sábado (day_of_week = 6)
-- =====================================================
UPDATE schedules 
SET day_of_week = 6  -- 6 = Sábado
WHERE classroom IN ('3', '5') 
  AND day_of_week = 5;  -- Solo cambiar los que están en viernes

-- =====================================================
-- PASO 3: Verificar que el cambio se aplicó correctamente
-- =====================================================
SELECT 
    s.id,
    s.classroom as grupo,
    c.name as curso,
    s.day_of_week as dia_nuevo,
    CASE s.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
        ELSE 'Día inválido'
    END as dia_nombre_nuevo,
    s.start_time,
    s.end_time,
    s.updated_at
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
WHERE s.classroom IN ('3', '5')
ORDER BY s.classroom;

-- =====================================================
-- PASO 4: Verificar TODOS los grupos después de la corrección
-- =====================================================
SELECT 
    s.classroom as grupo,
    c.name as curso,
    s.day_of_week,
    CASE s.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
        ELSE 'Día inválido'
    END as dia_correcto,
    s.start_time,
    s.end_time
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
ORDER BY s.day_of_week, s.start_time, s.classroom;

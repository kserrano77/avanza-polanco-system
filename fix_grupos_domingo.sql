-- 🛠️ CORRECCIÓN: Cambiar grupos 4 y 7 de sábado a domingo
-- Sistema: Polanco

-- =====================================================
-- PASO 1: Verificar datos actuales antes del cambio
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
WHERE s.classroom IN ('4', '7')
ORDER BY s.classroom;

-- =====================================================
-- PASO 2: ACTUALIZAR grupos 4 y 7 a domingo (day_of_week = 0)
-- =====================================================
UPDATE schedules 
SET day_of_week = 0  -- 0 = Domingo
WHERE classroom IN ('4', '7') 
  AND day_of_week = 6;  -- Solo cambiar los que están en sábado

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
WHERE s.classroom IN ('4', '7')
ORDER BY s.classroom;

-- =====================================================
-- PASO 4: Verificar estudiantes afectados
-- =====================================================
SELECT 
    st.id as student_id,
    st.first_name,
    st.last_name,
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
    END as dia_nombre,
    s.start_time,
    s.end_time
FROM students st
LEFT JOIN schedules s ON st.schedule_id = s.id
LEFT JOIN courses c ON s.course_id = c.id
WHERE s.classroom IN ('4', '7')
ORDER BY s.classroom, st.last_name, st.first_name;

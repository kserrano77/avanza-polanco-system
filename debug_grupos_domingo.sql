-- 🔍 DEBUG: Verificar Grupos 4 y 7 - Problema Domingo/Sábado
-- Sistema: Polanco

-- =====================================================
-- CONSULTA 1: Verificar horarios de los grupos 4 y 7
-- =====================================================
SELECT 
    s.id,
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
    s.end_time,
    s.created_at
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
WHERE s.classroom IN ('4', '7')
ORDER BY s.classroom, s.day_of_week;

-- =====================================================
-- CONSULTA 2: Verificar estudiantes asignados a grupos 4 y 7
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

-- =====================================================
-- CONSULTA 3: Verificar todos los horarios de PODOLOGÍA
-- =====================================================
SELECT 
    s.id,
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
    s.end_time,
    s.created_at
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
WHERE c.name = 'PODOLOGÍA'
ORDER BY s.day_of_week, s.start_time;

-- =====================================================
-- CONSULTA 4: Contar estudiantes por día de la semana
-- =====================================================
SELECT 
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
    COUNT(st.id) as total_estudiantes,
    STRING_AGG(DISTINCT s.classroom, ', ') as grupos
FROM students st
LEFT JOIN schedules s ON st.schedule_id = s.id
WHERE s.day_of_week IS NOT NULL
GROUP BY s.day_of_week
ORDER BY s.day_of_week;

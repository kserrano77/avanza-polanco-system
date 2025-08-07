-- 🔍 VERIFICAR TODOS LOS GRUPOS Y SUS DÍAS REALES
-- Sistema: Polanco

-- =====================================================
-- CONSULTA: Verificar todos los horarios y sus días
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
    END as dia_real,
    s.start_time,
    s.end_time,
    s.created_at
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
ORDER BY s.day_of_week, s.start_time, s.classroom;

-- 🚨 DIAGNÓSTICO URGENTE - GRUPOS EN POLANCO
-- Verificar estado actual de todos los grupos tras recreación del grupo 4

-- 1. VERIFICAR TODOS LOS GRUPOS ACTUALES
SELECT 
    id,
    course_id,
    day_of_week,
    start_time,
    end_time,
    classroom,
    CASE 
        WHEN day_of_week = 0 THEN 'Domingo'
        WHEN day_of_week = 1 THEN 'Lunes'
        WHEN day_of_week = 2 THEN 'Martes'
        WHEN day_of_week = 3 THEN 'Miércoles'
        WHEN day_of_week = 4 THEN 'Jueves'
        WHEN day_of_week = 5 THEN 'Viernes'
        WHEN day_of_week = 6 THEN 'Sábado'
        ELSE 'DÍA INVÁLIDO ⚠️'
    END as dia_nombre,
    created_at,
    updated_at
FROM schedules 
ORDER BY day_of_week, start_time;

-- 2. BUSCAR GRUPOS CON day_of_week INVÁLIDO
SELECT 
    id,
    course_id,
    day_of_week,
    classroom,
    'GRUPO CON DÍA INVÁLIDO' as problema
FROM schedules 
WHERE day_of_week NOT IN (0,1,2,3,4,5,6) OR day_of_week IS NULL;

-- 3. VERIFICAR ESPECÍFICAMENTE EL GRUPO 4 RECREADO
SELECT 
    s.id,
    s.course_id,
    c.name as curso_nombre,
    s.day_of_week,
    s.start_time,
    s.end_time,
    s.classroom,
    CASE 
        WHEN s.day_of_week = 0 THEN 'Domingo'
        WHEN s.day_of_week = 1 THEN 'Lunes'
        WHEN s.day_of_week = 2 THEN 'Martes'
        WHEN s.day_of_week = 3 THEN 'Miércoles'
        WHEN s.day_of_week = 4 THEN 'Jueves'
        WHEN s.day_of_week = 5 THEN 'Viernes'
        WHEN s.day_of_week = 6 THEN 'Sábado'
        ELSE 'DÍA INVÁLIDO ⚠️'
    END as dia_nombre,
    s.created_at
FROM schedules s
LEFT JOIN courses c ON s.course_id = c.id
WHERE s.classroom = '4'
ORDER BY s.created_at DESC;

-- 4. VERIFICAR SI HAY ESTUDIANTES ASIGNADOS A GRUPOS INVÁLIDOS
SELECT 
    st.id as student_id,
    st.name,
    st.last_name,
    st.schedule_info,
    s.classroom,
    s.day_of_week,
    CASE 
        WHEN s.day_of_week = 0 THEN 'Domingo'
        WHEN s.day_of_week = 1 THEN 'Lunes'
        WHEN s.day_of_week = 2 THEN 'Martes'
        WHEN s.day_of_week = 3 THEN 'Miércoles'
        WHEN s.day_of_week = 4 THEN 'Jueves'
        WHEN s.day_of_week = 5 THEN 'Viernes'
        WHEN s.day_of_week = 6 THEN 'Sábado'
        ELSE 'DÍA INVÁLIDO ⚠️'
    END as dia_nombre
FROM students st
LEFT JOIN schedules s ON st.schedule_info = s.id
WHERE s.day_of_week NOT IN (0,1,2,3,4,5,6) OR s.day_of_week IS NULL;

-- 5. CONTAR ESTUDIANTES POR GRUPO
SELECT 
    s.classroom as grupo,
    s.day_of_week,
    CASE 
        WHEN s.day_of_week = 0 THEN 'Domingo'
        WHEN s.day_of_week = 1 THEN 'Lunes'
        WHEN s.day_of_week = 2 THEN 'Martes'
        WHEN s.day_of_week = 3 THEN 'Miércoles'
        WHEN s.day_of_week = 4 THEN 'Jueves'
        WHEN s.day_of_week = 5 THEN 'Viernes'
        WHEN s.day_of_week = 6 THEN 'Sábado'
        ELSE 'DÍA INVÁLIDO ⚠️'
    END as dia_nombre,
    COUNT(st.id) as total_estudiantes
FROM schedules s
LEFT JOIN students st ON st.schedule_info = s.id
GROUP BY s.id, s.classroom, s.day_of_week
ORDER BY s.day_of_week, s.classroom;

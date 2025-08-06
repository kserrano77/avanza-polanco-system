-- =====================================================
-- VERIFICAR ESTUDIANTES Y SUS HORARIOS REALES - POLANCO
-- =====================================================
-- Este script te ayudará a identificar exactamente qué estudiantes
-- están asignados a qué horarios para decidir si eliminar duplicados
-- =====================================================

-- 1. VER TODOS LOS HORARIOS DISPONIBLES
SELECT 
    s.id as schedule_id,
    c.name as curso,
    CASE s.day_of_week 
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia,
    s.start_time,
    s.end_time,
    s.classroom
FROM schedules s
JOIN courses c ON s.course_id = c.id
ORDER BY s.day_of_week, s.start_time;

-- 2. VER ESTUDIANTES ASIGNADOS A HORARIOS SABATINOS (día 6)
SELECT 
    st.id as student_id,
    st.first_name,
    st.last_name,
    st.student_number,
    c.name as curso,
    'Sábado' as dia_asignado,
    s.start_time,
    s.end_time
FROM students st
JOIN schedules s ON st.schedule_id = s.id
JOIN courses c ON s.course_id = c.id
WHERE s.day_of_week = 6  -- Sábado
ORDER BY st.last_name, st.first_name;

-- 3. VER ESTUDIANTES ASIGNADOS A HORARIOS DOMINICALES (día 0)
SELECT 
    st.id as student_id,
    st.first_name,
    st.last_name,
    st.student_number,
    c.name as curso,
    'Domingo' as dia_asignado,
    s.start_time,
    s.end_time
FROM students st
JOIN schedules s ON st.schedule_id = s.id
JOIN courses c ON s.course_id = c.id
WHERE s.day_of_week = 0  -- Domingo
ORDER BY st.last_name, st.first_name;

-- 4. CONTAR ESTUDIANTES POR DÍA DE LA SEMANA
SELECT 
    CASE s.day_of_week 
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia,
    COUNT(st.id) as total_estudiantes
FROM students st
JOIN schedules s ON st.schedule_id = s.id
GROUP BY s.day_of_week
ORDER BY s.day_of_week;

-- 5. VERIFICAR SI HAY ESTUDIANTES SIN HORARIO ASIGNADO
SELECT 
    st.id,
    st.first_name,
    st.last_name,
    st.student_number,
    st.schedule_id
FROM students st
WHERE st.schedule_id IS NULL;

-- 6. BUSCAR POSIBLES DUPLICADOS (mismo nombre en diferentes horarios)
SELECT 
    st.first_name,
    st.last_name,
    COUNT(*) as apariciones,
    STRING_AGG(
        CASE s.day_of_week 
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
        END, ', '
    ) as dias_asignados
FROM students st
LEFT JOIN schedules s ON st.schedule_id = s.id
GROUP BY st.first_name, st.last_name
HAVING COUNT(*) > 1
ORDER BY apariciones DESC;

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Revisa los resultados de cada consulta:
--    - Consulta 2: Estudiantes realmente asignados a sábado
--    - Consulta 3: Estudiantes realmente asignados a domingo
--    - Consulta 6: Posibles duplicados por nombre
-- 3. Si encuentras duplicados legítimos (mismo nombre, diferentes horarios),
--    esos pueden ser estudiantes diferentes con el mismo nombre
-- 4. Si encuentras que todos los estudiantes dominicales son duplicados
--    de los sabatinos, entonces sí habría que limpiar
-- =====================================================

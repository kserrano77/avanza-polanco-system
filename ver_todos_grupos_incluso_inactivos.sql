-- 🚨 VER TODOS LOS GRUPOS - INCLUYENDO INACTIVOS
-- Para encontrar el grupo que causa "Día no válido"

-- 1. TODOS LOS GRUPOS (ACTIVOS E INACTIVOS)
SELECT 
    id,
    course_id,
    day_of_week,
    start_time,
    end_time,
    classroom,
    is_active,
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
ORDER BY is_active DESC, day_of_week, start_time;

-- 2. BUSCAR GRUPOS CON day_of_week INVÁLIDO (ACTIVOS E INACTIVOS)
SELECT 
    id,
    course_id,
    day_of_week,
    classroom,
    is_active,
    start_time,
    end_time,
    'GRUPO CON DÍA INVÁLIDO - ESTE ES EL PROBLEMA' as problema,
    created_at
FROM schedules 
WHERE day_of_week NOT IN (0,1,2,3,4,5,6) OR day_of_week IS NULL
ORDER BY created_at DESC;

-- 3. CONTAR GRUPOS POR ESTADO
SELECT 
    is_active,
    COUNT(*) as total
FROM schedules 
GROUP BY is_active;

-- 4. VER ESPECÍFICAMENTE GRUPOS 4 Y 7 (TODOS LOS REGISTROS)
SELECT 
    id,
    course_id,
    day_of_week,
    start_time,
    end_time,
    classroom,
    is_active,
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
WHERE classroom IN ('4', '7')
ORDER BY classroom, created_at DESC;

-- 🚨 FIX URGENTE - CORREGIR GRUPO CON day_of_week NULL
-- Este grupo causa "Día no válido" en el dropdown

-- 1. VERIFICAR EL PROBLEMA ANTES DE CORREGIR
SELECT 
    id,
    course_id,
    day_of_week,
    start_time,
    end_time,
    classroom,
    is_active,
    'PROBLEMA: day_of_week es NULL' as estado
FROM schedules 
WHERE day_of_week IS NULL;

-- 2. OPCIÓN A: CORREGIR EL GRUPO INVÁLIDO (Grupo 7 con day_of_week NULL)
-- Basándome en que es Grupo 7 y hay otro Grupo 7 válido con Domingo (day_of_week = 0)
-- Vamos a corregir este grupo para que sea Domingo también

UPDATE schedules 
SET 
    day_of_week = 0,  -- Domingo
    updated_at = NOW()
WHERE id = '95c39979-5997-4352-9a93-cf7b839be6fa'
AND day_of_week IS NULL;

-- 3. VERIFICAR LA CORRECCIÓN
SELECT 
    id,
    course_id,
    day_of_week,
    start_time,
    end_time,
    classroom,
    is_active,
    CASE 
        WHEN day_of_week = 0 THEN 'Domingo ✅'
        WHEN day_of_week = 1 THEN 'Lunes ✅'
        WHEN day_of_week = 2 THEN 'Martes ✅'
        WHEN day_of_week = 3 THEN 'Miércoles ✅'
        WHEN day_of_week = 4 THEN 'Jueves ✅'
        WHEN day_of_week = 5 THEN 'Viernes ✅'
        WHEN day_of_week = 6 THEN 'Sábado ✅'
        ELSE 'DÍA INVÁLIDO ⚠️'
    END as dia_nombre,
    updated_at
FROM schedules 
WHERE id = '95c39979-5997-4352-9a93-cf7b839be6fa';

-- 4. VERIFICAR QUE YA NO HAY GRUPOS CON day_of_week INVÁLIDO
SELECT 
    COUNT(*) as grupos_invalidos_restantes
FROM schedules 
WHERE day_of_week NOT IN (0,1,2,3,4,5,6) OR day_of_week IS NULL;

-- 5. VER TODOS LOS GRUPOS DESPUÉS DE LA CORRECCIÓN
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
WHERE is_active = true
ORDER BY day_of_week, start_time;

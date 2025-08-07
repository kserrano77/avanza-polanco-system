-- 🔍 VERIFICAR ESTRUCTURA REAL DE LAS TABLAS
-- Para identificar los nombres correctos de los campos

-- 1. ESTRUCTURA DE LA TABLA STUDENTS
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 2. ESTRUCTURA DE LA TABLA SCHEDULES  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'schedules'
ORDER BY ordinal_position;

-- 3. VERIFICAR ALGUNOS REGISTROS DE STUDENTS (primeros 3)
SELECT * FROM students LIMIT 3;

-- 4. VERIFICAR ALGUNOS REGISTROS DE SCHEDULES (primeros 3)
SELECT * FROM schedules LIMIT 3;

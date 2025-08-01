-- =====================================================
-- VER COLUMNAS REALES DE LA TABLA STUDENTS - SIMPLE
-- =====================================================
-- Script simplificado para ver exactamente qué columnas existen
-- =====================================================

-- MOSTRAR TODAS LAS COLUMNAS DE LA TABLA STUDENTS
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- EJECUTA SOLO ESTA CONSULTA Y COMPARTE EL RESULTADO
-- =====================================================

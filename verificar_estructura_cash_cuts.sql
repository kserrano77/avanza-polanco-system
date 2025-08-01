-- Verificar estructura real de la tabla cash_cuts
-- Ejecutar en Supabase SQL Editor

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cash_cuts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- También verificar si hay datos existentes para entender la estructura
SELECT * FROM cash_cuts LIMIT 3;

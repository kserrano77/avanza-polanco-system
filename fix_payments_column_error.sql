-- =====================================================
-- SCRIPT DE CORRECCIÓN DEFINITIVA - ERROR PAYMENTS_DATE
-- =====================================================
-- Este script corrige el error persistente de columna payments_date
-- Verifica y corrige la estructura de la tabla payments

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE LA TABLA PAYMENTS
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- 2. VERIFICAR SI EXISTE COLUMNA payments_date (INCORRECTA)
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'payments_date'
) as payments_date_exists;

-- 3. VERIFICAR SI EXISTE COLUMNA paid_date (CORRECTA)
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'paid_date'
) as paid_date_exists;

-- 4. SI NO EXISTE paid_date, AGREGARLA
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'paid_date'
    ) THEN
        ALTER TABLE payments ADD COLUMN paid_date DATE;
        RAISE NOTICE 'Columna paid_date agregada a la tabla payments';
    ELSE
        RAISE NOTICE 'Columna paid_date ya existe en la tabla payments';
    END IF;
END $$;

-- 5. SI EXISTE payments_date (INCORRECTA), MIGRAR DATOS Y ELIMINARLA
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'payments_date'
    ) THEN
        -- Migrar datos de payments_date a paid_date
        UPDATE payments SET paid_date = payments_date WHERE payments_date IS NOT NULL;
        
        -- Eliminar columna incorrecta
        ALTER TABLE payments DROP COLUMN payments_date;
        
        RAISE NOTICE 'Datos migrados de payments_date a paid_date y columna incorrecta eliminada';
    ELSE
        RAISE NOTICE 'Columna payments_date no existe (correcto)';
    END IF;
END $$;

-- 6. VERIFICAR ESTRUCTURA FINAL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name LIKE '%date%'
ORDER BY column_name;

-- 7. MOSTRAR CONTEO DE REGISTROS CON FECHAS
SELECT 
    COUNT(*) as total_payments,
    COUNT(paid_date) as payments_with_paid_date,
    COUNT(created_at) as payments_with_created_at
FROM payments;

-- =====================================================
-- RESULTADO ESPERADO:
-- - Columna paid_date existe y contiene datos
-- - Columna payments_date eliminada (si existía)
-- - Error "column payments_date does not exist" resuelto
-- =====================================================

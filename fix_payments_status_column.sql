-- =====================================================
-- SCRIPT DE CORRECCIÓN - COLUMNA STATUS EN PAYMENTS
-- =====================================================
-- Este script agrega la columna status faltante en la tabla payments

-- 1. VERIFICAR SI EXISTE COLUMNA status
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'status'
) as status_exists;

-- 2. AGREGAR COLUMNA status SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'status'
    ) THEN
        ALTER TABLE payments ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'Columna status agregada a la tabla payments';
    ELSE
        RAISE NOTICE 'Columna status ya existe en la tabla payments';
    END IF;
END $$;

-- 3. CREAR CONSTRAINT PARA VALORES VÁLIDOS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'payments_status_check'
    ) THEN
        ALTER TABLE payments 
        ADD CONSTRAINT payments_status_check 
        CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));
        RAISE NOTICE 'Constraint de status agregado';
    ELSE
        RAISE NOTICE 'Constraint de status ya existe';
    END IF;
END $$;

-- 4. ACTUALIZAR REGISTROS EXISTENTES
UPDATE payments 
SET status = CASE 
    WHEN paid_date IS NOT NULL THEN 'paid'
    ELSE 'pending'
END
WHERE status IS NULL OR status = '';

-- 5. VERIFICAR ESTRUCTURA FINAL
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name = 'status';

-- 6. MOSTRAR CONTEO POR STATUS
SELECT 
    status,
    COUNT(*) as count
FROM payments 
GROUP BY status
ORDER BY status;

-- =====================================================
-- RESULTADO ESPERADO:
-- - Columna status existe con valores válidos
-- - Error "column payments.status does not exist" resuelto
-- =====================================================

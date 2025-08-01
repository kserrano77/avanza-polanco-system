-- Script para corregir fechas de pagos y mostrar Julio 2025 correctamente
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar fechas actuales de pagos
SELECT 
    id,
    concept,
    amount,
    paid_date,
    payment_date,
    created_at
FROM payments 
ORDER BY created_at DESC;

-- 2. Actualizar todas las fechas de pagos de junio 2025 a julio 2025
UPDATE payments 
SET 
    paid_date = CASE 
        WHEN paid_date::text LIKE '2025-06%' THEN (paid_date::text)::date + INTERVAL '1 month'
        ELSE paid_date 
    END,
    payment_date = CASE 
        WHEN payment_date::text LIKE '2025-06%' THEN (payment_date::text)::date + INTERVAL '1 month'
        ELSE payment_date 
    END
WHERE paid_date::text LIKE '2025-06%' OR payment_date::text LIKE '2025-06%';

-- 3. Actualizar fechas de creación para que sean consistentes
UPDATE payments 
SET created_at = '2025-07-31T10:00:00Z'
WHERE created_at < '2025-07-01T00:00:00Z';

-- 4. Verificar que los cambios se aplicaron correctamente
SELECT 
    id,
    concept,
    amount,
    paid_date,
    payment_date,
    created_at,
    'CORREGIDO' as status
FROM payments 
WHERE paid_date::text LIKE '2025-07%' OR payment_date::text LIKE '2025-07%'
ORDER BY created_at DESC;

-- 5. Contar pagos por mes para verificar
SELECT 
    DATE_TRUNC('month', paid_date::date) as mes,
    COUNT(*) as total_pagos,
    SUM(amount) as total_monto
FROM payments 
WHERE paid_date IS NOT NULL
GROUP BY DATE_TRUNC('month', paid_date::date)
ORDER BY mes DESC;

-- Script directo para forzar actualización de fechas a julio 2025
-- Este script es más específico y directo

-- 1. Primero verificar cuántos registros tienen fechas de junio
SELECT 'ANTES DE LA ACTUALIZACIÓN - Pagos en Junio 2025:' as status, COUNT(*) as total
FROM payments 
WHERE paid_date >= '2025-06-01' AND paid_date < '2025-07-01';

-- 2. Actualizar TODOS los pagos de junio 2025 a julio 2025
-- Mantener el mismo día pero cambiar el mes
UPDATE payments 
SET 
  paid_date = (paid_date + INTERVAL '1 month')::date,
  payment_date = (payment_date + INTERVAL '1 month')::date,
  updated_at = NOW()
WHERE paid_date >= '2025-06-01' AND paid_date < '2025-07-01';

-- 3. Verificar después de la actualización
SELECT 'DESPUÉS DE LA ACTUALIZACIÓN - Pagos en Junio 2025:' as status, COUNT(*) as total
FROM payments 
WHERE paid_date >= '2025-06-01' AND paid_date < '2025-07-01';

-- 4. Verificar pagos en julio 2025
SELECT 'DESPUÉS DE LA ACTUALIZACIÓN - Pagos en Julio 2025:' as status, COUNT(*) as total
FROM payments 
WHERE paid_date >= '2025-07-01' AND paid_date < '2025-08-01';

-- 5. Mostrar algunos ejemplos de las fechas actualizadas
SELECT 
  id,
  student_id,
  amount,
  paid_date,
  payment_date,
  'Actualizado correctamente' as status
FROM payments 
WHERE paid_date >= '2025-07-01' AND paid_date < '2025-08-01'
ORDER BY paid_date
LIMIT 5;

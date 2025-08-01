-- Verificar las fechas actuales en la tabla payments
-- Para confirmar si el script de corrección se ejecutó correctamente

-- 1. Contar pagos por mes para ver la distribución
SELECT 
  DATE_TRUNC('month', paid_date) as mes,
  COUNT(*) as total_pagos,
  MIN(paid_date) as fecha_minima,
  MAX(paid_date) as fecha_maxima
FROM payments 
GROUP BY DATE_TRUNC('month', paid_date)
ORDER BY mes DESC;

-- 2. Ver todos los pagos con fechas de junio 2025 (si existen)
SELECT 
  id,
  student_id,
  amount,
  paid_date,
  payment_date,
  created_at
FROM payments 
WHERE paid_date >= '2025-06-01' AND paid_date < '2025-07-01'
ORDER BY paid_date;

-- 3. Ver todos los pagos con fechas de julio 2025
SELECT 
  id,
  student_id,
  amount,
  paid_date,
  payment_date,
  created_at
FROM payments 
WHERE paid_date >= '2025-07-01' AND paid_date < '2025-08-01'
ORDER BY paid_date;

-- 4. Verificar si hay pagos con payment_date diferente a paid_date
SELECT 
  id,
  student_id,
  amount,
  paid_date,
  payment_date,
  CASE 
    WHEN paid_date != payment_date THEN 'DIFERENTES'
    ELSE 'IGUALES'
  END as comparacion
FROM payments 
WHERE paid_date IS NOT NULL AND payment_date IS NOT NULL
ORDER BY paid_date DESC
LIMIT 10;

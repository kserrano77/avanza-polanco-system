-- =====================================================
-- VERIFICAR ESTRUCTURA DE LA TABLA PAYMENTS
-- Sistema Avanza Polanco
-- =====================================================

-- Verificar todas las columnas de la tabla payments
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- Verificar algunos registros de ejemplo para entender la estructura
SELECT 
    id,
    student_id,
    amount,
    concept,
    status,
    payment_date,
    paid_date,
    created_at,
    reminder_sent,
    overdue_notification_sent,
    confirmation_sent
FROM payments 
LIMIT 5;

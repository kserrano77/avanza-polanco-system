-- =====================================================
-- AGREGAR COLUMNAS PARA NOTIFICACIONES DE EMAIL
-- Sistema Avanza Polanco
-- =====================================================

-- Agregar columnas para rastrear notificaciones enviadas
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS overdue_notification_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmation_sent TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar performance en consultas de notificaciones
CREATE INDEX IF NOT EXISTS idx_payments_reminder_pending 
ON payments (payment_date, status) 
WHERE reminder_sent IS NULL AND status = 'pending';

CREATE INDEX IF NOT EXISTS idx_payments_overdue_pending 
ON payments (payment_date, status) 
WHERE overdue_notification_sent IS NULL AND status = 'pending';

-- Comentarios para documentación
COMMENT ON COLUMN payments.reminder_sent IS 'Timestamp cuando se envió recordatorio de pago (3 días antes)';
COMMENT ON COLUMN payments.overdue_notification_sent IS 'Timestamp cuando se envió notificación de pago vencido';
COMMENT ON COLUMN payments.confirmation_sent IS 'Timestamp cuando se envió confirmación de nuevo pago registrado';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name IN ('reminder_sent', 'overdue_notification_sent', 'confirmation_sent');

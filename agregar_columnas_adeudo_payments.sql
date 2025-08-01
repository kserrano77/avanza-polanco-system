-- Script para agregar columnas de adeudo a la tabla payments
-- Avanza Polanco - Sistema de Gestión Escolar

-- Agregar columna para el monto del adeudo
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS debt_amount DECIMAL(10,2) DEFAULT 0;

-- Agregar columna para la descripción del adeudo
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS debt_description TEXT;

-- Agregar comentarios a las columnas
COMMENT ON COLUMN payments.debt_amount IS 'Monto del adeudo pendiente del estudiante';
COMMENT ON COLUMN payments.debt_description IS 'Descripción o concepto del adeudo pendiente';

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name IN ('debt_amount', 'debt_description')
ORDER BY column_name;

-- Mostrar mensaje de confirmación
SELECT 'Columnas de adeudo agregadas exitosamente a la tabla payments' as resultado;

-- Script para agregar el tema "Blanco Elegante" a los temas de fondo disponibles
-- Avanza Polanco - Sistema de Gestión Escolar

-- Actualizar el constraint para incluir el nuevo tema 'white'
ALTER TABLE school_settings 
DROP CONSTRAINT IF EXISTS school_settings_background_theme_check;

ALTER TABLE school_settings 
ADD CONSTRAINT school_settings_background_theme_check 
CHECK (background_theme IN ('default', 'sunset', 'ocean', 'forest', 'lavender', 'white'));

-- Verificar que el constraint se aplicó correctamente
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'school_settings_background_theme_check';

-- Mostrar mensaje de confirmación
SELECT 'Tema "Blanco Elegante" agregado exitosamente a los temas disponibles' as resultado;

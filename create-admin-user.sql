-- =====================================================
-- CREAR USUARIO ADMINISTRADOR - INSTITUTO POLANCO
-- =====================================================
-- Este script crea un usuario administrador para el sistema
-- Ejecutar DESPUÉS de crear un usuario en Supabase Auth
-- =====================================================

-- PASO 1: Primero crear usuario en Supabase Auth Dashboard
-- Email: admin@institutopolanco.edu.mx
-- Password: PolancoAdmin2025!
-- Confirmar email automáticamente

-- PASO 2: Ejecutar este script con el ID del usuario creado
-- Reemplazar 'USER_ID_FROM_AUTH' con el ID real del usuario

-- Insertar perfil de administrador
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    '09c522c3-8959-4924-a97b-07aa688116ba', -- ID que el sistema está buscando
    'admin@institutopolanco.edu.mx',
    'Administrador Instituto Polanco',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verificar que se creó correctamente
SELECT * FROM profiles WHERE role = 'admin';

-- =====================================================
-- SCRIPT ALTERNATIVO: Crear usuario genérico si no existe el ID específico
-- =====================================================

-- Si el ID específico no funciona, usar este script alternativo:
/*
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(), -- Generar nuevo ID
    'admin@institutopolanco.edu.mx',
    'Administrador Instituto Polanco',
    'admin',
    NOW(),
    NOW()
);
*/

-- =====================================================
-- VERIFICACIONES FINALES
-- =====================================================

-- Contar usuarios totales
SELECT COUNT(*) as total_users FROM profiles;

-- Mostrar todos los administradores
SELECT id, email, full_name, role, created_at FROM profiles WHERE role = 'admin';

-- Verificar configuración de escuela
SELECT * FROM school_settings;

COMMIT;

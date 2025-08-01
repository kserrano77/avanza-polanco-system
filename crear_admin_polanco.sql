-- =====================================================
-- SCRIPT PARA CREAR USUARIO ADMINISTRADOR
-- AVANZA POLANCO - SISTEMA EDUCATIVO
-- =====================================================
-- Este script crea el usuario administrador inicial
-- para el sistema Avanza Polanco
-- =====================================================

-- IMPORTANTE: Primero debes crear el usuario en Supabase Auth
-- Email: forzzaserrano@gmail.com
-- Password: Kevinnivek77!
-- Luego ejecuta este script para asignar el rol admin

-- Insertar perfil de administrador
-- NOTA: Reemplaza 'USER_ID_AQUI' con el ID real del usuario creado en Auth
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    'USER_ID_AQUI', -- Reemplazar con el UUID real del usuario
    'forzzaserrano@gmail.com',
    'Kevin Serrano - Administrador',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Insertar configuración inicial de la escuela
INSERT INTO school_settings (
    school_name,
    school_code,
    address,
    phone,
    email,
    created_at,
    updated_at
) VALUES (
    'Avanza Polanco',
    'AVANZA_POLANCO',
    'Polanco, Ciudad de México',
    '+52 55 1234 5678',
    'admin@avanzapolanco.edu.mx',
    NOW(),
    NOW()
) ON CONFLICT (school_code) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    updated_at = NOW();

-- Mensaje de confirmación
SELECT 'Usuario administrador y configuración inicial creados exitosamente' as mensaje;

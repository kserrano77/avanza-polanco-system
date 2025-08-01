-- Script específico para crear el perfil del administrador principal
-- Email: forzzaserrano@gmail.com
-- Rol: admin (permisos completos)

-- 1. Verificar el usuario actual autenticado
SELECT 'Verificando usuario actual:' as info;
SELECT auth.uid() as current_user_id, auth.email() as current_user_email;

-- 2. Verificar si ya existe el perfil
SELECT 'Perfil existente (si existe):' as info;
SELECT id, email, full_name, role, created_at
FROM profiles 
WHERE email = 'forzzaserrano@gmail.com' OR id = auth.uid();

-- 3. Crear/actualizar el perfil del administrador principal
-- Esto funcionará tanto si el perfil no existe como si ya existe
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    auth.uid(),
    'forzzaserrano@gmail.com',
    'Kevin Serrano - Administrador Principal',
    'admin',
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    email = 'forzzaserrano@gmail.com',
    full_name = 'Kevin Serrano - Administrador Principal',
    role = 'admin',
    updated_at = NOW();

-- 4. Verificar que el perfil se creó/actualizó correctamente
SELECT 'Perfil después de creación/actualización:' as info;
SELECT id, email, full_name, role, created_at, updated_at
FROM profiles 
WHERE email = 'forzzaserrano@gmail.com' OR id = auth.uid();

-- 5. Verificar permisos del rol admin
SELECT 'Confirmación de permisos de admin:' as info;
SELECT 
    CASE 
        WHEN role = 'admin' THEN 'SÍ'
        ELSE 'NO'
    END as puede_eliminar_pagos,
    CASE 
        WHEN role = 'admin' THEN 'SÍ'
        ELSE 'NO'
    END as puede_eliminar_cortes,
    CASE 
        WHEN role = 'admin' THEN 'SÍ'
        ELSE 'NO'
    END as puede_eliminar_usuarios,
    CASE 
        WHEN role = 'admin' THEN 'SÍ'
        ELSE 'NO'
    END as puede_gestionar_configuracion
FROM profiles 
WHERE email = 'forzzaserrano@gmail.com' OR id = auth.uid();

-- 6. Mensaje de confirmación
SELECT 'PERFIL DE ADMINISTRADOR PRINCIPAL CREADO EXITOSAMENTE' as resultado,
       'forzzaserrano@gmail.com configurado como admin con permisos completos' as detalle;

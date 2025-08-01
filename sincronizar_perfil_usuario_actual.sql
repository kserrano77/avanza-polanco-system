-- Script para sincronizar el perfil del usuario autenticado actual
-- ID detectado: 09c522c3-8959-4924-a97b-07aa688116ba
-- Email: forzzaserrano@gmail.com

-- 1. Verificar el usuario actual autenticado
SELECT 'Usuario actual detectado:' as info;
SELECT auth.uid() as current_user_id, auth.email() as current_user_email;

-- 2. Verificar si existe algún perfil con este ID específico
SELECT 'Perfil existente con ID actual:' as info;
SELECT id, email, full_name, role, created_at
FROM profiles 
WHERE id = '09c522c3-8959-4924-a97b-07aa688116ba';

-- 3. Verificar todos los perfiles existentes
SELECT 'Todos los perfiles existentes:' as info;
SELECT id, email, full_name, role, created_at
FROM profiles 
ORDER BY created_at DESC;

-- 4. CREAR el perfil específico para el ID actual
-- Usar INSERT con ON CONFLICT para manejar si ya existe
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    '09c522c3-8959-4924-a97b-07aa688116ba',
    'forzzaserrano@gmail.com',
    'Kevin Serrano - Administrador Principal',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = 'forzzaserrano@gmail.com',
    full_name = 'Kevin Serrano - Administrador Principal',
    role = 'admin',
    updated_at = NOW();

-- 5. TAMBIÉN crear/actualizar usando auth.uid() por si acaso
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

-- 6. Verificar que el perfil se creó correctamente
SELECT 'Perfil después de sincronización:' as info;
SELECT id, email, full_name, role, created_at, updated_at
FROM profiles 
WHERE id = '09c522c3-8959-4924-a97b-07aa688116ba' OR id = auth.uid();

-- 7. Verificar que la consulta que falla ahora funcione
SELECT 'Prueba de consulta que fallaba:' as info;
SELECT role
FROM profiles 
WHERE id = '09c522c3-8959-4924-a97b-07aa688116ba';

-- 8. Mensaje de confirmación
SELECT 'PERFIL SINCRONIZADO EXITOSAMENTE' as resultado,
       'Usuario 09c522c3-8959-4924-a97b-07aa688116ba configurado como admin' as detalle;

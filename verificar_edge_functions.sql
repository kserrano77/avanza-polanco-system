-- =====================================================
-- VERIFICAR EDGE FUNCTIONS DISPONIBLES
-- Sistema Avanza Polanco
-- =====================================================

-- Esta consulta no funcionará en SQL Editor, pero puedes verificar en:
-- 1. Supabase Dashboard → Edge Functions
-- 2. O usar la CLI: supabase functions list

-- Para verificar si send-payment-receipt existe:
-- Ve a: https://app.supabase.com/project/[tu-project-id]/functions

-- Funciones que deberían existir:
-- - send-payment-receipt (para envío de emails)

-- Si no existe, necesitarás crearla desde el archivo:
-- supabase-edge-function.js

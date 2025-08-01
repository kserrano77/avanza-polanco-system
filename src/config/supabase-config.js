// Configuración forzada para Avanza Polanco
// Este archivo asegura que se usen las credenciales correctas

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY (primeros 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20));

// Configuración forzada para Avanza Polanco
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://asqymroylemsrrmfwako.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcXltcm95bGVtc3JybWZ3YWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTUzODgsImV4cCI6MjA2OTQzMTM4OH0.mdAX12fcUf2SWEvSd1PMA9Nrubl_qVS9j8QucaMqGfo'
};

// Verificación de seguridad
if (SUPABASE_CONFIG.url.includes('asqymroylemsrrmfwako')) {
  console.log('✅ CORRECTO: Usando proyecto de Avanza Polanco');
} else if (SUPABASE_CONFIG.url.includes('gvrgepdjxzhgqkmtwcvs')) {
  console.error('❌ ERROR: Usando proyecto de Cd. Obregón en sitio de Polanco');
} else {
  console.warn('⚠️ ADVERTENCIA: URL de Supabase no reconocida');
}

export default SUPABASE_CONFIG;

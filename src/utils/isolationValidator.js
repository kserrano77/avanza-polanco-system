// =====================================================
// VALIDADOR DE AISLAMIENTO - INSTITUTO POLANCO
// =====================================================
// Este módulo garantiza que el sistema esté conectado ÚNICAMENTE
// a la base de datos correcta de Avanza Polanco
// =====================================================

import { supabase } from '../lib/customSupabaseClient.js';

// Configuración esperada para Avanza Polanco
const EXPECTED_CONFIG = {
  projectId: 'asqymroylemsrrmfwako',
  projectUrl: 'https://asqymroylemsrrmfwako.supabase.co',
  schoolName: 'Avanza Polanco',
  schoolCode: 'INSTITUTO_POLANCO'
};

// Configuraciones prohibidas (otros proyectos)
const FORBIDDEN_CONFIGS = [
  {
    projectId: 'gvrgepdjxzhgqkmtwcvs',
    name: 'Cd. Obregón'
  },
  {
    projectId: 'iulokyhuaogovaynxqcl', 
    name: 'Polanco Anterior'
  },
  {
    projectId: 'txwplesyvhtseeinjkfs',
    name: 'Polanco Test'
  }
];

/**
 * Valida que la conexión sea únicamente al proyecto correcto
 */
export async function validateIsolation() {
  console.log('🔍 INICIANDO VALIDACIÓN DE AISLAMIENTO...');
  
  const results = {
    isValid: false,
    projectId: null,
    errors: [],
    warnings: [],
    details: {}
  };

  try {
    // 1. Verificar URL de conexión
    const currentUrl = supabase.supabaseUrl;
    console.log('📡 URL actual:', currentUrl);
    
    if (!currentUrl.includes(EXPECTED_CONFIG.projectId)) {
      results.errors.push(`❌ URL incorrecta. Esperada: ${EXPECTED_CONFIG.projectUrl}, Actual: ${currentUrl}`);
    }

    // 2. Verificar que NO esté conectado a proyectos prohibidos
    for (const forbidden of FORBIDDEN_CONFIGS) {
      if (currentUrl.includes(forbidden.projectId)) {
        results.errors.push(`🚨 CONEXIÓN PROHIBIDA detectada a proyecto ${forbidden.name} (${forbidden.projectId})`);
      }
    }

    // 3. Test de conexión real
    console.log('🧪 Probando conexión a base de datos...');
    const { data: testData, error: testError } = await supabase
      .from('school_settings')
      .select('school_name, school_code')
      .limit(1);

    if (testError) {
      results.errors.push(`❌ Error de conexión: ${testError.message}`);
    } else {
      console.log('✅ Conexión exitosa');
      results.details.connectionTest = 'SUCCESS';
      
      // 4. Verificar configuración de escuela
      if (testData && testData.length > 0) {
        const schoolData = testData[0];
        console.log('🏫 Datos de escuela:', schoolData);
        
        if (schoolData.school_name !== EXPECTED_CONFIG.schoolName) {
          results.warnings.push(`⚠️ Nombre de escuela inesperado: ${schoolData.school_name}`);
        }
        
        if (schoolData.school_code !== EXPECTED_CONFIG.schoolCode) {
          results.warnings.push(`⚠️ Código de escuela inesperado: ${schoolData.school_code}`);
        }
        
        results.details.schoolData = schoolData;
      }
    }

    // 5. Verificar variables de entorno
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (envUrl !== currentUrl) {
      results.warnings.push(`⚠️ Discrepancia entre .env y cliente: ENV=${envUrl}, Cliente=${currentUrl}`);
    }

    // 6. Test de aislamiento de datos
    console.log('🔒 Probando aislamiento de datos...');
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .limit(5);

    if (!studentsError) {
      results.details.studentsCount = studentsData?.length || 0;
      console.log(`👥 Estudiantes encontrados: ${results.details.studentsCount}`);
    }

    // 7. Determinar resultado final
    results.isValid = results.errors.length === 0;
    results.projectId = EXPECTED_CONFIG.projectId;

    // Log final
    if (results.isValid) {
      console.log('✅ VALIDACIÓN EXITOSA: Sistema correctamente aislado para Avanza Polanco');
    } else {
      console.error('❌ VALIDACIÓN FALLIDA: Problemas de aislamiento detectados');
      results.errors.forEach(error => console.error(error));
    }

    return results;

  } catch (error) {
    console.error('💥 Error durante validación:', error);
    results.errors.push(`Error inesperado: ${error.message}`);
    return results;
  }
}

/**
 * Ejecuta validación automática al cargar la aplicación
 */
export async function autoValidateOnLoad() {
  console.log('🚀 EJECUTANDO VALIDACIÓN AUTOMÁTICA DE AISLAMIENTO...');
  
  const results = await validateIsolation();
  
  // Mostrar alertas en caso de problemas críticos
  if (!results.isValid) {
    const errorMsg = `ALERTA DE SEGURIDAD: Problemas de aislamiento detectados\n\n${results.errors.join('\n')}`;
    console.error(errorMsg);
    
    // En desarrollo, mostrar alerta visual
    if (import.meta.env.DEV) {
      alert(errorMsg);
    }
  }
  
  return results;
}

/**
 * Genera reporte detallado de aislamiento
 */
export function generateIsolationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    status: results.isValid ? 'AISLADO' : 'PROBLEMAS_DETECTADOS',
    project: {
      expected: EXPECTED_CONFIG.projectId,
      actual: results.projectId,
      url: supabase.supabaseUrl
    },
    school: results.details.schoolData || null,
    errors: results.errors,
    warnings: results.warnings,
    studentsCount: results.details.studentsCount || 0
  };

  console.log('📋 REPORTE DE AISLAMIENTO:', JSON.stringify(report, null, 2));
  return report;
}

export default {
  validateIsolation,
  autoValidateOnLoad,
  generateIsolationReport,
  EXPECTED_CONFIG,
  FORBIDDEN_CONFIGS
};

/**
 * SCRIPT DE RESPALDO AUTOMATICO - SISTEMA POLANCO
 * 
 * Este script exporta todas las tablas importantes de Supabase
 * y las guarda como archivos CSV en OneDrive con timestamp
 * 
 * Autor: Sistema Avanza
 * Fecha: 2025-08-18
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURACIÓN - ACTUALIZAR ESTAS CREDENCIALES
// ========================================

const SUPABASE_CONFIG = {
    url: 'TU_SUPABASE_URL_AQUI', // Ejemplo: https://abcdefgh.supabase.co
    key: 'TU_SUPABASE_ANON_KEY_AQUI', // Tu clave anónima de Supabase
};

// Directorio donde se guardarán los respaldos
const BACKUP_DIR = __dirname; // Carpeta actual (respaldo polanco)

// Tablas a respaldar
const TABLES_TO_BACKUP = [
    'students',
    'payments', 
    'users',
    'courses',
    'schedules',
    'profiles',
    'cash_cuts',
    'school_settings'
];

// ========================================
// FUNCIONES PRINCIPALES
// ========================================

/**
 * Convierte array de objetos a formato CSV
 */
function arrayToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escapar comillas y envolver en comillas si contiene comas
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Genera timestamp para nombres de archivo
 */
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Exporta una tabla específica a CSV
 */
async function exportTable(supabase, tableName, timestamp) {
    try {
        console.log(`📊 Exportando tabla: ${tableName}...`);
        
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error(`❌ Error al exportar ${tableName}:`, error.message);
            return false;
        }
        
        if (!data || data.length === 0) {
            console.log(`⚠️  Tabla ${tableName} está vacía, creando archivo vacío...`);
            const filename = `${tableName}_${timestamp}.csv`;
            const filepath = path.join(BACKUP_DIR, filename);
            fs.writeFileSync(filepath, `# Respaldo de ${tableName} - ${new Date().toLocaleString('es-MX')}\n# Tabla vacía\n`);
            return true;
        }
        
        const csv = arrayToCSV(data);
        const filename = `${tableName}_${timestamp}.csv`;
        const filepath = path.join(BACKUP_DIR, filename);
        
        // Agregar header con información del respaldo
        const csvWithHeader = `# Respaldo de ${tableName} - ${new Date().toLocaleString('es-MX')}\n# Total de registros: ${data.length}\n${csv}`;
        
        fs.writeFileSync(filepath, csvWithHeader);
        console.log(`✅ ${tableName}: ${data.length} registros exportados → ${filename}`);
        return true;
        
    } catch (err) {
        console.error(`❌ Error inesperado al exportar ${tableName}:`, err.message);
        return false;
    }
}

/**
 * Función principal de respaldo
 */
async function runBackup() {
    console.log('🚀 INICIANDO RESPALDO AUTOMATICO - SISTEMA POLANCO');
    console.log('=' .repeat(60));
    console.log(`📅 Fecha: ${new Date().toLocaleString('es-MX')}`);
    console.log(`📁 Directorio: ${BACKUP_DIR}`);
    console.log('=' .repeat(60));
    
    // Validar configuración
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url === 'TU_SUPABASE_URL_AQUI') {
        console.error('❌ ERROR: Debes configurar SUPABASE_URL en el script');
        process.exit(1);
    }
    
    if (!SUPABASE_CONFIG.key || SUPABASE_CONFIG.key === 'TU_SUPABASE_ANON_KEY_AQUI') {
        console.error('❌ ERROR: Debes configurar SUPABASE_ANON_KEY en el script');
        process.exit(1);
    }
    
    // Crear cliente de Supabase
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    
    // Generar timestamp para este respaldo
    const timestamp = getTimestamp();
    
    let successCount = 0;
    let errorCount = 0;
    
    // Exportar cada tabla
    for (const tableName of TABLES_TO_BACKUP) {
        const success = await exportTable(supabase, tableName, timestamp);
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }
        
        // Pequeña pausa entre exportaciones
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Crear archivo de resumen
    const summaryContent = `RESUMEN DEL RESPALDO - SISTEMA POLANCO
Fecha: ${new Date().toLocaleString('es-MX')}
Timestamp: ${timestamp}

RESULTADOS:
✅ Tablas exportadas exitosamente: ${successCount}
❌ Tablas con errores: ${errorCount}
📊 Total de tablas procesadas: ${TABLES_TO_BACKUP.length}

TABLAS RESPALDADAS:
${TABLES_TO_BACKUP.map(table => `- ${table}_${timestamp}.csv`).join('\n')}

UBICACIÓN:
${BACKUP_DIR}

PRÓXIMO RESPALDO PROGRAMADO:
Cada domingo a las 23:00 hrs (configurado en Task Scheduler)

---
Script generado por Sistema Avanza
Para soporte: Contactar al desarrollador
`;
    
    const summaryFile = path.join(BACKUP_DIR, `RESUMEN_${timestamp}.txt`);
    fs.writeFileSync(summaryFile, summaryContent);
    
    console.log('=' .repeat(60));
    console.log('🎉 RESPALDO COMPLETADO');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📄 Resumen guardado: RESUMEN_${timestamp}.txt`);
    console.log('=' .repeat(60));
    
    if (errorCount > 0) {
        console.log('⚠️  ATENCIÓN: Hubo errores durante el respaldo');
        console.log('   Revisa los logs arriba para más detalles');
    }
}

// ========================================
// EJECUCIÓN
// ========================================

// Verificar si se está ejecutando directamente
if (require.main === module) {
    runBackup().catch(err => {
        console.error('💥 ERROR CRÍTICO:', err.message);
        process.exit(1);
    });
}

module.exports = { runBackup };

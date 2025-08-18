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
    url: 'https://asqymroylemsrrmfwako.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcXltcm95bGVtc3JybWZ3YWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTUzODgsImV4cCI6MjA2OTQzMTM4OH0.mdAX12fcUf2SWEvSd1PMA9Nrubl_qVS9j8QucaMqGfo',
};

// Directorio donde se guardarán los respaldos
const BACKUP_DIR = __dirname; // Carpeta actual (respaldo polanco)

// Configuración de limpieza automática
const MAX_BACKUPS_TO_KEEP = 8; // Mantener últimos 8 respaldos (2 meses)

// Tablas a respaldar
const TABLES_TO_BACKUP = [
    'students',
    'payments', 
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
 * Limpia respaldos antiguos manteniendo solo los más recientes
 */
function cleanupOldBackups() {
    try {
        console.log('🧹 Limpiando respaldos antiguos...');
        
        // Obtener todos los archivos de resumen (para identificar respaldos completos)
        const files = fs.readdirSync(BACKUP_DIR);
        const summaryFiles = files
            .filter(file => file.startsWith('RESUMEN_') && file.endsWith('.txt'))
            .map(file => {
                const match = file.match(/RESUMEN_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2})\.txt/);
                if (match) {
                    return {
                        file: file,
                        timestamp: match[1],
                        date: new Date(match[1].replace('_', 'T').replace('-', ':'))
                    };
                }
                return null;
            })
            .filter(item => item !== null)
            .sort((a, b) => b.date - a.date); // Más recientes primero
        
        console.log(`📊 Encontrados ${summaryFiles.length} respaldos completos`);
        
        if (summaryFiles.length <= MAX_BACKUPS_TO_KEEP) {
            console.log(`✅ Solo ${summaryFiles.length} respaldos. No es necesario limpiar.`);
            return;
        }
        
        // Respaldos a eliminar (los más antiguos)
        const backupsToDelete = summaryFiles.slice(MAX_BACKUPS_TO_KEEP);
        console.log(`🗑️  Eliminando ${backupsToDelete.length} respaldos antiguos...`);
        
        let deletedCount = 0;
        
        for (const backup of backupsToDelete) {
            const timestamp = backup.timestamp;
            
            // Buscar todos los archivos de este respaldo específico
            const relatedFiles = files.filter(file => file.includes(timestamp));
            
            for (const file of relatedFiles) {
                try {
                    const filePath = path.join(BACKUP_DIR, file);
                    fs.unlinkSync(filePath);
                    console.log(`   🗑️  ${file}`);
                    deletedCount++;
                } catch (err) {
                    console.log(`   ⚠️  Error eliminando ${file}: ${err.message}`);
                }
            }
        }
        
        console.log(`✅ Limpieza completada: ${deletedCount} archivos eliminados`);
        console.log(`📊 Respaldos mantenidos: ${Math.min(summaryFiles.length, MAX_BACKUPS_TO_KEEP)}`);
        
    } catch (err) {
        console.error('❌ Error durante limpieza:', err.message);
        // No fallar el respaldo por errores de limpieza
    }
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
    
    // Limpiar respaldos antiguos ANTES de crear el resumen
    console.log('=' .repeat(60));
    cleanupOldBackups();
    console.log('=' .repeat(60));
    
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

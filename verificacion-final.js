#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICACIÓN FINAL - INSTITUTO POLANCO
 * ================================================
 * Este script verifica que el sistema clonado esté correctamente
 * configurado y completamente aislado del sistema original.
 */

const fs = require('fs');
const path = require('path');

// Configuración esperada para Instituto Polanco
const EXPECTED_CONFIG = {
    projectId: 'asqymroylemsrrmfwako',
    projectUrl: 'https://asqymroylemsrrmfwako.supabase.co',
    schoolName: 'Instituto Polanco',
    schoolCode: 'INSTITUTO_POLANCO',
    packageName: 'sistema-polanco'
};

// Configuraciones prohibidas (sistemas originales)
const FORBIDDEN_CONFIGS = [
    'gvrgepdjxzhgqkmtwcvs', // Cd. Obregón
    'iulokyhuaogovaynxqcl', // Polanco Anterior
    'txwplesyvhtseeinjkfs'  // Polanco Test
];

let errors = [];
let warnings = [];
let successes = [];

function log(type, message) {
    const timestamp = new Date().toISOString();
    const prefix = {
        'error': '❌ ERROR',
        'warning': '⚠️  WARNING',
        'success': '✅ SUCCESS'
    }[type];
    
    console.log(`[${timestamp}] ${prefix}: ${message}`);
    
    if (type === 'error') errors.push(message);
    else if (type === 'warning') warnings.push(message);
    else successes.push(message);
}

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        log('success', `${description} existe: ${filePath}`);
        return true;
    } else {
        log('error', `${description} NO existe: ${filePath}`);
        return false;
    }
}

function checkFileContent(filePath, searchText, description, shouldExist = true) {
    if (!fs.existsSync(filePath)) {
        log('error', `Archivo no existe para verificar: ${filePath}`);
        return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const found = content.includes(searchText);
    
    if (shouldExist && found) {
        log('success', `${description}: Contenido correcto encontrado`);
        return true;
    } else if (!shouldExist && !found) {
        log('success', `${description}: Contenido prohibido NO encontrado`);
        return true;
    } else if (shouldExist && !found) {
        log('error', `${description}: Contenido esperado NO encontrado`);
        return false;
    } else {
        log('error', `${description}: Contenido prohibido encontrado`);
        return false;
    }
}

function main() {
    console.log('🔍 INICIANDO VERIFICACIÓN FINAL DEL SISTEMA INSTITUTO POLANCO');
    console.log('================================================================');
    
    // 1. Verificar estructura de archivos
    console.log('\n📁 Verificando estructura de archivos...');
    checkFileExists('.env', 'Archivo de variables de entorno');
    checkFileExists('package.json', 'Archivo package.json');
    checkFileExists('index.html', 'Archivo index.html');
    checkFileExists('database_setup_polanco.sql', 'Script SQL de base de datos');
    checkFileExists('test-polanco-isolation.html', 'Test de aislamiento');
    checkFileExists('README-POLANCO.md', 'Documentación');
    checkFileExists('INSTRUCCIONES-DEPLOYMENT-POLANCO.md', 'Instrucciones de deployment');
    checkFileExists('src/config/supabase-config.js', 'Configuración de Supabase');
    checkFileExists('src/utils/isolationValidator.js', 'Validador de aislamiento');
    
    // 2. Verificar configuración en .env
    console.log('\n🔧 Verificando archivo .env...');
    checkFileContent('.env', EXPECTED_CONFIG.projectUrl, 'URL de Supabase en .env');
    checkFileContent('.env', EXPECTED_CONFIG.schoolName, 'Nombre de escuela en .env');
    checkFileContent('.env', EXPECTED_CONFIG.schoolCode, 'Código de escuela en .env');
    
    // Verificar que NO contenga configuraciones prohibidas
    for (const forbidden of FORBIDDEN_CONFIGS) {
        checkFileContent('.env', forbidden, `Configuración prohibida ${forbidden} en .env`, false);
    }
    
    // 3. Verificar package.json
    console.log('\n📦 Verificando package.json...');
    checkFileContent('package.json', EXPECTED_CONFIG.packageName, 'Nombre del proyecto en package.json');
    
    // 4. Verificar index.html
    console.log('\n🌐 Verificando index.html...');
    checkFileContent('index.html', 'Sistema Instituto Polanco', 'Título en index.html');
    
    // 5. Verificar configuración de Supabase
    console.log('\n🗄️ Verificando configuración de Supabase...');
    checkFileContent('src/config/supabase-config.js', EXPECTED_CONFIG.projectUrl, 'URL en supabase-config.js');
    checkFileContent('src/config/supabase-config.js', 'Instituto Polanco', 'Nombre de escuela en supabase-config.js');
    
    // Verificar que NO contenga configuraciones prohibidas
    for (const forbidden of FORBIDDEN_CONFIGS) {
        checkFileContent('src/config/supabase-config.js', forbidden, `Configuración prohibida ${forbidden} en supabase-config.js`, false);
    }
    
    // 6. Verificar netlify.toml
    console.log('\n🚀 Verificando netlify.toml...');
    checkFileContent('netlify.toml', EXPECTED_CONFIG.projectUrl, 'URL en netlify.toml');
    checkFileContent('netlify.toml', EXPECTED_CONFIG.schoolName, 'Nombre de escuela en netlify.toml');
    
    // Verificar que NO contenga configuraciones prohibidas
    for (const forbidden of FORBIDDEN_CONFIGS) {
        checkFileContent('netlify.toml', forbidden, `Configuración prohibida ${forbidden} en netlify.toml`, false);
    }
    
    // 7. Verificar validador de aislamiento
    console.log('\n🛡️ Verificando validador de aislamiento...');
    checkFileContent('src/utils/isolationValidator.js', EXPECTED_CONFIG.projectId, 'Project ID en validador');
    checkFileContent('src/utils/isolationValidator.js', 'Instituto Polanco', 'Nombre de escuela en validador');
    
    // 8. Verificar test de aislamiento
    console.log('\n🧪 Verificando test de aislamiento...');
    checkFileContent('test-polanco-isolation.html', EXPECTED_CONFIG.projectUrl, 'URL en test de aislamiento');
    checkFileContent('test-polanco-isolation.html', 'Instituto Polanco', 'Nombre de escuela en test');
    
    // 9. Generar reporte final
    console.log('\n📋 REPORTE FINAL');
    console.log('================');
    console.log(`✅ Verificaciones exitosas: ${successes.length}`);
    console.log(`⚠️  Advertencias: ${warnings.length}`);
    console.log(`❌ Errores: ${errors.length}`);
    
    if (errors.length === 0) {
        console.log('\n🎉 ¡VERIFICACIÓN EXITOSA!');
        console.log('El sistema Instituto Polanco está correctamente configurado y aislado.');
        console.log('✅ Listo para deployment a producción.');
    } else {
        console.log('\n🚨 VERIFICACIÓN FALLIDA');
        console.log('Se encontraron errores que deben corregirse antes del deployment:');
        errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log('\n⚠️  ADVERTENCIAS:');
        warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    // Generar reporte JSON
    const report = {
        timestamp: new Date().toISOString(),
        project: 'Instituto Polanco',
        status: errors.length === 0 ? 'PASSED' : 'FAILED',
        summary: {
            successes: successes.length,
            warnings: warnings.length,
            errors: errors.length
        },
        details: {
            successes,
            warnings,
            errors
        },
        expectedConfig: EXPECTED_CONFIG,
        forbiddenConfigs: FORBIDDEN_CONFIGS
    };
    
    fs.writeFileSync('verificacion-reporte.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Reporte detallado guardado en: verificacion-reporte.json');
    
    // Exit code
    process.exit(errors.length === 0 ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = { main, EXPECTED_CONFIG, FORBIDDEN_CONFIGS };

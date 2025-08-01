// Respaldo Automático - Sistema Escolar Avanza
// Ejecutar: node respaldo-automatico.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración
const supabaseUrl = 'https://gvrgepdjxzhgqkmtwcvs.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'tu_clave_aqui';

const supabase = createClient(supabaseUrl, supabaseKey);

// Crear carpeta de respaldos
const backupDir = path.join(__dirname, 'respaldos');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Fecha para el nombre del archivo
const fecha = new Date().toISOString().split('T')[0];
const archivoRespaldo = path.join(backupDir, `respaldo_avanza_${fecha}.json`);

async function hacerRespaldo() {
  console.log('🔄 Iniciando respaldo...');
  
  try {
    const respaldo = {
      fecha_respaldo: new Date().toISOString(),
      version: '1.0',
      datos: {}
    };

    // Respaldar estudiantes
    console.log('📚 Respaldando estudiantes...');
    const { data: estudiantes } = await supabase
      .from('students')
      .select('*');
    respaldo.datos.estudiantes = estudiantes;

    // Respaldar pagos
    console.log('💰 Respaldando pagos...');
    const { data: pagos } = await supabase
      .from('payments')
      .select('*');
    respaldo.datos.pagos = pagos;

    // Respaldar cursos
    console.log('🎓 Respaldando cursos...');
    const { data: cursos } = await supabase
      .from('courses')
      .select('*');
    respaldo.datos.cursos = cursos;

    // Respaldar horarios
    console.log('⏰ Respaldando horarios...');
    const { data: horarios } = await supabase
      .from('schedules')
      .select('*');
    respaldo.datos.horarios = horarios;

    // Respaldar cortes de caja
    console.log('💵 Respaldando cortes de caja...');
    const { data: cortes } = await supabase
      .from('cash_cuts')
      .select('*');
    respaldo.datos.cortes_caja = cortes;

    // Respaldar usuarios
    console.log('👥 Respaldando usuarios...');
    const { data: usuarios } = await supabase
      .from('profiles')
      .select('*');
    respaldo.datos.usuarios = usuarios;

    // Guardar archivo
    fs.writeFileSync(archivoRespaldo, JSON.stringify(respaldo, null, 2));

    console.log('✅ ¡Respaldo completado exitosamente!');
    console.log(`📁 Archivo guardado en: ${archivoRespaldo}`);
    console.log(`📊 Datos respaldados:`);
    console.log(`   - Estudiantes: ${estudiantes?.length || 0}`);
    console.log(`   - Pagos: ${pagos?.length || 0}`);
    console.log(`   - Cursos: ${cursos?.length || 0}`);
    console.log(`   - Horarios: ${horarios?.length || 0}`);
    console.log(`   - Cortes de caja: ${cortes?.length || 0}`);
    console.log(`   - Usuarios: ${usuarios?.length || 0}`);
    
    console.log('\n🌤️ Ahora puedes subir este archivo a tu nube preferida');
    console.log('💡 Tip: Comprime el archivo antes de subirlo para ahorrar espacio');

  } catch (error) {
    console.error('❌ Error al hacer respaldo:', error);
  }
}

// Ejecutar respaldo
hacerRespaldo();

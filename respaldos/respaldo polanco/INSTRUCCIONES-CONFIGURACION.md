# 🔧 CONFIGURACIÓN DEL RESPALDO AUTOMÁTICO - POLANCO

## 📋 PASOS PARA ACTIVAR EL RESPALDO SEMANAL

### 1. **Instalar Dependencias**
```bash
cd "C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco"
npm install
```

### 2. **Configurar Credenciales de Supabase**

Abre el archivo `respaldo-automatico-polanco.js` y actualiza estas líneas:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',  // ← Cambiar por tu URL real
    key: 'tu-clave-anonima-aqui',            // ← Cambiar por tu clave real
};
```

**¿Dónde encontrar estas credenciales?**
1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto de Polanco
3. Ve a Settings → API
4. Copia "Project URL" y "anon public"

### 3. **Probar el Respaldo Manual**
```bash
npm run backup
```

Si funciona correctamente, verás archivos CSV creados con timestamp.

### 4. **Configurar Ejecución Automática Semanal**

#### Opción A: Windows Task Scheduler (Recomendado)

1. **Abrir Task Scheduler:**
   - Presiona `Win + R`
   - Escribe `taskschd.msc`
   - Presiona Enter

2. **Crear Nueva Tarea:**
   - Click derecho en "Task Scheduler Library"
   - "Create Basic Task..."

3. **Configurar la Tarea:**
   - **Name:** `Respaldo Polanco Semanal`
   - **Description:** `Respaldo automático de datos Supabase - Sistema Polanco`
   - **Trigger:** Weekly
   - **Day:** Sunday
   - **Time:** 23:00 (11:00 PM)
   - **Action:** Start a program
   - **Program:** `node`
   - **Arguments:** `respaldo-automatico-polanco.js`
   - **Start in:** `C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco`

#### Opción B: Script Batch (Alternativo)

Crear archivo `ejecutar-respaldo.bat`:
```batch
@echo off
cd /d "C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco"
node respaldo-automatico-polanco.js
pause
```

### 5. **Verificar Funcionamiento**

Después de la primera ejecución automática, deberías ver:
- Archivos CSV con datos exportados
- Archivo `RESUMEN_YYYY-MM-DD_HH-MM.txt` con estadísticas
- Logs en consola (si ejecutas manualmente)

## 📊 QUÉ SE RESPALDA

El script exporta estas tablas automáticamente:
- ✅ `students` - Datos de estudiantes
- ✅ `payments` - Historial de pagos
- ✅ `users` - Usuarios del sistema
- ✅ `courses` - Cursos disponibles
- ✅ `schedules` - Horarios de clases
- ✅ `profiles` - Perfiles de usuario
- ✅ `cash_cuts` - Cortes de caja
- ✅ `school_settings` - Configuración del sistema

## 📁 ESTRUCTURA DE ARCHIVOS GENERADOS

```
respaldo polanco/
├── students_2025-08-18_23-00.csv
├── payments_2025-08-18_23-00.csv
├── users_2025-08-18_23-00.csv
├── courses_2025-08-18_23-00.csv
├── schedules_2025-08-18_23-00.csv
├── profiles_2025-08-18_23-00.csv
├── cash_cuts_2025-08-18_23-00.csv
├── school_settings_2025-08-18_23-00.csv
└── RESUMEN_2025-08-18_23-00.txt
```

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "Invalid API key"
- Verifica que copiaste correctamente la clave de Supabase
- Asegúrate de usar la clave "anon public", no la "service_role"

### Error: "Permission denied"
- Ejecuta como administrador
- Verifica que tienes permisos de escritura en la carpeta

### Archivos CSV vacíos
- Normal si las tablas están vacías
- El script crea archivos con headers informativos

## 📞 SOPORTE

Si tienes problemas:
1. Ejecuta `npm run backup` manualmente para ver errores
2. Revisa el archivo de resumen generado
3. Verifica que las credenciales de Supabase sean correctas
4. Contacta al desarrollador si persisten los problemas

---

**Creado:** 2025-08-18  
**Sistema:** Polanco  
**Autor:** Sistema Avanza

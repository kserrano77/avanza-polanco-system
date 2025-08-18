# 📅 CONFIGURAR TASK SCHEDULER - RESPALDO AUTOMÁTICO POLANCO

## 🎯 OBJETIVO
Configurar Windows Task Scheduler para ejecutar el respaldo automáticamente cada **domingo a las 11:00 PM**.

---

## 📋 PASOS DETALLADOS

### **Paso 1: Abrir Task Scheduler**
1. Presiona `Win + R`
2. Escribe `taskschd.msc`
3. Presiona `Enter`

### **Paso 2: Crear Nueva Tarea**
1. En el panel izquierdo, click derecho en **"Task Scheduler Library"**
2. Selecciona **"Create Basic Task..."**

### **Paso 3: Configurar Información General**
- **Name:** `Respaldo Polanco Semanal`
- **Description:** `Respaldo automático de datos Supabase - Sistema Polanco - Cada domingo 11:00 PM`
- Click **"Next"**

### **Paso 4: Configurar Trigger (Cuándo ejecutar)**
1. Selecciona **"Weekly"**
2. Click **"Next"**
3. Configurar:
   - **Start:** Fecha actual
   - **Start time:** `23:00:00` (11:00 PM)
   - **Recur every:** `1 weeks`
   - **On:** Marcar solo **"Sunday"** ✅
4. Click **"Next"**

### **Paso 5: Configurar Action (Qué ejecutar)**
1. Selecciona **"Start a program"**
2. Click **"Next"**
3. Configurar:
   - **Program/script:** 
     ```
     C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco\ejecutar-respaldo.bat
     ```
   - **Add arguments:** `auto`
   - **Start in:** 
     ```
     C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco
     ```
4. Click **"Next"**

### **Paso 6: Revisar y Finalizar**
1. Revisar toda la configuración
2. Marcar **"Open the Properties dialog for this task when I click Finish"** ✅
3. Click **"Finish"**

### **Paso 7: Configuraciones Avanzadas (Propiedades)**
En el diálogo de Properties que se abre:

#### **Pestaña "General":**
- Marcar **"Run whether user is logged on or not"** ✅
- Marcar **"Run with highest privileges"** ✅

#### **Pestaña "Settings":**
- Marcar **"Allow task to be run on demand"** ✅
- Marcar **"Run task as soon as possible after a scheduled start is missed"** ✅
- **"If the task fails, restart every:"** `1 minute`
- **"Attempt to restart up to:"** `3 times`

#### **Pestaña "History":**
- Marcar **"Enable All Tasks History"** ✅

### **Paso 8: Guardar**
1. Click **"OK"**
2. Te pedirá tu contraseña de Windows - ingrésala
3. Click **"OK"**

---

## ✅ VERIFICAR CONFIGURACIÓN

### **Probar ejecución manual:**
1. En Task Scheduler, busca tu tarea **"Respaldo Polanco Semanal"**
2. Click derecho → **"Run"**
3. Verifica que se ejecute correctamente

### **Verificar próxima ejecución:**
- En la columna **"Next Run Time"** debe mostrar el próximo domingo a las 11:00 PM

---

## 📊 MONITOREO

### **Ver historial de ejecuciones:**
1. Selecciona tu tarea en Task Scheduler
2. Click en pestaña **"History"** (abajo)
3. Verás logs de cada ejecución

### **Archivos generados:**
Cada domingo se crearán nuevos archivos en:
```
C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco\
```

Con formato:
- `students_2025-08-25_23-00.csv`
- `payments_2025-08-25_23-00.csv`
- `RESUMEN_2025-08-25_23-00.txt`
- etc.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **La tarea no se ejecuta:**
- Verifica que esté habilitada en Task Scheduler
- Revisa el historial para ver errores específicos
- Ejecuta manualmente para probar

### **Error "Access Denied":**
- Asegúrate de marcar "Run with highest privileges"
- Verifica permisos en la carpeta de respaldos

### **Error "Node.js not found":**
- El script `.bat` verificará automáticamente
- Instala Node.js si es necesario

### **Archivos no se generan:**
- Ejecuta `ejecutar-respaldo.bat` manualmente
- Revisa logs en consola para errores específicos

---

## 📞 SOPORTE

Si tienes problemas:
1. Ejecuta `ejecutar-respaldo.bat` manualmente primero
2. Revisa el historial en Task Scheduler
3. Verifica que Node.js esté instalado
4. Contacta al desarrollador si persisten los problemas

---

**Configurado:** 2025-08-18  
**Sistema:** Polanco  
**Frecuencia:** Semanal (Domingos 11:00 PM)  
**Autor:** Sistema Avanza

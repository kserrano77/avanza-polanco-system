# 🚀 Instrucciones de Deployment - Instituto Polanco

## 📋 Checklist Pre-Deployment

### ✅ Verificaciones Completadas
- [x] Sistema clonado con aislamiento absoluto
- [x] Credenciales Supabase configuradas (asqymroylemsrrmfwako)
- [x] Variables de entorno configuradas en .env
- [x] Branding actualizado a "Instituto Polanco"
- [x] Script SQL de base de datos creado
- [x] Validaciones de aislamiento implementadas
- [x] Test de separación automático creado

### 🔄 Pasos Pendientes para Deployment

## 1. 🗄️ Configuración de Base de Datos Supabase

### Paso 1.1: Acceder a Supabase
```
URL: https://supabase.com/dashboard/project/asqymroylemsrrmfwako
Proyecto: asqymroylemsrrmfwako
```

### Paso 1.2: Ejecutar Script SQL
1. Ir a **SQL Editor** en Supabase Dashboard
2. Abrir el archivo: `database_setup_polanco.sql`
3. Copiar todo el contenido del script
4. Pegar en el SQL Editor
5. Ejecutar el script completo
6. Verificar que todas las tablas se crearon correctamente

### Paso 1.3: Verificar Tablas Creadas
```sql
-- Ejecutar para verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Tablas esperadas:**
- profiles
- school_settings
- courses
- students
- schedules
- payments
- cash_cuts
- attendance
- document_templates
- issued_documents
- audit_log

## 2. 🔧 Configuración de Edge Functions (Opcional)

### Paso 2.1: Crear Edge Function para Email
```bash
# Si se requiere funcionalidad de email
supabase functions new send-email
```

### Paso 2.2: Configurar Variables de Entorno en Supabase
```
RESEND_API_KEY=tu_api_key_de_resend
SCHOOL_NAME=Instituto Polanco
```

## 3. 🏗️ Build y Preparación

### Paso 3.1: Instalar Dependencias
```bash
cd sistema-polanco
npm install
```

### Paso 3.2: Verificar Configuración
```bash
# Verificar que .env esté configurado correctamente
cat .env
```

### Paso 3.3: Test de Aislamiento Local
```bash
# Abrir en navegador
open test-polanco-isolation.html
```

### Paso 3.4: Build para Producción
```bash
npm run build
```

## 4. 🌐 Deployment a Netlify

### Paso 4.1: Crear Nuevo Site en Netlify
1. Ir a [Netlify Dashboard](https://app.netlify.com/)
2. Click en "Add new site" > "Deploy manually"
3. Arrastrar la carpeta `dist` generada

### Paso 4.2: Configurar Variables de Entorno en Netlify
```
Site Settings > Environment Variables > Add variable

VITE_SUPABASE_URL=https://asqymroylemsrrmfwako.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcXltcm95bGVtc3JybWZ3YWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTUzODgsImV4cCI6MjA2OTQzMTM4OH0.mdAX12fcUf2SWEvSd1PMA9Nrubl_qVS9j8QucaMqGfo
VITE_PROJECT_NAME=Polanco
VITE_SCHOOL_NAME=Instituto Polanco
VITE_SCHOOL_CODE=INSTITUTO_POLANCO
RESEND_API_KEY=tu_api_key_de_resend
```

### Paso 4.3: Configurar Build Settings
```
Build command: npm run build
Publish directory: dist
```

### Paso 4.4: Deploy Automático (Opcional)
Si quieres deployment automático:
1. Conectar repositorio GitHub
2. Configurar auto-deploy en push a main

## 5. 🌍 Configuración de Dominio Personalizado

### Paso 5.1: Configurar Dominio en Netlify
```
Site Settings > Domain management > Add custom domain
Dominio sugerido: institutopolanco.com o similar
```

### Paso 5.2: Configurar DNS
```
Tipo: CNAME
Nombre: www
Valor: tu-site-name.netlify.app

Tipo: A
Nombre: @
Valor: 75.2.60.5 (IP de Netlify)
```

### Paso 5.3: Habilitar SSL
- Netlify habilitará SSL automáticamente
- Verificar que el certificado esté activo

## 6. 🧪 Testing Post-Deployment

### Paso 6.1: Test de Aislamiento en Producción
```
URL: https://tu-dominio.com/test-polanco-isolation.html
```

### Paso 6.2: Verificaciones Funcionales
- [ ] Login funciona correctamente
- [ ] Registro de estudiantes
- [ ] Procesamiento de pagos
- [ ] Generación de reportes
- [ ] Responsive design en móviles

### Paso 6.3: Test de Separación de Datos
```javascript
// En consola del navegador del sitio en producción
console.log('URL Supabase:', window.location.origin);
// Debe mostrar únicamente el proyecto de Polanco
```

## 7. 👥 Configuración de Usuarios Iniciales

### Paso 7.1: Crear Usuario Administrador
1. Ir a Supabase Dashboard > Authentication
2. Crear nuevo usuario manualmente
3. Asignar role 'admin' en tabla profiles

### Paso 7.2: Configurar Datos Iniciales
```sql
-- Insertar configuración de escuela
INSERT INTO school_settings (
    school_name, 
    school_code, 
    address, 
    phone, 
    email
) VALUES (
    'Instituto Polanco',
    'INSTITUTO_POLANCO',
    'Dirección del Instituto Polanco',
    '+52 123 456 7890',
    'contacto@institutopolanco.edu.mx'
);
```

## 8. 📊 Monitoreo y Mantenimiento

### Paso 8.1: Configurar Alertas
- Monitoreo de uptime del sitio
- Alertas de errores en Supabase
- Backup automático de base de datos

### Paso 8.2: Documentar Credenciales
```
Proyecto Supabase: asqymroylemsrrmfwako
URL Producción: https://tu-dominio.com
Netlify Site ID: [anotar después del deployment]
```

## 🚨 Verificaciones de Seguridad Final

### ✅ Checklist de Aislamiento
- [ ] Sistema conectado ÚNICAMENTE a asqymroylemsrrmfwako
- [ ] NO hay conexión a gvrgepdjxzhgqkmtwcvs (Cd. Obregón)
- [ ] NO hay conexión a otros proyectos Supabase
- [ ] Test de aislamiento pasa todas las pruebas
- [ ] Datos completamente separados
- [ ] Configuración de escuela correcta (Instituto Polanco)

### ✅ Checklist Funcional
- [ ] Autenticación funciona
- [ ] CRUD de estudiantes operativo
- [ ] Sistema de pagos funcional
- [ ] Generación de reportes
- [ ] Responsive design
- [ ] Performance aceptable

## 📞 Contacto Post-Deployment

Una vez completado el deployment:
1. Documentar todas las URLs y credenciales
2. Crear manual de usuario para Instituto Polanco
3. Capacitar al personal en el uso del sistema
4. Establecer procedimientos de backup y mantenimiento

---

**🎯 OBJETIVO: Sistema Instituto Polanco completamente independiente y operativo**

**⚠️ CRÍTICO: Verificar aislamiento absoluto antes de usar en producción**

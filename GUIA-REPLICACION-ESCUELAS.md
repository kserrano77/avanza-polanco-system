# 🏫 GUÍA DE REPLICACIÓN - SISTEMA ESCOLAR AVANZA

## 📋 RESUMEN
Esta guía te permite replicar exactamente este sistema para múltiples escuelas con proyectos separados en Supabase y dominios independientes.

## 🎯 ARQUITECTURA MULTI-ESCUELA

### ✅ LO QUE TENDRÁS:
- **Escuela A:** Proyecto Supabase A + Dominio A + Sistema A
- **Escuela B:** Proyecto Supabase B + Dominio B + Sistema B  
- **Escuela C:** Proyecto Supabase C + Dominio C + Sistema C

### ✅ BENEFICIOS:
- 🔒 **Datos completamente separados** entre escuelas
- 🌐 **Dominios profesionales** independientes
- 👥 **Usuarios únicos** por escuela
- 📊 **Reportes independientes** por plantel

---

## 📦 PASO 1: PREPARAR PLANTILLA

### 🗂️ Archivos a Copiar:
```
📂 PLANTILLA-SISTEMA-ESCOLAR/
├── 📂 src/                    ← Todo el código frontend
├── 📂 public/                 ← Archivos públicos
├── 📄 package.json           ← Dependencias
├── 📄 vite.config.js         ← Configuración Vite
├── 📄 tailwind.config.js     ← Estilos
├── 📄 netlify.toml           ← Config Netlify
├── 📄 database_setup.sql     ← Script base de datos
├── 📄 add-roles-system.sql   ← Sistema de roles
├── 📄 add-student-fields.sql ← Campos adicionales
├── 📄 supabase-edge-function.js     ← Función emails
├── 📄 user-management-edge-function.js ← Gestión usuarios
├── 📄 respaldo-automatico.cjs       ← Sistema respaldos
├── 📄 hacer-respaldo.bat           ← Script respaldos
└── 📄 .env.template               ← Plantilla variables
```

### 🚫 Archivos a NO Copiar:
- `.env` (contiene credenciales específicas)
- `node_modules/` (se regenera con npm install)
- `dist/` (se regenera con npm run build)
- `respaldos/` (específico de cada escuela)

---

## 🔧 PASO 2: CONFIGURAR NUEVA ESCUELA

### 🆕 Para Cada Nueva Escuela:

#### A. CREAR PROYECTO SUPABASE
1. **Ve a:** [supabase.com](https://supabase.com)
2. **Crea** nuevo proyecto
3. **Nombre:** "Sistema Escuela [Nombre]"
4. **Región:** Más cercana a la escuela
5. **Guarda:** URL y claves del proyecto

#### B. CONFIGURAR BASE DE DATOS
1. **Ejecuta** `database_setup.sql` en SQL Editor
2. **Ejecuta** `add-roles-system.sql` 
3. **Ejecuta** `add-student-fields.sql`
4. **Configura** políticas RLS
5. **Crea** bucket de storage: `schoolassets`

#### C. CONFIGURAR EDGE FUNCTIONS
1. **Crea** función: `send-payment-receipt`
2. **Sube** código de `supabase-edge-function.js`
3. **Crea** función: `manage-users`
4. **Sube** código de `user-management-edge-function.js`
5. **Configura** secretos: `PROJECT_URL`, `SERVICE_ROLE_KEY`

#### D. CONFIGURAR RESEND
1. **Verifica** dominio de la escuela en Resend
2. **Configura** DNS records
3. **Obtén** API key específica

#### E. CONFIGURAR VARIABLES (.env)
```env
# Configuración Escuela: [NOMBRE_ESCUELA]
VITE_SUPABASE_URL=https://[nuevo-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[nueva-clave-anonima]
RESEND_API_KEY=[nueva-clave-resend]

# Información de la Escuela
VITE_SCHOOL_NAME=[Nombre de la Escuela]
VITE_SCHOOL_CODE=[CODIGO_ESCUELA]
VITE_BRANCH_NAME=[Nombre Sucursal]
```

#### F. DESPLEGAR A NETLIFY
1. **Ejecuta:** `npm install`
2. **Ejecuta:** `npm run build`
3. **Sube** carpeta `dist` a Netlify
4. **Configura** dominio personalizado
5. **Actualiza** DNS en proveedor de dominio

---

## 🎯 PASO 3: AUTOMATIZACIÓN

### 📋 Checklist por Escuela:
- [ ] ✅ Proyecto Supabase creado
- [ ] ✅ Base de datos configurada
- [ ] ✅ Edge Functions desplegadas
- [ ] ✅ Dominio Resend verificado
- [ ] ✅ Variables .env configuradas
- [ ] ✅ Sistema desplegado en Netlify
- [ ] ✅ Dominio personalizado configurado
- [ ] ✅ Primer usuario admin creado
- [ ] ✅ Respaldos configurados
- [ ] ✅ Capacitación al personal

### ⏱️ Tiempo Estimado por Escuela:
- **Configuración técnica:** 2-3 horas
- **Capacitación personal:** 1-2 horas
- **Total:** 4-5 horas por escuela

---

## 💰 COSTOS POR ESCUELA

### 🆓 Servicios Gratuitos:
- **Supabase:** Plan gratuito (500MB DB, 50MB storage)
- **Netlify:** Plan gratuito (100GB bandwidth)
- **Resend:** Plan gratuito (3,000 emails/mes)

### 💳 Costos Opcionales:
- **Dominio personalizado:** $10-15/año
- **Planes premium:** Solo si necesario por volumen

### 📊 ROI Estimado:
- **Inversión inicial:** $15/año por escuela
- **Ahorro operativo:** $200-500/mes por escuela
- **ROI:** 1,200-4,000% anual

---

## 🔄 MANTENIMIENTO MULTI-ESCUELA

### 📱 Gestión Centralizada:
- **Dashboard Supabase:** Monitor todas las escuelas
- **Netlify Dashboard:** Estado de todos los sitios
- **Resend Dashboard:** Estadísticas de emails

### 🔄 Actualizaciones:
1. **Desarrolla** mejoras en escuela principal
2. **Prueba** completamente
3. **Replica** cambios a otras escuelas
4. **Despliega** de forma escalonada

### 📊 Monitoreo:
- **Uso de base de datos** por escuela
- **Tráfico web** por sitio
- **Emails enviados** por plantel
- **Respaldos** automáticos semanales

---

## 🎉 BENEFICIOS DEL SISTEMA MULTI-ESCUELA

### 🏢 Para el Negocio:
- **Escalabilidad** ilimitada
- **Ingresos recurrentes** por escuela
- **Marca profesional** consistente
- **Soporte centralizado**

### 🏫 Para las Escuelas:
- **Sistema profesional** a bajo costo
- **Datos seguros** y privados
- **Acceso 24/7** desde cualquier lugar
- **Respaldos automáticos**

### 👨‍💻 Para Ti:
- **Código reutilizable** 100%
- **Configuración estandarizada**
- **Mantenimiento eficiente**
- **Crecimiento escalable**

---

## 📞 SOPORTE Y CONTACTO

**Para implementar en nueva escuela:**
1. Sigue esta guía paso a paso
2. Usa los archivos de plantilla
3. Configura variables específicas
4. Despliega y prueba
5. Capacita al personal

**¡Tu sistema está listo para conquistar múltiples escuelas! 🚀**

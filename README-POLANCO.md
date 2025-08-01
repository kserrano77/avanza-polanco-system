# 🏫 Sistema Educativo - Instituto Polanco

## 📋 Descripción del Proyecto

Este es un sistema de gestión educativa **completamente independiente** y **aislado** para el Instituto Polanco. Ha sido clonado del sistema original con **aislamiento absoluto** para garantizar la separación total de datos.

## 🔒 Configuración de Aislamiento

### Base de Datos Supabase
- **Proyecto ID**: `asqymroylemsrrmfwako`
- **URL**: `https://asqymroylemsrrmfwako.supabase.co`
- **Estado**: Completamente independiente y aislado

### Validaciones de Seguridad
- ✅ Configuración forzada en `src/config/supabase-config.js`
- ✅ Validador de aislamiento en `src/utils/isolationValidator.js`
- ✅ Test automático de separación en `test-polanco-isolation.html`

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
```bash
# Node.js 18+ requerido
node --version
npm --version
```

### 2. Instalación de Dependencias
```bash
cd sistema-polanco
npm install
```

### 3. Configuración de Variables de Entorno
El archivo `.env` ya está configurado con las credenciales correctas:
```env
VITE_SUPABASE_URL=https://asqymroylemsrrmfwako.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_PROJECT_NAME=Polanco
VITE_SCHOOL_NAME=Instituto Polanco
VITE_SCHOOL_CODE=INSTITUTO_POLANCO
```

### 4. Configuración de Base de Datos
```bash
# Ejecutar el script SQL en Supabase
# Archivo: database_setup_polanco.sql
```

### 5. Ejecutar en Desarrollo
```bash
npm run dev
```

### 6. Construir para Producción
```bash
npm run build
```

## 🧪 Verificación de Aislamiento

### Test Automático
Abrir en navegador: `test-polanco-isolation.html`

Este test verifica:
- ✅ Conexión únicamente al proyecto correcto
- ✅ No conexión a proyectos prohibidos
- ✅ Datos independientes y aislados
- ✅ Configuración correcta de escuela

### Validación Manual
```javascript
// En consola del navegador
import { validateIsolation } from './src/utils/isolationValidator.js';
const results = await validateIsolation();
console.log(results);
```

## 📊 Funcionalidades del Sistema

### Gestión de Estudiantes
- ✅ Registro y edición de estudiantes
- ✅ Historial académico
- ✅ Control de asistencias
- ✅ Estados: activo, inactivo, graduado, suspendido

### Gestión de Pagos
- ✅ Registro de pagos (efectivo, tarjeta, transferencia)
- ✅ Generación automática de recibos
- ✅ Control de deudas
- ✅ Cortes de caja automatizados

### Gestión de Cursos
- ✅ Catálogo de cursos disponibles
- ✅ Horarios y programación
- ✅ Asignación de instructores
- ✅ Control de precios

### Reportes y Documentos
- ✅ Reportes de pagos
- ✅ Listas de asistencia
- ✅ Certificados de estudios
- ✅ Documentos en PDF

### Sistema de Usuarios
- ✅ Roles: Administrador y Recepcionista
- ✅ Autenticación segura
- ✅ Permisos diferenciados

## 🔧 Arquitectura Técnica

### Frontend
- **React 18** con Vite
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **Responsive Design** para móviles

### Backend
- **Supabase** como BaaS
- **PostgreSQL** como base de datos
- **Row Level Security (RLS)** habilitado
- **Edge Functions** para lógica del servidor

### Seguridad
- **Autenticación JWT** con Supabase Auth
- **Políticas RLS** para control de acceso
- **Validación de aislamiento** automática
- **Logs de auditoría** completos

## 📁 Estructura del Proyecto

```
sistema-polanco/
├── src/
│   ├── components/          # Componentes React
│   ├── contexts/           # Contextos de React
│   ├── lib/               # Librerías y utilidades
│   ├── config/            # Configuraciones
│   ├── utils/             # Utilidades y validadores
│   └── main.jsx           # Punto de entrada
├── public/                # Archivos estáticos
├── database_setup_polanco.sql  # Script de BD
├── test-polanco-isolation.html # Test de aislamiento
├── .env                   # Variables de entorno
├── package.json           # Dependencias
└── README-POLANCO.md      # Esta documentación
```

## 🛡️ Garantías de Aislamiento

### ✅ Separación Completa
- **Base de datos independiente**: Proyecto Supabase completamente separado
- **Credenciales únicas**: API keys y URLs específicas para Polanco
- **Validación automática**: Sistema que verifica la conexión correcta
- **Test de separación**: Pruebas automatizadas de aislamiento

### ✅ Sin Contaminación Cruzada
- **Datos aislados**: Estudiantes, pagos y cursos completamente separados
- **Configuración independiente**: Nombre de escuela y códigos únicos
- **Logs separados**: Auditoría independiente para cada sistema

### ✅ Verificación Continua
- **Validador en tiempo real**: Verifica conexión en cada carga
- **Alertas de seguridad**: Notifica si detecta conexiones incorrectas
- **Reportes de aislamiento**: Genera reportes detallados de separación

## 🚀 Deployment

### Netlify (Recomendado)
```bash
# 1. Build del proyecto
npm run build

# 2. Deploy a Netlify
# Subir carpeta 'dist' a Netlify

# 3. Configurar variables de entorno en Netlify
VITE_SUPABASE_URL=https://asqymroylemsrrmfwako.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Dominio Personalizado
- Configurar DNS para apuntar a Netlify
- Habilitar SSL automático
- Configurar redirects si es necesario

## 📞 Soporte y Contacto

### Instituto Polanco
- **Nombre**: Instituto Polanco
- **Código**: INSTITUTO_POLANCO
- **Sistema**: Completamente independiente

### Desarrollador
- **Proyecto**: Sistema Educativo Clonado
- **Versión**: 1.0.0
- **Fecha**: Enero 2025

## 🔄 Actualizaciones

### Historial de Versiones
- **v1.0.0** - Sistema clonado con aislamiento absoluto
- Todas las funcionalidades del sistema original
- Configuración independiente para Instituto Polanco
- Validaciones de aislamiento implementadas

### Próximas Mejoras
- [ ] Integración con sistema de email personalizado
- [ ] Dashboard de métricas avanzadas
- [ ] App móvil nativa
- [ ] Integración con sistemas de pago online

## ⚠️ Notas Importantes

1. **NUNCA** modificar las credenciales de Supabase sin actualizar todos los archivos de configuración
2. **SIEMPRE** ejecutar el test de aislamiento después de cualquier cambio
3. **VERIFICAR** que el sistema esté conectado únicamente al proyecto correcto
4. **MANTENER** la separación absoluta con otros sistemas educativos

---

**✅ Sistema Instituto Polanco - Completamente Aislado y Funcional**

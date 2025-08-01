@echo off
echo.
echo ===============================================
echo    CREAR PLANTILLA PARA NUEVA ESCUELA
echo ===============================================
echo.

set FECHA=%DATE:/=-%
set PLANTILLA_DIR=%USERPROFILE%\Desktop\PLANTILLA-SISTEMA-ESCOLAR-%FECHA%

echo 📁 Creando directorio de plantilla...
mkdir "%PLANTILLA_DIR%"

echo 📂 Copiando archivos del proyecto...

REM Copiar carpetas principales
xcopy /E /I /Y "src" "%PLANTILLA_DIR%\src"
xcopy /E /I /Y "public" "%PLANTILLA_DIR%\public"

REM Copiar archivos de configuración
copy "package.json" "%PLANTILLA_DIR%\"
copy "vite.config.js" "%PLANTILLA_DIR%\"
copy "tailwind.config.js" "%PLANTILLA_DIR%\"
copy "postcss.config.js" "%PLANTILLA_DIR%\"
copy "netlify.toml" "%PLANTILLA_DIR%\"
copy "index.html" "%PLANTILLA_DIR%\"

REM Copiar scripts SQL
copy "database_setup.sql" "%PLANTILLA_DIR%\"
copy "add-roles-system.sql" "%PLANTILLA_DIR%\"
copy "add-student-fields.sql" "%PLANTILLA_DIR%\"
copy "fix-student-status.sql" "%PLANTILLA_DIR%\"

REM Copiar Edge Functions
copy "supabase-edge-function.js" "%PLANTILLA_DIR%\"
copy "user-management-edge-function.js" "%PLANTILLA_DIR%\"

REM Copiar sistema de respaldos
copy "respaldo-automatico.cjs" "%PLANTILLA_DIR%\"
copy "hacer-respaldo.bat" "%PLANTILLA_DIR%\"

REM Copiar plantilla de configuración
copy ".env.template" "%PLANTILLA_DIR%\"

REM Copiar guía de replicación
copy "GUIA-REPLICACION-ESCUELAS.md" "%PLANTILLA_DIR%\"

REM Crear archivo README para la nueva escuela
echo # 🏫 SISTEMA ESCOLAR AVANZA - PLANTILLA > "%PLANTILLA_DIR%\README.md"
echo. >> "%PLANTILLA_DIR%\README.md"
echo ## 🚀 INSTALACIÓN RÁPIDA >> "%PLANTILLA_DIR%\README.md"
echo. >> "%PLANTILLA_DIR%\README.md"
echo 1. Copia .env.template como .env >> "%PLANTILLA_DIR%\README.md"
echo 2. Completa las variables en .env >> "%PLANTILLA_DIR%\README.md"
echo 3. Ejecuta: npm install >> "%PLANTILLA_DIR%\README.md"
echo 4. Configura Supabase con los archivos SQL >> "%PLANTILLA_DIR%\README.md"
echo 5. Ejecuta: npm run build >> "%PLANTILLA_DIR%\README.md"
echo 6. Sube carpeta dist a Netlify >> "%PLANTILLA_DIR%\README.md"
echo. >> "%PLANTILLA_DIR%\README.md"
echo ## 📖 GUÍA COMPLETA >> "%PLANTILLA_DIR%\README.md"
echo Lee GUIA-REPLICACION-ESCUELAS.md para instrucciones detalladas >> "%PLANTILLA_DIR%\README.md"

echo.
echo ✅ ¡Plantilla creada exitosamente!
echo 📁 Ubicación: %PLANTILLA_DIR%
echo.
echo 🎯 PRÓXIMOS PASOS:
echo 1. Comprime la carpeta PLANTILLA-SISTEMA-ESCOLAR
echo 2. Guárdala en tu nube (Google Drive, OneDrive, etc.)
echo 3. Para nueva escuela: descarga, descomprime y sigue la guía
echo.
pause

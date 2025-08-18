@echo off
REM ========================================
REM SCRIPT DE EJECUCION - RESPALDO POLANCO
REM Se ejecuta automáticamente cada domingo
REM ========================================

echo.
echo ============================================================
echo 🚀 INICIANDO RESPALDO AUTOMATICO POLANCO
echo ============================================================
echo 📅 Fecha y hora: %date% %time%
echo.

REM Cambiar al directorio del script
cd /d "C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco"

REM Verificar que Node.js esté disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado o no está en el PATH
    echo    Instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Ejecutar el respaldo
echo 📊 Ejecutando respaldo de datos...
node respaldo-automatico-polanco.js

REM Verificar resultado
if errorlevel 1 (
    echo.
    echo ❌ ERROR: El respaldo falló
    echo    Revisa los logs arriba para más detalles
    echo.
) else (
    echo.
    echo ✅ RESPALDO COMPLETADO EXITOSAMENTE
    echo    Los archivos se guardaron en:
    echo    %cd%
    echo.
)

REM Mostrar archivos generados recientemente
echo 📁 Archivos de respaldo más recientes:
dir /od /b *.csv 2>nul | findstr /r ".*" >nul && (
    dir /od /b *.csv | tail -5
) || (
    echo    No se encontraron archivos CSV
)

echo.
echo ============================================================
echo 🏁 PROCESO COMPLETADO
echo ============================================================

REM Solo pausar si se ejecuta manualmente (no desde Task Scheduler)
if /i "%1" neq "auto" (
    echo.
    echo Presiona cualquier tecla para cerrar...
    pause >nul
)

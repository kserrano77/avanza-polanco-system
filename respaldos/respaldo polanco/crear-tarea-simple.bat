@echo off
echo ========================================
echo CREANDO TAREA DE RESPALDO AUTOMATICO
echo ========================================

echo Creando tarea "Respaldo Polanco Semanal"...

schtasks /create ^
/tn "Respaldo Polanco Semanal" ^
/tr "C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco\ejecutar-respaldo.bat auto" ^
/sc weekly ^
/d SUN ^
/st 23:00 ^
/rl highest ^
/f

if %errorlevel% == 0 (
    echo.
    echo ✅ TAREA CREADA EXITOSAMENTE
    echo    Nombre: Respaldo Polanco Semanal
    echo    Horario: Domingos 11:00 PM
    echo    Privilegios: Elevados
    echo.
    echo Verificando tarea creada...
    schtasks /query /tn "Respaldo Polanco Semanal"
) else (
    echo.
    echo ❌ ERROR AL CREAR LA TAREA
    echo    Codigo de error: %errorlevel%
    echo.
)

echo.
echo Presiona cualquier tecla para cerrar...
pause >nul

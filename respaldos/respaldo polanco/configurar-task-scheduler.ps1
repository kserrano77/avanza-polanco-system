# ========================================
# CONFIGURACIÓN AUTOMÁTICA DE TASK SCHEDULER
# Sistema: Polanco - Respaldo Semanal
# ========================================

Write-Host "🚀 CONFIGURANDO TASK SCHEDULER AUTOMÁTICAMENTE..." -ForegroundColor Green
Write-Host "=" * 60

# Parámetros de la tarea
$TaskName = "Respaldo Polanco Semanal"
$TaskDescription = "Respaldo automático de datos Supabase - Sistema Polanco - Cada domingo 11:00 PM"
$ScriptPath = "C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco\ejecutar-respaldo.bat"
$WorkingDirectory = "C:\Users\Kevin Serrano\OneDrive\polanco-github\respaldos\respaldo polanco"

Write-Host "📋 Configuración de la tarea:" -ForegroundColor Yellow
Write-Host "   Nombre: $TaskName"
Write-Host "   Descripción: $TaskDescription"
Write-Host "   Script: $ScriptPath"
Write-Host "   Directorio: $WorkingDirectory"
Write-Host "   Horario: Domingos a las 11:00 PM"
Write-Host ""

try {
    # Verificar si la tarea ya existe
    $ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($ExistingTask) {
        Write-Host "⚠️  La tarea '$TaskName' ya existe. Eliminando..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "✅ Tarea anterior eliminada" -ForegroundColor Green
    }

    # Verificar que el archivo .bat existe
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "❌ ERROR: No se encuentra el archivo:" -ForegroundColor Red
        Write-Host "   $ScriptPath" -ForegroundColor Red
        Write-Host "   Verifica que el archivo existe" -ForegroundColor Red
        exit 1
    }

    Write-Host "📅 Creando trigger (Domingos 11:00 PM)..." -ForegroundColor Cyan
    # Crear trigger para ejecutar cada domingo a las 11:00 PM
    $Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "23:00"

    Write-Host "⚙️  Creando action (ejecutar script)..." -ForegroundColor Cyan
    # Crear action para ejecutar el script
    $Action = New-ScheduledTaskAction -Execute $ScriptPath -Argument "auto" -WorkingDirectory $WorkingDirectory

    Write-Host "🔧 Configurando settings..." -ForegroundColor Cyan
    # Configurar settings de la tarea
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false

    Write-Host "👤 Configurando principal (usuario actual)..." -ForegroundColor Cyan
    # Configurar para ejecutar con el usuario actual, con privilegios elevados
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

    Write-Host "📝 Registrando tarea en Task Scheduler..." -ForegroundColor Cyan
    # Registrar la tarea
    Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Trigger $Trigger -Action $Action -Settings $Settings -Principal $Principal

    Write-Host ""
    Write-Host "🎉 ¡TAREA CONFIGURADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "=" * 60
    Write-Host "✅ Nombre: $TaskName" -ForegroundColor Green
    Write-Host "✅ Horario: Cada domingo a las 11:00 PM" -ForegroundColor Green
    Write-Host "✅ Script: ejecutar-respaldo.bat" -ForegroundColor Green
    Write-Host "✅ Privilegios: Elevados" -ForegroundColor Green
    Write-Host ""

    # Mostrar información de la próxima ejecución
    $Task = Get-ScheduledTask -TaskName $TaskName
    $TaskInfo = Get-ScheduledTaskInfo -TaskName $TaskName
    
    Write-Host "📊 INFORMACIÓN DE LA TAREA:" -ForegroundColor Yellow
    Write-Host "   Estado: $($Task.State)" -ForegroundColor White
    Write-Host "   Próxima ejecución: $($TaskInfo.NextRunTime)" -ForegroundColor White
    Write-Host "   Última ejecución: $($TaskInfo.LastRunTime)" -ForegroundColor White
    Write-Host ""

    Write-Host "🧪 ¿QUIERES PROBAR LA TAREA AHORA?" -ForegroundColor Magenta
    $TestNow = Read-Host "Escribe 'si' para ejecutar una prueba inmediata"
    
    if ($TestNow -eq "si" -or $TestNow -eq "sí" -or $TestNow -eq "s") {
        Write-Host ""
        Write-Host "🚀 EJECUTANDO PRUEBA..." -ForegroundColor Cyan
        Start-ScheduledTask -TaskName $TaskName
        Write-Host "✅ Tarea ejecutada. Revisa la consola para ver los resultados." -ForegroundColor Green
        
        # Esperar un poco y mostrar el estado
        Start-Sleep -Seconds 3
        $TaskInfo = Get-ScheduledTaskInfo -TaskName $TaskName
        Write-Host "   Estado actual: $($TaskInfo.LastTaskResult)" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "1. La tarea se ejecutará automáticamente cada domingo a las 11:00 PM"
    Write-Host "2. Puedes ver el historial en Task Scheduler (taskschd.msc)"
    Write-Host "3. Los archivos de respaldo se guardarán en:"
    Write-Host "   $WorkingDirectory"
    Write-Host ""
    Write-Host "🎯 ¡RESPALDO AUTOMÁTICO CONFIGURADO!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "❌ ERROR AL CONFIGURAR LA TAREA:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 SOLUCIONES:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta este script como Administrador"
    Write-Host "2. Verifica que el archivo .bat existe"
    Write-Host "3. Configura manualmente usando taskschd.msc"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

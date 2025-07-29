# Script para limpiar puertos ocupados
Write-Host "🧹 Limpiando puertos ocupados..." -ForegroundColor Yellow

# Terminar procesos Node.js
Write-Host "Terminando procesos Node.js..." -ForegroundColor Cyan
taskkill /f /im node.exe 2>$null

# Esperar un momento
Start-Sleep -Seconds 2

# Verificar puertos
Write-Host "Verificando puertos..." -ForegroundColor Cyan
$ports = @(3000, 3001, 3002, 3003)
foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port "
    if ($connections) {
        Write-Host "Puerto $port está ocupado" -ForegroundColor Red
    } else {
        Write-Host "Puerto $port está libre" -ForegroundColor Green
    }
}

Write-Host "✅ Limpieza completada" -ForegroundColor Green 
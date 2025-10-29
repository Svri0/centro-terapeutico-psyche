# Script de Verificación - Puerto 3002 Obligatorio
# Verifica que el backend esté corriendo correctamente en puerto 3002

Write-Host "🔍 VERIFICANDO PUERTO 3002 OBLIGATORIO..." -ForegroundColor Cyan
Write-Host ""

# Verificar si el puerto 3002 está en uso
$puerto3002 = netstat -ano | Select-String ":3002"
if ($puerto3002) {
    Write-Host "✅ Puerto 3002 está en uso" -ForegroundColor Green
    
    # Verificar si es nuestro backend
    $response = try {
        Invoke-RestMethod -Uri "http://localhost:3002/salud" -Method Get -TimeoutSec 5
    } catch {
        $null
    }
    
    if ($response -and $response.success) {
        Write-Host "✅ Backend funcionando correctamente en puerto 3002" -ForegroundColor Green
        Write-Host "🌐 Dashboard: http://localhost:3002/dashboard" -ForegroundColor Cyan
        Write-Host "📊 API: http://localhost:3002/api/v1" -ForegroundColor Cyan
        Write-Host "💚 Estado: $($response.data.estado)" -ForegroundColor Green
        Write-Host "⏰ Iniciado: $($response.data.timestamp)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Puerto 3002 ocupado pero NO es nuestro backend" -ForegroundColor Red
        Write-Host "🛠️  Ejecuta: .\scripts\clean-ports.ps1" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Puerto 3002 NO está en uso" -ForegroundColor Red
    Write-Host "🚀 Ejecuta: cd backend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host "  Verificar puerto: netstat -ano | findstr :3002" -ForegroundColor White
Write-Host "  Iniciar backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  Limpiar puertos: .\scripts\clean-ports.ps1" -ForegroundColor White
Write-Host "  Dashboard: http://localhost:3002/dashboard" -ForegroundColor White

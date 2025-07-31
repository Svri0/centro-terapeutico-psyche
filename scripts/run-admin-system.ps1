# Script para ejecutar el sistema completo de administración
# Centro Terapéutico Psyche

Write-Host "🎯 Iniciando Sistema de Administración - Centro Terapéutico Psyche" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# Función para verificar si un puerto está en uso
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Función para matar procesos en puertos específicos
function Kill-Port {
    param($Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    foreach ($process in $processes) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "Proceso en puerto $Port terminado" -ForegroundColor Yellow
    }
}

# Verificar y limpiar puertos
Write-Host "🔧 Limpiando puertos..." -ForegroundColor Yellow
$ports = @(3002, 5173, 5432)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "Puerto $port está en uso. Terminando procesos..." -ForegroundColor Yellow
        Kill-Port -Port $port
    }
}

# Verificar si Docker está corriendo
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está corriendo. Iniciando Docker..." -ForegroundColor Red
    Start-Process "Docker Desktop" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 10
}

# Iniciar base de datos
Write-Host "🗄️ Iniciando base de datos PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 5

# Configurar backend
Write-Host "🔧 Configurando backend..." -ForegroundColor Yellow
Set-Location backend

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
    npm install
}

# Ejecutar setup del admin
Write-Host "⚙️ Ejecutando configuración del administrador..." -ForegroundColor Yellow
npm run setup:admin

# Iniciar backend en segundo plano
Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 10

# Configurar frontend
Write-Host "🎨 Configurando frontend..." -ForegroundColor Yellow
Set-Location ../frontend

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
}

# Iniciar frontend en segundo plano
Write-Host "🚀 Iniciando servidor frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

# Esperar un poco para que el frontend inicie
Start-Sleep -Seconds 10

# Mostrar información final
Write-Host ""
Write-Host "🎉 ¡Sistema iniciado exitosamente!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "📱 Panel de Administrador: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 API Backend: http://localhost:3002" -ForegroundColor White
Write-Host "🗄️ Base de Datos: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales de Administrador:" -ForegroundColor Yellow
Write-Host "   Email: admin@terapia.cl" -ForegroundColor White
Write-Host "   Contraseña: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   • Ver logs del backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "   • Ver logs del frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "   • Detener sistema: docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ¡Abre http://localhost:5173 en tu navegador!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan

# Abrir el navegador automáticamente
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "✅ Sistema iniciado. Presiona cualquier tecla para salir..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
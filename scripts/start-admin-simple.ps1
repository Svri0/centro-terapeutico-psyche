# Script simple para iniciar el sistema de administración
# Centro Terapéutico Psyche

Write-Host "🎯 Iniciando Sistema de Administración" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. Iniciar base de datos
Write-Host "🗄️ Iniciando PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 5

# 2. Configurar backend
Write-Host "🔧 Configurando backend..." -ForegroundColor Yellow
Set-Location backend

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Configurar admin
Write-Host "⚙️ Configurando administrador..." -ForegroundColor Yellow
npm run setup:admin

# 3. Iniciar backend
Write-Host "🚀 Iniciando backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# 4. Configurar frontend
Write-Host "🎨 Configurando frontend..." -ForegroundColor Yellow
Set-Location ../frontend

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# 5. Iniciar frontend
Write-Host "🚀 Iniciando frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# 6. Mostrar información
Write-Host ""
Write-Host "🎉 ¡Sistema iniciado!" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green
Write-Host "📱 Panel: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 API: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales:" -ForegroundColor Yellow
Write-Host "   Email: admin@terapia.cl" -ForegroundColor White
Write-Host "   Contraseña: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Esperando 5 segundos para abrir el navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Abrir navegador
Start-Process "http://localhost:5173"

Write-Host "✅ ¡Listo! El navegador se abrirá automáticamente." -ForegroundColor Green 
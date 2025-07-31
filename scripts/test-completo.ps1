# Script para probar la funcionalidad completa
Write-Host "🧪 Ejecutando pruebas completas..." -ForegroundColor Cyan

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Navegar al directorio backend
Set-Location backend

# Verificar si existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado, copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
}

# Cargar variables de entorno
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

Write-Host ""
Write-Host "🔍 Paso 1: Verificando psicólogo..." -ForegroundColor Yellow
node ../scripts/debug-psicologo.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al verificar psicólogo" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Paso 2: Probando creación de paciente..." -ForegroundColor Yellow
node ../scripts/test-crear-paciente.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear paciente de prueba" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Todas las pruebas completadas exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Ahora puedes:" -ForegroundColor Cyan
Write-Host "   1. Iniciar el backend: npm run dev" -ForegroundColor White
Write-Host "   2. Iniciar el frontend: cd ../frontend && npm run dev" -ForegroundColor White
Write-Host "   3. Probar la creación de pacientes desde el frontend" -ForegroundColor White
Write-Host ""

# Volver al directorio raíz
Set-Location .. 
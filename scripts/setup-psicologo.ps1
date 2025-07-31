# Script para crear un psicólogo de prueba
Write-Host "🎯 Configurando psicólogo de prueba..." -ForegroundColor Cyan

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

# Ejecutar migraciones
Write-Host "📦 Ejecutando migraciones..." -ForegroundColor Yellow
npm run db:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar migraciones" -ForegroundColor Red
    exit 1
}

# Ejecutar seeders
Write-Host "🌱 Ejecutando seeders..." -ForegroundColor Yellow
npm run db:seed:all

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar seeders" -ForegroundColor Red
    exit 1
}

# Crear psicólogo de prueba
Write-Host "👤 Creando psicólogo de prueba..." -ForegroundColor Yellow
node ../scripts/crear-psicologo.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear psicólogo" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Credenciales del psicólogo:" -ForegroundColor Cyan
Write-Host "   Email: psicologo@terapia.cl" -ForegroundColor White
Write-Host "   Contraseña: Psicologo123!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ahora puedes:" -ForegroundColor Cyan
Write-Host "   1. Iniciar el backend: npm run dev" -ForegroundColor White
Write-Host "   2. Iniciar el frontend: cd ../frontend && npm run dev" -ForegroundColor White
Write-Host "   3. Iniciar sesión con las credenciales del psicólogo" -ForegroundColor White
Write-Host "   4. Ir a la pestaña 'Gestión de Pacientes' para crear pacientes" -ForegroundColor White
Write-Host ""

# Volver al directorio raíz
Set-Location .. 
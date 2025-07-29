# Script para configurar el entorno de desarrollo
# Centro Terapéutico Psyche

Write-Host "🚀 Configurando entorno de desarrollo..." -ForegroundColor Green

# Verificar si Docker está instalado
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está disponible
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose no está disponible." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker está disponible" -ForegroundColor Green

# Crear archivo .env si no existe
if (!(Test-Path "backend\.env")) {
    Write-Host "📝 Creando archivo .env para desarrollo..." -ForegroundColor Yellow
    Copy-Item "env.example" "backend\.env"
}

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Instalar dependencias del servicio ML
Write-Host "📦 Instalando dependencias del servicio ML..." -ForegroundColor Yellow
Set-Location ml-service
npm install
Set-Location ..

# Instalar dependencias compartidas
Write-Host "📦 Instalando dependencias compartidas..." -ForegroundColor Yellow
Set-Location shared
npm install
Set-Location ..

# Preguntar si instalar extensiones de VS Code/Cursor
Write-Host ""
$installExtensions = Read-Host "¿Deseas instalar las extensiones de VS Code/Cursor automáticamente? (s/n)"
if ($installExtensions -eq "s" -or $installExtensions -eq "S" -or $installExtensions -eq "y" -or $installExtensions -eq "Y") {
    Write-Host "🔌 Instalando extensiones..." -ForegroundColor Yellow
    & .\scripts\install-extensions.ps1
}

# Levantar servicios de base de datos
Write-Host "🐘 Iniciando servicios de base de datos..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Esperar a que PostgreSQL esté listo
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Ejecutar migraciones
Write-Host "🗃️ Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
Set-Location backend
npm run db:migrate
npm run db:seed
Set-Location ..

Write-Host "✅ ¡Entorno de desarrollo configurado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "  npm run dev                   # Iniciar desarrollo completo"
Write-Host "  docker-compose up -d          # Iniciar todos los servicios"
Write-Host "  docker-compose down           # Detener todos los servicios"
Write-Host "  docker-compose logs -f        # Ver logs en tiempo real"
Write-Host "  npm run lint                  # Verificar calidad de código"
Write-Host "  npm run format                # Formatear código"
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend API: http://localhost:3001"
Write-Host "  ML Service: http://localhost:3003"
Write-Host "  pgAdmin: http://localhost:5050"
Write-Host ""
Write-Host "🔑 Credenciales pgAdmin:" -ForegroundColor Cyan
Write-Host "  Email: admin@psyche.cl"
Write-Host "  Password: admin123"
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "  docs/development/DEVELOPMENT_SETUP.md    # Guía completa"
Write-Host "  docs/development/SETUP_EXTENSIONS.md     # Configuración de extensiones"
Write-Host ""
if ($installExtensions -ne "s" -and $installExtensions -ne "S" -and $installExtensions -ne "y" -and $installExtensions -ne "Y") {
    Write-Host "💡 Para instalar extensiones más tarde:" -ForegroundColor Yellow
    Write-Host "  .\scripts\install-extensions.ps1"
    Write-Host ""
} 
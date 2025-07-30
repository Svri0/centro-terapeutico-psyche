# Script para configurar el archivo .env del backend
# Centro Terapéutico Psyche

Write-Host "🔧 Configurando archivo .env para el backend..." -ForegroundColor Green
Write-Host ""

# Verificar si existe el archivo .env
if (Test-Path ".env") {
    Write-Host "⚠️  El archivo .env ya existe. ¿Quieres sobrescribirlo? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Configuración cancelada." -ForegroundColor Red
        exit 1
    }
}

# Solicitar credenciales de PostgreSQL
Write-Host "📋 Configuración de PostgreSQL:" -ForegroundColor Cyan
Write-Host ""

$dbHost = Read-Host "Host de PostgreSQL (default: localhost)"
if ([string]::IsNullOrEmpty($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Puerto de PostgreSQL (default: 5432)"
if ([string]::IsNullOrEmpty($dbPort)) { $dbPort = "5432" }

$dbUser = Read-Host "Usuario de PostgreSQL (default: postgres)"
if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Contraseña de PostgreSQL" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

$dbName = Read-Host "Nombre de la base de datos (default: psyche_db)"
if ([string]::IsNullOrEmpty($dbName)) { $dbName = "psyche_db" }

# Generar JWT secret
$jwtSecret = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Crear contenido del archivo .env
$envContent = @"
# Configuración del entorno
NODE_ENV=development

# Configuración de la base de datos PostgreSQL
DB_HOST=$dbHost
DB_PORT=$dbPort
DB_USER=$dbUser
DB_PASSWORD=$dbPasswordPlain
DB_NAME=$dbName

# Configuración del servidor
PORT=3002
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtSecret`_refresh
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Configuración de seguridad
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Configuración de logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Configuración de desarrollo
HOT_RELOAD_ENABLED=true
DEBUG_ENABLED=true
"@

# Escribir archivo .env
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Archivo .env creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Configuración guardada:" -ForegroundColor Cyan
    Write-Host "   Host: $dbHost" -ForegroundColor White
    Write-Host "   Puerto: $dbPort" -ForegroundColor White
    Write-Host "   Usuario: $dbUser" -ForegroundColor White
    Write-Host "   Base de datos: $dbName" -ForegroundColor White
    Write-Host "   Puerto del servidor: 3002" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Ahora puedes:" -ForegroundColor Yellow
    Write-Host "   1. Crear la base de datos $dbName en pgAdmin" -ForegroundColor White
    Write-Host "   2. Ejecutar: npm run dev" -ForegroundColor White
    Write-Host "   3. Probar el sistema de autenticación" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Error al crear el archivo .env: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 
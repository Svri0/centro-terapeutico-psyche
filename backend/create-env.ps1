# Script para crear archivo .env básico
$envContent = @"
# Configuración del entorno
NODE_ENV=development

# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=psyche_db

# Configuración del servidor
PORT=3002
JWT_SECRET=psyche_jwt_secret_2024_development
JWT_REFRESH_SECRET=psyche_refresh_secret_2024_development
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Configuración de seguridad
CORS_ORIGIN=http://localhost:3003
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Configuración de logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Configuración de desarrollo
HOT_RELOAD_ENABLED=true
DEBUG_ENABLED=true
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Archivo .env creado exitosamente!" -ForegroundColor Green 
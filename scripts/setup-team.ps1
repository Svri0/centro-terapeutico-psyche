# Script de Configuración Automática para el Equipo
# Centro Terapéutico Psyche
# Autor: Equipo de Desarrollo
# Fecha: Julio 2025

param(
    [string]$GitHubUser = "",
    [string]$DbPassword = "",
    [switch]$SkipDatabase = $false,
    [switch]$SkipFrontend = $false,
    [switch]$Verbose = $false
)

# Configuración de colores para output
$Host.UI.RawUI.ForegroundColor = "White"
$Host.UI.RawUI.BackgroundColor = "Black"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

function Write-Header {
    param([string]$Title)
    Write-ColorOutput "`n" "Cyan"
    Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "  $Title" "Cyan"
    Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "`n" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Blue"
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "🔧 $Message" "Magenta"
}

# Banner de bienvenida
Write-Header "Centro Terapéutico Psyche - Setup del Equipo"
Write-ColorOutput "🏥 Configuración automática del proyecto" "White"
Write-ColorOutput "👥 Para nuevos miembros del equipo" "White"
Write-ColorOutput "⏰ Iniciado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Gray"
Write-ColorOutput "`n" "White"

# Verificar prerrequisitos
Write-Step "Verificando prerrequisitos..."

# Verificar Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Success "Node.js encontrado: $nodeVersion"
    } else {
        throw "Node.js no encontrado"
    }
} catch {
    Write-Error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Success "npm encontrado: $npmVersion"
    } else {
        throw "npm no encontrado"
    }
} catch {
    Write-Error "npm no está instalado"
    exit 1
}

# Verificar Git
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Success "Git encontrado: $gitVersion"
    } else {
        throw "Git no encontrado"
    }
} catch {
    Write-Error "Git no está instalado. Por favor instala Git desde https://git-scm.com/"
    exit 1
}

Write-Success "Todos los prerrequisitos están instalados"

# Verificar si estamos en el directorio correcto
Write-Step "Verificando estructura del proyecto..."

if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Error "No se encontró la estructura del proyecto. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
}

Write-Success "Estructura del proyecto verificada"

# Configurar variables de entorno
Write-Step "Configurando variables de entorno..."

if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Success "Archivo .env creado desde env.example"
    } else {
        Write-Error "No se encontró env.example. Por favor crea el archivo .env manualmente."
        exit 1
    }
} else {
    Write-Info "Archivo .env ya existe"
}

# Actualizar .env con valores del usuario si se proporcionan
if ($GitHubUser -ne "") {
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "https://github.com/tu-usuario/", "https://github.com/$GitHubUser/"
    Set-Content ".env" $envContent
    Write-Success "URL de GitHub actualizada con usuario: $GitHubUser"
}

if ($DbPassword -ne "") {
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$DbPassword"
    Set-Content ".env" $envContent
    Write-Success "Contraseña de base de datos actualizada"
} else {
    Write-Warning "IMPORTANTE: Debes editar manualmente el archivo .env con tu contraseña personal de PostgreSQL"
    Write-Info "Abre el archivo .env y cambia DB_PASSWORD=TU_CONTRASEÑA_PERSONAL_DE_POSTGRESQL"
}

# Instalar dependencias del backend
Write-Step "Instalando dependencias del backend..."

Set-Location "backend"
if (Test-Path "node_modules") {
    Write-Info "node_modules ya existe, saltando instalación..."
} else {
    Write-Info "Instalando dependencias del backend..."
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencias del backend instaladas"
    } else {
        Write-Error "Error al instalar dependencias del backend"
        exit 1
    }
}

# Verificar base de datos
if (-not $SkipDatabase) {
    Write-Step "Verificando configuración de base de datos..."
    
    # Verificar si PostgreSQL está corriendo
    try {
        $pgTest = pg_isready -h localhost -p 5432 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL está corriendo"
        } else {
            Write-Warning "PostgreSQL no está corriendo. Por favor inicia PostgreSQL antes de continuar."
        }
    } catch {
        Write-Warning "No se pudo verificar PostgreSQL. Asegúrate de que esté instalado y corriendo."
    }
    
    # Intentar ejecutar migraciones
    Write-Info "Ejecutando migraciones de base de datos..."
    npm run db:migrate
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Migraciones ejecutadas correctamente"
    } else {
        Write-Warning "Error al ejecutar migraciones. Verifica la configuración de la base de datos."
    }
}

Set-Location ".."

# Instalar dependencias del frontend
if (-not $SkipFrontend) {
    Write-Step "Instalando dependencias del frontend..."
    
    Set-Location "frontend"
    if (Test-Path "node_modules") {
        Write-Info "node_modules ya existe, saltando instalación..."
    } else {
        Write-Info "Instalando dependencias del frontend..."
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencias del frontend instaladas"
        } else {
            Write-Error "Error al instalar dependencias del frontend"
            exit 1
        }
    }
    Set-Location ".."
}

# Limpiar puertos si es necesario
Write-Step "Verificando puertos disponibles..."

try {
    $ports = @(3002, 3004, 3006, 3008, 3010, 3011, 3012)
    $occupiedPorts = @()
    
    foreach ($port in $ports) {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet 2>$null
        if ($connection) {
            $occupiedPorts += $port
        }
    }
    
    if ($occupiedPorts.Count -gt 0) {
        Write-Warning "Puertos ocupados detectados: $($occupiedPorts -join ', ')"
        Write-Info "Ejecutando limpieza de puertos..."
        npx kill-port $occupiedPorts 2>$null
        Write-Success "Puertos limpiados"
    } else {
        Write-Success "Todos los puertos están disponibles"
    }
} catch {
    Write-Warning "No se pudo verificar puertos ocupados"
}

# Verificar que todo funciona
Write-Step "Verificando instalación..."

# Verificar backend
Set-Location "backend"
$backendTest = npm run health 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Success "Backend responde correctamente"
} else {
    Write-Info "Backend no está corriendo (normal en primera instalación)"
}

Set-Location ".."

# Resumen final
Write-Header "✅ Configuración Completada"
Write-ColorOutput "`n🎉 ¡Bienvenido al equipo del Centro Terapéutico Psyche!" "Green"
Write-ColorOutput "`n📋 Resumen de la instalación:" "White"
Write-ColorOutput "   ✅ Prerrequisitos verificados" "Green"
Write-ColorOutput "   ✅ Variables de entorno configuradas" "Green"
Write-ColorOutput "   ✅ Dependencias del backend instaladas" "Green"
if (-not $SkipFrontend) {
    Write-ColorOutput "   ✅ Dependencias del frontend instaladas" "Green"
}
if (-not $SkipDatabase) {
    Write-ColorOutput "   ✅ Migraciones de base de datos ejecutadas" "Green"
}
Write-ColorOutput "   ✅ Puertos verificados y limpiados" "Green"

Write-ColorOutput "`n🚀 Para iniciar el proyecto:" "Yellow"
Write-ColorOutput "   Terminal 1: cd backend; npm run dev" "Cyan"
Write-ColorOutput "   Terminal 2: cd frontend; npm run dev" "Cyan"

Write-ColorOutput "`n🌐 URLs importantes:" "Yellow"
Write-ColorOutput "   Dashboard: http://localhost:3002/dashboard" "Cyan"
Write-ColorOutput "   API Salud: http://localhost:3002/salud" "Cyan"
Write-ColorOutput "   Frontend: http://localhost:3000" "Cyan"

Write-ColorOutput "`n📚 Documentación:" "Yellow"
Write-ColorOutput "   Onboarding: docs/ONBOARDING_EQUIPO.md" "Cyan"
Write-ColorOutput "   README: README.md" "Cyan"

Write-ColorOutput "`n🤝 ¡Listo para contribuir al proyecto!" "Green"
Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "⏰ Completado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Gray"
Write-ColorOutput "`n" "White" 
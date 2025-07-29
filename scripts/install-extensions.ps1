#!/usr/bin/env pwsh
# Script para instalar extensiones automaticamente en Cursor/VSCode
# Centro Terapeutico Psyche

Write-Host "Instalando extensiones de desarrollo..." -ForegroundColor Green
Write-Host ""

# Lista de extensiones requeridas principales
$extensiones = @(
    "dsznajder.es7-react-js-snippets",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "eamodio.gitlens",
    "formulahendry.auto-rename-tag",
    "coenraads.bracket-pair-colorizer-2",
    "pkief.material-icon-theme",
    "rangav.vscode-thunder-client",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense"
)

# Extensiones adicionales opcionales
$extensionesAdicionales = @(
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one",
    "ms-vscode-remote.remote-containers"
)

Write-Host "NOTA: TypeScript auto-import ya esta incluido en Cursor/VSCode" -ForegroundColor Yellow
Write-Host "No necesitas instalar TypeScript Importer por separado." -ForegroundColor Yellow
Write-Host ""

# Detectar si Cursor o VSCode esta disponible
$useCursor = Get-Command cursor -ErrorAction SilentlyContinue
$useVSCode = Get-Command code -ErrorAction SilentlyContinue

if ($useCursor) {
    Write-Host "Detectado Cursor, instalando extensiones..." -ForegroundColor Cyan
    $editor = "cursor"
} elseif ($useVSCode) {
    Write-Host "Detectado VSCode, instalando extensiones..." -ForegroundColor Cyan
    $editor = "code"
} else {
    Write-Host "ERROR: No se encontro Cursor ni VSCode en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala las extensiones manualmente desde el marketplace" -ForegroundColor Yellow
    exit 1
}

$instaladas = 0
$errores = 0
$todasLasExtensiones = $extensiones + $extensionesAdicionales

foreach ($extension in $todasLasExtensiones) {
    try {
        Write-Host "Instalando $extension..." -ForegroundColor Yellow
        
        $result = & $editor --install-extension $extension --force 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "INSTALADA: $extension" -ForegroundColor Green
            $instaladas++
        } else {
            Write-Host "ERROR instalando $extension" -ForegroundColor Red
            Write-Host "$result" -ForegroundColor Gray
            $errores++
        }
    }
    catch {
        Write-Host "ERROR inesperado con $extension" -ForegroundColor Red
        Write-Host "$($_.Exception.Message)" -ForegroundColor Gray
        $errores++
    }
    
    # Pequeña pausa para evitar saturar
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "RESUMEN DE INSTALACION:" -ForegroundColor Yellow
Write-Host "Instaladas correctamente: $instaladas" -ForegroundColor Green
Write-Host "Errores encontrados: $errores" -ForegroundColor Red
Write-Host ""

if ($errores -eq 0) {
    Write-Host "PERFECTO: Todas las extensiones se instalaron correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Por favor reinicia $editor para que los cambios tomen efecto." -ForegroundColor Cyan
} else {
    Write-Host "ATENCION: Algunas extensiones no se pudieron instalar automaticamente." -ForegroundColor Yellow
    Write-Host "Instalallas manualmente desde el marketplace del editor." -ForegroundColor Gray
}

Write-Host ""
Write-Host "FUNCIONALIDADES INCLUIDAS:" -ForegroundColor Cyan
Write-Host "- Auto-import: Ctrl+Space o Ctrl+." -ForegroundColor White
Write-Host "- Organizar imports: Shift+Alt+O" -ForegroundColor White
Write-Host "- Quick fix: Ctrl+." -ForegroundColor White
Write-Host ""
Write-Host "Para verificar instalacion:" -ForegroundColor Cyan
Write-Host ".\scripts\check-extensions-simple.ps1" -ForegroundColor White 
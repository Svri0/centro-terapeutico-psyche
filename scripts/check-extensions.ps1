#!/usr/bin/env pwsh
# Script para verificar extensiones instaladas en Cursor/VSCode
# Centro Terapéutico Psyche

Write-Host "🔍 Verificando extensiones instaladas..." -ForegroundColor Cyan
Write-Host ""

# Lista de extensiones requeridas
$extensionesRequeridas = @(
    @{Nombre="ES7+ React/Redux/React-Native snippets"; ID="dsznajder.es7-react-js-snippets"},
    @{Nombre="Tailwind CSS IntelliSense"; ID="bradlc.vscode-tailwindcss"},
    @{Nombre="Prettier - Code formatter"; ID="esbenp.prettier-vscode"},
    @{Nombre="ESLint"; ID="dbaeumer.vscode-eslint"},
    @{Nombre="GitLens"; ID="eamodio.gitlens"},
    @{Nombre="Auto Rename Tag"; ID="formulahendry.auto-rename-tag"},
    @{Nombre="Bracket Pair Colorizer"; ID="coenraads.bracket-pair-colorizer-2"},
    @{Nombre="Material Icon Theme"; ID="pkief.material-icon-theme"},
    @{Nombre="Thunder Client"; ID="rangav.vscode-thunder-client"},
    @{Nombre="Error Lens"; ID="usernamehw.errorlens"},
    @{Nombre="Path Intellisense"; ID="christian-kohler.path-intellisense"},
    @{Nombre="TypeScript Importer"; ID="pmneo.tsimporter"}
)

# Función para verificar si una extensión está instalada
function Test-Extension {
    param($ExtensionID)
    
    # Intentar con Cursor primero
    $cursorInstalled = & cursor --list-extensions 2>$null | Where-Object { $_ -eq $ExtensionID }
    if ($cursorInstalled) {
        return "Cursor"
    }
    
    # Intentar con Code (VSCode)
    $codeInstalled = & code --list-extensions 2>$null | Where-Object { $_ -eq $ExtensionID }
    if ($codeInstalled) {
        return "VSCode"
    }
    
    return $false
}

# Verificar cada extensión
$instaladas = 0
$total = $extensionesRequeridas.Count

foreach ($extension in $extensionesRequeridas) {
    $estado = Test-Extension -ExtensionID $extension.ID
    
    if ($estado) {
        Write-Host "✅ $($extension.Nombre)" -ForegroundColor Green
        Write-Host "   Instalada en: $estado" -ForegroundColor Gray
        $instaladas++
    } else {
        Write-Host "❌ $($extension.Nombre)" -ForegroundColor Red
        Write-Host "   ID: $($extension.ID)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "📊 Resumen:" -ForegroundColor Yellow
Write-Host "   Instaladas: $instaladas/$total" -ForegroundColor White
Write-Host ""

if ($instaladas -eq $total) {
    Write-Host "🎉 ¡Todas las extensiones están instaladas!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Faltan extensiones por instalar." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Para instalar todas automáticamente, ejecuta:" -ForegroundColor Cyan
    Write-Host "   .\scripts\install-extensions.ps1" -ForegroundColor White
} 
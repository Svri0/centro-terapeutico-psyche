# Script para configurar terminal PowerShell correctamente
# Centro Terapeutico Psyche

Write-Host "Configurando terminal PowerShell..." -ForegroundColor Green

# Limpiar terminal
Clear-Host

# Configurar codificación UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Configurar página de códigos
chcp 65001 > $null

# Configurar PowerShell para UTF-8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

Write-Host "Terminal configurada correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuraciones aplicadas:" -ForegroundColor Cyan
Write-Host "- Codificacion: UTF-8" -ForegroundColor White
Write-Host "- Pagina de codigos: 65001" -ForegroundColor White
Write-Host "- Salida limpia: Activada" -ForegroundColor White
Write-Host ""
Write-Host "Comandos disponibles:" -ForegroundColor Yellow
Write-Host ".\scripts\check-extensions-simple.ps1  # Verificar extensiones" -ForegroundColor White
Write-Host ".\scripts\install-extensions.ps1       # Instalar extensiones" -ForegroundColor White 
# Script simple para verificar extensiones instaladas
# Centro Terapeutico Psyche

Write-Host "Verificando extensiones instaladas..." -ForegroundColor Cyan
Write-Host ""

# Lista de extensiones requeridas (actualizadas)
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

$nombres = @(
    "ES7+ React/Redux/React-Native snippets",
    "Tailwind CSS IntelliSense",
    "Prettier - Code formatter",
    "ESLint",
    "GitLens",
    "Auto Rename Tag",
    "Bracket Pair Colorizer",
    "Material Icon Theme",
    "Thunder Client",
    "Error Lens",
    "Path Intellisense"
)

$instaladas = 0
$total = $extensiones.Count

# Detectar que editor usar
$useCursor = Get-Command cursor -ErrorAction SilentlyContinue
$useVSCode = Get-Command code -ErrorAction SilentlyContinue

if ($useCursor) {
    $editor = "cursor"
    $editorName = "Cursor"
} elseif ($useVSCode) {
    $editor = "code"
    $editorName = "VSCode"
} else {
    Write-Host "ERROR: No se encontro Cursor ni VSCode" -ForegroundColor Red
    exit 1
}

Write-Host "Usando editor: $editorName" -ForegroundColor Yellow
Write-Host ""

# Obtener lista de extensiones instaladas
try {
    $extInstalladas = & $editor --list-extensions 2>$null
} catch {
    Write-Host "ERROR: No se pudo obtener lista de extensiones" -ForegroundColor Red
    exit 1
}

# Verificar cada extension
for ($i = 0; $i -lt $extensiones.Count; $i++) {
    $ext = $extensiones[$i]
    $nombre = $nombres[$i]
    
    if ($extInstalladas -contains $ext) {
        Write-Host "SI INSTALADA: $nombre" -ForegroundColor Green
        $instaladas++
    } else {
        Write-Host "NO INSTALADA: $nombre" -ForegroundColor Red
        Write-Host "  ID: $ext" -ForegroundColor Gray
    }
}

# Verificar TypeScript (incluido por defecto)
if ($extInstalladas -contains "ms-vscode.vscode-typescript-next") {
    Write-Host "SI INSTALADA: TypeScript (con auto-import incluido)" -ForegroundColor Green
    $instaladas++
    $total++
}

Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor Yellow
Write-Host "Instaladas: $instaladas de $total" -ForegroundColor White

if ($instaladas -eq $total) {
    Write-Host "PERFECTO: Todas las extensiones estan instaladas!" -ForegroundColor Green
    Write-Host ""
    Write-Host "FUNCIONALIDADES DISPONIBLES:" -ForegroundColor Cyan
    Write-Host "- Auto-import TypeScript: Ctrl+Space" -ForegroundColor White
    Write-Host "- Quick Fix: Ctrl+." -ForegroundColor White
    Write-Host "- Organizar imports: Shift+Alt+O" -ForegroundColor White
} else {
    Write-Host "FALTA: $($total - $instaladas) extensiones por instalar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para instalar todas automaticamente:" -ForegroundColor Cyan
    Write-Host "  .\scripts\install-extensions.ps1" -ForegroundColor White
} 
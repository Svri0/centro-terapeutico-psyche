#!/bin/bash
# Script para instalar extensiones de VS Code/Cursor automáticamente
# Centro Terapéutico Psyche

echo "🔌 Instalando extensiones de VS Code/Cursor..."

# Lista de extensiones requeridas
extensions=(
    "dsznajder.es7-react-js-snippets"
    "bradlc.vscode-tailwindcss"
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
    "eamodio.gitlens"
    "formulahendry.auto-rename-tag"
    "coenraads.bracket-pair-colorizer-2"
    "pkief.material-icon-theme"
    "rangav.vscode-thunder-client"
    "usernamehw.errorlens"
    "christian-kohler.path-intellisense"
    "pmneo.tsimporter"
    "ms-vscode.vscode-typescript-next"
    "ms-vscode.vscode-json"
    "yzhang.markdown-all-in-one"
    "ms-vscode-remote.remote-containers"
    "ms-vscode.vscode-docker"
)

# Detectar si es VS Code o Cursor
code_command=""
if command -v code &> /dev/null; then
    code_command="code"
    echo "✅ VS Code detectado"
elif command -v cursor &> /dev/null; then
    code_command="cursor"
    echo "✅ Cursor detectado"
else
    echo "❌ No se detectó VS Code ni Cursor instalado"
    echo "Por favor instala VS Code o Cursor primero:"
    echo "  VS Code: https://code.visualstudio.com/"
    echo "  Cursor: https://cursor.sh/"
    exit 1
fi

echo "📦 Instalando ${#extensions[@]} extensiones..."

for extension in "${extensions[@]}"; do
    echo "  Instalando $extension..."
    if $code_command --install-extension "$extension" --force; then
        echo "    ✅ $extension instalada"
    else
        echo "    ❌ Error instalando $extension"
    fi
done

echo ""
echo "🎉 ¡Instalación de extensiones completada!"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Reinicia VS Code/Cursor"
echo "  2. Abre el proyecto: $code_command ."
echo "  3. Verifica que las extensiones estén activas"
echo ""
echo "🔧 Para verificar instalación:"
echo "  $code_command --list-extensions" 
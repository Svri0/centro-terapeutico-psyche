# Instalación Manual de Extensiones en Cursor

## 🚀 Instalación Automática desde Terminal

Abre la terminal integrada de Cursor (Ctrl + `) y ejecuta estos comandos uno por uno:

```bash
cursor --install-extension dsznajder.es7-react-js-snippets
cursor --install-extension bradlc.vscode-tailwindcss
cursor --install-extension esbenp.prettier-vscode
cursor --install-extension dbaeumer.vscode-eslint
cursor --install-extension eamodio.gitlens
cursor --install-extension formulahendry.auto-rename-tag
cursor --install-extension coenraads.bracket-pair-colorizer-2
cursor --install-extension pkief.material-icon-theme
cursor --install-extension rangav.vscode-thunder-client
cursor --install-extension usernamehw.errorlens
cursor --install-extension christian-kohler.path-intellisense
cursor --install-extension pmneo.tsimporter
```

## 🔍 Instalación desde el Marketplace

Si los comandos no funcionan, puedes instalarlas desde el marketplace:

1. **Abrir Extensions Panel**: Presiona `Ctrl + Shift + X`
2. **Buscar cada extensión** por su nombre:

### ✅ Lista de Extensiones a Buscar:

1. **ES7+ React/Redux/React-Native snippets** (dsznajder)
2. **Tailwind CSS IntelliSense** (Tailwind Labs)
3. **Prettier - Code formatter** (Prettier)
4. **ESLint** (Microsoft)
5. **GitLens** (GitKraken)
6. **Auto Rename Tag** (Jun Han)
7. **Bracket Pair Colorizer** (CoenraadS)
8. **Material Icon Theme** (Philipp Kief)
9. **Thunder Client** (Thunder Client)
10. **Error Lens** (Alexander)
11. **Path Intellisense** (Christian Kohler)
12. **TypeScript Importer** (pmneo)

## 🔄 Verificar Instalación

Después de instalar todas, ejecuta en la terminal:

```powershell
.\scripts\check-extensions-simple.ps1
```

Debería mostrar "PERFECTA: Todas las extensiones están instaladas!"

## ⚙️ Configuración Automática

Una vez instaladas las extensiones, el proyecto ya tiene toda la configuración en:
- `.vscode/settings.json` - Configuraciones automáticas
- `.vscode/extensions.json` - Lista de extensiones recomendadas

¡No necesitas configurar nada más! 
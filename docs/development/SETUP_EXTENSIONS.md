# 🔧 Configuración de Extensiones para Desarrollo

## 📦 Instalación de Extensiones

### 🚀 Opción 1: Instalación Automática (Recomendada)

Al abrir el proyecto en VS Code/Cursor por primera vez:

1. **Aparecerá una notificación** en la esquina inferior derecha:
   > "Este workspace tiene recomendaciones de extensiones"

2. **Haz clic en "Instalar"** o "Install All"

3. **Espera** a que se instalen todas automáticamente

### 🔧 Opción 2: Script Automático

```powershell
# Windows (PowerShell)
.\scripts\install-extensions.ps1

# Linux/Mac (Bash)
chmod +x scripts/install-extensions.sh
./scripts/install-extensions.sh
```

### 📋 Opción 3: Instalación Manual

1. **Abre VS Code/Cursor**
2. **Ve a la pestaña de extensiones** (Ctrl+Shift+X)
3. **Busca "@recommended"** en el buscador
4. **Verás "Workspace Recommendations"**
5. **Instala cada extensión** haciendo clic en "Install"

### 🎯 Opción 4: Comando por Comando

```bash
# Detectar si tienes VS Code o Cursor
code --version    # o cursor --version

# Instalar extensiones una por una
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
# ... y así sucesivamente
```

## ✅ Extensiones Requeridas

### 🎨 **Desarrollo React/TypeScript**
1. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
   - Snippets para React: `rafce`, `useState`, `useEffect`, etc.
   - Acelera la escritura de componentes

2. **TypeScript Importer** (`pmneo.tsimporter`)
   - Auto-importación de módulos TypeScript
   - Organización automática de imports

### 🎨 **Estilos y UI**
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Autocompletado para clases de Tailwind
   - Preview de colores y espaciado
   - Validación de clases

### 🔧 **Calidad de Código**
4. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
   - Formateo automático al guardar
   - Consistencia en todo el equipo

5. **ESLint** (`dbaeumer.vscode-eslint`)
   - Detección de errores en tiempo real
   - Corrección automática de problemas

6. **Error Lens** (`usernamehw.errorlens`)
   - Muestra errores directamente en la línea de código
   - Mejor visibilidad de problemas

### 🔍 **Git y Navegación**
7. **GitLens** (`eamodio.gitlens`)
   - Información detallada de Git inline
   - Blame, historial, comparaciones

8. **Path Intellisense** (`christian-kohler.path-intellisense`)
   - Autocompletado de rutas de archivos
   - Previene errores de importación

### 🛠️ **Productividad**
9. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
   - Renombra automáticamente tags HTML/JSX emparejados

10. **Bracket Pair Colorizer** (`coenraads.bracket-pair-colorizer-2`)
    - Colorea brackets para mejor legibilidad
    - Especialmente útil en JSX anidado

11. **Material Icon Theme** (`pkief.material-icon-theme`)
    - Iconos personalizados para archivos del proyecto
    - Mejor organización visual

### 🧪 **Testing y API**
12. **Thunder Client** (`rangav.vscode-thunder-client`)
    - Cliente REST integrado
    - Alternativa a Postman dentro del editor

## 🔍 Verificación de Instalación

### ✅ Verificar que están instaladas:
```bash
# Ver todas las extensiones instaladas
code --list-extensions

# Verificar extensiones específicas
code --list-extensions | grep -E "(eslint|prettier|tailwind)"
```

### 🧪 Probar que funcionan:

1. **ESLint**: Abre un archivo `.ts` y escribe código con errores
2. **Prettier**: Guarda un archivo mal formateado
3. **Tailwind**: Escribe `bg-` y verifica autocompletado
4. **React Snippets**: Escribe `rafce` y presiona Tab
5. **GitLens**: Verifica información de Git inline

## ⚙️ Configuración Automática

El proyecto ya incluye configuración para:

- ✅ **Formateo automático** al guardar
- ✅ **ESLint ejecutándose** automáticamente  
- ✅ **Tailwind CSS** configurado
- ✅ **Organización de imports** automática
- ✅ **Iconos personalizados** para archivos del proyecto

## 🚨 Solución de Problemas

### ❌ "No aparece la notificación de extensiones"
1. Verifica que el archivo `.vscode/extensions.json` existe
2. Recarga VS Code/Cursor (Ctrl+Shift+P → "Reload Window")
3. Ve manualmente a extensiones y busca "@recommended"

### ❌ "Las extensiones no se instalan"
```bash
# Verificar que VS Code/Cursor está en PATH
code --version
# o
cursor --version

# Si no funciona, reinstala VS Code/Cursor
```

### ❌ "ESLint no funciona"
1. Verifica que ESLint esté instalado: `npm list eslint`
2. Recarga la ventana: Ctrl+Shift+P → "ESLint: Restart ESLint Server"
3. Verifica que `.eslintrc.js` existe en backend/ y frontend/

### ❌ "Prettier no formatea"
1. Verifica que Prettier esté configurado como formateador por defecto
2. Habilita "Format on Save" en configuración
3. Verifica que `.prettierrc` existe

### ❌ "Tailwind no autocompleta"
1. Verifica que `tailwind.config.js` existe
2. Instala la extensión manualmente
3. Recarga la ventana del editor

## 📋 Checklist Final

- [ ] ✅ Todas las 12 extensiones instaladas
- [ ] 🔧 ESLint muestra errores/warnings
- [ ] 🎨 Prettier formatea al guardar  
- [ ] 🌈 Tailwind CSS autocompleta
- [ ] 📊 GitLens muestra información de Git
- [ ] ⚡ Thunder Client disponible
- [ ] 🎯 Material Icons activos
- [ ] 🔍 Error Lens muestra errores inline

## 🎉 ¡Listo para Desarrollar!

Una vez que todas las extensiones estén instaladas y funcionando:

```bash
# Verificar que todo funciona
npm run lint
npm run format:check
npm run dev
```

---

**¿Necesitas ayuda?** Consulta con el equipo de desarrollo o revisa la [Guía de Desarrollo Completa](./DEVELOPMENT_SETUP.md). 
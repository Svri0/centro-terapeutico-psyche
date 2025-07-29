# 🛠️ Herramientas de Desarrollo - Centro Terapéutico Psyche

## 🚀 Configuración Inicial (Solo una vez)

### 1. Instalar Extensiones de Cursor

```powershell
# Automático (recomendado)
.\scripts\install-extensions.ps1

# Manual: Ir a Extensions (Ctrl+Shift+X) y buscar:
# - ES7+ React snippets, Tailwind CSS, Prettier, ESLint
# - GitLens, Auto Rename Tag, Material Icon Theme
# - Thunder Client, Error Lens, Path Intellisense
```

### 2. Verificar Instalación

```powershell
.\scripts\check-extensions-simple.ps1
```

## 📝 Comandos Diarios

### Frontend (React + TypeScript)

```bash
cd frontend

# Desarrollo
npm run dev              # Iniciar servidor desarrollo
npm run build           # Compilar para producción

# Calidad de código
npm run lint            # Revisar errores ESLint
npm run lint:fix        # Corregir errores automáticamente
npm run format         # Formatear código con Prettier
npm run format:check    # Solo verificar formato
npm run type-check      # Verificar tipos TypeScript

# Testing
npm run test           # Ejecutar tests
npm run test:ui        # Tests con interfaz visual
npm run test:coverage  # Tests con cobertura
```

### Backend (Node.js + TypeScript)

```bash
cd backend

# Desarrollo
npm run dev            # Iniciar con nodemon
npm run build         # Compilar TypeScript
npm start             # Iniciar en producción

# Calidad de código
npm run lint          # Revisar errores ESLint
npm run lint:fix      # Corregir errores automáticamente
npm run format        # Formatear código con Prettier
npm run format:check  # Solo verificar formato
npm run type-check    # Verificar tipos TypeScript

# Base de datos
npm run db:migrate    # Ejecutar migraciones
npm run db:seed       # Cargar datos iniciales
npm run db:fresh      # Resetear y cargar todo
```

## 🎨 Configuración Automática

### ✅ **Formato Automático al Guardar**

- Prettier se ejecuta automáticamente al guardar archivos
- ESLint marca errores en tiempo real
- Auto-fix de problemas menores al guardar

### ✅ **Configuraciones del Proyecto**

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Estilo**: Single quotes, semicolons, 2 espacios
- **Accesibilidad**: Validaciones JSX a11y activadas

## 🚨 Errores Comunes

### "ESLint configuration error"

```bash
# Verificar que las extensiones estén instaladas
.\scripts\check-extensions-simple.ps1

# Reinstalar dependencias
cd frontend && npm install
cd backend && npm install
```

### "Prettier format issues"

```bash
# Formatear todos los archivos automáticamente
npm run format
```

### "TypeScript compilation errors"

```bash
# Verificar errores de tipos
npm run type-check
```

## 📊 Scripts de Verificación

### Verificar Todo el Proyecto

```bash
# Desde la raíz del proyecto
cd frontend && npm run lint && npm run type-check
cd ../backend && npm run lint && npm run type-check
```

### Formatear Todo el Proyecto

```bash
cd frontend && npm run format
cd ../backend && npm run format
```

## 🔧 Configuración Personal

### Configuraciones Recomendadas en Cursor

1. **Ctrl + ,** → Abrir configuraciones
2. **Format On Save**: ✅ Activado
3. **Auto Save**: `afterDelay` (1000ms)
4. **Default Formatter**: Prettier

### Atajos Útiles

- **Ctrl + Shift + P**: Paleta de comandos
- **Ctrl + Shift + I**: Formatear documento
- **Ctrl + .**: Quick fix (arreglo rápido)
- **F2**: Renombrar símbolo
- **Ctrl + Space**: Autocompletado

## 🎯 Mejores Prácticas

### ✅ **Antes de Hacer Commit**

```bash
# 1. Formatear código
npm run format

# 2. Verificar linting
npm run lint

# 3. Verificar tipos
npm run type-check

# 4. Ejecutar tests (si existen)
npm run test
```

### ✅ **Estructura de Commits**

```
feat: agregar componente de login
fix: corregir validación de email
docs: actualizar README
style: formatear código con prettier
refactor: reorganizar estructura de carpetas
```

### ✅ **Resolución de Conflictos**

1. Siempre ejecutar `npm run format` antes de resolver conflictos
2. Verificar que ESLint no marque errores
3. Probar que la aplicación compile correctamente

---

**🎉 ¡Con estas herramientas configuradas, todo el equipo trabajará con el mismo estilo de código!**

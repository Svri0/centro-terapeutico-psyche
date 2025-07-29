# 🚨 Solución de Errores Comunes

## ❌ Error: Caracteres extraños en terminal (q♦, etc.)

### **Síntomas:**

- Aparecen caracteres como `q♦` en la terminal
- Error: "El término 'q♦' no se reconoce"
- Scripts de PowerShell fallan con errores extraños

### **Causa:**

Problema de codificación de caracteres en PowerShell

### **✅ Solución Rápida:**

```powershell
# Ejecutar este comando desde la raíz del proyecto
.\scripts\configurar-terminal.ps1
```

### **✅ Solución Manual:**

```powershell
# 1. Limpiar terminal
Clear-Host

# 2. Configurar codificación
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 3. Configurar página de códigos
chcp 65001

# 4. Configurar PowerShell
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
```

## ❌ Error: ESLint configuration not found

### **Síntomas:**

- "ESLint couldn't find the config"
- "@typescript-eslint/recommended not found"

### **✅ Solución:**

```bash
# Verificar extensiones instaladas
.\scripts\check-extensions-simple.ps1

# Reinstalar dependencias
cd frontend && npm install
cd ../backend && npm install
```

## ❌ Error: Prettier format issues

### **Síntomas:**

- "Code style issues found in X files"
- Archivos no formateados correctamente

### **✅ Solución:**

```bash
# Frontend
cd frontend && npm run format

# Backend
cd backend && npm run format
```

## ❌ Error: TypeScript compilation errors

### **Síntomas:**

- Errores de tipos TypeScript
- "Cannot find module" en imports

### **✅ Solución:**

```bash
# Verificar tipos
npm run type-check

# Usar auto-import
# Ctrl + Space (autocompletado con import)
# Ctrl + . (quick fix para agregar imports)
# Shift + Alt + O (organizar imports)
```

## ❌ Error: Docker/Base de datos

### **Síntomas:**

- "Connection refused" al conectar DB
- Migraciones fallan

### **✅ Solución:**

```bash
# Levantar servicios
docker-compose up -d postgres redis

# Esperar y ejecutar migraciones
cd backend
npm run db:migrate
npm run db:seed
```

## 🛠️ Scripts de Diagnóstico

### Verificar Estado General

```bash
# Desde raíz del proyecto
.\scripts\configurar-terminal.ps1       # Arreglar terminal
.\scripts\check-extensions-simple.ps1   # Verificar extensiones
docker-compose ps                       # Verificar servicios Docker
```

### Verificar Herramientas de Desarrollo

```bash
# Frontend
cd frontend
npm run lint          # ESLint
npm run format:check  # Prettier
npm run type-check    # TypeScript

# Backend
cd backend
npm run lint          # ESLint
npm run format:check  # Prettier
npm run type-check    # TypeScript
```

## 📞 Contacto

Si ninguna solución funciona:

1. Crear issue en GitHub con el error completo
2. Incluir salida de `.\scripts\check-extensions-simple.ps1`
3. Mencionar sistema operativo y versión de Cursor

---

**💡 Tip:** Ejecutar `.\scripts\configurar-terminal.ps1` al inicio de cada sesión de trabajo.

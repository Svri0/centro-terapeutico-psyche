# 🚨 CONFIGURACIÓN OBLIGATORIA - PUERTO 3002

## ⚠️ IMPORTANTE PARA EL EQUIPO
**EL BACKEND DEBE CORRER SIEMPRE EN EL PUERTO 3002**

### 🔧 Configuración Actual
- ✅ Puerto configurado: `3002` (OBLIGATORIO)
- ✅ Archivo `.env`: `PORT=3002`
- ✅ Docker Compose: `3002:3002`
- ✅ Código modificado: NO permite puertos alternativos

### 🚀 Cómo Iniciar el Backend
```bash
cd backend
npm run dev
```

### 🔍 Verificar que Funciona
```bash
# Verificar puerto
netstat -ano | findstr :3002

# Verificar API
curl http://localhost:3002/salud

# Dashboard
http://localhost:3002/dashboard
```

### 🛠️ Si el Puerto 3002 Está Ocupado

#### Solución 1: Script Automático
```powershell
.\scripts\clean-ports.ps1
```

#### Solución 2: Matar Procesos Node
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

#### Solución 3: Matar Puerto Específico
```powershell
$processes = netstat -aon | Select-String ":3002" | ForEach-Object { ($_ -split '\s+')[-1] }
$processes | ForEach-Object { if ($_ -ne "0") { taskkill /f /pid $_ } }
```

#### Solución 4: Reiniciar Computadora
Si nada funciona, reinicia la computadora.

### 🚨 COMPORTAMIENTO ACTUAL
- ❌ Si puerto 3002 está ocupado → Backend se cierra con error
- ✅ NO usa puertos alternativos (3007, 3008, etc.)
- ✅ Mensaje claro de error con soluciones

### 📋 Para Unión de Proyectos
1. **Frontend** debe apuntar a: `http://localhost:3002`
2. **Docker Compose** usa: `3002:3002`
3. **Variables de entorno**: `PORT=3002`

### 🔒 Archivos Críticos
- `backend/.env` → `PORT=3002`
- `backend/src/servidor.ts` → Puerto obligatorio
- `docker-compose.yml` → `3002:3002`

---
**Última actualización**: 23-10-2025
**Estado**: ✅ FUNCIONANDO EN PUERTO 3002

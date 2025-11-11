# 🧪 Guía de Prueba - Reporte de Adherencia Terapéutica

## 📋 Pasos para Probar

### 1. **Verificar que el servidor esté corriendo**
```bash
# En una terminal, verifica que el backend esté corriendo
cd backend
npm run dev
```

El servidor debe estar en: `http://localhost:3002`

### 2. **Acceder al Panel del Psicólogo**
1. Abre el navegador en: `http://localhost:3000`
2. Inicia sesión con:
   - **Email**: `admin@admin.cl` (o cualquier psicólogo)
   - **Contraseña**: `admin123`

### 3. **Navegar al Reporte de Adherencia**
1. En el Panel del Psicólogo, busca la pestaña **"📈 Adherencia"** en el menú
2. Haz clic en ella

### 4. **Verificar que se carga el reporte**
- El reporte debería generarse automáticamente al entrar
- Deberías ver:
  - ✅ Tarjetas de resumen (Total, Cumplidas, Incumplidas, Adherencia %)
  - ✅ Gráficos (Pie chart y Bar chart)
  - ✅ Tabla por paciente
  - ✅ Lista de tareas incumplidas
  - ✅ Lista de tareas cumplidas recientes

### 5. **Probar los Filtros**
1. **Filtro por Paciente:**
   - Selecciona un paciente del dropdown
   - Haz clic en "🔄 Generar Reporte"
   - Verifica que solo muestre datos de ese paciente

2. **Filtro por Fecha:**
   - Selecciona "Fecha Inicio" (ej: hace 30 días)
   - Selecciona "Fecha Fin" (ej: hoy)
   - Haz clic en "🔄 Generar Reporte"
   - Verifica que solo muestre tareas del período seleccionado

3. **Filtro Combinado:**
   - Selecciona un paciente Y un rango de fechas
   - Haz clic en "🔄 Generar Reporte"
   - Verifica que muestre datos filtrados correctamente

### 6. **Verificar los Datos Mostrados**

#### **Resumen General:**
- ✅ Total de tareas debe ser correcto
- ✅ Tareas cumplidas + incumplidas = total (aproximadamente)
- ✅ Porcentaje de adherencia debe calcularse: (cumplidas / total) * 100

#### **Por Paciente:**
- ✅ Cada paciente debe mostrar su porcentaje de adherencia
- ✅ Los pacientes deben estar ordenados por adherencia (mayor a menor)
- ✅ Debe mostrar días promedio de retraso si hay tareas completadas con retraso

#### **Tareas Incumplidas:**
- ✅ Solo debe mostrar tareas con estado "vencida" o "pendiente" con fecha vencida
- ✅ Debe mostrar cuántos días lleva vencida cada tarea
- ✅ Debe mostrar la prioridad de cada tarea

#### **Tareas Cumplidas Recientes:**
- ✅ Solo debe mostrar tareas con estado "completada"
- ✅ Debe indicar si fue "A tiempo" o "Con retraso"
- ✅ Debe mostrar días de retraso si aplica

### 7. **Probar con Datos Reales**

Si no hay tareas en el sistema, puedes crear algunas para probar:

1. Ve a la pestaña **"Tareas"**
2. Crea algunas tareas para diferentes pacientes
3. Marca algunas como completadas y deja otras pendientes/vencidas
4. Vuelve al reporte de adherencia y verifica que los datos se actualicen

## 🐛 Si hay Problemas

### **El reporte no carga:**
- Verifica la consola del navegador (F12) para ver errores
- Verifica la consola del backend para ver errores del servidor
- Verifica que el endpoint `/api/v1/tareas/reporte-adherencia` esté accesible

### **Datos incorrectos:**
- Verifica que las tareas tengan estados correctos
- Verifica que las fechas de vencimiento estén correctas
- Verifica que las tareas pertenezcan al psicólogo autenticado

### **Gráficos no se muestran:**
- Verifica que `recharts` esté instalado correctamente
- Verifica la consola del navegador para errores de JavaScript

## ✅ Checklist de Prueba

- [ ] El reporte se carga automáticamente al entrar
- [ ] Las tarjetas de resumen muestran datos correctos
- [ ] Los gráficos se muestran correctamente
- [ ] La tabla por paciente muestra todos los pacientes con tareas
- [ ] Los filtros funcionan correctamente
- [ ] El filtro por paciente funciona
- [ ] El filtro por fecha funciona
- [ ] El filtro combinado funciona
- [ ] Las tareas incumplidas se muestran correctamente
- [ ] Las tareas cumplidas recientes se muestran correctamente
- [ ] Los porcentajes de adherencia se calculan correctamente
- [ ] Los días de retraso se calculan correctamente

## 📊 Datos de Prueba Sugeridos

Para una prueba completa, asegúrate de tener:
- Al menos 2-3 pacientes con tareas asignadas
- Tareas en diferentes estados (completadas, vencidas, pendientes)
- Tareas con fechas de vencimiento pasadas y futuras
- Tareas completadas a tiempo y con retraso


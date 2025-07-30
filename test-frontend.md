# 🧪 Pruebas del Frontend de Autenticación

## 🚀 Cómo Probar el Sistema

### 1. **Iniciar el Backend**

```bash
# En el directorio raíz del proyecto
npm run dev
```

### 2. **Acceder al Frontend**

- Abrir el navegador en: `http://localhost:3003`
- El frontend debería redirigir automáticamente a `/login`

### 3. **Usuarios de Prueba Disponibles**

| Email                        | Password      | Rol           |
| ---------------------------- | ------------- | ------------- |
| `admin@psyche.cl`            | `admin123`    | Administrador |
| `juan.perez@psyche.cl`       | `password123` | Psicólogo     |
| `maria.gonzalez@psyche.cl`   | `password123` | Psicólogo     |
| `carlos.rodriguez@psyche.cl` | `password123` | Paciente      |
| `ana.silva@psyche.cl`        | `password123` | Paciente      |
| `pedro.lopez@psyche.cl`      | `password123` | Recepcionista |

### 4. **Flujo de Pruebas**

#### **A) Login**

1. Ir a `/login`
2. Usar cualquier usuario de prueba
3. Verificar que redirija al dashboard
4. Verificar que muestre el nombre y rol del usuario

#### **B) Registro**

1. Ir a `/registro`
2. Llenar el formulario completo
3. Verificar que cree la cuenta y redirija al dashboard

#### **C) Logout**

1. En el dashboard, hacer clic en "Cerrar Sesión"
2. Verificar que redirija al login
3. Verificar que no se pueda acceder al dashboard sin autenticación

#### **D) Rutas Protegidas**

1. Intentar acceder a `/dashboard` sin estar autenticado
2. Verificar que redirija al login
3. Verificar que después del login redirija al dashboard

### 5. **Características a Verificar**

#### **✅ Funcionalidades Implementadas**

- [ ] Formulario de login con validación
- [ ] Formulario de registro completo
- [ ] Contexto de autenticación global
- [ ] Rutas protegidas
- [ ] Redirección automática
- [ ] Persistencia de sesión
- [ ] Logout funcional
- [ ] UI responsive y moderna
- [ ] Manejo de errores
- [ ] Loading states

#### **🎨 UI/UX**

- [ ] Diseño moderno con Tailwind CSS
- [ ] Gradientes y colores atractivos
- [ ] Iconos SVG
- [ ] Animaciones de loading
- [ ] Mensajes de error claros
- [ ] Información de usuarios de prueba visible

### 6. **Troubleshooting**

#### **Problema: Backend no responde**

```bash
# Verificar que el backend esté corriendo
curl http://localhost:3002/salud
```

#### **Problema: CORS errors**

- Verificar que el backend tenga CORS configurado
- Verificar que las URLs coincidan

#### **Problema: Base de datos vacía**

```bash
# Ejecutar seeders manualmente
cd backend
node scripts/seed-roles.js
node scripts/seed-manual.js
```

### 7. **Estructura de Archivos Creados**

```
frontend/src/
├── componentes/
│   ├── Login.tsx          # Formulario de login
│   ├── Registro.tsx       # Formulario de registro
│   └── ProtectedRoute.tsx # Componente para rutas protegidas
├── contextos/
│   └── AuthContext.tsx    # Contexto de autenticación
├── servicios/
│   └── api.ts            # Servicios API actualizados
└── paginas/
    └── PanelPrincipal.tsx # Dashboard actualizado
```

### 8. **Próximos Pasos**

1. **Implementar refresh token automático**
2. **Agregar validación de formularios más robusta**
3. **Implementar recuperación de contraseña**
4. **Agregar notificaciones toast**
5. **Implementar temas oscuro/claro**
6. **Agregar tests unitarios**

### 9. **Comandos Útiles**

```bash
# Verificar puertos en uso
netstat -ano | findstr :3002
netstat -ano | findstr :3003

# Limpiar cache del navegador
Ctrl + Shift + R

# Ver logs del backend
# En la terminal donde corre npm run dev
```

### 10. **Credenciales de Desarrollo**

- **Backend**: `http://localhost:3002`
- **Frontend**: `http://localhost:3003`
- **Base de datos**: PostgreSQL en `localhost:5432`
- **Base de datos**: `psyche_db`

¡El sistema de autenticación está listo para usar! 🎉

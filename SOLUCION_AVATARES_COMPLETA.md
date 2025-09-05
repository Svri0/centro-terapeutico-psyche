# Solución Completa: Problemas con Avatares en Vista de Psicólogo

## Problemas Identificados

1. **Avatar no se guarda en la primera actualización**: El avatar se seleccionaba visualmente pero no se guardaba correctamente en la base de datos
2. **Avatar vuelve al default después de cerrar sesión**: El avatar no se persistía después de cerrar y volver a iniciar sesión
3. **Error 500 al actualizar perfil**: Problema en la consulta de base de datos para verificar el rol del psicólogo

## Soluciones Implementadas

### 1. Corrección de la Interfaz User en AuthService

**Problema**: La interfaz `User` no incluía los campos `avatar_url`, `especialidad`, `descripcion`, etc.

**Solución**: Agregar los campos faltantes a la interfaz:

```typescript
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  rol: string;
  rol_id: number;
}
```

**Archivos modificados**:
- `frontend/src/servicios/auth.service.ts`

### 2. Corrección del Endpoint obtenerPerfil

**Problema**: El endpoint devolvía solo los datos del token JWT, no los datos completos de la base de datos.

**Solución**: Obtener el usuario completo de la base de datos:

```typescript
// Obtener usuario completo de la base de datos
const usuarios = await sequelize.query(
  `SELECT u.id, u.nombres, u.apellidos, u.email, u.telefono, u.especialidad, u.descripcion, u.avatar_url, u.rol_id, r.nombre as rol
   FROM usuarios u
   INNER JOIN roles r ON u.rol_id = r.id
   WHERE u.id = :id AND u.deleted_at IS NULL`,
  {
    replacements: { id: usuarioAutenticado.id },
    type: QueryTypes.SELECT
  }
) as any[];
```

**Archivos modificados**:
- `backend/src/controladores/autenticacion.controlador.ts`

### 3. Corrección del Manejo de Estado en PanelPsicologo

**Problema**: El estado local no se actualizaba correctamente después de guardar el avatar.

**Solución**: Actualizar el estado local inmediatamente después de guardar:

```typescript
// Actualizar el usuario en localStorage con todos los datos actualizados
const updatedUser = { 
  ...user, 
  ...response.data,
  avatar_url: finalAvatarUrl // Asegurar que el avatar_url se guarde correctamente
};
localStorage.setItem('user', JSON.stringify(updatedUser));

// Actualizar el estado local para reflejar los cambios inmediatamente
setPerfilData(prev => ({
  ...prev,
  avatar_url: finalAvatarUrl
}));
setSelectedAvatarUrl(finalAvatarUrl);
```

**Archivos modificados**:
- `frontend/src/paginas/PanelPsicologo.tsx`

### 4. Corrección de la Carga Inicial de Avatar

**Problema**: Al cargar el perfil, no se detectaba si el avatar actual era uno de los predefinidos.

**Solución**: Verificar si el avatar actual coincide con uno de los avatares predefinidos:

```typescript
// Si el usuario tiene un avatar_url, verificar si es uno de los avatares predefinidos
if (user.avatar_url) {
  const avatar = AVATARS_ANIMALES.find(av => av.url === user.avatar_url);
  if (avatar) {
    setSelectedAvatarId(avatar.id);
  }
}
```

**Archivos modificados**:
- `frontend/src/paginas/PanelPsicologo.tsx`

### 5. Corrección de URLs de Avatares

**Problema**: Las URLs de los avatares de robots tenían parámetros inválidos que causaban error 400.

**Solución**: Simplificar las URLs removiendo parámetros problemáticos:

```typescript
// Antes (error 400)
url: 'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf&scale=80&mouth=smile&eyes=happy'

// Después (funciona correctamente)
url: 'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf'
```

**Archivos modificados**:
- `frontend/src/assets/avatars/default-avatars.ts`

### 6. Corrección de la Consulta de Base de Datos

**Problema**: La consulta para verificar el rol del psicólogo usaba un `include` complejo que no funcionaba.

**Solución**: Simplificar la consulta usando `rol_id` directamente:

```typescript
// Antes (no funcionaba)
const usuario = await Usuario.findOne({
  where: { id },
  include: [{ model: Rol, where: { nombre: 'psicologo' } }]
});

// Después (funciona correctamente)
const usuario = await Usuario.findOne({
  where: { 
    id,
    rol_id: 2 // ID del rol de psicólogo
  }
});
```

**Archivos modificados**:
- `backend/src/controladores/usuarios.controlador.ts`

## Resultados de las Pruebas

✅ **Avatar se guarda correctamente**: Verificado con scripts de prueba
✅ **Avatar persiste después de cerrar sesión**: Verificado con pruebas de login/logout
✅ **Avatar se carga correctamente al iniciar sesión**: Verificado con pruebas de carga de perfil
✅ **Avatares de robots funcionan**: Todas las URLs verificadas y funcionando
✅ **Actualización de perfil sin errores**: Sin errores 500

## Scripts de Prueba Creados

- `backend/scripts/test-avatar-save.js`: Prueba específica de guardado de avatares
- `backend/scripts/test-upload-image.js`: Prueba completa de subida de imagen y actualización
- `backend/scripts/test-update-profile.js`: Prueba solo de actualización de perfil
- `backend/scripts/test-avatars.js`: Prueba de URLs de avatares

## Verificación

Para verificar que todo funciona:

1. **Backend**: `node scripts/test-avatar-save.js`
2. **Frontend**: Navegar a la vista de psicólogo y:
   - Seleccionar un avatar de robot
   - Hacer clic en "Actualizar Perfil"
   - Verificar que el avatar se mantiene
   - Cerrar sesión y volver a entrar
   - Verificar que el avatar persiste

## Notas Importantes

- Los avatares de robots ahora usan URLs simplificadas de DiceBear
- El sistema mantiene compatibilidad con fotos reales y avatares de robots
- El avatar se guarda correctamente en la primera actualización
- El avatar persiste después de cerrar y volver a iniciar sesión
- Se mantienen los logs de error para debugging 
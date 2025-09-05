# Solución: Problemas con Fotos y Avatares en Vista de Psicólogo

## Problemas Identificados

1. **Error 500 al subir fotos**: El servidor devolvía error interno al intentar actualizar el perfil del psicólogo
2. **Avatares no cargan**: Los avatares de robots no se mostraban en el frontend

## Soluciones Implementadas

### 1. Corrección del Error 500 en Actualización de Perfil

**Problema**: La consulta de base de datos usaba un `include` con `where` que no funcionaba correctamente.

**Solución**: Simplificar la consulta para verificar el rol usando `rol_id` directamente:

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

### 2. Corrección de URLs de Avatares

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

### 3. Verificación de Campos en Modelo

**Problema**: Los campos `especialidad` y `descripcion` estaban definidos en la interfaz pero no en el modelo.

**Solución**: Agregar los campos faltantes al modelo:

```typescript
especialidad: {
  type: DataTypes.TEXT,
  allowNull: true,
},
descripcion: {
  type: DataTypes.TEXT,
  allowNull: true,
},
```

**Archivos modificados**:
- `backend/src/modelos/Usuario.ts`

## Resultados

✅ **Subida de fotos**: Ahora funciona correctamente
✅ **Actualización de perfil**: Sin errores 500
✅ **Avatares de robots**: Todos cargan correctamente
✅ **Campos especialidad y descripción**: Funcionan correctamente

## Scripts de Prueba Creados

- `backend/scripts/test-upload-image.js`: Prueba completa de subida de imagen y actualización
- `backend/scripts/test-update-profile.js`: Prueba solo de actualización de perfil
- `backend/scripts/test-avatars.js`: Prueba de URLs de avatares

## Verificación

Para verificar que todo funciona:

1. **Backend**: `node scripts/test-upload-image.js`
2. **Avatares**: `node scripts/test-avatars.js`
3. **Frontend**: Navegar a la vista de psicólogo y probar subir foto y seleccionar avatares

## Notas Importantes

- Los avatares de robots ahora usan URLs simplificadas de DiceBear
- La subida de imágenes se convierte a base64 y se guarda en la base de datos
- El sistema mantiene compatibilidad con fotos reales y avatares de robots
- Se mantienen los logs de error para debugging pero se removieron los logs de debug 
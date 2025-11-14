# Guía de Testing - Centro Terapéutico Psyche

Esta guía explica cómo escribir y ejecutar tests en el proyecto.

## Estructura de Tests

Los tests están organizados en la carpeta `src/__tests__/` siguiendo la misma estructura del código fuente:

```
src/__tests__/
├── controladores/
│   ├── autenticacion.controlador.test.ts
│   ├── autenticacion.funcional.test.ts
│   └── usuarios.controlador.test.ts
├── middleware/
│   └── auth.middleware.test.ts
├── modelos/
│   └── Usuario.test.ts
├── servicios/
│   └── recordatorios-tareas.service.test.ts
├── utilidades/
│   ├── email.service.test.ts
│   └── respuestas.test.ts
├── helpers/
│   └── app.helper.ts
└── setup.ts
```

## Configuración

### Jest

El proyecto usa Jest con TypeScript. La configuración está en `jest.config.js`.

### Variables de Entorno

Los tests usan variables de entorno de test. Crea un archivo `.env.test` en la raíz del backend (no se sube al repositorio).

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests en modo watch
```bash
npm run test:watch
```

### Tests con cobertura
```bash
npm run test:coverage
```

### Tests en CI
```bash
npm run test:ci
```

## Escribir Nuevos Tests

### Tests Unitarios

Los tests unitarios prueban funciones o métodos de forma aislada, usando mocks para dependencias externas.

**Ejemplo:**
```typescript
import { ManejadorRespuestas } from '../../utilidades/respuestas';

describe('ManejadorRespuestas', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('debe enviar respuesta exitosa', () => {
    ManejadorRespuestas.exito(mockResponse as Response, 'Operación exitosa');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
```

### Tests Funcionales

Los tests funcionales prueban endpoints completos usando Supertest.

**Ejemplo:**
```typescript
import request from 'supertest';
import express from 'express';
import autenticacionRoutes from '../../rutas/autenticacion.routes';

describe('POST /api/v1/autenticacion/login', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/autenticacion', autenticacionRoutes);
  });

  it('debe iniciar sesión exitosamente', async () => {
    const response = await request(app)
      .post('/api/v1/autenticacion/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Mocking

### Mock de Base de Datos

```typescript
jest.mock('../../configuracion/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));
```

### Mock de Modelos

```typescript
jest.mock('../../modelos/Usuario', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
}));
```

### Mock de Utilidades

```typescript
jest.mock('../../utilidades/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
```

## Mejores Prácticas

1. **Aislar tests**: Cada test debe ser independiente y no depender de otros tests.

2. **Usar mocks**: Mockea dependencias externas (BD, APIs, servicios externos).

3. **Nombres descriptivos**: Usa nombres claros que describan qué se está probando.

4. **Arrange-Act-Assert**: Organiza tus tests en estas tres secciones.

5. **Cobertura mínima**: Apunta a 60-70% de cobertura inicial, priorizando módulos críticos.

6. **Tests rápidos**: Los tests deben ejecutarse rápidamente. Evita operaciones lentas.

## Cobertura de Código

El objetivo inicial es alcanzar 60-70% de cobertura, priorizando:
- Módulos de autenticación y usuarios (crítico)
- Middleware de seguridad
- Controladores principales
- Utilidades compartidas

Para ver el reporte de cobertura:
```bash
npm run test:coverage
```

El reporte se genera en `coverage/` y puedes abrir `coverage/index.html` en el navegador.

## Troubleshooting

### Tests fallan por variables de entorno
Asegúrate de tener un archivo `.env.test` con las configuraciones necesarias.

### Tests fallan por conexión a BD
Los tests deben usar mocks de la base de datos. No deben conectarse a una BD real.

### Tests lentos
Revisa que estés usando mocks correctamente y no haciendo llamadas reales a servicios externos.

## Recursos

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing TypeScript con Jest](https://jestjs.io/docs/getting-started#using-typescript)


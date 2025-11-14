import request from 'supertest';
import express, { Express } from 'express';
import autenticacionRoutes from '../../rutas/autenticacion.routes';
import sequelize from '../../configuracion/database';
import bcrypt from 'bcryptjs';

// Mock de sequelize
jest.mock('../../configuracion/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

// Mock de logger
jest.mock('../../utilidades/logger', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de AuditoriaService
jest.mock('../../utilidades/auditoria.service', () => ({
  AuditoriaService: {
    crearLog: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock de mensajes
jest.mock('../../utilidades/mensajes', () => ({
  MENSAJES_AUTH: {
    LOGIN_EXITOSO: 'Inicio de sesión exitoso',
  },
}));

describe('Tests Funcionales - Autenticación', () => {
  let app: Express;
  const JWT_SECRET = 'test_secret_key';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    app = express();
    app.use(express.json());
    app.use('/api/v1/autenticacion', autenticacionRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/autenticacion/login', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 12);
      const mockUsuario = {
        id: '123',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        telefono: '123456789',
        password_hash: passwordHash,
        activo: true,
        rol_id: 1,
        rol_nombre: 'admin',
      };

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([mockUsuario]) // Query de login
        .mockResolvedValueOnce(undefined); // Update de último acceso

      const response = await request(app)
        .post('/api/v1/autenticacion/login')
        .send({
          email: 'test@example.com',
          password: password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usuario');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.usuario.email).toBe('test@example.com');
    });

    it('debe rechazar login con credenciales inválidas', async () => {
      (sequelize.query as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/v1/autenticacion/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe rechazar login sin email o contraseña', async () => {
      const response = await request(app)
        .post('/api/v1/autenticacion/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/autenticacion/registro', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([]) // Verificar si existe
        .mockResolvedValueOnce([{ id: 'new-user-id' }]); // Insertar usuario

      const response = await request(app)
        .post('/api/v1/autenticacion/registro')
        .send({
          nombres: 'Nuevo',
          apellidos: 'Usuario',
          email: 'nuevo@example.com',
          password: 'password123',
          telefono: '123456789',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debe rechazar registro con email duplicado', async () => {
      (sequelize.query as jest.Mock).mockResolvedValueOnce([{ id: 'existing-id' }]);

      const response = await request(app)
        .post('/api/v1/autenticacion/registro')
        .send({
          nombres: 'Nuevo',
          apellidos: 'Usuario',
          email: 'existente@example.com',
          password: 'password123',
          telefono: '123456789',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/autenticacion/logout', () => {
    it('debe cerrar sesión exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/autenticacion/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/autenticacion/perfil', () => {
    it('debe requerir autenticación para obtener perfil', async () => {
      const response = await request(app)
        .get('/api/v1/autenticacion/perfil');

      // Debe retornar 401 porque no hay token
      expect(response.status).toBe(401);
    });

    it('debe obtener perfil con token válido', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        {
          id: '123',
          email: 'test@example.com',
          rol_id: 1,
          nombres: 'Test',
          apellidos: 'User',
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const mockUsuario = {
        id: '123',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        telefono: '123456789',
        rol: 'admin',
      };

      (sequelize.query as jest.Mock).mockResolvedValueOnce([mockUsuario]);

      const response = await request(app)
        .get('/api/v1/autenticacion/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('usuario');
    });
  });
});


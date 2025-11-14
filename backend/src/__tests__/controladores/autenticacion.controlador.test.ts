import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { iniciarSesion, registrar, cerrarSesion, obtenerPerfil } from '../../controladores/autenticacion.controlador';
import sequelize from '../../configuracion/database';
import { ManejadorRespuestas } from '../../utilidades/respuestas';
import { AuditoriaService } from '../../utilidades/auditoria.service';

// Mock de sequelize
jest.mock('../../configuracion/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

// Mock de ManejadorRespuestas
jest.mock('../../utilidades/respuestas', () => ({
  ManejadorRespuestas: {
    exito: jest.fn((res, mensaje, data, codigo) => res.status(200).json({ success: true, mensaje, data, codigo })),
    errorValidacion: jest.fn((res, mensaje, errores, codigo) => res.status(400).json({ success: false, mensaje, errores, codigo })),
    noAutorizado: jest.fn((res, mensaje, codigo) => res.status(401).json({ success: false, mensaje, codigo })),
    prohibido: jest.fn((res, mensaje, codigo) => res.status(403).json({ success: false, mensaje, codigo })),
    conflicto: jest.fn((res, mensaje, codigo) => res.status(409).json({ success: false, mensaje, codigo })),
    errorInterno: jest.fn((res, mensaje, codigo) => res.status(500).json({ success: false, mensaje, codigo })),
    noEncontrado: jest.fn((res, mensaje, codigo) => res.status(404).json({ success: false, mensaje, codigo })),
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

describe('Controlador de Autenticación', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const JWT_SECRET = 'test_secret_key';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    mockRequest = {
      body: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('iniciarSesion', () => {
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

      (sequelize.query as jest.Mock).mockResolvedValueOnce([mockUsuario]);

      mockRequest.body = {
        email: 'test@example.com',
        password: password,
      };

      await iniciarSesion(mockRequest as Request, mockResponse as Response);

      expect(sequelize.query).toHaveBeenCalled();
      expect(ManejadorRespuestas.exito).toHaveBeenCalled();
      const exitoCall = (ManejadorRespuestas.exito as jest.Mock).mock.calls[0];
      expect(exitoCall[2]).toHaveProperty('usuario');
      expect(exitoCall[2]).toHaveProperty('token');
    });

    it('debe rechazar login con email inexistente', async () => {
      (sequelize.query as jest.Mock).mockResolvedValueOnce([]);

      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await iniciarSesion(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 12);
      const mockUsuario = {
        id: '123',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        password_hash: passwordHash,
        activo: true,
        rol_id: 1,
        rol_nombre: 'admin',
      };

      (sequelize.query as jest.Mock).mockResolvedValueOnce([mockUsuario]);

      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await iniciarSesion(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
    });

    it('debe rechazar login con cuenta inactiva', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 12);
      const mockUsuario = {
        id: '123',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        password_hash: passwordHash,
        activo: false,
        rol_id: 1,
        rol_nombre: 'admin',
      };

      (sequelize.query as jest.Mock).mockResolvedValueOnce([mockUsuario]);

      mockRequest.body = {
        email: 'test@example.com',
        password: password,
      };

      await iniciarSesion(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.prohibido).toHaveBeenCalled();
    });

    it('debe rechazar login sin email o contraseña', async () => {
      mockRequest.body = {};

      await iniciarSesion(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.errorValidacion).toHaveBeenCalled();
    });
  });

  describe('registrar', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([]) // Verificar si existe
        .mockResolvedValueOnce([{ id: 'new-user-id' }]); // Insertar usuario

      mockRequest.body = {
        nombres: 'Nuevo',
        apellidos: 'Usuario',
        email: 'nuevo@example.com',
        password: 'password123',
        telefono: '123456789',
      };

      await registrar(mockRequest as Request, mockResponse as Response);

      expect(sequelize.query).toHaveBeenCalledTimes(2);
      expect(ManejadorRespuestas.exito).toHaveBeenCalled();
    });

    it('debe rechazar registro con email ya existente', async () => {
      (sequelize.query as jest.Mock).mockResolvedValueOnce([{ id: 'existing-id' }]);

      mockRequest.body = {
        nombres: 'Nuevo',
        apellidos: 'Usuario',
        email: 'existente@example.com',
        password: 'password123',
        telefono: '123456789',
      };

      await registrar(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.conflicto).toHaveBeenCalled();
    });
  });

  describe('cerrarSesion', () => {
    it('debe cerrar sesión exitosamente', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'test@example.com',
        rol_id: 1,
        nombres: 'Test',
        apellidos: 'User',
      };

      await cerrarSesion(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.exito).toHaveBeenCalled();
      expect(AuditoriaService.crearLog).toHaveBeenCalled();
    });

    it('debe cerrar sesión sin usuario autenticado', async () => {
      delete (mockRequest as any).usuario;

      await cerrarSesion(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.exito).toHaveBeenCalled();
    });
  });

  describe('obtenerPerfil', () => {
    it('debe obtener perfil del usuario autenticado', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'test@example.com',
        rol_id: 1,
        nombres: 'Test',
        apellidos: 'User',
      };

      const mockUsuario = {
        id: '123',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        telefono: '123456789',
        rol: 'admin',
      };

      (sequelize.query as jest.Mock).mockResolvedValueOnce([mockUsuario]);

      await obtenerPerfil(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.exito).toHaveBeenCalled();
      const exitoCall = (ManejadorRespuestas.exito as jest.Mock).mock.calls[0];
      expect(exitoCall[2]).toHaveProperty('usuario');
    });

    it('debe rechazar obtener perfil sin usuario autenticado', async () => {
      delete (mockRequest as any).usuario;

      await obtenerPerfil(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
    });

    it('debe rechazar obtener perfil si usuario no existe en BD', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'test@example.com',
        rol_id: 1,
        nombres: 'Test',
        apellidos: 'User',
      };

      (sequelize.query as jest.Mock).mockResolvedValueOnce([]);

      await obtenerPerfil(mockRequest as Request, mockResponse as Response);

      expect(ManejadorRespuestas.noEncontrado).toHaveBeenCalled();
    });
  });
});


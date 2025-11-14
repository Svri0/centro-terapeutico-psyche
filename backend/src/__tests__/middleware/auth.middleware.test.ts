import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verificarToken, verificarAdmin, verificarPsicologo, verificarRol } from '../../middleware/auth.middleware';
import { ManejadorRespuestas } from '../../utilidades/respuestas';

// Mock de ManejadorRespuestas
jest.mock('../../utilidades/respuestas', () => ({
  ManejadorRespuestas: {
    noAutorizado: jest.fn((res, mensaje, codigo) => res.status(401).json({ success: false, mensaje, codigo })),
    prohibido: jest.fn((res, mensaje, codigo) => res.status(403).json({ success: false, mensaje, codigo })),
    errorInterno: jest.fn((res, mensaje, codigo) => res.status(500).json({ success: false, mensaje, codigo })),
  },
}));

// Mock de logger
jest.mock('../../utilidades/logger', () => ({
  log: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Middleware de Autenticación', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  const JWT_SECRET = 'test_secret_key';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('verificarToken', () => {
    it('debe permitir el acceso con un token válido', async () => {
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

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await verificarToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.usuario).toBeDefined();
      expect(mockRequest.usuario?.id).toBe('123');
      expect(mockRequest.usuario?.email).toBe('test@example.com');
    });

    it('debe rechazar el acceso sin token', async () => {
      mockRequest.headers = {};

      await verificarToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe rechazar el acceso con token inválido', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid_token',
      };

      await verificarToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe rechazar el acceso con token expirado', async () => {
      const expiredToken = jwt.sign(
        {
          id: '123',
          email: 'test@example.com',
          rol_id: 1,
        },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await verificarToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('verificarAdmin', () => {
    it('debe permitir el acceso a administradores', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'admin@example.com',
        rol_id: 1, // Admin
        nombres: 'Admin',
        apellidos: 'User',
      };

      await verificarAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debe rechazar el acceso a no administradores', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'user@example.com',
        rol_id: 2, // Psicólogo
        nombres: 'User',
        apellidos: 'Test',
      };

      await verificarAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.prohibido).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe rechazar el acceso sin usuario autenticado', async () => {
      delete (mockRequest as any).usuario;

      await verificarAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('verificarPsicologo', () => {
    it('debe permitir el acceso a psicólogos', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'psicologo@example.com',
        rol_id: 2, // Psicólogo
        nombres: 'Psicologo',
        apellidos: 'Test',
      };

      await verificarPsicologo(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debe rechazar el acceso a no psicólogos', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'user@example.com',
        rol_id: 4, // Paciente
        nombres: 'User',
        apellidos: 'Test',
      };

      await verificarPsicologo(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.prohibido).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('verificarRol', () => {
    it('debe permitir el acceso con rol permitido', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'admin@example.com',
        rol_id: 1, // Admin
        nombres: 'Admin',
        apellidos: 'User',
      };

      const middleware = verificarRol(['admin']);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debe rechazar el acceso con rol no permitido', async () => {
      mockRequest.usuario = {
        id: '123',
        email: 'user@example.com',
        rol_id: 4, // Paciente
        nombres: 'User',
        apellidos: 'Test',
      };

      const middleware = verificarRol(['admin', 'psicologo']);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.prohibido).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe rechazar el acceso sin usuario autenticado', async () => {
      delete (mockRequest as any).usuario;

      const middleware = verificarRol(['admin']);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ManejadorRespuestas.noAutorizado).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});


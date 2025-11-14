import { Request, Response } from 'express';
import { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, actualizarPerfilPsicologo } from '../../controladores/usuarios.controlador';
import { Usuario } from '../../modelos';

// Mock de modelos
jest.mock('../../modelos', () => ({
  Usuario: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Rol: {},
  Paciente: {},
}));

describe('Controlador de Usuarios', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('obtenerTodos', () => {
    it('debe retornar lista de usuarios', async () => {
      await obtenerTodos(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: 'Usuarios obtenidos exitosamente',
      });
    });
  });

  describe('obtenerPorId', () => {
    it('debe retornar usuario por ID', async () => {
      mockRequest.params = { id: '123' };

      await obtenerPorId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: 'Usuario 123 obtenido exitosamente',
      });
    });
  });

  describe('crear', () => {
    it('debe crear un nuevo usuario', async () => {
      await crear(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: 'Usuario creado exitosamente',
      });
    });
  });

  describe('actualizar', () => {
    it('debe actualizar un usuario existente', async () => {
      mockRequest.params = { id: '123' };

      await actualizar(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: 'Usuario 123 actualizado exitosamente',
      });
    });
  });

  describe('eliminar', () => {
    it('debe eliminar un usuario', async () => {
      mockRequest.params = { id: '123' };

      await eliminar(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        mensaje: 'Usuario 123 eliminado exitosamente',
      });
    });
  });

  describe('actualizarPerfilPsicologo', () => {
    it('debe actualizar perfil de psicólogo exitosamente', async () => {
      const mockUsuario = {
        id: '123',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        telefono: '123456789',
        especialidad: 'Psicología Clínica',
        descripcion: 'Descripción',
        avatar_url: 'http://example.com/avatar.jpg',
        rol_id: 2,
        update: jest.fn().mockResolvedValue(undefined),
      };

      (Usuario.findOne as jest.Mock).mockResolvedValue(mockUsuario);

      mockRequest.params = { id: '123' };
      mockRequest.body = {
        nombres: 'Nuevo',
        apellidos: 'Nombre',
        email: 'nuevo@example.com',
        telefono: '987654321',
        especialidad: 'Nueva Especialidad',
        descripcion: 'Nueva Descripción',
        avatar_url: 'http://example.com/new-avatar.jpg',
      };

      await actualizarPerfilPsicologo(mockRequest as Request, mockResponse as Response);

      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { id: '123', rol_id: 2 },
      });
      expect(mockUsuario.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Perfil actualizado exitosamente',
        })
      );
    });

    it('debe retornar error si psicólogo no existe', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '123' };
      mockRequest.body = {
        nombres: 'Nuevo',
        apellidos: 'Nombre',
      };

      await actualizarPerfilPsicologo(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Psicólogo no encontrado',
      });
    });

    it('debe retornar error si usuario no es psicólogo', async () => {
      (Usuario.findOne as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '123' };
      mockRequest.body = {
        nombres: 'Nuevo',
        apellidos: 'Nombre',
      };

      await actualizarPerfilPsicologo(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});


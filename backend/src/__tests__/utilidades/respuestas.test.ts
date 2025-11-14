import { Response } from 'express';
import { ManejadorRespuestas } from '../../utilidades/respuestas';

describe('ManejadorRespuestas', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('exito', () => {
    it('debe enviar respuesta exitosa con código 200', () => {
      const data = { id: '123', nombre: 'Test' };
      ManejadorRespuestas.exito(mockResponse as Response, 'Operación exitosa', data, 'SUCCESS_001');

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          mensaje: 'Operación exitosa',
          data,
          codigo: 'SUCCESS_001',
        })
      );
    });

    it('debe enviar respuesta exitosa sin código', () => {
      ManejadorRespuestas.exito(mockResponse as Response, 'Operación exitosa');

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          mensaje: 'Operación exitosa',
        })
      );
    });
  });

  describe('creado', () => {
    it('debe enviar respuesta de creación con código 201', () => {
      const data = { id: '123' };
      ManejadorRespuestas.creado(mockResponse as Response, 'Recurso creado', data, 'CREATED_001');

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          mensaje: 'Recurso creado',
          data,
          codigo: 'CREATED_001',
        })
      );
    });
  });

  describe('errorValidacion', () => {
    it('debe enviar respuesta de error de validación con código 400', () => {
      const errores = { email: 'Email inválido' };
      ManejadorRespuestas.errorValidacion(mockResponse as Response, 'Error de validación', errores, 'VALID_001');

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'Error de validación',
          error: 'Error de validación',
          data: errores,
          codigo: 'VALID_001',
        })
      );
    });
  });

  describe('noAutorizado', () => {
    it('debe enviar respuesta de no autorizado con código 401', () => {
      ManejadorRespuestas.noAutorizado(mockResponse as Response, 'No autorizado', 'AUTH_001');

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'No autorizado',
          error: 'No autorizado',
          codigo: 'AUTH_001',
        })
      );
    });
  });

  describe('prohibido', () => {
    it('debe enviar respuesta de prohibido con código 403', () => {
      ManejadorRespuestas.prohibido(mockResponse as Response, 'Acceso prohibido', 'FORBIDDEN_001');

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'Acceso prohibido',
          error: 'Acceso prohibido',
          codigo: 'FORBIDDEN_001',
        })
      );
    });
  });

  describe('noEncontrado', () => {
    it('debe enviar respuesta de no encontrado con código 404', () => {
      ManejadorRespuestas.noEncontrado(mockResponse as Response, 'Recurso no encontrado', 'NOT_FOUND_001');

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'Recurso no encontrado',
          error: 'Recurso no encontrado',
          codigo: 'NOT_FOUND_001',
        })
      );
    });
  });

  describe('conflicto', () => {
    it('debe enviar respuesta de conflicto con código 409', () => {
      const datos = { email: 'Email ya existe' };
      ManejadorRespuestas.conflicto(mockResponse as Response, 'Conflicto', datos, 'CONFLICT_001');

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'Conflicto',
          error: 'Conflicto',
          data: datos,
          codigo: 'CONFLICT_001',
        })
      );
    });
  });

  describe('errorInterno', () => {
    it('debe enviar respuesta de error interno con código 500', () => {
      ManejadorRespuestas.errorInterno(mockResponse as Response, 'Error interno del servidor', 'ERROR_001');

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'Error interno del servidor',
          error: 'Error interno del servidor',
          codigo: 'ERROR_001',
        })
      );
    });
  });

  describe('personalizado', () => {
    it('debe enviar respuesta personalizada con código de estado específico', () => {
      const data = { custom: 'data' };
      ManejadorRespuestas.personalizado(mockResponse as Response, 418, 'Soy una tetera', data, true, 'CUSTOM_001');

      expect(mockResponse.status).toHaveBeenCalledWith(418);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          mensaje: 'Soy una tetera',
          data,
          codigo: 'CUSTOM_001',
        })
      );
    });

    it('debe enviar respuesta personalizada con success false', () => {
      ManejadorRespuestas.personalizado(mockResponse as Response, 400, 'Error personalizado', undefined, false, 'CUSTOM_002');

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          mensaje: 'Error personalizado',
          error: 'Error personalizado',
          codigo: 'CUSTOM_002',
        })
      );
    });
  });
});


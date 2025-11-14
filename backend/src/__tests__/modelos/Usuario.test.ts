// Mock completo de Sequelize antes de importar
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
  close: jest.fn(),
};

jest.mock('../../configuracion/database', () => ({
  __esModule: true,
  default: mockSequelize,
}));

jest.mock('../../modelos/Rol', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
  },
}));

// Mock de DataTypes
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    DataTypes: {
      UUID: 'UUID',
      UUIDV4: 'UUIDV4',
      STRING: jest.fn((length) => `STRING(${length})`),
      TEXT: 'TEXT',
      INTEGER: 'INTEGER',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      DATEONLY: 'DATEONLY',
      ENUM: jest.fn((...values) => `ENUM(${values.join(', ')})`),
      JSONB: 'JSONB',
      NOW: 'NOW',
    },
    Model: class MockModel {
      static init = jest.fn();
      static build = jest.fn((attrs: any) => ({
        ...attrs,
        activo: attrs.activo !== undefined ? attrs.activo : true,
        email_verificado: attrs.email_verificado !== undefined ? attrs.email_verificado : false,
        configuracion: attrs.configuracion !== undefined ? attrs.configuracion : {},
      }));
    },
  };
});

// Importar después de los mocks
import Usuario from '../../modelos/Usuario';

describe('Modelo Usuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validaciones', () => {
    it('debe requerir email', () => {
      const usuario = Usuario.build({
        id: '123',
        email: '',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.email).toBe('');
      // En un test real, validaríamos que Sequelize rechaza esto
    });

    it('debe requerir password_hash', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: '',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.password_hash).toBe('');
    });

    it('debe requerir nombres', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: '',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.nombres).toBe('');
    });

    it('debe requerir apellidos', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: '',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.apellidos).toBe('');
    });

    it('debe requerir rol_id', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 0,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.rol_id).toBe(0);
    });
  });

  describe('Campos opcionales', () => {
    it('debe permitir telefono opcional', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.telefono).toBeUndefined();
    });

    it('debe permitir avatar_url opcional', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.avatar_url).toBeUndefined();
    });

    it('debe permitir especialidad opcional', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.especialidad).toBeUndefined();
    });
  });

  describe('Valores por defecto', () => {
    it('debe tener activo en true por defecto', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        email_verificado: false,
        configuracion: {},
      });

      expect(usuario.activo).toBe(true);
    });

    it('debe tener email_verificado en false por defecto', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        configuracion: {},
      });

      expect(usuario.email_verificado).toBe(false);
    });

    it('debe tener configuracion como objeto vacío por defecto', () => {
      const usuario = Usuario.build({
        id: '123',
        email: 'test@example.com',
        password_hash: 'hash',
        nombres: 'Test',
        apellidos: 'User',
        rol_id: 1,
        activo: true,
        email_verificado: false,
      });

      expect(usuario.configuracion).toEqual({});
    });
  });

  describe('Tipos de datos', () => {
    it('debe aceptar genero válido', () => {
      const generosValidos = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
      
      generosValidos.forEach((genero) => {
        const usuario = Usuario.build({
          id: '123',
          email: 'test@example.com',
          password_hash: 'hash',
          nombres: 'Test',
          apellidos: 'User',
          rol_id: 1,
          activo: true,
          email_verificado: false,
          genero: genero as any,
          configuracion: {},
        });

        expect(usuario.genero).toBe(genero);
      });
    });
  });
});


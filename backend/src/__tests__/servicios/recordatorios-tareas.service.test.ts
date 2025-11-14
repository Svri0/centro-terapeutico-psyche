import { RecordatoriosTareasService } from '../../servicios/recordatorios-tareas.service';
import Tarea from '../../modelos/Tarea';
import Paciente from '../../modelos/Paciente';
import { enviarEmailRecordatorioTareas } from '../../utilidades/email.service';

// Mock de modelos
jest.mock('../../modelos/Tarea', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../modelos/Paciente', () => ({
  __esModule: true,
  default: {},
}));

// Mock de email service
jest.mock('../../utilidades/email.service', () => ({
  enviarEmailRecordatorioTareas: jest.fn(),
}));

// Mock de logger
jest.mock('../../utilidades/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RecordatoriosTareasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enviarRecordatoriosTareas', () => {
    it('debe retornar estadísticas vacías cuando no hay tareas pendientes', async () => {
      (Tarea.findAll as jest.Mock).mockResolvedValue([]);

      const resultado = await RecordatoriosTareasService.enviarRecordatoriosTareas();

      expect(resultado).toEqual({
        exitosos: 0,
        fallidos: 0,
        pacientesNotificados: 0,
        totalTareas: 0,
      });
    });

    it('debe enviar recordatorios cuando hay tareas pendientes', async () => {
      const mockPaciente = {
        id: 'paciente-1',
        nombres: 'Test',
        apellidos: 'Paciente',
        email: 'test@example.com',
        estado: 'activo',
      };

      const mockTarea = {
        id: 'tarea-1',
        paciente_id: 'paciente-1',
        estado: 'pendiente',
        es_borrador: false,
        paciente: mockPaciente,
      };

      (Tarea.findAll as jest.Mock).mockResolvedValue([mockTarea]);
      (enviarEmailRecordatorioTareas as jest.Mock).mockResolvedValue(true);

      const resultado = await RecordatoriosTareasService.enviarRecordatoriosTareas();

      expect(Tarea.findAll).toHaveBeenCalled();
      expect(enviarEmailRecordatorioTareas).toHaveBeenCalled();
      expect(resultado.totalTareas).toBeGreaterThan(0);
    });

    it('debe manejar errores al enviar recordatorios', async () => {
      const mockPaciente = {
        id: 'paciente-1',
        nombres: 'Test',
        apellidos: 'Paciente',
        email: 'test@example.com',
        estado: 'activo',
      };

      const mockTarea = {
        id: 'tarea-1',
        paciente_id: 'paciente-1',
        estado: 'pendiente',
        es_borrador: false,
        paciente: mockPaciente,
      };

      (Tarea.findAll as jest.Mock).mockResolvedValue([mockTarea]);
      (enviarEmailRecordatorioTareas as jest.Mock).mockRejectedValue(new Error('Error al enviar email'));

      const resultado = await RecordatoriosTareasService.enviarRecordatoriosTareas();

      expect(resultado.fallidos).toBeGreaterThan(0);
    });
  });
});


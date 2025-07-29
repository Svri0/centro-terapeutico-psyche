// Controlador de pacientes
import { Request, Response } from 'express';
import { MENSAJES_PACIENTES } from '../utilidades/mensajes';
import { ManejadorRespuestas } from '../utilidades/respuestas';

export const obtenerTodos = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica real para obtener pacientes desde la base de datos
    const pacientesSimulados = [
      {
        id: 1,
        nombre: 'María González',
        email: 'maria.gonzalez@email.com',
        edad: 28,
        telefono: '+56987654321',
        fechaRegistro: '2024-01-15',
        psicologoAsignado: 'Dr. Juan Pérez',
        estado: 'activo',
        proximaCita: '2024-01-30T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        edad: 35,
        telefono: '+56912345678',
        fechaRegistro: '2024-01-10',
        psicologoAsignado: 'Dra. Ana López',
        estado: 'activo',
        proximaCita: '2024-01-29T14:30:00Z'
      }
    ];

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.LISTA_OBTENIDA,
      {
        pacientes: pacientesSimulados,
        total: pacientesSimulados.length,
        activos: pacientesSimulados.filter(p => p.estado === 'activo').length
      },
      'PAC_001'
    );
  } catch (error) {
    console.error('Error en obtenerTodos:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener la lista de pacientes',
      'PAC_002'
    );
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const { nombre, email, edad, telefono, psicologoId } = req.body;

    // Validar datos requeridos
    if (!nombre || !email) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombre y email son requeridos',
        { camposRequeridos: ['nombre', 'email'] },
        'PAC_003'
      );
    }

    // TODO: Implementar lógica real de creación de paciente
    const nuevoPaciente = {
      id: 3,
      nombre,
      email,
      edad: edad || null,
      telefono: telefono || null,
      fechaRegistro: new Date().toISOString(),
      psicologoAsignado: psicologoId ? 'Dr. Juan Pérez' : null,
      estado: 'activo',
      puntosGamificacion: 0
    };

    return ManejadorRespuestas.creado(
      res,
      MENSAJES_PACIENTES.PACIENTE_CREADO,
      nuevoPaciente,
      'PAC_004'
    );
  } catch (error) {
    console.error('Error en crear:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al crear el paciente', 'PAC_005');
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente inválido',
        { idRecibido: id },
        'PAC_006'
      );
    }

    // TODO: Implementar búsqueda real en la base de datos
    const pacienteSimulado = {
      id: Number(id),
      nombre: 'María González',
      email: 'maria.gonzalez@email.com',
      edad: 28,
      telefono: '+56987654321',
      fechaRegistro: '2024-01-15',
      psicologoAsignado: 'Dr. Juan Pérez',
      estado: 'activo',
      puntosGamificacion: 150,
      nivel: 3,
      sesionesCompletadas: 8,
      tareasAsignadas: 12,
      tareasCompletadas: 9,
      ultimaActividad: new Date().toISOString()
    };

    return ManejadorRespuestas.exito(
      res,
      'Información del paciente obtenida exitosamente',
      pacienteSimulado,
      'PAC_007'
    );
  } catch (error) {
    console.error('Error en obtenerPorId:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener el paciente', 'PAC_008');
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, edad } = req.body;

    if (!id || isNaN(Number(id))) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente inválido',
        { idRecibido: id },
        'PAC_009'
      );
    }

    // TODO: Implementar actualización real en la base de datos
    const pacienteActualizado = {
      id: Number(id),
      nombre: nombre || 'María González',
      email: email || 'maria.gonzalez@email.com',
      telefono: telefono || '+56987654321',
      edad: edad || 28,
      fechaActualizacion: new Date().toISOString()
    };

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.PACIENTE_ACTUALIZADO,
      pacienteActualizado,
      'PAC_010'
    );
  } catch (error) {
    console.error('Error en actualizar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar el paciente',
      'PAC_011'
    );
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente inválido',
        { idRecibido: id },
        'PAC_012'
      );
    }

    // TODO: Implementar eliminación real (soft delete) en la base de datos

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.PACIENTE_ELIMINADO,
      {
        pacienteId: Number(id),
        fechaEliminacion: new Date().toISOString()
      },
      'PAC_013'
    );
  } catch (error) {
    console.error('Error en eliminar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al eliminar el paciente',
      'PAC_014'
    );
  }
};

export const asignarPsicologo = async (req: Request, res: Response) => {
  try {
    const { pacienteId } = req.params;
    const { psicologoId } = req.body;

    if (!pacienteId || !psicologoId) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID del paciente y psicólogo son requeridos',
        { camposRequeridos: ['pacienteId', 'psicologoId'] },
        'PAC_015'
      );
    }

    // TODO: Implementar asignación real en la base de datos
    const asignacion = {
      pacienteId: Number(pacienteId),
      psicologoId: Number(psicologoId),
      psicologoNombre: 'Dr. Juan Pérez',
      fechaAsignacion: new Date().toISOString()
    };

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.ASIGNACION_EXITOSA,
      asignacion,
      'PAC_016'
    );
  } catch (error) {
    console.error('Error en asignarPsicologo:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al asignar psicólogo', 'PAC_017');
  }
};

export const obtenerHistorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente inválido',
        { idRecibido: id },
        'PAC_018'
      );
    }

    // TODO: Implementar obtención real del historial
    const historialSimulado = {
      pacienteId: Number(id),
      sesiones: [
        {
          id: 1,
          fecha: '2024-01-20T10:00:00Z',
          tipo: 'Evaluación inicial',
          duración: 60,
          notas: 'Primera sesión, establecimiento de rapport'
        },
        {
          id: 2,
          fecha: '2024-01-27T10:00:00Z',
          tipo: 'Terapia cognitivo-conductual',
          duración: 50,
          notas: 'Trabajo en técnicas de relajación'
        }
      ],
      tareas: [
        {
          id: 1,
          titulo: 'Diario de emociones',
          fechaAsignacion: '2024-01-20',
          estado: 'completada',
          puntos: 50
        }
      ],
      progreso: {
        sesionesCompletadas: 8,
        tareasCompletadas: 9,
        puntosTotal: 450,
        nivelActual: 3
      }
    };

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.HISTORIAL_OBTENIDO,
      historialSimulado,
      'PAC_019'
    );
  } catch (error) {
    console.error('Error en obtenerHistorial:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener el historial',
      'PAC_020'
    );
  }
};

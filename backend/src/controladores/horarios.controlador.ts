import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';

// Obtener especialidades disponibles
export const obtenerEspecialidades = async (_req: Request, res: Response) => {
  try {
    const especialidades = [
      'Psicología Clínica',
      'Psicología Infantil',
      'Psicología de Pareja',
      'Psicología Laboral',
      'Psicología Forense',
      'Neuropsicología',
      'Psicología Deportiva',
      'Psicología Educacional'
    ];

    return ManejadorRespuestas.exito(
      res,
      'Especialidades obtenidas exitosamente',
      especialidades,
      'HORARIOS_001'
    );
  } catch (error) {
    log.error('Error en obtenerEspecialidades:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener especialidades',
      'HORARIOS_002'
    );
  }
};

// Obtener horarios por especialidad
export const obtenerHorariosPorEspecialidad = async (req: Request, res: Response) => {
  try {
    const { especialidad } = req.params;

    if (!especialidad) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Especialidad es requerida',
        null,
        'HORARIOS_003'
      );
    }

    // Generar horario de ejemplo para la especialidad
    const horarioEjemplo = generarHorarioEjemplo(especialidad);

    return ManejadorRespuestas.exito(
      res,
      'Horarios obtenidos exitosamente',
      horarioEjemplo,
      'HORARIOS_004'
    );

  } catch (error) {
    log.error('Error en obtenerHorariosPorEspecialidad:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener horarios',
      'HORARIOS_005'
    );
  }
};

// Función para generar horario de ejemplo
const generarHorarioEjemplo = (especialidad: string) => {
  const horarioSemanal = [
    { hora: '08:00', lunes: 'Dr. García', martes: 'Dra. López', miercoles: 'Dr. Martínez', jueves: 'Dra. Rodríguez', viernes: 'Dr. Pérez', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '09:00', lunes: 'Dr. García', martes: 'Dra. López', miercoles: 'Dr. Martínez', jueves: 'Dra. Rodríguez', viernes: 'Dr. Pérez', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '10:00', lunes: 'Dr. García', martes: 'Dra. López', miercoles: 'Dr. Martínez', jueves: 'Dra. Rodríguez', viernes: 'Dr. Pérez', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '11:00', lunes: 'Dr. García', martes: 'Dra. López', miercoles: 'Dr. Martínez', jueves: 'Dra. Rodríguez', viernes: 'Dr. Pérez', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '12:00', lunes: 'Almuerzo', martes: 'Almuerzo', miercoles: 'Almuerzo', jueves: 'Almuerzo', viernes: 'Almuerzo', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '13:00', lunes: 'Almuerzo', martes: 'Almuerzo', miercoles: 'Almuerzo', jueves: 'Almuerzo', viernes: 'Almuerzo', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '14:00', lunes: 'Dra. Silva', martes: 'Dr. Torres', miercoles: 'Dra. Vargas', jueves: 'Dr. Morales', viernes: 'Dra. Herrera', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '15:00', lunes: 'Dra. Silva', martes: 'Dr. Torres', miercoles: 'Dra. Vargas', jueves: 'Dr. Morales', viernes: 'Dra. Herrera', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '16:00', lunes: 'Dra. Silva', martes: 'Dr. Torres', miercoles: 'Dra. Vargas', jueves: 'Dr. Morales', viernes: 'Dra. Herrera', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '17:00', lunes: 'Dra. Silva', martes: 'Dr. Torres', miercoles: 'Dra. Vargas', jueves: 'Dr. Morales', viernes: 'Dra. Herrera', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '18:00', lunes: 'Dr. Castro', martes: 'Dra. Ruiz', miercoles: 'Dr. Jiménez', jueves: 'Dra. Moreno', viernes: 'Dr. Díaz', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '19:00', lunes: 'Dr. Castro', martes: 'Dra. Ruiz', miercoles: 'Dr. Jiménez', jueves: 'Dra. Moreno', viernes: 'Dr. Díaz', sabado: 'Cerrado', domingo: 'Cerrado' },
    { hora: '20:00', lunes: 'Dr. Castro', martes: 'Dra. Ruiz', miercoles: 'Dr. Jiménez', jueves: 'Dra. Moreno', viernes: 'Dr. Díaz', sabado: 'Cerrado', domingo: 'Cerrado' }
  ];

  return {
    especialidad,
    horario: horarioSemanal,
    tipo: 'ejemplo'
  };
};

// Obtener todos los horarios disponibles
export const obtenerTodosLosHorarios = async (_req: Request, res: Response) => {
  try {
    const especialidades = [
      'Psicología Clínica',
      'Psicología Infantil',
      'Psicología de Pareja',
      'Psicología Laboral',
      'Psicología Forense',
      'Neuropsicología',
      'Psicología Deportiva',
      'Psicología Educacional'
    ];

    const horariosCompletos = especialidades.map(especialidad => 
      generarHorarioEjemplo(especialidad)
    );

    return ManejadorRespuestas.exito(
      res,
      'Todos los horarios obtenidos exitosamente',
      horariosCompletos,
      'HORARIOS_006'
    );
  } catch (error) {
    log.error('Error en obtenerTodosLosHorarios:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener todos los horarios',
      'HORARIOS_007'
    );
  }
}; 
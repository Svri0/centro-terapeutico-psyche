import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Usuario, Paciente } from '../modelos';
import { ManejadorRespuestas } from '../utilidades/respuestas';

class ChatUnificadoController {
  // Obtener psicólogos disponibles para chat
  obtenerPsicologos = async (req: Request, res: Response) => {
    try {
      console.log('🔍 ChatUnificado - obtenerPsicologos - método llamado');
      
      const userId = req.usuario?.id;
      const userRole = req.usuario?.rol_id;
      
      console.log('🔍 ChatUnificado - userId:', userId, 'userRole:', userRole);
      
      if (!userId) {
        return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado');
      }

      // Obtener psicólogos activos
      const psicologos = await Usuario.findAll({
        where: {
          rol_id: 2, // Psicólogos
          activo: true
        },
        attributes: [
          'id',
          'nombres',
          'apellidos',
          'email',
          'telefono',
          'especialidad',
          'codigo_sbs'
        ],
        order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
      });

      // Formatear respuesta
      const psicologosFormateados = psicologos.map(psicologo => ({
        id: psicologo.id,
        nombres: psicologo.nombres,
        apellidos: psicologo.apellidos,
        email: psicologo.email,
        telefono: psicologo.telefono,
        especialidad: psicologo.especialidad,
        numeroColegiado: psicologo.codigo_sbs,
        estado: true
      }));

      console.log('🔍 ChatUnificado - psicólogos encontrados:', psicologosFormateados.length);

      return ManejadorRespuestas.exito(res, 'Psicólogos obtenidos correctamente', psicologosFormateados);
    } catch (error) {
      console.error('Error en obtenerPsicologos:', error);
      return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener psicólogos');
    }
  };

  // Obtener pacientes disponibles para chat
  obtenerPacientes = async (req: Request, res: Response) => {
    try {
      console.log('🔍 ChatUnificado - obtenerPacientes - método llamado');
      
      const userId = req.usuario?.id;
      const userRole = req.usuario?.rol_id;
      
      console.log('🔍 ChatUnificado - userId:', userId, 'userRole:', userRole);
      
      if (!userId) {
        return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado');
      }

      let pacientes: any[] = [];

      // Si es psicólogo, obtener solo sus pacientes
      if (userRole === 2) {
        console.log('🔍 ChatUnificado - Buscando pacientes del psicólogo:', userId);
        
        pacientes = await Paciente.findAll({
          where: {
            psicologo_id: userId,
            estado: 'activo'
          },
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombres', 'apellidos', 'email', 'telefono'],
            where: {
              activo: true
            },
            required: false
          }],
          attributes: [
            'id',
            'numero_ficha',
            'rut',
            'estado',
            'fecha_ingreso'
          ]
        });
      } else {
        // Para otros roles (admin, recepcionista), obtener todos los pacientes
        console.log('🔍 ChatUnificado - Buscando todos los pacientes');
        
        pacientes = await Paciente.findAll({
          where: {
            estado: 'activo'
          },
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombres', 'apellidos', 'email', 'telefono'],
            where: {
              activo: true
            },
            required: false
          }],
          attributes: [
            'id',
            'numero_ficha',
            'rut',
            'estado',
            'fecha_ingreso'
          ]
        });
      }

      // Formatear respuesta
      const pacientesFormateados = pacientes.map(paciente => ({
        id: paciente.id,
        nombres: paciente.usuario?.nombres || '',
        apellidos: paciente.usuario?.apellidos || '',
        email: paciente.usuario?.email || '',
        telefono: paciente.usuario?.telefono || '',
        numero_ficha: paciente.numero_ficha,
        rut: paciente.rut,
        estado: paciente.estado,
        fecha_ingreso: paciente.fecha_ingreso
      }));

      console.log('🔍 ChatUnificado - pacientes encontrados:', pacientesFormateados.length);

      return ManejadorRespuestas.exito(res, 'Pacientes obtenidos correctamente', pacientesFormateados);
    } catch (error) {
      console.error('Error en obtenerPacientes:', error);
      return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener pacientes');
    }
  };

  // Obtener recepcionistas disponibles para chat
  obtenerRecepcionistas = async (req: Request, res: Response) => {
    try {
      console.log('🔍 ChatUnificado - obtenerRecepcionistas - método llamado');
      
      const userId = req.usuario?.id;
      const userRole = req.usuario?.rol_id;
      
      console.log('🔍 ChatUnificado - userId:', userId, 'userRole:', userRole);
      
      if (!userId) {
        return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado');
      }

      // Obtener recepcionistas activos
      const recepcionistas = await Usuario.findAll({
        where: {
          rol_id: 4, // Recepcionistas
          activo: true
        },
        attributes: [
          'id',
          'nombres',
          'apellidos',
          'email',
          'telefono'
        ],
        order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
      });

      // Formatear respuesta
      const recepcionistasFormateados = recepcionistas.map(recepcionista => ({
        id: recepcionista.id,
        nombres: recepcionista.nombres,
        apellidos: recepcionista.apellidos,
        email: recepcionista.email,
        telefono: recepcionista.telefono,
        estado: true
      }));

      console.log('🔍 ChatUnificado - recepcionistas encontrados:', recepcionistasFormateados.length);

      return ManejadorRespuestas.exito(res, 'Recepcionistas obtenidos correctamente', recepcionistasFormateados);
    } catch (error) {
      console.error('Error en obtenerRecepcionistas:', error);
      return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener recepcionistas');
    }
  };
}

export default new ChatUnificadoController();
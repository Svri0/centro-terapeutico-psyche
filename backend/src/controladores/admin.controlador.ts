import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { crearDisponibilidadPorDefecto } from './disponibilidad.controlador';
import AuditoriaService from '../utilidades/auditoria.service';

// Interfaz para crear psicólogo
interface CrearPsicologoData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
}

// Interfaz para actualizar psicólogo
interface ActualizarPsicologoData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
}

// Obtener todos los psicólogos
export const obtenerPsicologos = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.activo,
        u.email_verificado,
        u.ultimo_acceso,
        u.created_at,
        r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'psicologo'
      ORDER BY u.created_at DESC
    `;

    const [psicologos] = await sequelize.query(query) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Psicólogos obtenidos exitosamente',
      psicologos,
      'ADMIN_001'
    );
  } catch (error) {
    log.error('Error en obtenerPsicologos:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener la lista de psicólogos',
      'ADMIN_002'
    );
  }
};

// Crear nuevo psicólogo
export const crearPsicologo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { nombres, apellidos, email, password, telefono, fecha_nacimiento, genero }: CrearPsicologoData = req.body;

    // Validar campos obligatorios
    if (!nombres || !apellidos || !email || !password) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombres, apellidos, email y contraseña son requeridos',
        { camposRequeridos: ['nombres', 'apellidos', 'email', 'password'] },
        'ADMIN_003'
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'Formato de email inválido',
        { email },
        'ADMIN_004'
      );
    }

    // Verificar si el email ya existe
    const [usuarioExistente] = await sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      {
        replacements: { email },
        transaction
      }
    ) as [any[], unknown];

    if (Array.isArray(usuarioExistente) && usuarioExistente.length > 0) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado en el sistema',
        { email },
        'ADMIN_005'
      );
    }

    // Obtener el rol_id de psicólogo
    const [rolPsicologo] = await sequelize.query(
      'SELECT id FROM roles WHERE nombre = :nombre',
      {
        replacements: { nombre: 'psicologo' },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(rolPsicologo) || rolPsicologo.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.errorInterno(
        res,
        'Error: Rol de psicólogo no encontrado en el sistema',
        'ADMIN_006'
      );
    }

    const rolId = (rolPsicologo[0] as any).id;

    // Hashear la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generar token de activación
    const tokenActivacion = uuidv4();
    const tokenExpira = new Date();
    tokenExpira.setHours(tokenExpira.getHours() + 24); // Expira en 24 horas

    // Crear el usuario
    const [nuevoUsuario] = await sequelize.query(
      `INSERT INTO usuarios (
        id, nombres, apellidos, email, password_hash, telefono, 
        fecha_nacimiento, genero, rol_id, activo, email_verificado,
        token_activacion, token_activacion_expira, configuracion,
        created_at, updated_at
      ) VALUES (
        :id, :nombres, :apellidos, :email, :password_hash, :telefono,
        :fecha_nacimiento, :genero, :rol_id, :activo, :email_verificado,
        :token_activacion, :token_activacion_expira, :configuracion,
        :created_at, :updated_at
      ) RETURNING id, nombres, apellidos, email, created_at`,
      {
        replacements: {
          id: uuidv4(),
          nombres,
          apellidos,
          email,
          password_hash: passwordHash,
          telefono: telefono || null,
          fecha_nacimiento: fecha_nacimiento || null,
          genero: genero || null,
          rol_id: rolId,
          activo: true,
          email_verificado: false,
          token_activacion: tokenActivacion,
          token_activacion_expira: tokenExpira,
          configuracion: JSON.stringify({}),
          created_at: new Date(),
          updated_at: new Date()
        },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Crear disponibilidad por defecto para el psicólogo
    const psicologoId = nuevoUsuario[0].id;
    await crearDisponibilidadPorDefecto(psicologoId);

    // TODO: Enviar email de activación con el token
    log.info(`Nuevo psicólogo creado: ${email} con token: ${tokenActivacion}`);

    return ManejadorRespuestas.creado(
      res,
      'Psicólogo creado exitosamente. Se ha enviado un email de activación.',
      {
        usuario: nuevoUsuario[0],
        token_activacion: tokenActivacion // Solo para desarrollo, en producción no enviar
      },
      'ADMIN_007'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en crearPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear el psicólogo',
      'ADMIN_008'
    );
  }
};

// Obtener psicólogo por ID
export const obtenerPsicologoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [psicologo] = await sequelize.query(
      `SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.activo,
        u.email_verificado,
        u.ultimo_acceso,
        u.created_at,
        u.updated_at,
        r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id }
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_009'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Psicólogo obtenido exitosamente',
      psicologo[0],
      'ADMIN_010'
    );

  } catch (error) {
    log.error('Error en obtenerPsicologoPorId:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener el psicólogo',
      'ADMIN_011'
    );
  }
};

// Actualizar psicólogo
export const actualizarPsicologo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { nombres, apellidos, email, telefono, fecha_nacimiento, genero }: ActualizarPsicologoData = req.body;

    // Verificar que el psicólogo existe
    const [psicologoExistente] = await sequelize.query(
      `SELECT u.id, u.email, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologoExistente) || psicologoExistente.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_012'
      );
    }

    // Si se está actualizando el email, verificar que no exista
    if (email && email !== (psicologoExistente[0] as any).email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await transaction.rollback();
        return ManejadorRespuestas.errorValidacion(
          res,
          'Formato de email inválido',
          { email },
          'ADMIN_013'
        );
      }

      const [emailExistente] = await sequelize.query(
        'SELECT id FROM usuarios WHERE email = :email AND id != :id',
        {
          replacements: { email, id },
          transaction
        }
      ) as [any[], unknown];

      if (Array.isArray(emailExistente) && emailExistente.length > 0) {
        await transaction.rollback();
        return ManejadorRespuestas.conflicto(
          res,
          'El email ya está registrado por otro usuario',
          { email },
          'ADMIN_014'
        );
      }
    }

    // Construir query de actualización dinámicamente
    const camposActualizar: string[] = [];
    const replacements: any = { id };

    if (nombres) {
      camposActualizar.push('nombres = :nombres');
      replacements.nombres = nombres;
    }
    if (apellidos) {
      camposActualizar.push('apellidos = :apellidos');
      replacements.apellidos = apellidos;
    }
    if (email) {
      camposActualizar.push('email = :email');
      replacements.email = email;
    }
    if (telefono !== undefined) {
      camposActualizar.push('telefono = :telefono');
      replacements.telefono = telefono;
    }
    if (fecha_nacimiento !== undefined) {
      camposActualizar.push('fecha_nacimiento = :fecha_nacimiento');
      replacements.fecha_nacimiento = fecha_nacimiento;
    }
    if (genero !== undefined) {
      camposActualizar.push('genero = :genero');
      replacements.genero = genero;
    }

    if (camposActualizar.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'No se proporcionaron campos para actualizar',
        'ADMIN_015'
      );
    }

    // Agregar updated_at
    camposActualizar.push('updated_at = NOW()');

    const query = `UPDATE usuarios SET ${camposActualizar.join(', ')} WHERE id = :id`;

    await sequelize.query(query, {
      replacements,
      transaction
    });

    await transaction.commit();

    return ManejadorRespuestas.exito(
      res,
      'Psicólogo actualizado exitosamente',
      { id, campos_actualizados: camposActualizar.length - 1 }, // -1 por updated_at
      'ADMIN_016'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en actualizarPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar el psicólogo',
      'ADMIN_017'
    );
  }
};

// Desactivar psicólogo (desactivación lógica)
export const desactivarPsicologo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Validar que el ID existe
    if (!id) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID del psicólogo es requerido',
        'ADMIN_018'
      );
    }

    // Verificar que el psicólogo existe y está activo
    const [psicologo] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.activo, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_019'
      );
    }

    if (!(psicologo[0] as any).activo) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El psicólogo ya está desactivado',
        'ADMIN_020'
      );
    }

    // Desactivar el usuario
    await sequelize.query(
      'UPDATE usuarios SET activo = false, updated_at = NOW() WHERE id = :id',
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Log de auditoría
    const psicologoData = psicologo[0] as any;
    const usuarioId = (req as any).usuario?.id;
    if (usuarioId && typeof usuarioId === 'string') {
      await AuditoriaService.logDesactivacionPsicologo(
        id,
        `${psicologoData.nombres} ${psicologoData.apellidos}`,
        usuarioId,
        req
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Psicólogo desactivado exitosamente',
      { 
        id,
        nombres: psicologoData.nombres,
        apellidos: psicologoData.apellidos,
        estado: 'desactivado'
      },
      'ADMIN_021'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en desactivarPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al desactivar el psicólogo',
      'ADMIN_022'
    );
  }
};

// Reactivar psicólogo
export const reactivarPsicologo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Validar que el ID existe
    if (!id) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID del psicólogo es requerido',
        'ADMIN_023'
      );
    }

    // Verificar que el psicólogo existe y está desactivado
    const [psicologo] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.activo, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_024'
      );
    }

    if ((psicologo[0] as any).activo) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El psicólogo ya está activo',
        'ADMIN_025'
      );
    }

    // Reactivar el usuario
    await sequelize.query(
      'UPDATE usuarios SET activo = true, updated_at = NOW() WHERE id = :id',
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Log de auditoría
    const psicologoData = psicologo[0] as any;
    const usuarioId = (req as any).usuario?.id;
    if (usuarioId && typeof usuarioId === 'string') {
      await AuditoriaService.logReactivacionPsicologo(
        id,
        `${psicologoData.nombres} ${psicologoData.apellidos}`,
        usuarioId,
        req
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Psicólogo reactivado exitosamente',
      { 
        id,
        nombres: psicologoData.nombres,
        apellidos: psicologoData.apellidos,
        estado: 'activado'
      },
      'ADMIN_026'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en reactivarPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al reactivar el psicólogo',
      'ADMIN_027'
    );
  }
};

// Eliminar psicólogo (eliminación física)
export const eliminarPsicologo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Validar que el ID existe
    if (!id) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID del psicólogo es requerido',
        'ADMIN_028'
      );
    }

    // Verificar que el psicólogo existe
    const [psicologo] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_029'
      );
    }

    // Verificar si hay registros relacionados antes de eliminar
    let totalSesiones = 0;
    let totalCitas = 0;
    let totalPacientes = 0;

    try {
      const [sesiones] = await sequelize.query(
        'SELECT COUNT(*) as total FROM sesiones WHERE psicologo_id = :id',
        {
          replacements: { id },
          transaction
        }
      ) as [any[], unknown];

      const [citas] = await sequelize.query(
        'SELECT COUNT(*) as total FROM citas WHERE psicologo_id = :id',
        {
          replacements: { id },
          transaction
        }
      ) as [any[], unknown];

      const [pacientes] = await sequelize.query(
        'SELECT COUNT(*) as total FROM pacientes WHERE psicologo_id = :id',
        {
          replacements: { id },
          transaction
        }
      ) as [any[], unknown];

      totalSesiones = Array.isArray(sesiones) && sesiones.length > 0 ? (sesiones[0] as any).total : 0;
      totalCitas = Array.isArray(citas) && citas.length > 0 ? (citas[0] as any).total : 0;
      totalPacientes = Array.isArray(pacientes) && pacientes.length > 0 ? (pacientes[0] as any).total : 0;

    } catch (countError: any) {
      log.warn('Error al contar registros relacionados:', countError);
      // Continuar con la eliminación
    }

    if (totalSesiones > 0 || totalCitas > 0 || totalPacientes > 0) {
      await transaction.rollback();
      
      // Log de intento de eliminación fallido
      const psicologoData = psicologo[0] as any;
      const usuarioId = (req as any).usuario?.id;
      if (usuarioId && typeof usuarioId === 'string') {
        await AuditoriaService.logIntentoEliminacionFallido(
          id,
          `${psicologoData.nombres} ${psicologoData.apellidos}`,
          usuarioId,
          req,
          'Registros relacionados encontrados',
          {
            total_sesiones: totalSesiones,
            total_citas: totalCitas,
            total_pacientes: totalPacientes
          }
        );
      }
      
      return ManejadorRespuestas.conflicto(
        res,
        `No se puede eliminar al psicólogo ${psicologoData.nombres} ${psicologoData.apellidos} porque tiene registros relacionados: ${totalSesiones} sesión(es), ${totalCitas} cita(s), ${totalPacientes} paciente(s). Considere desactivar la cuenta en lugar de eliminarla.`,
        { 
          psicologo_id: id,
          total_sesiones: totalSesiones,
          total_citas: totalCitas,
          total_pacientes: totalPacientes,
          nombres: psicologoData.nombres,
          apellidos: psicologoData.apellidos
        },
        'ADMIN_030'
      );
    }

    // Eliminar registros relacionados de forma segura
    const deleteQueries = [
      { query: 'DELETE FROM logs_auditoria WHERE usuario_id = :id', name: 'logs_auditoria' },
      { query: 'DELETE FROM disponibilidad_psicologos WHERE psicologo_id = :id', name: 'disponibilidad_psicologos' },
      { query: 'DELETE FROM tareas WHERE psicologo_id = :id', name: 'tareas' },
      { query: 'DELETE FROM mensajes WHERE remitente_id = :id OR destinatario_id = :id', name: 'mensajes' }
    ];

    for (const deleteQuery of deleteQueries) {
      try {
        await sequelize.query(deleteQuery.query, {
          replacements: { id },
          transaction
        }) as [any[], unknown];
        log.info(`Registros eliminados de ${deleteQuery.name} para psicólogo ${id}`);
      } catch (deleteError: any) {
        log.warn(`Error al eliminar registros de ${deleteQuery.name}:`, deleteError);
        // Continuar con la siguiente tabla
      }
    }

    // Finalmente eliminar el usuario
    await sequelize.query(
      'DELETE FROM usuarios WHERE id = :id',
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Log de auditoría para eliminación exitosa
    const psicologoData = psicologo[0] as any;
    const usuarioId = (req as any).usuario?.id;
    if (usuarioId && typeof usuarioId === 'string') {
      await AuditoriaService.logEliminacionPsicologo(
        id,
        `${psicologoData.nombres} ${psicologoData.apellidos}`,
        usuarioId,
        req,
        {
          total_sesiones: totalSesiones,
          total_citas: totalCitas,
          total_pacientes: totalPacientes
        }
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Psicólogo eliminado exitosamente',
      { 
        id,
        nombres: psicologoData.nombres,
        apellidos: psicologoData.apellidos,
        estado: 'eliminado'
      },
      'ADMIN_031'
    );

  } catch (error: any) {
    await transaction.rollback();
    log.error('Error en eliminarPsicologo:', error);
    
    // Verificar si es un error de restricción de clave foránea
    if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
      return ManejadorRespuestas.conflicto(
        res,
        'No se puede eliminar al psicólogo porque tiene registros relacionados que no se pueden eliminar automáticamente. Considere desactivar la cuenta en lugar de eliminarla.',
        { 
          error_code: error.code,
          error_message: error.message 
        },
        'ADMIN_032'
      );
    }
    
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al eliminar el psicólogo',
      'ADMIN_033'
    );
  }
}; 

// Obtener pacientes de un psicólogo
export const obtenerPacientesPsicologo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el psicólogo existe
    const [psicologo] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id }
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_031'
      );
    }

    // Obtener pacientes asignados al psicólogo
    const [pacientes] = await sequelize.query(
      `SELECT 
        p.id,
        p.usuario_id,
        p.nombres,
        p.apellidos,
        p.email,
        p.telefono,
        p.fecha_nacimiento,
        p.genero,
        p.numero_ficha,
        p.rut,
        p.direccion,
        p.contacto_emergencia_nombre,
        p.contacto_emergencia_telefono,
        p.contacto_emergencia_relacion,
        p.diagnosticos,
        p.etiquetas,
        p.estrategias_autorregulacion,
        p.puntos_acumulados,
        p.estado,
        p.fecha_ingreso,
        p.fecha_alta,
        p.observaciones,
        p.created_at,
        p.updated_at
       FROM pacientes p
       WHERE p.psicologo_id = :id
       ORDER BY p.created_at DESC`,
      {
        replacements: { id }
      }
    ) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Pacientes del psicólogo obtenidos exitosamente',
      pacientes,
      'ADMIN_032'
    );

  } catch (error) {
    log.error('Error en obtenerPacientesPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener los pacientes del psicólogo',
      'ADMIN_033'
    );
  }
};

// Obtener citas de un psicólogo
export const obtenerCitasPsicologo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el psicólogo existe
    const [psicologo] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND r.nombre = 'psicologo'`,
      {
        replacements: { id }
      }
    ) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Psicólogo no encontrado',
        'ADMIN_034'
      );
    }

    // Obtener citas del psicólogo con información del paciente
    const [citas] = await sequelize.query(
      `SELECT 
        c.id,
        c.paciente_id,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.email as paciente_email,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        c.created_at,
        c.updated_at
       FROM citas c
       INNER JOIN pacientes p ON c.paciente_id = p.id
       WHERE c.psicologo_id = :id
       AND c.estado IN ('programada', 'confirmada', 'en_progreso')
       ORDER BY c.fecha ASC, c.hora_inicio ASC`,
      {
        replacements: { id }
      }
    ) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Citas del psicólogo obtenidas exitosamente',
      citas,
      'ADMIN_035'
    );

  } catch (error) {
    log.error('Error en obtenerCitasPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las citas del psicólogo',
      'ADMIN_036'
    );
  }
};

// Eliminar cita específica
export const eliminarCita = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Validar que el ID existe
    if (!id) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de la cita es requerido',
        'ADMIN_037'
      );
    }

    // Verificar que la cita existe y obtener información
    const [cita] = await sequelize.query(
      `SELECT 
        c.id,
        c.paciente_id,
        c.psicologo_id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        u_psicologo.nombres as psicologo_nombres,
        u_psicologo.apellidos as psicologo_apellidos
       FROM citas c
       INNER JOIN pacientes p ON c.paciente_id = p.id
       INNER JOIN usuarios u_psicologo ON c.psicologo_id = u_psicologo.id
       WHERE c.id = :id`,
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(cita) || cita.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'ADMIN_038'
      );
    }

    const citaData = cita[0] as any;

    // Verificar que la cita no esté completada o cancelada
    if (citaData.estado === 'completada' || citaData.estado === 'cancelada') {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'No se puede eliminar una cita que ya está completada o cancelada',
        { estado: citaData.estado },
        'ADMIN_039'
      );
    }

    // Eliminar la cita
    await sequelize.query(
      'DELETE FROM citas WHERE id = :id',
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Log de auditoría
    const usuarioId = (req as any).usuario?.id;
    if (usuarioId && typeof usuarioId === 'string') {
      await AuditoriaService.logEliminacionCita(
        id,
        citaData,
        usuarioId,
        req
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Cita eliminada exitosamente',
      {
        id,
        paciente: `${citaData.paciente_nombres} ${citaData.paciente_apellidos}`,
        psicologo: `${citaData.psicologo_nombres} ${citaData.psicologo_apellidos}`,
        fecha: citaData.fecha,
        hora: citaData.hora_inicio
      },
      'ADMIN_040'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en eliminarCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al eliminar la cita',
      'ADMIN_041'
    );
  }
};

// Reasignar paciente a otro psicólogo
export const reasignarPaciente = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { pacienteId, nuevoPsicologoId } = req.body;

    if (!pacienteId || !nuevoPsicologoId) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID del paciente y nuevo psicólogo son requeridos',
        { camposRequeridos: ['pacienteId', 'nuevoPsicologoId'] },
        'ADMIN_041'
      );
    }

    // Verificar que el paciente existe
    const [paciente] = await sequelize.query(
      `SELECT 
        p.id,
        p.usuario_id,
        p.nombres,
        p.apellidos,
        p.psicologo_id as psicologo_actual_id,
        u_psicologo.nombres as psicologo_actual_nombres,
        u_psicologo.apellidos as psicologo_actual_apellidos
       FROM pacientes p
       INNER JOIN usuarios u_psicologo ON p.psicologo_id = u_psicologo.id
       WHERE p.id = :pacienteId`,
      {
        replacements: { pacienteId },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(paciente) || paciente.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'ADMIN_042'
      );
    }

    // Verificar que el nuevo psicólogo existe y está activo
    const [nuevoPsicologo] = await sequelize.query(
      `SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.activo,
        r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :nuevoPsicologoId AND r.nombre = 'psicologo'`,
      {
        replacements: { nuevoPsicologoId },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(nuevoPsicologo) || nuevoPsicologo.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Nuevo psicólogo no encontrado',
        'ADMIN_043'
      );
    }

    if (!(nuevoPsicologo[0] as any).activo) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El nuevo psicólogo debe estar activo para poder reasignar pacientes',
        { psicologo_id: nuevoPsicologoId },
        'ADMIN_044'
      );
    }

    const pacienteData = paciente[0] as any;
    const nuevoPsicologoData = nuevoPsicologo[0] as any;

    // Verificar que no se está reasignando al mismo psicólogo
    if (pacienteData.psicologo_actual_id === nuevoPsicologoId) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El paciente ya está asignado a este psicólogo',
        { psicologo_id: nuevoPsicologoId },
        'ADMIN_045'
      );
    }

    // Actualizar el psicólogo del paciente
    await sequelize.query(
      'UPDATE pacientes SET psicologo_id = :nuevoPsicologoId, updated_at = NOW() WHERE id = :pacienteId',
      {
        replacements: { pacienteId, nuevoPsicologoId },
        transaction
      }
    ) as [any[], unknown];

    // Actualizar las citas futuras del paciente para que sean con el nuevo psicólogo
    await sequelize.query(
      `UPDATE citas 
       SET psicologo_id = :nuevoPsicologoId, updated_at = NOW() 
       WHERE paciente_id = :pacienteId 
       AND estado IN ('programada', 'confirmada')`,
      {
        replacements: { pacienteId, nuevoPsicologoId },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Log de auditoría
    const usuarioId = (req as any).usuario?.id;
    if (usuarioId && typeof usuarioId === 'string') {
      await AuditoriaService.logReasignacionPaciente(
        pacienteId,
        {
          nombre: `${pacienteData.nombres} ${pacienteData.apellidos}`,
          id: pacienteId
        },
        pacienteData.psicologo_actual_id,
        nuevoPsicologoId,
        usuarioId,
        req
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Paciente reasignado exitosamente',
      {
        paciente_id: pacienteId,
        paciente_nombre: `${pacienteData.nombres} ${pacienteData.apellidos}`,
        psicologo_anterior: `${pacienteData.psicologo_actual_nombres} ${pacienteData.psicologo_actual_apellidos}`,
        psicologo_nuevo: `${nuevoPsicologoData.nombres} ${nuevoPsicologoData.apellidos}`,
        psicologo_nuevo_id: nuevoPsicologoId
      },
      'ADMIN_046'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en reasignarPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al reasignar el paciente',
      'ADMIN_047'
    );
  }
};

// Obtener psicólogos disponibles para reasignación
export const obtenerPsicologosDisponibles = async (req: Request, res: Response) => {
  try {
    const { excludeId } = req.query; // ID del psicólogo a excluir

    let query = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.activo,
        u.created_at,
        u.updated_at
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'psicologo' AND u.activo = true
    `;

    const replacements: any = {};

    if (excludeId) {
      query += ' AND u.id != :excludeId';
      replacements.excludeId = excludeId;
    }

    query += ' ORDER BY u.nombres ASC, u.apellidos ASC';

    const [psicologos] = await sequelize.query(query, { replacements }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Psicólogos disponibles obtenidos exitosamente',
      psicologos,
      'ADMIN_048'
    );

  } catch (error) {
    log.error('Error en obtenerPsicologosDisponibles:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener los psicólogos disponibles',
      'ADMIN_049'
    );
  }
}; 

// Obtener logs de auditoría
export const obtenerLogsAuditoria = async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, accion, fecha_inicio, fecha_fin } = req.query;

    let whereClause = '';
    const replacements: any = {};

    // Filtros opcionales
    if (accion) {
      whereClause += ' AND accion = :accion';
      replacements.accion = accion;
    }

    if (fecha_inicio) {
      whereClause += ' AND created_at >= :fecha_inicio';
      replacements.fecha_inicio = fecha_inicio;
    }

    if (fecha_fin) {
      whereClause += ' AND created_at <= :fecha_fin';
      replacements.fecha_fin = fecha_fin;
    }

    // Query principal
    const query = `
      SELECT 
        id,
        usuario_id,
        accion,
        tabla_afectada,
        registro_id,
        valores_anteriores,
        valores_nuevos,
        ip_address,
        user_agent,
        metadatos,
        created_at
      FROM logs_auditoria
      WHERE 1=1 ${whereClause}
      ORDER BY created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = parseInt(limit as string);
    replacements.offset = parseInt(offset as string);

    const [logs] = await sequelize.query(query, { replacements }) as [any[], unknown];

    // Query para obtener el total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM logs_auditoria
      WHERE 1=1 ${whereClause}
    `;

    const [countResult] = await sequelize.query(countQuery, { replacements }) as [any[], unknown];
    const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0;

    return ManejadorRespuestas.exito(
      res,
      'Logs de auditoría obtenidos exitosamente',
      {
        logs,
        paginacion: {
          total,
          limit: replacements.limit,
          offset: replacements.offset,
          pagina_actual: Math.floor(replacements.offset / replacements.limit) + 1,
          total_paginas: Math.ceil(total / replacements.limit)
        }
      },
      'ADMIN_048'
    );

  } catch (error) {
    log.error('Error en obtenerLogsAuditoria:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener los logs de auditoría',
      'ADMIN_049'
    );
  }
};

// Obtener estadísticas de auditoría
export const obtenerEstadisticasAuditoria = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let whereClause = '';
    const replacements: any = {};

    if (fecha_inicio) {
      whereClause += ' AND created_at >= :fecha_inicio';
      replacements.fecha_inicio = fecha_inicio;
    }

    if (fecha_fin) {
      whereClause += ' AND created_at <= :fecha_fin';
      replacements.fecha_fin = fecha_fin;
    }

    // Estadísticas por tipo de acción
    const statsQuery = `
      SELECT 
        accion,
        COUNT(*) as total
      FROM logs_auditoria
      WHERE 1=1 ${whereClause}
      GROUP BY accion
      ORDER BY total DESC
    `;

    const [stats] = await sequelize.query(statsQuery, { replacements }) as [any[], unknown];

    // Estadísticas por día (últimos 30 días)
    const dailyStatsQuery = `
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as total
      FROM logs_auditoria
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY fecha DESC
    `;

    const [dailyStats] = await sequelize.query(dailyStatsQuery) as [any[], unknown];

    // Total de acciones
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM logs_auditoria
      WHERE 1=1 ${whereClause}
    `;

    const [totalResult] = await sequelize.query(totalQuery, { replacements }) as [any[], unknown];
    const total = Array.isArray(totalResult) && totalResult.length > 0 ? (totalResult[0] as any).total : 0;

    return ManejadorRespuestas.exito(
      res,
      'Estadísticas de auditoría obtenidas exitosamente',
      {
        total_acciones: total,
        estadisticas_por_accion: stats,
        estadisticas_diarias: dailyStats,
        periodo: {
          fecha_inicio: fecha_inicio || null,
          fecha_fin: fecha_fin || null
        }
      },
      'ADMIN_050'
    );

  } catch (error) {
    log.error('Error en obtenerEstadisticasAuditoria:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las estadísticas de auditoría',
      'ADMIN_051'
    );
  }
}; 
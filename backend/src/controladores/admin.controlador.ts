import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { crearDisponibilidadPorDefecto } from './disponibilidad.controlador';

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
        'ADMIN_018'
      );
    }

    if (!(psicologo[0] as any).activo) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El psicólogo ya está desactivado',
        'ADMIN_019'
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

          return ManejadorRespuestas.exito(
        res,
        'Psicólogo desactivado exitosamente',
        { 
          id,
          nombres: (psicologo[0] as any).nombres,
          apellidos: (psicologo[0] as any).apellidos,
          estado: 'desactivado'
        },
        'ADMIN_020'
      );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en desactivarPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al desactivar el psicólogo',
      'ADMIN_021'
    );
  }
};

// Reactivar psicólogo
export const reactivarPsicologo = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

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
        'ADMIN_022'
      );
    }

    if ((psicologo[0] as any).activo) {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'El psicólogo ya está activo',
        'ADMIN_023'
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

          return ManejadorRespuestas.exito(
        res,
        'Psicólogo reactivado exitosamente',
        { 
          id,
          nombres: (psicologo[0] as any).nombres,
          apellidos: (psicologo[0] as any).apellidos,
          estado: 'activado'
        },
        'ADMIN_024'
      );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en reactivarPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al reactivar el psicólogo',
      'ADMIN_025'
    );
  }
}; 
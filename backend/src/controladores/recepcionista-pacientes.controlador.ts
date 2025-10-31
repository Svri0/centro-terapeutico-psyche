// Controlador específico para gestión de pacientes por recepcionistas
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { enviarEmailRegistroPaciente } from '../utilidades/email.service';
import { QueryTypes } from 'sequelize';

// Crear paciente básico (para recepcionistas)
export const crearPacienteBasico = async (req: Request, res: Response) => {
  try {
    const {
      nombres,
      apellidos,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      rut,
      direccion,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono,
      contacto_emergencia_relacion,
      observaciones
    } = req.body;

    // Validar datos requeridos
    if (!nombres || !apellidos || !email) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombres, apellidos y email son requeridos',
        { camposRequeridos: ['nombres', 'apellidos', 'email'] },
        'REC_012'
      );
    }

    // Verificar que el email no esté en uso
    const [usuarioExistente] = await sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      { replacements: { email } }
    ) as [any[], unknown];

    if (Array.isArray(usuarioExistente) && usuarioExistente.length > 0) {
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado',
        'REC_013'
      );
    }

    // Verificar que el RUT no esté en uso
    if (rut) {
      const [rutExistente] = await sequelize.query(
        'SELECT id FROM pacientes WHERE rut = :rut AND deleted_at IS NULL',
        { replacements: { rut } }
      ) as [any[], unknown];

      if (Array.isArray(rutExistente) && rutExistente.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El RUT ya está registrado',
          'REC_014'
        );
      }
    }

    // Obtener el rol de paciente
    const [rolPaciente] = await sequelize.query(
      'SELECT id FROM roles WHERE nombre = \'Paciente\'',
      { replacements: {} }
    ) as [any[], unknown];

    if (!Array.isArray(rolPaciente) || rolPaciente.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'Error: Rol de paciente no encontrado',
        'REC_015'
      );
    }

    const rolId = rolPaciente[0].id;

    // Generar password temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const saltRounds = 12;
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(passwordTemporal, saltRounds);

    // Crear usuario
    const [usuarioCreado] = await sequelize.query(`
      INSERT INTO usuarios (
        id, nombres, apellidos, email, password_hash, telefono, 
        fecha_nacimiento, genero, rol_id, activo, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :nombres, :apellidos, :email, :password_hash, :telefono,
        :fecha_nacimiento, :genero, :rol_id, true, NOW(), NOW()
      ) RETURNING id, nombres, apellidos, email, telefono, fecha_nacimiento, genero
    `, {
      replacements: {
        nombres,
        apellidos,
        email,
        password_hash: hashedPassword,
        telefono: telefono || null,
        fecha_nacimiento: fecha_nacimiento || null,
        genero: genero || null,
        rol_id: rolId
      }
    }) as [any[], unknown];

    if (!Array.isArray(usuarioCreado) || usuarioCreado.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al crear el usuario',
        'REC_016'
      );
    }

    const usuario = usuarioCreado[0];

    // Generar número de ficha usando un contador
    const [ultimoPaciente] = await sequelize.query(`
      SELECT numero_ficha FROM pacientes 
      WHERE numero_ficha LIKE 'P%' 
      ORDER BY numero_ficha DESC 
      LIMIT 1
    `) as [any[], unknown];

    let numeroFicha;
    if (Array.isArray(ultimoPaciente) && ultimoPaciente.length > 0) {
      const ultimoNumero = ultimoPaciente[0].numero_ficha.match(/P(\d+)/);
      if (ultimoNumero) {
        const siguienteNumero = parseInt(ultimoNumero[1]) + 1;
        numeroFicha = `P${String(siguienteNumero).padStart(6, '0')}`;
      } else {
        numeroFicha = 'P000001';
      }
    } else {
      numeroFicha = 'P000001';
    }

    // Crear paciente básico (sin psicólogo asignado inicialmente)
    // NOTA: Necesitamos asignar un psicologo_id, usaremos el primero disponible o requerirlo
    const [primerPsicologo] = await sequelize.query(`
      SELECT id FROM usuarios WHERE rol_id = 2 AND activo = true LIMIT 1
    `) as [any[], unknown];

    if (!Array.isArray(primerPsicologo) || primerPsicologo.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'No hay psicólogos disponibles en el sistema. Contacte al administrador.',
        'REC_020'
      );
    }

    const psicologoId = primerPsicologo[0].id;

    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        id, usuario_id, psicologo_id, numero_ficha, rut, direccion,
        estrategias_autorregulacion, puntos_acumulados, estado,
        fecha_ingreso, observaciones, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :usuario_id, :psicologo_id, :numero_ficha, :rut, :direccion,
        '[]', 0, 'activo',
        NOW(), :observaciones, NOW(), NOW()
      ) RETURNING id, numero_ficha, rut, direccion, 
                observaciones, estado, fecha_ingreso
    `, {
      replacements: {
        usuario_id: usuario.id,
        psicologo_id: psicologoId,
        numero_ficha: numeroFicha,
        rut: rut || null,
        direccion: direccion || null,
        observaciones: observaciones || null
      }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteCreado) || pacienteCreado.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al crear el paciente',
        'REC_017'
      );
    }

    const paciente = pacienteCreado[0];

    // Crear contacto de emergencia en tabla normalizada (si viene)
    if (contacto_emergencia_nombre || contacto_emergencia_telefono || contacto_emergencia_relacion) {
      await sequelize.query(`
        INSERT INTO contactos_emergencia (id, paciente_id, nombre, telefono, relacion, created_at, updated_at)
        VALUES (gen_random_uuid(), :pacienteId, :nombre, :telefono, :relacion, NOW(), NOW())
      `, {
        replacements: {
          pacienteId: paciente.id,
          nombre: contacto_emergencia_nombre || 'Sin nombre',
          telefono: contacto_emergencia_telefono || null,
          relacion: contacto_emergencia_relacion || null,
        }
      });
    }

    // Enviar email de bienvenida al paciente
    const nombreCompleto = `${nombres} ${apellidos}`;
    const emailEnviado = await enviarEmailRegistroPaciente(
      email,
      nombreCompleto,
      email,
      passwordTemporal,
      usuario.token_activacion || ''
    );

    if (emailEnviado) {
      log.info(`Email de bienvenida enviado exitosamente al paciente: ${email}`);
    } else {
      log.warn(`No se pudo enviar el email de bienvenida al paciente: ${email}`);
    }

    return ManejadorRespuestas.creado(
      res,
      'Paciente creado exitosamente. Se ha enviado un email de bienvenida. El psicólogo completará la información en la primera sesión.',
      {
        ...usuario,
        ...paciente,
        password_temporal: passwordTemporal,
        email_enviado: emailEnviado
      },
      'REC_018'
    );

  } catch (error) {
    log.error('Error en crearPacienteBasico:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al crear el paciente',
      'REC_019'
    );
  }
};

// Obtener el paciente del usuario autenticado
export const obtenerMiPaciente = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    
    if (!usuarioId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_001'
      );
    }

    console.log('🔍 Obteniendo paciente para usuario ID:', usuarioId);

    // Obtener el paciente del usuario autenticado (normalizado)
    const [paciente] = await sequelize.query(
      `SELECT 
        p.id,
        p.numero_ficha,
        p.rut,
        p.direccion,
        (
          SELECT ce.nombre FROM contactos_emergencia ce 
          WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
          ORDER BY ce.created_at ASC LIMIT 1
        ) AS contacto_emergencia_nombre,
        (
          SELECT ce.telefono FROM contactos_emergencia ce 
          WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
          ORDER BY ce.created_at ASC LIMIT 1
        ) AS contacto_emergencia_telefono,
        (
          SELECT ce.relacion FROM contactos_emergencia ce 
          WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
          ORDER BY ce.created_at ASC LIMIT 1
        ) AS contacto_emergencia_relacion,
        (
          SELECT COALESCE(array_agg(e.nombre ORDER BY e.nombre), '{}')
          FROM paciente_etiquetas pe 
          JOIN etiquetas e ON e.id = pe.etiqueta_id
          WHERE pe.paciente_id = p.id
        ) AS etiquetas,
        (
          SELECT COALESCE(array_agg(d.nombre ORDER BY d.nombre), '{}')
          FROM paciente_diagnosticos pd 
          JOIN diagnosticos d ON d.id = pd.diagnostico_id
          WHERE pd.paciente_id = p.id
        ) AS diagnosticos,
        p.estrategias_autorregulacion,
        p.puntos_acumulados,
        p.estado,
        p.fecha_ingreso,
        p.fecha_alta,
        p.observaciones,
        p.psicologo_id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.activo,
        u.created_at,
        u.updated_at
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.usuario_id = :usuarioId AND p.deleted_at IS NULL`,
      {
        replacements: { usuarioId },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!paciente) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'PAC_002'
      );
    }

    console.log('✅ Paciente encontrado:', paciente.id);

    return ManejadorRespuestas.exito(
      res,
      'Paciente obtenido exitosamente',
      paciente,
      'PAC_003'
    );

  } catch (error) {
    log.error('Error en obtenerMiPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener el paciente',
      'PAC_004'
    );
  }
};











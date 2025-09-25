// Controlador específico para gestión de pacientes por recepcionistas
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';

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

    // Generar número de ficha
    const numeroFicha = `P${String(usuario.id).padStart(6, '0')}`;

    // Crear paciente básico (sin psicólogo asignado inicialmente)
    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        id, usuario_id, numero_ficha, rut, direccion,
        contacto_emergencia_nombre, contacto_emergencia_telefono, 
        contacto_emergencia_relacion, observaciones, estado,
        fecha_ingreso, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :usuario_id, :numero_ficha, :rut, :direccion,
        :contacto_emergencia_nombre, :contacto_emergencia_telefono,
        :contacto_emergencia_relacion, :observaciones, 'activo',
        NOW(), NOW(), NOW()
      ) RETURNING id, numero_ficha, rut, direccion, 
                contacto_emergencia_nombre, contacto_emergencia_telefono, 
                contacto_emergencia_relacion, observaciones, estado, fecha_ingreso
    `, {
      replacements: {
        usuario_id: usuario.id,
        numero_ficha: numeroFicha,
        rut: rut || null,
        direccion: direccion || null,
        contacto_emergencia_nombre: contacto_emergencia_nombre || null,
        contacto_emergencia_telefono: contacto_emergencia_telefono || null,
        contacto_emergencia_relacion: contacto_emergencia_relacion || null,
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

    return ManejadorRespuestas.creado(
      res,
      'Paciente creado exitosamente. El psicólogo completará la información en la primera sesión.',
      {
        ...usuario,
        ...paciente,
        password_temporal: passwordTemporal
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



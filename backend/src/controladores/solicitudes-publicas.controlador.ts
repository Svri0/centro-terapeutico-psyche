// Controlador para solicitudes públicas desde el homepage
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { enviarEmailRegistroPaciente } from '../utilidades/email.service';

// Crear solicitud de consulta desde el homepage (público, sin autenticación)
export const crearSolicitudConsulta = async (req: Request, res: Response) => {
  try {
    const {
      nombres,
      apellidos,
      email,
      telefono,
      observaciones
    } = req.body;

    // Validar datos requeridos
    if (!nombres || !apellidos || !email) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombres, apellidos y email son requeridos',
        { camposRequeridos: ['nombres', 'apellidos', 'email'] },
        'SOL_001'
      );
    }

    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-ñáéíóúüÑÁÉÍÓÚÜ]+@[a-zA-Z0-9.-]+\.(com|cl)$/;
    if (!emailRegex.test(email)) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'El email debe tener un formato válido y terminar en .com o .cl',
        {},
        'SOL_002'
      );
    }

    // Validar formato de teléfono (opcional pero si viene debe ser válido)
    if (telefono) {
      const phoneRegex = /^(\+56\s?)?[2-9]\d{8}$/;
      if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'El teléfono debe tener un formato válido (ej: +56 9 1234 5678)',
          {},
          'SOL_003'
        );
      }
    }

    // Verificar que el email no esté en uso (incluyendo soft deletes)
    const usuarioExistente = await sequelize.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = LOWER(:email) AND deleted_at IS NULL',
      { 
        replacements: { email: email.trim().toLowerCase() }, 
        type: QueryTypes.SELECT 
      }
    ) as any[];

    if (Array.isArray(usuarioExistente) && usuarioExistente.length > 0) {
      console.log('⚠️ Email ya existe:', email);
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado en nuestro sistema. Por favor, inicia sesión o contacta con nosotros si necesitas ayuda.',
        'SOL_004'
      );
    }

    // Obtener el rol de paciente (usar minúscula para consistencia)
    const rolPaciente = await sequelize.query(
      'SELECT id FROM roles WHERE LOWER(nombre) = LOWER(\'paciente\')',
      { replacements: {}, type: QueryTypes.SELECT }
    ) as any[];

    console.log('🔍 Resultado de búsqueda de rol paciente:', rolPaciente);

    if (!Array.isArray(rolPaciente) || rolPaciente.length === 0) {
      console.error('❌ No se encontró el rol de paciente');
      return ManejadorRespuestas.errorInterno(
        res,
        'Error: Rol de paciente no encontrado',
        'SOL_005'
      );
    }

    const rolId = rolPaciente[0].id;
    console.log('✅ Rol ID encontrado:', rolId);

    // Generar password temporal y token de activación
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const tokenActivacion = crypto.randomBytes(32).toString('hex');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(passwordTemporal, saltRounds);

    console.log('🔍 Intentando crear usuario con:', {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      rol_id: rolId
    });

    // Crear usuario con token de activación (mismo formato que recepcionista-pacientes)
    const [usuarioCreado] = await sequelize.query(`
      INSERT INTO usuarios (
        id, nombres, apellidos, email, password_hash, telefono, 
        rol_id, activo, token_activacion, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :nombres, :apellidos, :email, :password_hash, :telefono,
        :rol_id, true, :token_activacion, NOW(), NOW()
      ) RETURNING id, nombres, apellidos, email, telefono, token_activacion
    `, {
      replacements: {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hashedPassword,
        telefono: telefono ? telefono.trim() : null,
        rol_id: rolId,
        token_activacion: tokenActivacion
      }
    }) as [any[], unknown];

    console.log('🔍 Resultado de creación de usuario:', usuarioCreado);

    if (!Array.isArray(usuarioCreado) || usuarioCreado.length === 0) {
      console.error('❌ Error: No se pudo crear el usuario');
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al crear el usuario',
        'SOL_006'
      );
    }

    const usuario = usuarioCreado[0];
    console.log('✅ Usuario creado:', usuario.id);

    // Generar número de ficha usando un contador
    const ultimoPaciente = await sequelize.query(`
      SELECT numero_ficha FROM pacientes 
      WHERE numero_ficha LIKE 'P%' 
      ORDER BY numero_ficha DESC 
      LIMIT 1
    `, { type: QueryTypes.SELECT }) as any[];

    console.log('🔍 Resultado de búsqueda de último paciente:', ultimoPaciente);

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

    console.log('✅ Número de ficha generado:', numeroFicha);

    // Obtener el primer psicólogo disponible (usando JOIN con roles para mayor seguridad)
    const primerPsicologo = await sequelize.query(`
      SELECT u.id 
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE LOWER(r.nombre) = LOWER('psicologo') AND u.activo = true AND u.deleted_at IS NULL
      LIMIT 1
    `, { type: QueryTypes.SELECT }) as any[];

    console.log('🔍 Resultado de búsqueda de psicólogo:', primerPsicologo);

    if (!Array.isArray(primerPsicologo) || primerPsicologo.length === 0) {
      console.error('❌ No se encontró psicólogo disponible');
      return ManejadorRespuestas.errorInterno(
        res,
        'No hay psicólogos disponibles en el sistema. Contacte al administrador.',
        'SOL_007'
      );
    }

    const psicologoId = primerPsicologo[0].id;
    console.log('✅ Psicólogo ID encontrado:', psicologoId);

    // Crear paciente básico (mismo formato que recepcionista-pacientes)
    console.log('🔍 Intentando crear paciente con:', {
      usuario_id: usuario.id,
      psicologo_id: psicologoId,
      numero_ficha: numeroFicha,
      observaciones: observaciones || 'Solicitud desde homepage'
    });

    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        id, usuario_id, psicologo_id, numero_ficha,
        estrategias_autorregulacion, puntos_acumulados, estado,
        fecha_ingreso, observaciones, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :usuario_id, :psicologo_id, :numero_ficha,
        '[]', 0, 'activo',
        NOW(), :observaciones, NOW(), NOW()
      ) RETURNING id, numero_ficha, observaciones, estado, fecha_ingreso
    `, {
      replacements: {
        usuario_id: usuario.id,
        psicologo_id: psicologoId,
        numero_ficha: numeroFicha,
        observaciones: observaciones || 'Solicitud desde homepage'
      }
    }) as [any[], unknown];

    console.log('🔍 Resultado de creación de paciente:', pacienteCreado);

    if (!Array.isArray(pacienteCreado) || pacienteCreado.length === 0) {
      console.error('❌ Error: No se pudo crear el paciente');
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al crear el paciente',
        'SOL_008'
      );
    }

    const paciente = pacienteCreado[0];
    console.log('✅ Paciente creado:', paciente.id);

    // Enviar email de bienvenida al paciente
    console.log('📧 ========== PREPARANDO ENVÍO DE EMAIL ==========');
    console.log('📧 Destinatario:', email);
    console.log('📧 Nombre completo:', `${nombres} ${apellidos}`);
    console.log('📧 Password temporal:', passwordTemporal);
    console.log('📧 Token activación:', usuario.token_activacion);
    console.log('📧 ==============================================');
    
    const nombreCompleto = `${nombres} ${apellidos}`;
    const emailEnviado = await enviarEmailRegistroPaciente(
      email,
      nombreCompleto,
      email,
      passwordTemporal,
      usuario.token_activacion || ''
    );

    if (emailEnviado) {
      console.log('✅ Email de bienvenida enviado exitosamente al paciente:', email);
      log.info(`Email de bienvenida enviado exitosamente al paciente: ${email}`);
    } else {
      console.error('❌ NO SE PUDO ENVIAR el email de bienvenida al paciente:', email);
      log.warn(`No se pudo enviar el email de bienvenida al paciente: ${email}`);
    }

    return ManejadorRespuestas.creado(
      res,
      'Solicitud de consulta recibida exitosamente. Se ha enviado un email de bienvenida con tus credenciales de acceso. Nos pondremos en contacto contigo pronto.',
      {
        ...usuario,
        ...paciente,
        password_temporal: passwordTemporal,
        email_enviado: emailEnviado
      },
      'SOL_009'
    );

  } catch (error: any) {
    console.error('❌ Error completo en crearSolicitudConsulta:', error);
    console.error('❌ Stack:', error?.stack);
    
    // Manejar error de email duplicado
    if (error?.name === 'SequelizeUniqueConstraintError' || 
        error?.parent?.code === '23505' ||
        error?.message?.includes('llave duplicada') ||
        error?.message?.includes('usuarios_email_key')) {
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado en nuestro sistema. Por favor, inicia sesión o contacta con nosotros si necesitas ayuda.',
        'SOL_011'
      );
    }

    log.error('Error en crearSolicitudConsulta:', {
      message: error?.message,
      stack: error?.stack,
      error: error
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error interno al procesar la solicitud: ${error?.message || 'Error desconocido'}`,
      'SOL_010'
    );
  }
};


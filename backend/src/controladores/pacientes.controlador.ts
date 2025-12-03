// Controlador de pacientes
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { MENSAJES_PACIENTES } from '../utilidades/mensajes';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { enviarEmailRegistroPaciente } from '../utilidades/email.service';

export const obtenerTodos = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    
    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_001'
      );
    }

    // Obtener pacientes del psicólogo autenticado (normalizado)
    const [pacientes] = await sequelize.query(`
      SELECT 
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
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.psicologo_id = :psicologoId
      AND p.deleted_at IS NULL
      ORDER BY p.fecha_ingreso DESC
    `, {
      replacements: { psicologoId }
    }) as [any[], unknown];
    
    // Enriquecer los resultados con campos adicionales si existen
    const pacientesEnriquecidos = pacientes.map((paciente: any) => ({
      ...paciente,
      direccion: paciente.direccion || null,
      contacto_emergencia_nombre: paciente.contacto_emergencia_nombre || null,
      contacto_emergencia_telefono: paciente.contacto_emergencia_telefono || null,
      contacto_emergencia_relacion: paciente.contacto_emergencia_relacion || null,
      diagnosticos: paciente.diagnosticos || [],
      etiquetas: paciente.etiquetas || [],
      estrategias_autorregulacion: paciente.estrategias_autorregulacion || [],
      puntos_acumulados: paciente.puntos_acumulados || 0,
      fecha_alta: paciente.fecha_alta || null,
      observaciones: paciente.observaciones || null,
    }));

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.LISTA_OBTENIDA,
      {
        pacientes: pacientesEnriquecidos,
        total: pacientesEnriquecidos.length,
        activos: pacientesEnriquecidos.filter((p: any) => p.estado === 'activo').length
      },
      'PAC_002'
    );
  } catch (error: any) {
    // Logging exhaustivo del error
    console.error('🔴 ========== ERROR EN OBTENER PACIENTES ==========');
    console.error('Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('Tipo de error (name):', error?.name);
    console.error('Mensaje:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Original:', error?.original);
    console.error('Parent:', error?.parent);
    console.error('Código original:', error?.original?.code);
    console.error('Código parent:', error?.parent?.code);
    console.error('Mensaje original:', error?.original?.message);
    console.error('===================================================');
    
    log.error('Error en obtenerTodos:', error);
    log.error('Tipo de error:', error?.name);
    log.error('Código original:', error?.original?.code);
    log.error('Mensaje:', error?.message);
    
    // Detectar errores de conexión a la base de datos (más exhaustivo)
    const errorString = JSON.stringify(error).toLowerCase();
    const isDbError = 
      error?.name === 'SequelizeConnectionError' || 
      error?.name === 'SequelizeConnectionRefusedError' ||
      error?.name === 'SequelizeHostNotFoundError' ||
      error?.name === 'SequelizeAccessDeniedError' ||
      error?.name === 'ConnectionError' ||
      error?.name?.includes('Connection') ||
      error?.original?.code === '28P01' ||
      error?.original?.code === 'ECONNREFUSED' ||
      error?.original?.code === 'ENOTFOUND' ||
      error?.parent?.code === '28P01' ||
      error?.parent?.code === 'ECONNREFUSED' ||
      error?.message?.toLowerCase().includes('password') ||
      error?.message?.toLowerCase().includes('autentificación') ||
      error?.message?.toLowerCase().includes('authentication') ||
      error?.message?.toLowerCase().includes('connection') ||
      error?.message?.toLowerCase().includes('connect econnrefused') ||
      errorString.includes('password') ||
      errorString.includes('autentificación') ||
      errorString.includes('authentication') ||
      errorString.includes('28p01') ||
      errorString.includes('econnrefused') ||
      (error?.original?.message && error.original.message.toLowerCase().includes('password'));
    
    if (isDbError) {
      console.error('🔴 Error de base de datos DETECTADO');
      log.error('🔴 Error de base de datos detectado');
      return ManejadorRespuestas.errorInterno(
        res,
        'Error de conexión a la base de datos. Verifica que PostgreSQL esté corriendo y las credenciales sean correctas.',
        'DB_001'
      );
    }
    
    console.error('⚠️ Error NO detectado como error de BD, usando mensaje genérico');
    
    // Incluir información del error en la respuesta si estamos en desarrollo
    const mensajeError = process.env.NODE_ENV === 'development' 
      ? `Error interno al obtener la lista de pacientes. Tipo: ${error?.name || 'Desconocido'}, Mensaje: ${error?.message || 'Sin mensaje'}`
      : 'Error interno al obtener la lista de pacientes';
    
    return ManejadorRespuestas.errorInterno(
      res,
      mensajeError,
      'PAC_003'
    );
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    
    log.info('🔍 Creando paciente - Psicólogo ID:', psicologoId);
    log.info('🔍 Usuario completo:', req.usuario);
    
    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_004'
      );
    }

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
      observaciones,
      etiquetas,
      diagnosticos
    } = req.body;

    // Validar datos requeridos
    if (!nombres || !apellidos || !email) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombres, apellidos y email son requeridos',
        { camposRequeridos: ['nombres', 'apellidos', 'email'] },
        'PAC_005'
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
        'PAC_006'
      );
    }

    // Verificar que el RUT no esté en uso por el mismo psicólogo
    if (rut) {
      const [rutExistente] = await sequelize.query(
        'SELECT id FROM pacientes WHERE rut = :rut AND psicologo_id = :psicologoId AND deleted_at IS NULL',
        { replacements: { rut, psicologoId } }
      ) as [any[], unknown];

      if (Array.isArray(rutExistente) && rutExistente.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El RUT ya está registrado para otro paciente',
          'PAC_007'
        );
      }
    }

    // Obtener el rol de paciente
    const [rolPaciente] = await sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'paciente'",
      { replacements: {} }
    ) as [any[], unknown];

    if (!Array.isArray(rolPaciente) || rolPaciente.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'Error: Rol de paciente no encontrado',
        'PAC_008'
      );
    }

    // Generar contraseña temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(passwordTemporal, 12);

    // Crear usuario del paciente
    const [usuarioCreado] = await sequelize.query(`
      INSERT INTO usuarios (
        id, email, password_hash, nombres, apellidos, telefono, 
        fecha_nacimiento, genero, rol_id, activo, email_verificado, 
        configuracion, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :email, :passwordHash, :nombres, :apellidos, :telefono,
        :fechaNacimiento, :genero, :rolId, true, false,
        '{}', NOW(), NOW()
      ) RETURNING id, token_activacion
    `, {
      replacements: {
        email,
        passwordHash,
        nombres,
        apellidos,
        telefono: telefono || null,
        fechaNacimiento: fecha_nacimiento || null,
        genero: genero || null,
        rolId: rolPaciente[0].id
      }
    }) as [any[], unknown];

    const usuarioId = usuarioCreado[0].id;
    const usuarioToken = usuarioCreado[0].token_activacion || '';

    // Generar número de ficha autoincremental por psicólogo
    log.info('🔍 Buscando última ficha para psicólogo:', psicologoId);
    
    // Buscar el siguiente número de ficha disponible
    const [ultimaFicha] = await sequelize.query(`
      SELECT numero_ficha 
      FROM pacientes 
      WHERE psicologo_id = :psicologoId 
      AND deleted_at IS NULL 
      ORDER BY numero_ficha DESC 
      LIMIT 1
    `, {
      replacements: { psicologoId }
    }) as [any[], unknown];
    
    log.info('🔍 Resultado de búsqueda de ficha:', ultimaFicha);

    // Obtener el número de psicólogo (asignar un número secuencial)
    const [psicologoNumero] = await sequelize.query(`
      SELECT COUNT(DISTINCT psicologo_id) + 1 as numero
      FROM pacientes 
      WHERE deleted_at IS NULL
    `) as [any[], unknown];
    
    const numeroPsicologo = Array.isArray(psicologoNumero) && psicologoNumero.length > 0 
      ? psicologoNumero[0].numero 
      : 1;
    
    let numeroFicha;
    if (Array.isArray(ultimaFicha) && ultimaFicha.length > 0) {
      // Extraer el número de la ficha existente
      const fichaExistente = ultimaFicha[0].numero_ficha;
      log.info('🔍 Ficha existente encontrada:', fichaExistente);
      
      const match = fichaExistente.match(/PSI-(\d+)-(\d+)/);
      if (match) {
        const ultimoNumero = parseInt(match[2]) || 0;
        numeroFicha = `PSI-${numeroPsicologo}-${String(ultimoNumero + 1).padStart(4, '0')}`;
        log.info('🔍 Último número extraído:', ultimoNumero);
      } else {
        numeroFicha = `PSI-${numeroPsicologo}-0001`;
        log.info('🔍 No se pudo extraer número, usando 0001');
      }
    } else {
      numeroFicha = `PSI-${numeroPsicologo}-0001`;
      log.info('🔍 No hay fichas existentes, usando 0001');
    }
    
    // Verificar que el número de ficha no exista ya
    const [fichaExistente] = await sequelize.query(`
      SELECT id FROM pacientes WHERE numero_ficha = :numeroFicha AND deleted_at IS NULL
    `, {
      replacements: { numeroFicha }
    }) as [any[], unknown];
    
    if (Array.isArray(fichaExistente) && fichaExistente.length > 0) {
      // Si existe, buscar el siguiente número disponible
      const [siguienteFicha] = await sequelize.query(`
        SELECT numero_ficha 
        FROM pacientes 
        WHERE numero_ficha LIKE :patron 
        AND deleted_at IS NULL 
        ORDER BY numero_ficha DESC 
        LIMIT 1
      `, {
        replacements: { patron: `PSI-${numeroPsicologo}-%` }
      }) as [any[], unknown];
      
      if (Array.isArray(siguienteFicha) && siguienteFicha.length > 0) {
        const match = siguienteFicha[0].numero_ficha.match(/PSI-(\d+)-(\d+)/);
        if (match) {
          const ultimoNumero = parseInt(match[2]) || 0;
          numeroFicha = `PSI-${numeroPsicologo}-${String(ultimoNumero + 1).padStart(4, '0')}`;
          log.info('🔍 Número de ficha ajustado:', numeroFicha);
        }
      }
    }
    
    log.info('🎯 Número de ficha final generado:', numeroFicha);

    // Crear paciente (sin columnas legacy normalizadas)
    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        id, usuario_id, psicologo_id, nombres, apellidos, email, telefono, fecha_nacimiento, genero,
        numero_ficha, rut, direccion,
        estrategias_autorregulacion, puntos_acumulados, estado,
        fecha_ingreso, observaciones, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :usuarioId, :psicologoId, :nombres, :apellidos, :email, :telefono, :fechaNacimiento, :genero,
        :numeroFicha, :rut, :direccion,
        '[]', 0, 'activo',
        NOW(), :observaciones, NOW(), NOW()
      ) RETURNING id, numero_ficha
    `, {
      replacements: {
        usuarioId,
        psicologoId,
        nombres,
        apellidos,
        email,
        telefono: telefono || null,
        fechaNacimiento: fecha_nacimiento || null,
        genero: genero || null,
        numeroFicha,
        rut: rut || null,
        direccion: direccion || null,
        observaciones: observaciones || null
      }
    }) as [any[], unknown];

    log.info(`Paciente creado: ${numeroFicha} por psicólogo ${psicologoId}`);

    const nuevoPacienteId = pacienteCreado[0].id;

    // Insertar contacto de emergencia normalizado (si viene en payload)
    if (contacto_emergencia_nombre || contacto_emergencia_telefono || contacto_emergencia_relacion) {
      await sequelize.query(`
        INSERT INTO contactos_emergencia (id, paciente_id, nombre, telefono, relacion, created_at, updated_at)
        VALUES (gen_random_uuid(), :pacienteId, :nombre, :telefono, :relacion, NOW(), NOW())
      `, {
        replacements: {
          pacienteId: nuevoPacienteId,
          nombre: contacto_emergencia_nombre || 'Sin nombre',
          telefono: contacto_emergencia_telefono || null,
          relacion: contacto_emergencia_relacion || null,
        }
      });
    }

    // Insertar etiquetas normalizadas (si vienen)
    if (Array.isArray(etiquetas) && etiquetas.length > 0) {
      for (const nombre of etiquetas) {
        if (!nombre || typeof nombre !== 'string') continue;
        const [e] = await sequelize.query(`
          INSERT INTO etiquetas (id, nombre, created_at, updated_at)
          VALUES (gen_random_uuid(), :nombre, NOW(), NOW())
          ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
          RETURNING id
        `, { replacements: { nombre } }) as [any[], unknown];
        const etiquetaId = e[0].id;
        await sequelize.query(`
          INSERT INTO paciente_etiquetas (paciente_id, etiqueta_id, created_at)
          VALUES (:pacienteId, :etiquetaId, NOW())
          ON CONFLICT DO NOTHING
        `, { replacements: { pacienteId: nuevoPacienteId, etiquetaId } });
      }
    }

    // Insertar diagnósticos normalizados (si vienen)
    if (Array.isArray(diagnosticos) && diagnosticos.length > 0) {
      for (const d of diagnosticos) {
        if (!d) continue;
        const codigo = typeof d === 'object' ? d.codigo || null : null;
        const nombre = typeof d === 'object' ? (d.nombre || d) : d;
        if (!nombre || typeof nombre !== 'string') continue;

        // Buscar existente por código o nombre
        let diagId: string | null = null;
        if (codigo) {
          const [ex1] = await sequelize.query(`SELECT id FROM diagnosticos WHERE codigo = :codigo LIMIT 1`, { replacements: { codigo } }) as [any[], unknown];
          if (Array.isArray(ex1) && ex1.length > 0) diagId = ex1[0].id;
        }
        if (!diagId) {
          const [ex2] = await sequelize.query(`SELECT id FROM diagnosticos WHERE nombre = :nombre LIMIT 1`, { replacements: { nombre } }) as [any[], unknown];
          if (Array.isArray(ex2) && ex2.length > 0) diagId = ex2[0].id;
        }
        if (!diagId) {
          const [ins] = await sequelize.query(`
            INSERT INTO diagnosticos (id, codigo, nombre, created_at, updated_at)
            VALUES (gen_random_uuid(), :codigo, :nombre, NOW(), NOW())
            RETURNING id
          `, { replacements: { codigo, nombre } }) as [any[], unknown];
          diagId = ins[0].id;
        }

        await sequelize.query(`
          INSERT INTO paciente_diagnosticos (paciente_id, diagnostico_id, created_at)
          VALUES (:pacienteId, :diagId, NOW())
          ON CONFLICT DO NOTHING
        `, { replacements: { pacienteId: nuevoPacienteId, diagId } });
      }
    }

    // Enviar email de bienvenida al paciente con la contraseña temporal
    const nombreCompleto = `${nombres} ${apellidos}`;
    const emailEnviado = await enviarEmailRegistroPaciente(
      email,
      nombreCompleto,
      email,
      passwordTemporal,
      usuarioToken
    );

    if (emailEnviado) {
      log.info(`Email de bienvenida enviado exitosamente al paciente: ${email}`);
    } else {
      log.warn(`No se pudo enviar el email de bienvenida al paciente: ${email}`);
    }

    return ManejadorRespuestas.creado(
      res,
      MENSAJES_PACIENTES.PACIENTE_CREADO,
      {
        id: pacienteCreado[0].id,
        numero_ficha: pacienteCreado[0].numero_ficha,
        nombres,
        apellidos,
        email,
        password_temporal: passwordTemporal,
        email_enviado: emailEnviado,
        mensaje: 'Paciente creado exitosamente. Se ha enviado un email con la contraseña temporal al paciente.'
      },
      'PAC_009'
    );
  } catch (error) {
    log.error('Error en crear:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al crear el paciente', 'PAC_010');
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_006'
      );
    }

    if (!id) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente requerido',
        { idRecibido: id },
        'PAC_007'
      );
    }

    // Obtener paciente del psicólogo autenticado (normalizado)
    const [pacientes] = await sequelize.query(`
      SELECT 
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
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        CASE WHEN p.estado = 'activo' THEN true ELSE false END as activo,
        p.created_at,
        p.updated_at
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = :id 
      AND p.psicologo_id = :psicologoId
      AND p.deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'PAC_008'
      );
    }

    const paciente = pacientes[0];

    return ManejadorRespuestas.exito(
      res,
      'Información del paciente obtenida exitosamente',
      paciente,
      'PAC_009'
    );
  } catch (error) {
    log.error('Error en obtenerPorId:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener el paciente', 'PAC_010');
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = req.usuario?.id;
    
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
      observaciones,
      estado
    } = req.body;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_011'
      );
    }

    if (!id) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente requerido',
        { idRecibido: id },
        'PAC_012'
      );
    }

    // Verificar que el paciente pertenece al psicólogo
    const [pacienteExistente] = await sequelize.query(`
      SELECT p.id, p.usuario_id, p.numero_ficha
      FROM pacientes p
      WHERE p.id = :id 
      AND p.psicologo_id = :psicologoId
      AND p.deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteExistente) || pacienteExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'PAC_013'
      );
    }

    const paciente = pacienteExistente[0];

    // Verificar que el email no esté en uso por otro usuario
    if (email) {
      const [emailExistente] = await sequelize.query(`
        SELECT id FROM usuarios 
        WHERE email = :email 
        AND id != :usuarioId
      `, {
        replacements: { email, usuarioId: paciente.usuario_id }
      }) as [any[], unknown];

      if (Array.isArray(emailExistente) && emailExistente.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El email ya está registrado por otro usuario',
          'PAC_014'
        );
      }
    }

    // Verificar que el RUT no esté en uso por otro paciente del mismo psicólogo
    if (rut) {
      const [rutExistente] = await sequelize.query(`
        SELECT id FROM pacientes 
        WHERE rut = :rut 
        AND psicologo_id = :psicologoId 
        AND id != :id
        AND deleted_at IS NULL
      `, {
        replacements: { rut, psicologoId, id }
      }) as [any[], unknown];

      if (Array.isArray(rutExistente) && rutExistente.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El RUT ya está registrado para otro paciente',
          'PAC_015'
        );
      }
    }

    // Actualizar usuario
    if (nombres || apellidos || email || telefono || fecha_nacimiento || genero) {
      const camposUsuario = [];
      const valoresUsuario: any = {};

      if (nombres) {
        camposUsuario.push('nombres = :nombres');
        valoresUsuario.nombres = nombres;
      }
      if (apellidos) {
        camposUsuario.push('apellidos = :apellidos');
        valoresUsuario.apellidos = apellidos;
      }
      if (email) {
        camposUsuario.push('email = :email');
        valoresUsuario.email = email;
      }
      if (telefono !== undefined) {
        camposUsuario.push('telefono = :telefono');
        valoresUsuario.telefono = telefono || null;
      }
      if (fecha_nacimiento !== undefined) {
        camposUsuario.push('fecha_nacimiento = :fecha_nacimiento');
        valoresUsuario.fecha_nacimiento = fecha_nacimiento || null;
      }
      if (genero !== undefined) {
        camposUsuario.push('genero = :genero');
        valoresUsuario.genero = genero || null;
      }

      if (camposUsuario.length > 0) {
        camposUsuario.push('updated_at = NOW()');
        valoresUsuario.usuarioId = paciente.usuario_id;

        await sequelize.query(`
          UPDATE usuarios 
          SET ${camposUsuario.join(', ')}
          WHERE id = :usuarioId
        `, {
          replacements: valoresUsuario
        });
      }
    }

    // Actualizar paciente
    const camposPaciente = [];
    const valoresPaciente: any = { id, psicologoId };

    if (rut !== undefined) {
      camposPaciente.push('rut = :rut');
      valoresPaciente.rut = rut || null;
    }
    if (direccion !== undefined) {
      camposPaciente.push('direccion = :direccion');
      valoresPaciente.direccion = direccion || null;
    }
    if (observaciones !== undefined) {
      camposPaciente.push('observaciones = :observaciones');
      valoresPaciente.observaciones = observaciones || null;
    }
    if (estado !== undefined) {
      camposPaciente.push('estado = :estado');
      valoresPaciente.estado = estado;
    }

    if (camposPaciente.length > 0) {
      camposPaciente.push('updated_at = NOW()');

      await sequelize.query(`
        UPDATE pacientes 
        SET ${camposPaciente.join(', ')}
        WHERE id = :id AND psicologo_id = :psicologoId
      `, {
        replacements: valoresPaciente
      });
    }

    // Actualizar contactos de emergencia en tabla normalizada
    if (contacto_emergencia_nombre !== undefined || contacto_emergencia_telefono !== undefined || contacto_emergencia_relacion !== undefined) {
      // Buscar contacto existente o crear uno nuevo
      const [contactoExistente] = await sequelize.query(`
        SELECT id FROM contactos_emergencia 
        WHERE paciente_id = :pacienteId AND deleted_at IS NULL
        ORDER BY created_at ASC LIMIT 1
      `, {
        replacements: { pacienteId: id }
      }) as [any[], unknown];

      if (Array.isArray(contactoExistente) && contactoExistente.length > 0) {
        // Actualizar contacto existente
        await sequelize.query(`
          UPDATE contactos_emergencia 
          SET nombre = COALESCE(:nombre, nombre),
              telefono = COALESCE(:telefono, telefono),
              relacion = COALESCE(:relacion, relacion),
              updated_at = NOW()
          WHERE id = :contactoId
        `, {
          replacements: {
            contactoId: contactoExistente[0].id,
            nombre: contacto_emergencia_nombre || null,
            telefono: contacto_emergencia_telefono || null,
            relacion: contacto_emergencia_relacion || null,
          }
        });
      } else if (contacto_emergencia_nombre) {
        // Crear nuevo contacto
        await sequelize.query(`
          INSERT INTO contactos_emergencia (id, paciente_id, nombre, telefono, relacion, created_at, updated_at)
          VALUES (gen_random_uuid(), :pacienteId, :nombre, :telefono, :relacion, NOW(), NOW())
        `, {
          replacements: {
            pacienteId: id,
            nombre: contacto_emergencia_nombre,
            telefono: contacto_emergencia_telefono || null,
            relacion: contacto_emergencia_relacion || null,
          }
        });
      }
    }

    // Obtener paciente actualizado (normalizado)
    const [pacienteActualizado] = await sequelize.query(`
      SELECT 
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
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        CASE WHEN p.estado = 'activo' THEN true ELSE false END as activo,
        p.created_at,
        p.updated_at
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = :id 
      AND p.psicologo_id = :psicologoId
      AND p.deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.PACIENTE_ACTUALIZADO,
      pacienteActualizado[0],
      'PAC_016'
    );
  } catch (error) {
    log.error('Error en actualizar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar el paciente',
      'PAC_017'
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

export const buscarPacientes = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    
    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_018'
      );
    }

    const { q: query } = req.query; // q puede ser ficha, RUT o nombre

    if (!query || typeof query !== 'string') {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Término de búsqueda requerido',
        { parametro: 'q' },
        'PAC_019'
      );
    }

    const searchTerm = `%${query.trim()}%`;

    // Buscar pacientes del psicólogo por ficha, RUT o nombre (normalizado en select)
    const [pacientes] = await sequelize.query(`
      SELECT 
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
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.psicologo_id = :psicologoId
      AND p.deleted_at IS NULL
      AND (
        p.numero_ficha ILIKE :searchTerm
        OR p.rut ILIKE :searchTerm
        OR u.nombres ILIKE :searchTerm
        OR u.apellidos ILIKE :searchTerm
        OR CONCAT(u.nombres, ' ', u.apellidos) ILIKE :searchTerm
      )
      ORDER BY p.fecha_ingreso DESC
      LIMIT 20
    `, {
      replacements: { psicologoId, searchTerm }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Búsqueda completada exitosamente',
      {
        pacientes,
        total: pacientes.length,
        termino_busqueda: query
      },
      'PAC_020'
    );
  } catch (error) {
    log.error('Error en buscarPacientes:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al buscar pacientes',
      'PAC_021'
    );
  }
};

export const obtenerHistorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_022'
      );
    }

    if (!id || isNaN(Number(id))) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente inválido',
        { idRecibido: id },
        'PAC_023'
      );
    }

    // Verificar que el paciente pertenece al psicólogo
    const [paciente] = await sequelize.query(`
      SELECT id FROM pacientes 
      WHERE id = :id AND psicologo_id = :psicologoId AND deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(paciente) || paciente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'PAC_024'
      );
    }

    // Obtener historial de sesiones
    const [sesiones] = await sequelize.query(`
      SELECT 
        id, fecha_programada, fecha_inicio, fecha_fin, duracion_minutos,
        tipo_sesion, estado, notas_evolucion, objetivos_sesion,
        tecnicas_utilizadas, evaluacion_paciente, observaciones
      FROM sesiones 
      WHERE paciente_id = :id AND deleted_at IS NULL
      ORDER BY fecha_programada DESC
    `, {
      replacements: { id }
    }) as [any[], unknown];

    // Obtener historial de tareas
    const [tareas] = await sequelize.query(`
      SELECT 
        id, titulo, descripcion, tipo_tarea, prioridad, fecha_asignacion,
        fecha_vencimiento, fecha_completada, estado, puntos_asignados,
        respuesta_paciente, evaluacion_psicologo
      FROM tareas 
      WHERE paciente_id = :id AND deleted_at IS NULL
      ORDER BY fecha_asignacion DESC
    `, {
      replacements: { id }
    }) as [any[], unknown];

    // Calcular estadísticas
    const sesionesCompletadas = sesiones.filter((s: any) => s.estado === 'completada').length;
    const tareasCompletadas = tareas.filter((t: any) => t.estado === 'completada').length;
    const puntosTotal = tareas.reduce((sum: number, t: any) => sum + (t.puntos_asignados || 0), 0);

    const historial = {
      pacienteId: Number(id),
      sesiones,
      tareas,
      progreso: {
        sesionesCompletadas,
        tareasCompletadas,
        tareasAsignadas: tareas.length,
        puntosTotal,
        nivelActual: Math.floor(puntosTotal / 100) + 1
      }
    };

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_PACIENTES.HISTORIAL_OBTENIDO,
      historial,
      'PAC_025'
    );
  } catch (error) {
    log.error('Error en obtenerHistorial:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener el historial',
      'PAC_026'
    );
  }
};

export const obtenerPsicologoAsignado = async (req: Request, res: Response) => {
  try {
    const pacienteId = req.usuario?.id;
    
    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'PAC_027'
      );
    }

    // Obtener el psicólogo asignado al paciente autenticado
    const [psicologo] = await sequelize.query(`
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.especialidad,
        u.descripcion,
        u.avatar_url,
        u.created_at,
        u.updated_at
      FROM usuarios u
      INNER JOIN pacientes p ON p.psicologo_id = u.id
      WHERE p.usuario_id = :pacienteId
      AND p.deleted_at IS NULL
      AND u.deleted_at IS NULL
      LIMIT 1
    `, {
      replacements: { pacienteId }
    }) as [any[], unknown];

    if (!Array.isArray(psicologo) || psicologo.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'No se encontró un psicólogo asignado',
        'PAC_028'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Psicólogo asignado obtenido exitosamente',
      psicologo[0],
      'PAC_029'
    );

  } catch (error) {
    log.error('Error en obtenerPsicologoAsignado:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener el psicólogo asignado',
      'PAC_030'
    );
  }
};

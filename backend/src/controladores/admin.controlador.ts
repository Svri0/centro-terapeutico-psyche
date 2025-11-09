import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
// import { crearDisponibilidadPorDefecto } from './disponibilidadMensual.controlador';
import AuditoriaService from '../utilidades/auditoria.service';
import { enviarEmailBienvenidaPsicologo, enviarEmailRegistroPaciente } from '../utilidades/email.service';

// Interfaz para crear psicólogo
interface CrearPsicologoData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  codigo_sbs?: string;
}

// Interfaz para actualizar psicólogo
interface ActualizarPsicologoData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
}

// Obtener todos los psicólogos
export const obtenerPsicologos = async (_req: Request, res: Response) => {
  try {
    console.log('🔍 Admin solicitando lista de psicólogos...');
    
    const query = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.especialidad,
        u.descripcion,
        u.avatar_url,
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

    console.log('🔍 Ejecutando query:', query);

    const [psicologos] = await sequelize.query(query) as [any[], unknown];

    console.log('✅ Psicólogos encontrados:', psicologos.length);
    console.log('📋 Datos de psicólogos:', psicologos);

    return ManejadorRespuestas.exito(
      res,
      'Psicólogos obtenidos exitosamente',
      psicologos,
      'ADMIN_001'
    );
  } catch (error) {
    console.error('❌ Error en obtenerPsicologos:', error);
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
    const { nombres, apellidos, email, password, telefono, fecha_nacimiento, genero, especialidad, descripcion, avatar_url, codigo_sbs }: CrearPsicologoData = req.body;
    
    // Usar el avatar_url del body si se proporciona, o usar uno aleatorio de robots
    const avataresRobots = [
      'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=dolphin&backgroundColor=bfdfff&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=owl&backgroundColor=8b4513&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=butterfly&backgroundColor=ffb6c1&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=bee&backgroundColor=ffff00&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=turtle&backgroundColor=90ee90&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=rabbit&backgroundColor=ffffff&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=000000&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=giraffe&backgroundColor=daa520&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=koala&backgroundColor=8b4513&scale=80&mouth=smile&eyes=happy',
      'https://api.dicebear.com/7.x/bottts/svg?seed=panda&backgroundColor=000000&scale=80&mouth=smile&eyes=happy'
    ];
    
    const avatarUrl = avatar_url || avataresRobots[Math.floor(Math.random() * avataresRobots.length)];

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

    // Validar código SBS si se proporciona
    if (codigo_sbs && (codigo_sbs.length < 6 || codigo_sbs.length > 8 || !/^\d+$/.test(codigo_sbs))) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'El código SBS debe tener entre 6 y 8 dígitos numéricos',
        { codigo_sbs },
        'ADMIN_009'
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
        fecha_nacimiento, genero, especialidad, descripcion, avatar_url, codigo_sbs, rol_id, activo, email_verificado,
        token_activacion, token_activacion_expira, configuracion,
        created_at, updated_at
      ) VALUES (
        :id, :nombres, :apellidos, :email, :password_hash, :telefono,
        :fecha_nacimiento, :genero, :especialidad, :descripcion, :avatar_url, :codigo_sbs, :rol_id, :activo, :email_verificado,
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
          especialidad: especialidad || null,
          descripcion: descripcion || null,
          avatar_url: avatarUrl,
          codigo_sbs: codigo_sbs || null,
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
            // await crearDisponibilidadPorDefecto(psicologoId);

    // Enviar email de bienvenida al psicólogo
    const nombreCompleto = `${nombres} ${apellidos}`;
    
    // Función para convertir imagen a base64
    const convertirImagenABase64 = (filePath: string): string | null => {
      try {
        const fullPath = path.join(__dirname, '..', '..', 'uploads', 'avatars', path.basename(filePath));
        log.info(`DEBUG - Intentando leer imagen desde: ${fullPath}`);
        
        if (fs.existsSync(fullPath)) {
          const imageBuffer = fs.readFileSync(fullPath);
          const base64 = imageBuffer.toString('base64');
          const mimeType = 'image/png'; // Asumimos PNG por el componente CircularImageEditor
          return `data:${mimeType};base64,${base64}`;
        } else {
          log.warn(`DEBUG - Archivo no encontrado: ${fullPath}`);
          return null;
        }
      } catch (error) {
        log.error('Error al convertir imagen a base64:', error);
        return null;
      }
    };
    
    // Usar la URL del avatar directamente para el email
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      email,
      nombreCompleto,
      password,
      especialidad,
      avatarUrl
    );

    if (emailEnviado) {
      log.info(`Email de bienvenida enviado exitosamente a: ${email}`);
    } else {
      log.warn(`No se pudo enviar el email de bienvenida a: ${email}`);
    }

    log.info(`Nuevo psicólogo creado: ${email} con token: ${tokenActivacion}`);

    return ManejadorRespuestas.creado(
      res,
      'Psicólogo creado exitosamente. Se ha enviado un email de bienvenida.',
      {
        usuario: nuevoUsuario[0],
        email_enviado: emailEnviado,
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
    const { nombres, apellidos, email, telefono, fecha_nacimiento, genero, especialidad, descripcion }: ActualizarPsicologoData = req.body;
    
    // Obtener la URL del avatar si se subió una imagen
    const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

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
    if (especialidad !== undefined) {
      camposActualizar.push('especialidad = :especialidad');
      replacements.especialidad = especialidad;
    }
    if (descripcion !== undefined) {
      camposActualizar.push('descripcion = :descripcion');
      replacements.descripcion = descripcion;
    }
    if (avatar_url !== undefined) {
      camposActualizar.push('avatar_url = :avatar_url');
      replacements.avatar_url = avatar_url;
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

      const [pacientes] = await sequelize.query(
        'SELECT COUNT(*) as total FROM pacientes WHERE psicologo_id = :id',
        {
          replacements: { id },
          transaction
        }
      ) as [any[], unknown];

      totalSesiones = Array.isArray(sesiones) && sesiones.length > 0 ? (sesiones[0] as any).total : 0;
      totalPacientes = Array.isArray(pacientes) && pacientes.length > 0 ? (pacientes[0] as any).total : 0;

    } catch (countError: any) {
      log.warn('Error al contar registros relacionados:', countError);
      // Continuar con la eliminación
    }

    if (totalSesiones > 0 || totalPacientes > 0) {
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
            total_pacientes: totalPacientes
          }
        );
      }
      
      return ManejadorRespuestas.conflicto(
        res,
        `No se puede eliminar al psicólogo ${psicologoData.nombres} ${psicologoData.apellidos} porque tiene registros relacionados: ${totalSesiones} sesión(es), ${totalPacientes} paciente(s). Considere desactivar la cuenta en lugar de eliminarla.`,
        { 
          psicologo_id: id,
          total_sesiones: totalSesiones,
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
      { query: 'DELETE FROM disponibilidad_mensual WHERE psicologo_id = :id', name: 'disponibilidad_mensual' },
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

// Obtener todos los pacientes (para administradores)
export const obtenerTodosPacientes = async (req: Request, res: Response) => {
  try {
    // Obtener todos los pacientes del sistema
    const [pacientes] = await sequelize.query(`
      SELECT 
        p.id,
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
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.activo,
        u.created_at,
        u.updated_at,
        ps.nombres as psicologo_nombres,
        ps.apellidos as psicologo_apellidos
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN usuarios ps ON p.psicologo_id = ps.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.fecha_ingreso DESC
    `) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Lista de pacientes obtenida exitosamente',
      {
        pacientes,
        total: pacientes.length,
        activos: pacientes.filter((p: any) => p.activo).length
      },
      'ADMIN_030'
    );
  } catch (error) {
    log.error('Error en obtenerTodosPacientes:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener la lista de pacientes',
      'ADMIN_031'
    );
  }
};

// Crear paciente (para administradores)
export const crearPaciente = async (req: Request, res: Response) => {
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

    // Verificar que el email no esté en uso
    const [usuarioExistente] = await sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      { replacements: { email } }
    ) as [any[], unknown];

    if (Array.isArray(usuarioExistente) && usuarioExistente.length > 0) {
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado',
        'ADMIN_032'
      );
    }

    // Verificar que el RUT no esté en uso
    if (rut) {
      const [rutExistente] = await sequelize.query(
        'SELECT id FROM pacientes WHERE rut = :rut',
        { replacements: { rut } }
      ) as [any[], unknown];

      if (Array.isArray(rutExistente) && rutExistente.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El RUT ya está registrado',
          'ADMIN_033'
        );
      }
    }

    // Generar password temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);

    // Crear usuario
    const [usuarioCreado] = await sequelize.query(`
      INSERT INTO usuarios (nombres, apellidos, email, password_hash, telefono, fecha_nacimiento, genero, rol_id, activo, created_at, updated_at)
      VALUES (:nombres, :apellidos, :email, :password_hash, :telefono, :fecha_nacimiento, :genero, 3, true, NOW(), NOW())
      RETURNING id, nombres, apellidos, email, telefono, fecha_nacimiento, genero, activo, created_at, updated_at
    `, {
      replacements: {
        nombres,
        apellidos,
        email,
        password_hash: passwordTemporal, // En producción, esto debería estar hasheado
        telefono,
        fecha_nacimiento,
        genero
      }
    }) as [any[], unknown];

    if (!Array.isArray(usuarioCreado) || usuarioCreado.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al crear el usuario',
        'ADMIN_034'
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

    // Obtener el primer psicólogo disponible para asignar al paciente
    const [psicologoDisponible] = await sequelize.query(`
      SELECT u.id FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'psicologo' AND u.activo = true
      LIMIT 1
    `) as [any[], unknown];

    if (!Array.isArray(psicologoDisponible) || psicologoDisponible.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'No hay psicólogos disponibles en el sistema',
        'ADMIN_034'
      );
    }

    const psicologoId = psicologoDisponible[0].id;

    // Crear paciente
    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        usuario_id, psicologo_id, numero_ficha, rut, direccion, 
        contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion,
        observaciones, estado, fecha_ingreso, created_at, updated_at
      )
      VALUES (
        :usuario_id, :psicologo_id, :numero_ficha, :rut, :direccion,
        :contacto_emergencia_nombre, :contacto_emergencia_telefono, :contacto_emergencia_relacion,
        :observaciones, 'activo', NOW(), NOW(), NOW()
      )
      RETURNING id, numero_ficha, rut, direccion, contacto_emergencia_nombre, 
                contacto_emergencia_telefono, contacto_emergencia_relacion, observaciones, estado, fecha_ingreso
    `, {
      replacements: {
        usuario_id: usuario.id,
        psicologo_id: psicologoId,
        numero_ficha: numeroFicha,
        rut,
        direccion,
        contacto_emergencia_nombre,
        contacto_emergencia_telefono,
        contacto_emergencia_relacion,
        observaciones
      }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteCreado) || pacienteCreado.length === 0) {
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al crear el paciente',
        'ADMIN_035'
      );
    }

    const paciente = pacienteCreado[0];

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
      'Paciente creado exitosamente. Se ha enviado un email de bienvenida.',
      {
        ...usuario,
        ...paciente,
        password_temporal: passwordTemporal,
        email_enviado: emailEnviado
      },
      'ADMIN_036'
    );

  } catch (error) {
    log.error('Error en crearPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al crear el paciente',
      'ADMIN_037'
    );
  }
};

// Actualizar paciente (para administradores)
export const actualizarPaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      activo
    } = req.body;

    // Verificar que el paciente existe
    const [pacienteExistente] = await sequelize.query(`
      SELECT p.id, p.usuario_id, u.email as email_actual, p.rut as rut_actual
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = :id AND p.deleted_at IS NULL
    `, {
      replacements: { id }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteExistente) || pacienteExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'ADMIN_038'
      );
    }

    const paciente = pacienteExistente[0];

    // Verificar que el email no esté en uso por otro usuario
    if (email && email !== paciente.email_actual) {
      const [emailEnUso] = await sequelize.query(
        'SELECT id FROM usuarios WHERE email = :email AND id != :usuario_id',
        { replacements: { email, usuario_id: paciente.usuario_id } }
      ) as [any[], unknown];

      if (Array.isArray(emailEnUso) && emailEnUso.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El email ya está registrado',
          'ADMIN_039'
        );
      }
    }

    // Verificar que el RUT no esté en uso por otro paciente
    if (rut && rut !== paciente.rut_actual) {
      const [rutEnUso] = await sequelize.query(
        'SELECT id FROM pacientes WHERE rut = :rut AND id != :id',
        { replacements: { rut, id } }
      ) as [any[], unknown];

      if (Array.isArray(rutEnUso) && rutEnUso.length > 0) {
        return ManejadorRespuestas.conflicto(
          res,
          'El RUT ya está registrado',
          'ADMIN_040'
        );
      }
    }

    // Actualizar usuario
    await sequelize.query(`
      UPDATE usuarios 
      SET nombres = COALESCE(:nombres, nombres),
          apellidos = COALESCE(:apellidos, apellidos),
          email = COALESCE(:email, email),
          telefono = COALESCE(:telefono, telefono),
          fecha_nacimiento = COALESCE(:fecha_nacimiento, fecha_nacimiento),
          genero = COALESCE(:genero, genero),
          activo = COALESCE(:activo, activo),
          updated_at = NOW()
      WHERE id = :usuario_id
    `, {
      replacements: {
        nombres,
        apellidos,
        email,
        telefono,
        fecha_nacimiento,
        genero,
        activo,
        usuario_id: paciente.usuario_id
      }
    });

    // Actualizar paciente
    await sequelize.query(`
      UPDATE pacientes 
      SET rut = COALESCE(:rut, rut),
          direccion = COALESCE(:direccion, direccion),
          contacto_emergencia_nombre = COALESCE(:contacto_emergencia_nombre, contacto_emergencia_nombre),
          contacto_emergencia_telefono = COALESCE(:contacto_emergencia_telefono, contacto_emergencia_telefono),
          contacto_emergencia_relacion = COALESCE(:contacto_emergencia_relacion, contacto_emergencia_relacion),
          observaciones = COALESCE(:observaciones, observaciones),
          updated_at = NOW()
      WHERE id = :id
    `, {
      replacements: {
        id,
        rut,
        direccion,
        contacto_emergencia_nombre,
        contacto_emergencia_telefono,
        contacto_emergencia_relacion,
        observaciones
      }
    });

    return ManejadorRespuestas.exito(
      res,
      'Paciente actualizado exitosamente',
      null,
      'ADMIN_041'
    );

  } catch (error) {
    log.error('Error en actualizarPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar el paciente',
      'ADMIN_042'
    );
  }
};

// Eliminar paciente (para administradores)
export const eliminarPaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const [pacienteExistente] = await sequelize.query(`
      SELECT p.id, p.usuario_id
      FROM pacientes p
      WHERE p.id = :id AND p.deleted_at IS NULL
    `, {
      replacements: { id }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteExistente) || pacienteExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'ADMIN_043'
      );
    }

    const paciente = pacienteExistente[0];

    // Soft delete del paciente
    await sequelize.query(`
      UPDATE pacientes 
      SET deleted_at = NOW()
      WHERE id = :id
    `, {
      replacements: { id }
    });

    // Soft delete del usuario
    await sequelize.query(`
      UPDATE usuarios 
      SET deleted_at = NOW()
      WHERE id = :usuario_id
    `, {
      replacements: { usuario_id: paciente.usuario_id }
    });

    return ManejadorRespuestas.exito(
      res,
      'Paciente eliminado exitosamente',
      null,
      'ADMIN_044'
    );

  } catch (error) {
    log.error('Error en eliminarPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al eliminar el paciente',
      'ADMIN_045'
    );
  }
};

// Activar paciente (para administradores)
export const activarPaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const [pacienteExistente] = await sequelize.query(`
      SELECT p.id, p.usuario_id
      FROM pacientes p
      WHERE p.id = :id AND p.deleted_at IS NULL
    `, {
      replacements: { id }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteExistente) || pacienteExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'ADMIN_046'
      );
    }

    const paciente = pacienteExistente[0];

    // Activar usuario
    await sequelize.query(`
      UPDATE usuarios 
      SET activo = true, updated_at = NOW()
      WHERE id = :usuario_id
    `, {
      replacements: { usuario_id: paciente.usuario_id }
    });

    return ManejadorRespuestas.exito(
      res,
      'Paciente activado exitosamente',
      null,
      'ADMIN_047'
    );

  } catch (error) {
    log.error('Error en activarPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al activar el paciente',
      'ADMIN_048'
    );
  }
};

// Desactivar paciente (para administradores)
export const desactivarPaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const [pacienteExistente] = await sequelize.query(`
      SELECT p.id, p.usuario_id
      FROM pacientes p
      WHERE p.id = :id AND p.deleted_at IS NULL
    `, {
      replacements: { id }
    }) as [any[], unknown];

    if (!Array.isArray(pacienteExistente) || pacienteExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'ADMIN_049'
      );
    }

    const paciente = pacienteExistente[0];

    // Desactivar usuario
    await sequelize.query(`
      UPDATE usuarios 
      SET activo = false, updated_at = NOW()
      WHERE id = :usuario_id
    `, {
      replacements: { usuario_id: paciente.usuario_id }
    });

    return ManejadorRespuestas.exito(
      res,
      'Paciente desactivado exitosamente',
      null,
      'ADMIN_050'
    );

  } catch (error) {
    log.error('Error en desactivarPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al desactivar el paciente',
      'ADMIN_051'
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

    // Obtener pacientes asignados al psicólogo (normalizado)
    const [pacientes] = await sequelize.query(
      `SELECT 
        p.id,
        p.usuario_id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
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
        p.created_at,
        p.updated_at
       FROM pacientes p
       INNER JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.psicologo_id = :id AND p.deleted_at IS NULL
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
export const obtenerSesionesPsicologo = async (req: Request, res: Response) => {
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

    // Obtener sesiones del psicólogo con información del paciente
    const [sesiones] = await sequelize.query(
      `SELECT 
        s.id,
        s.paciente_id,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos,
        u.email as paciente_email,
        s.fecha_programada as fecha,
        s.fecha_inicio as hora_inicio,
        s.fecha_fin as hora_fin,
        s.estado,
        s.tipo_sesion,
        s.created_at,
        s.updated_at
       FROM sesiones s
       INNER JOIN pacientes p ON s.paciente_id = p.id
       INNER JOIN usuarios u ON p.usuario_id = u.id
       WHERE s.psicologo_id = :id
       AND s.estado IN ('programada', 'confirmada', 'en_curso')
       ORDER BY s.fecha_programada ASC, s.fecha_inicio ASC`,
      {
        replacements: { id }
      }
    ) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Sesiones del psicólogo obtenidas exitosamente',
      sesiones,
      'ADMIN_035'
    );

  } catch (error) {
    log.error('Error en obtenerSesionesPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las sesiones del psicólogo',
      'ADMIN_036'
    );
  }
};

// Eliminar sesión específica
export const eliminarSesion = async (req: Request, res: Response) => {
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

    // Verificar que la sesión existe y obtener información
    const [cita] = await sequelize.query(
      `SELECT 
        s.id,
        s.paciente_id,
        s.psicologo_id,
        s.fecha_programada as fecha,
        s.fecha_inicio as hora_inicio,
        s.fecha_fin as hora_fin,
        s.estado,
        u_paciente.nombres as paciente_nombres,
        u_paciente.apellidos as paciente_apellidos,
        u_psicologo.nombres as psicologo_nombres,
        u_psicologo.apellidos as psicologo_apellidos
       FROM sesiones s
       INNER JOIN pacientes p ON s.paciente_id = p.id
       INNER JOIN usuarios u_paciente ON p.usuario_id = u_paciente.id
       INNER JOIN usuarios u_psicologo ON s.psicologo_id = u_psicologo.id
       WHERE s.id = :id`,
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    if (!Array.isArray(cita) || cita.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Sesión no encontrada',
        'ADMIN_038'
      );
    }

    const sesionData = cita[0] as any;

    // Verificar que la sesión no esté completada o cancelada
    if (sesionData.estado === 'completada' || sesionData.estado === 'cancelada') {
      await transaction.rollback();
      return ManejadorRespuestas.conflicto(
        res,
        'No se puede eliminar una sesión que ya está completada o cancelada',
        { estado: sesionData.estado },
        'ADMIN_039'
      );
    }

    // Eliminar la sesión
    await sequelize.query(
      'DELETE FROM sesiones WHERE id = :id',
      {
        replacements: { id },
        transaction
      }
    ) as [any[], unknown];

    await transaction.commit();

    // Log de auditoría
    const usuarioId = (req as any).usuario?.id;
    if (usuarioId && typeof usuarioId === 'string') {
      await AuditoriaService.logEliminacionSesion(
        id,
        sesionData,
        usuarioId,
        req
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Sesión eliminada exitosamente',
      {
        id,
        paciente: `${sesionData.paciente_nombres} ${sesionData.paciente_apellidos}`,
        psicologo: `${sesionData.psicologo_nombres} ${sesionData.psicologo_apellidos}`,
        fecha: sesionData.fecha,
        hora: sesionData.hora_inicio
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
        u_paciente.nombres,
        u_paciente.apellidos,
        p.psicologo_id as psicologo_actual_id,
        u_psicologo.nombres as psicologo_actual_nombres,
        u_psicologo.apellidos as psicologo_actual_apellidos
       FROM pacientes p
       INNER JOIN usuarios u_paciente ON p.usuario_id = u_paciente.id
       INNER JOIN usuarios u_psicologo ON p.psicologo_id = u_psicologo.id
       WHERE p.id = :pacienteId AND p.deleted_at IS NULL`,
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

    // Actualizar las sesiones futuras del paciente para que sean con el nuevo psicólogo
    await sequelize.query(
      `UPDATE sesiones 
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

// ==================== FUNCIONES PARA RECEPCIONISTAS ====================

// Interfaz para crear recepcionista
interface CrearRecepcionistaData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  avatar_url?: string;
}

// Interfaz para actualizar recepcionista
interface ActualizarRecepcionistaData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  avatar_url?: string;
}

// Obtener todos los recepcionistas
export const obtenerRecepcionistas = async (_req: Request, res: Response) => {
  try {
    console.log('🔍 Admin solicitando lista de recepcionistas...');
    
    const query = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.avatar_url,
        u.activo,
        u.created_at,
        u.updated_at,
        u.ultimo_acceso
      FROM usuarios u
      WHERE u.rol_id = 3
      ORDER BY u.created_at DESC
    `;

    const [recepcionistas] = await sequelize.query(query) as [any[], unknown];

    console.log(`✅ Se encontraron ${recepcionistas.length} recepcionistas`);

    return ManejadorRespuestas.exito(
      res,
      'Recepcionistas obtenidos exitosamente',
      recepcionistas,
      'ADMIN_052'
    );

  } catch (error) {
    log.error('Error en obtenerRecepcionistas:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener los recepcionistas',
      'ADMIN_053'
    );
  }
};

// Crear nuevo recepcionista
export const crearRecepcionista = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('👤 Admin creando nuevo recepcionista...');
    
    const {
      nombres,
      apellidos,
      email,
      password,
      telefono,
      fecha_nacimiento,
      genero,
      avatar_url
    }: CrearRecepcionistaData = req.body;

    // Validaciones básicas
    if (!nombres || !apellidos || !email || !password) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'Los campos nombres, apellidos, email y contraseña son obligatorios',
        'ADMIN_054'
      );
    }

    // Verificar si el email ya existe
    const emailExistente = await sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    if (Array.isArray(emailExistente) && emailExistente.length > 0) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'Ya existe un usuario con este email',
        'ADMIN_055'
      );
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario recepcionista
    const userId = uuidv4();
    const insertUserQuery = `
      INSERT INTO usuarios (
        id, nombres, apellidos, email, password_hash, telefono, 
        fecha_nacimiento, genero, rol_id, activo, avatar_url, created_at, updated_at
      ) VALUES (
        :id, :nombres, :apellidos, :email, :password_hash, :telefono,
        :fecha_nacimiento, :genero, 3, true, :avatar_url, NOW(), NOW()
      )
    `;

    await sequelize.query(insertUserQuery, {
      replacements: {
        id: userId,
        nombres,
        apellidos,
        email,
        password_hash: hashedPassword,
        telefono: telefono || null,
        fecha_nacimiento: fecha_nacimiento || null,
        genero: genero || null,
        avatar_url: avatar_url || null
      },
      transaction
    });

    // Obtener el recepcionista creado
    const recepcionistaQuery = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.avatar_url,
        u.activo,
        u.created_at,
        u.updated_at
      FROM usuarios u
      WHERE u.id = :id
    `;

    const [recepcionista] = await sequelize.query(recepcionistaQuery, {
      replacements: { id: userId },
      type: QueryTypes.SELECT,
      transaction
    });

    await transaction.commit();

    console.log(`✅ Recepcionista creado exitosamente: ${email}`);

    // Log de auditoría
    await AuditoriaService.crearLog({
      usuario_id: req.usuario?.id || 'system',
      accion: 'CREAR_RECEPCIONISTA',
      tabla_afectada: 'usuarios',
      registro_id: userId,
      metadatos: { 
        recepcionista_id: userId,
        descripcion: `Recepcionista creado: ${nombres} ${apellidos} (${email})`
      }
    });

    return ManejadorRespuestas.exito(
      res,
      'Recepcionista creado exitosamente',
      recepcionista,
      'ADMIN_056'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en crearRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear el recepcionista',
      'ADMIN_057'
    );
  }
};

// Actualizar recepcionista
export const actualizarRecepcionista = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      nombres,
      apellidos,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      avatar_url
    }: ActualizarRecepcionistaData = req.body;

    console.log(`👤 Admin actualizando recepcionista: ${id}`);

    // Verificar si el recepcionista existe
    const recepcionistaExistente = await sequelize.query(
      'SELECT id, email FROM usuarios WHERE id = :id AND rol_id = 3',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(recepcionistaExistente) || recepcionistaExistente.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.noEncontrado(
        res,
        'Recepcionista no encontrado',
        'ADMIN_058'
      );
    }

    // Si se está cambiando el email, verificar que no exista
    if (email && email !== (recepcionistaExistente[0] as any).email) {
      const emailExistente = await sequelize.query(
        'SELECT id FROM usuarios WHERE email = :email AND id != :id',
        {
          replacements: { email, id },
          type: QueryTypes.SELECT
        }
      );

      if (Array.isArray(emailExistente) && emailExistente.length > 0) {
        await transaction.rollback();
        return ManejadorRespuestas.errorValidacion(
          res,
          'Ya existe un usuario con este email',
          'ADMIN_059'
        );
      }
    }

    // Construir query de actualización dinámicamente
    const camposActualizar = [];
    const replacements: any = { id };

    if (nombres !== undefined) {
      camposActualizar.push('nombres = :nombres');
      replacements.nombres = nombres;
    }
    if (apellidos !== undefined) {
      camposActualizar.push('apellidos = :apellidos');
      replacements.apellidos = apellidos;
    }
    if (email !== undefined) {
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
    if (avatar_url !== undefined) {
      camposActualizar.push('avatar_url = :avatar_url');
      replacements.avatar_url = avatar_url;
    }

    if (camposActualizar.length === 0) {
      await transaction.rollback();
      return ManejadorRespuestas.errorValidacion(
        res,
        'No se proporcionaron campos para actualizar',
        'ADMIN_060'
      );
    }

    camposActualizar.push('updated_at = NOW()');

    const updateQuery = `
      UPDATE usuarios 
      SET ${camposActualizar.join(', ')}
      WHERE id = :id AND rol_id = 3
    `;

    await sequelize.query(updateQuery, {
      replacements,
      transaction
    });

    // Obtener el recepcionista actualizado
    const recepcionistaQuery = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono,
        u.fecha_nacimiento,
        u.genero,
        u.avatar_url,
        u.activo,
        u.created_at,
        u.updated_at
      FROM usuarios u
      WHERE u.id = :id
    `;

    const [recepcionista] = await sequelize.query(recepcionistaQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
      transaction
    });

    await transaction.commit();

    console.log(`✅ Recepcionista actualizado exitosamente: ${id}`);

    // Log de auditoría
    await AuditoriaService.crearLog({
      usuario_id: req.usuario?.id || 'system',
      accion: 'ACTUALIZAR_RECEPCIONISTA',
      tabla_afectada: 'usuarios',
      registro_id: id || '',
      metadatos: { 
        recepcionista_id: id,
        cambios: req.body,
        descripcion: `Recepcionista actualizado: ${id}`
      }
    });

    return ManejadorRespuestas.exito(
      res,
      'Recepcionista actualizado exitosamente',
      recepcionista,
      'ADMIN_061'
    );

  } catch (error) {
    await transaction.rollback();
    log.error('Error en actualizarRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar el recepcionista',
      'ADMIN_062'
    );
  }
};

// Desactivar recepcionista
export const desactivarRecepcionista = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`👤 Admin desactivando recepcionista: ${id}`);

    // Verificar si el recepcionista existe
    const recepcionistaExistente = await sequelize.query(
      'SELECT id, nombres, apellidos, email FROM usuarios WHERE id = :id AND rol_id = 3',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(recepcionistaExistente) || recepcionistaExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Recepcionista no encontrado',
        'ADMIN_063'
      );
    }

    // Desactivar recepcionista
    await sequelize.query(
      'UPDATE usuarios SET activo = false, updated_at = NOW() WHERE id = :id AND rol_id = 3',
      {
        replacements: { id }
      }
    );

    console.log(`✅ Recepcionista desactivado exitosamente: ${id}`);

    // Log de auditoría
    await AuditoriaService.crearLog({
      usuario_id: req.usuario?.id || 'system',
      accion: 'DESACTIVAR_RECEPCIONISTA',
      tabla_afectada: 'usuarios',
      registro_id: id || '',
      metadatos: { 
        recepcionista_id: id,
        descripcion: `Recepcionista desactivado: ${(recepcionistaExistente[0] as any).nombres} ${(recepcionistaExistente[0] as any).apellidos}`
      }
    });

    return ManejadorRespuestas.exito(
      res,
      'Recepcionista desactivado exitosamente',
      null,
      'ADMIN_064'
    );

  } catch (error) {
    log.error('Error en desactivarRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al desactivar el recepcionista',
      'ADMIN_065'
    );
  }
};

// Activar recepcionista
export const activarRecepcionista = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`👤 Admin activando recepcionista: ${id}`);

    // Verificar si el recepcionista existe
    const recepcionistaExistente = await sequelize.query(
      'SELECT id, nombres, apellidos, email FROM usuarios WHERE id = :id AND rol_id = 3',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(recepcionistaExistente) || recepcionistaExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Recepcionista no encontrado',
        'ADMIN_066'
      );
    }

    // Activar recepcionista
    await sequelize.query(
      'UPDATE usuarios SET activo = true, updated_at = NOW() WHERE id = :id AND rol_id = 3',
      {
        replacements: { id }
      }
    );

    console.log(`✅ Recepcionista activado exitosamente: ${id}`);

    // Log de auditoría
    await AuditoriaService.crearLog({
      usuario_id: req.usuario?.id || 'system',
      accion: 'ACTIVAR_RECEPCIONISTA',
      tabla_afectada: 'usuarios',
      registro_id: id || '',
      metadatos: { 
        recepcionista_id: id,
        descripcion: `Recepcionista activado: ${(recepcionistaExistente[0] as any).nombres} ${(recepcionistaExistente[0] as any).apellidos}`
      }
    });

    return ManejadorRespuestas.exito(
      res,
      'Recepcionista activado exitosamente',
      null,
      'ADMIN_067'
    );

  } catch (error) {
    log.error('Error en activarRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al activar el recepcionista',
      'ADMIN_068'
    );
  }
};

// Eliminar recepcionista
export const eliminarRecepcionista = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`👤 Admin eliminando recepcionista: ${id}`);

    // Verificar si el recepcionista existe
    const recepcionistaExistente = await sequelize.query(
      'SELECT id, nombres, apellidos, email FROM usuarios WHERE id = :id AND rol_id = 3',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(recepcionistaExistente) || recepcionistaExistente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Recepcionista no encontrado',
        'ADMIN_069'
      );
    }

    // Eliminar recepcionista (soft delete)
    await sequelize.query(
      'UPDATE usuarios SET deleted_at = NOW(), updated_at = NOW() WHERE id = :id AND rol_id = 3',
      {
        replacements: { id }
      }
    );

    console.log(`✅ Recepcionista eliminado exitosamente: ${id}`);

    // Log de auditoría
    await AuditoriaService.crearLog({
      usuario_id: req.usuario?.id || 'system',
      accion: 'ELIMINAR_RECEPCIONISTA',
      tabla_afectada: 'usuarios',
      registro_id: id || '',
      metadatos: { 
        recepcionista_id: id,
        descripcion: `Recepcionista eliminado: ${(recepcionistaExistente[0] as any).nombres} ${(recepcionistaExistente[0] as any).apellidos}`
      }
    });

    return ManejadorRespuestas.exito(
      res,
      'Recepcionista eliminado exitosamente',
      null,
      'ADMIN_070'
    );

  } catch (error) {
    log.error('Error en eliminarRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al eliminar el recepcionista',
      'ADMIN_071'
    );
  }
};

// ==================== ESTADÍSTICAS GENERALES ====================

// Obtener estadísticas generales del centro
export const obtenerEstadisticasGenerales = async (req: Request, res: Response) => {
  try {
    console.log('📊 Admin solicitando estadísticas generales del centro...');

    // Estadísticas de usuarios por rol
    const [usuariosPorRol] = await sequelize.query(`
      SELECT 
        r.nombre as rol,
        COUNT(u.id) as total,
        COUNT(CASE WHEN u.activo = true THEN 1 END) as activos
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.deleted_at IS NULL
      GROUP BY r.nombre, r.id
      ORDER BY r.id
    `) as [any[], unknown];

    // Estadísticas de pacientes
    const [estadisticasPacientes] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_pacientes,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as pacientes_activos,
        COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) as pacientes_inactivos,
        COUNT(CASE WHEN estado = 'alta' THEN 1 END) as pacientes_alta,
        COUNT(CASE WHEN estado = 'derivado' THEN 1 END) as pacientes_derivados,
        COUNT(CASE WHEN fecha_ingreso >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as pacientes_nuevos_mes,
        AVG(puntos_acumulados) as promedio_puntos
      FROM pacientes 
      WHERE deleted_at IS NULL
    `) as [any[], unknown];

    // Estadísticas de sesiones
    const [estadisticasSesiones] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_sesiones,
        COUNT(CASE WHEN estado = 'programada' THEN 1 END) as sesiones_programadas,
        COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as sesiones_confirmadas,
        COUNT(CASE WHEN estado = 'en_curso' THEN 1 END) as sesiones_en_curso,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as sesiones_completadas,
        COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as sesiones_canceladas,
        COUNT(CASE WHEN estado = 'no_asistio' THEN 1 END) as sesiones_no_asistio,
        COUNT(CASE WHEN fecha_programada >= CURRENT_DATE THEN 1 END) as sesiones_futuras,
        COUNT(CASE WHEN fecha_programada >= CURRENT_DATE - INTERVAL '30 days' AND fecha_programada < CURRENT_DATE THEN 1 END) as sesiones_mes_pasado
      FROM sesiones
    `) as [any[], unknown];

    // Estadísticas de tareas
    const [estadisticasTareas] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_tareas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as tareas_pendientes,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as tareas_en_progreso,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as tareas_completadas,
        COUNT(CASE WHEN estado = 'vencida' THEN 1 END) as tareas_vencidas,
        COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as tareas_canceladas,
        COUNT(CASE WHEN fecha_asignacion >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as tareas_semana,
        AVG(puntos_asignados) as promedio_puntos_tarea
      FROM tareas
    `) as [any[], unknown];

    // Estadísticas por tipo de sesión
    const [sesionesPorTipo] = await sequelize.query(`
      SELECT 
        tipo_sesion,
        COUNT(*) as total
      FROM sesiones
      GROUP BY tipo_sesion
      ORDER BY total DESC
    `) as [any[], unknown];

    // Estadísticas por tipo de tarea
    const [tareasPorTipo] = await sequelize.query(`
      SELECT 
        tipo_tarea,
        COUNT(*) as total
      FROM tareas
      GROUP BY tipo_tarea
      ORDER BY total DESC
    `) as [any[], unknown];

    // Estadísticas de actividad reciente (últimos 7 días)
    const [actividadReciente] = await sequelize.query(`
      SELECT 
        DATE(created_at) as fecha,
        'usuarios' as tipo,
        COUNT(*) as cantidad
      FROM usuarios 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      
      UNION ALL
      
      SELECT 
        DATE(created_at) as fecha,
        'sesiones' as tipo,
        COUNT(*) as cantidad
      FROM sesiones 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      
      UNION ALL
      
      SELECT 
        DATE(created_at) as fecha,
        'tareas' as tipo,
        COUNT(*) as cantidad
      FROM tareas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      
      ORDER BY fecha DESC, tipo
    `) as [any[], unknown];

    // Estadísticas de psicólogos más activos (por número de sesiones)
    const [psicologosActivos] = await sequelize.query(`
      SELECT 
        u.nombres,
        u.apellidos,
        COUNT(s.id) as total_sesiones,
        COUNT(CASE WHEN s.estado = 'completada' THEN 1 END) as sesiones_completadas,
        COUNT(p.id) as total_pacientes
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      LEFT JOIN sesiones s ON u.id = s.psicologo_id
      LEFT JOIN pacientes p ON u.id = p.psicologo_id
      WHERE r.nombre = 'psicologo' AND u.activo = true
      GROUP BY u.id, u.nombres, u.apellidos
      ORDER BY total_sesiones DESC
      LIMIT 5
    `) as [any[], unknown];

    // Resumen general
    const resumen = {
      total_usuarios: usuariosPorRol.reduce((sum: number, item: any) => sum + parseInt(item.total), 0),
      total_pacientes: estadisticasPacientes[0]?.total_pacientes || 0,
      total_sesiones: estadisticasSesiones[0]?.total_sesiones || 0,
      total_tareas: estadisticasTareas[0]?.total_tareas || 0,
      pacientes_activos: estadisticasPacientes[0]?.pacientes_activos || 0,
      sesiones_programadas: estadisticasSesiones[0]?.sesiones_programadas || 0,
      tareas_pendientes: estadisticasTareas[0]?.tareas_pendientes || 0
    };

    const estadisticas = {
      resumen,
      usuarios_por_rol: usuariosPorRol,
      pacientes: estadisticasPacientes[0] || {},
      sesiones: estadisticasSesiones[0] || {},
      tareas: estadisticasTareas[0] || {},
      sesiones_por_tipo: sesionesPorTipo,
      tareas_por_tipo: tareasPorTipo,
      actividad_reciente: actividadReciente,
      psicologos_mas_activos: psicologosActivos,
      fecha_consulta: new Date().toISOString()
    };

    console.log('✅ Estadísticas generales obtenidas exitosamente');

    return ManejadorRespuestas.exito(
      res,
      'Estadísticas generales obtenidas exitosamente',
      estadisticas,
      'ADMIN_072'
    );

  } catch (error) {
    log.error('Error en obtenerEstadisticasGenerales:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las estadísticas generales',
      'ADMIN_073'
    );
  }
}; 
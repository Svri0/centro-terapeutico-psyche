// Controlador de usuarios
import { Request, Response } from 'express';
import { Usuario, Rol, Paciente } from '../modelos';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const obtenerTodos = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica para obtener todos los usuarios
    res.json({ mensaje: 'Usuarios obtenidos exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para obtener usuario por ID
    res.json({ mensaje: `Usuario ${id} obtenido exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

export const crear = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica para crear usuario
    res.json({ mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para actualizar usuario
    res.json({ mensaje: `Usuario ${id} actualizado exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para eliminar usuario
    res.json({ mensaje: `Usuario ${id} eliminado exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

export const actualizarPerfilPsicologo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, email, telefono, especialidad, descripcion, avatar_url } = req.body;

    // Verificar que el usuario existe y es psicólogo (rol_id = 2)
    const usuario = await Usuario.findOne({
      where: { 
        id,
        rol_id: 2 // ID del rol de psicólogo
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Psicólogo no encontrado'
      });
    }

    // Actualizar datos del usuario
    await usuario.update({
      nombres,
      apellidos,
      email,
      telefono,
      especialidad,
      descripcion,
      avatar_url
    });

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        especialidad: usuario.especialidad,
        descripcion: usuario.descripcion,
        avatar_url: usuario.avatar_url
      }
    });

  } catch (error: any) {
    console.error('Error al actualizar perfil del psicólogo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Endpoint de prueba para verificar conexión
export const testConnection = async (req: Request, res: Response) => {
  console.log('🚀 testConnection - INICIANDO');
  try {
    return res.json({
      success: true,
      message: 'Conexión exitosa',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('💥 Error en testConnection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const actualizarPerfilPaciente = async (req: Request, res: Response) => {
  console.log('🚀 actualizarPerfilPaciente - INICIANDO');
  console.log('   - ID:', req.params.id);
  console.log('   - Body:', req.body);
  
  try {
    const { id } = req.params;
    const { 
      nombres, 
      apellidos, 
      email, 
      telefono, 
      fecha_nacimiento, 
      genero, 
      avatar_url,
      // Campos específicos del paciente
      rut,
      direccion,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono,
      contacto_emergencia_relacion,
      observaciones
    } = req.body;

    console.log('🔍 Campos recibidos:', {
      nombres: !!nombres,
      apellidos: !!apellidos,
      email: !!email,
      telefono: !!telefono,
      fecha_nacimiento: !!fecha_nacimiento,
      genero: !!genero,
      avatar_url: !!avatar_url,
      rut: !!rut,
      direccion: !!direccion,
      contacto_emergencia_nombre: !!contacto_emergencia_nombre,
      contacto_emergencia_telefono: !!contacto_emergencia_telefono,
      contacto_emergencia_relacion: !!contacto_emergencia_relacion,
      observaciones: !!observaciones
    });

    // Verificar que el usuario existe y es paciente (rol_id = 4)
    const usuario = await Usuario.findOne({
      where: { 
        id,
        rol_id: 4 // ID del rol de paciente
      }
    });

    if (!usuario) {
      console.log('❌ Paciente no encontrado con ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    console.log('✅ Usuario encontrado:', usuario.id);

    // Crear objeto de actualización solo con campos definidos
    const updateDataUsuario: any = {};
    if (nombres !== undefined) updateDataUsuario.nombres = nombres;
    if (apellidos !== undefined) updateDataUsuario.apellidos = apellidos;
    if (email !== undefined) updateDataUsuario.email = email;
    if (telefono !== undefined) updateDataUsuario.telefono = telefono;
    if (fecha_nacimiento !== undefined) updateDataUsuario.fecha_nacimiento = fecha_nacimiento;
    if (genero !== undefined) updateDataUsuario.genero = genero;
    if (avatar_url !== undefined) updateDataUsuario.avatar_url = avatar_url;

    console.log('🔍 Datos a actualizar en usuario:', updateDataUsuario);

    // Solo actualizar si hay datos para actualizar
    if (Object.keys(updateDataUsuario).length > 0) {
      console.log('🔍 Ejecutando usuario.update con datos:', JSON.stringify(updateDataUsuario, null, 2));
      try {
        await usuario.update(updateDataUsuario);
        console.log('✅ Usuario actualizado exitosamente');
      } catch (updateError: any) {
        console.error('💥 Error en usuario.update:', updateError);
        console.error('   - Datos que causaron el error:', updateDataUsuario);
        console.error('   - Error completo:', updateError.message);
        throw updateError;
      }
    }

    // Actualizar datos específicos del paciente
    const paciente = await Paciente.findOne({
      where: { usuario_id: id }
    });

    if (paciente) {
      console.log('✅ Paciente encontrado, actualizando datos específicos');
      
      // Crear objeto de actualización solo con campos definidos (sin contactos legacy)
      const updateDataPaciente: any = {};
      if (rut !== undefined) updateDataPaciente.rut = rut;
      if (direccion !== undefined) updateDataPaciente.direccion = direccion;
      if (observaciones !== undefined) updateDataPaciente.observaciones = observaciones;

      console.log('🔍 Datos a actualizar en paciente:', updateDataPaciente);

      // Solo actualizar si hay datos para actualizar
      if (Object.keys(updateDataPaciente).length > 0) {
        console.log('🔍 Ejecutando paciente.update con datos:', JSON.stringify(updateDataPaciente, null, 2));
        try {
          await paciente.update(updateDataPaciente);
          console.log('✅ Paciente actualizado exitosamente');
        } catch (updateError: any) {
          console.error('💥 Error en paciente.update:', updateError);
          console.error('   - Datos que causaron el error:', updateDataPaciente);
          console.error('   - Error completo:', updateError.message);
          throw updateError;
        }
      }

      // Actualizar contactos de emergencia en tabla normalizada
      if (contacto_emergencia_nombre !== undefined || contacto_emergencia_telefono !== undefined || contacto_emergencia_relacion !== undefined) {
        const sequelize = require('../configuracion/database').default;
        
        // Buscar contacto existente o crear uno nuevo
        const [contactoExistente] = await sequelize.query(`
          SELECT id FROM contactos_emergencia 
          WHERE paciente_id = :pacienteId AND deleted_at IS NULL
          ORDER BY created_at ASC LIMIT 1
        `, {
          replacements: { pacienteId: paciente.id }
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
              pacienteId: paciente.id,
              nombre: contacto_emergencia_nombre,
              telefono: contacto_emergencia_telefono || null,
              relacion: contacto_emergencia_relacion || null,
            }
          });
        }
      }
    } else {
      console.log('⚠️ No se encontró registro de paciente para usuario:', id);
    }

    // Obtener datos actualizados para la respuesta
    const usuarioActualizado = await Usuario.findByPk(id);
    const pacienteActualizado = await Paciente.findOne({ where: { usuario_id: id } });

    console.log('✅ Preparando respuesta con datos actualizados');

    // Obtener contacto de emergencia desde tabla normalizada
    let contactoEmergencia: any = null;
    if (pacienteActualizado) {
      const sequelize = require('../configuracion/database').default;
      const [contacto] = await sequelize.query(`
        SELECT nombre, telefono, relacion 
        FROM contactos_emergencia 
        WHERE paciente_id = :pacienteId AND deleted_at IS NULL
        ORDER BY created_at ASC LIMIT 1
      `, {
        replacements: { pacienteId: pacienteActualizado.id }
      }) as [any[], unknown];

      if (Array.isArray(contacto) && contacto.length > 0) {
        contactoEmergencia = contacto[0];
      }
    }

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: usuarioActualizado?.id,
        nombres: usuarioActualizado?.nombres,
        apellidos: usuarioActualizado?.apellidos,
        email: usuarioActualizado?.email,
        telefono: usuarioActualizado?.telefono,
        fecha_nacimiento: usuarioActualizado?.fecha_nacimiento,
        genero: usuarioActualizado?.genero,
        avatar_url: usuarioActualizado?.avatar_url,
        // Datos del paciente
        rut: pacienteActualizado?.rut,
        direccion: pacienteActualizado?.direccion,
        contacto_emergencia_nombre: contactoEmergencia?.nombre || null,
        contacto_emergencia_telefono: contactoEmergencia?.telefono || null,
        contacto_emergencia_relacion: contactoEmergencia?.relacion || null,
        observaciones: pacienteActualizado?.observaciones
      }
    });

  } catch (error: any) {
    console.error('💥 Error al actualizar perfil del paciente:', error);
    console.error('   - Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const subirImagenReal = async (req: Request, res: Response) => {
  console.log('🚀 subirImagenReal - INICIANDO');
  console.log('   - Headers:', req.headers);
  console.log('   - File:', req.file);
  console.log('   - Body:', req.body);
  
  try {
    // Verificar que se recibió un archivo
    if (!req.file) {
      console.log('❌ No se recibió archivo');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    console.log('✅ Archivo recibido:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Verificar que el archivo existe en el sistema
    if (!fs.existsSync(req.file.path)) {
      console.log('❌ Archivo temporal no encontrado en:', req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Error: archivo temporal no encontrado'
      });
    }

    console.log('✅ Archivo temporal encontrado en:', req.file.path);

    // Leer el archivo como buffer
    let imageBuffer: Buffer;
    try {
      imageBuffer = fs.readFileSync(req.file.path);
    } catch (readError) {
      console.error('Error al leer el archivo:', readError);
      return res.status(500).json({
        success: false,
        message: 'Error al leer el archivo'
      });
    }

    // Convertir a base64
    let base64String: string;
    try {
      base64String = imageBuffer.toString('base64');
    } catch (base64Error) {
      console.error('Error al convertir a base64:', base64Error);
      return res.status(500).json({
        success: false,
        message: 'Error al convertir imagen a base64'
      });
    }

    // Crear la URL de datos
    const base64Image = `data:${req.file.mimetype};base64,${base64String}`;

    // Limpiar archivo temporal
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error al eliminar archivo temporal:', cleanupError);
    }

    return res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        avatar_url: base64Image
      }
    });

  } catch (error: any) {
    console.error('Error al subir imagen:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar la imagen'
    });
  }
};

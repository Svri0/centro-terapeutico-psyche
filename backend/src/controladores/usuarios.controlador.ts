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

export const actualizarPerfilPaciente = async (req: Request, res: Response) => {
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

    // Verificar que el usuario existe y es paciente (rol_id = 3)
    const usuario = await Usuario.findOne({
      where: { 
        id,
        rol_id: 3 // ID del rol de paciente
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Actualizar datos del usuario
    await usuario.update({
      nombres,
      apellidos,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      avatar_url
    });

    // Actualizar datos específicos del paciente
    const paciente = await Paciente.findOne({
      where: { usuario_id: id }
    });

    if (paciente) {
      await paciente.update({
        rut,
        direccion,
        contacto_emergencia_nombre,
        contacto_emergencia_telefono,
        contacto_emergencia_relacion,
        observaciones
      });
    }

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        fecha_nacimiento: usuario.fecha_nacimiento,
        genero: usuario.genero,
        avatar_url: usuario.avatar_url,
        // Datos del paciente
        rut: paciente?.rut,
        direccion: paciente?.direccion,
        contacto_emergencia_nombre: paciente?.contacto_emergencia_nombre,
        contacto_emergencia_telefono: paciente?.contacto_emergencia_telefono,
        contacto_emergencia_relacion: paciente?.contacto_emergencia_relacion,
        observaciones: paciente?.observaciones
      }
    });

  } catch (error: any) {
    console.error('Error al actualizar perfil del paciente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const subirImagenReal = async (req: Request, res: Response) => {
  try {
    // Verificar que se recibió un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    // Verificar que el archivo existe en el sistema
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({
        success: false,
        message: 'Error: archivo temporal no encontrado'
      });
    }

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

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Asegurar que el directorio de uploads existe
const uploadsDir = 'uploads/avatars/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio de uploads creado:', uploadsDir);
}

// Configurar el almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurar que el directorio existe antes de guardar
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrar archivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware para manejar errores de multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El archivo es demasiado grande. Máximo 5MB permitido.',
        codigo: 'FILE_TOO_LARGE'
      });
    }
    return res.status(400).json({
      exito: false,
      mensaje: 'Error al subir el archivo',
      codigo: 'UPLOAD_ERROR'
    });
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      exito: false,
      mensaje: 'Solo se permiten archivos de imagen (JPG, PNG, GIF)',
      codigo: 'INVALID_FILE_TYPE'
    });
  }
  
  return next(error);
};

export default upload; 
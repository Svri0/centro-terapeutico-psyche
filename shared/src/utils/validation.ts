import { z } from 'zod';

// Esquemas de validación para usuarios
export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  rol: z.enum(['admin', 'psicologo', 'paciente', 'recepcionista'])
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida')
});

// Esquemas de validación para sesiones
export const sessionSchema = z.object({
  pacienteId: z.string().uuid('ID de paciente inválido'),
  psicologoId: z.string().uuid('ID de psicólogo inválido'),
  fecha: z.date(),
  duracion: z.number().min(15).max(180), // 15-180 minutos
  notas: z.string().optional()
});

// Esquemas de validación para tareas
export const taskSchema = z.object({
  pacienteId: z.string().uuid('ID de paciente inválido'),
  psicologoId: z.string().uuid('ID de psicólogo inválido'),
  titulo: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
  descripcion: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  fechaVencimiento: z.date(),
  puntos: z.number().min(1).max(10)
});

// Esquemas de validación para mensajes
export const messageSchema = z.object({
  destinatarioId: z.string().uuid('ID de destinatario inválido'),
  asunto: z.string().min(3, 'Asunto debe tener al menos 3 caracteres'),
  contenido: z.string().min(10, 'Contenido debe tener al menos 10 caracteres'),
  adjuntos: z.array(z.string()).optional()
});

// Esquemas de validación para pacientes
export const patientSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  fechaNacimiento: z.date(),
  telefono: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
  direccion: z.string().optional(),
  emergenciaContacto: z.string().optional(),
  emergenciaTelefono: z.string().optional(),
  diagnostico: z.string().optional(),
  estrategiasAutorregulacion: z.string().optional()
});

// Validación de paginación
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Validación de filtros de búsqueda
export const searchSchema = z.object({
  query: z.string().min(1, 'Término de búsqueda es requerido'),
  filters: z.record(z.any()).optional()
});

// Tipos inferidos de los esquemas
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>; 
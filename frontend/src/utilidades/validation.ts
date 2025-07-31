// Utilidades de validación para el frontend

// Patrones de validación
export const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[\+]?[0-9\s\-\(\)]{8,20}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/
};

// Tipos de errores
export interface ValidationError {
  field: string;
  message: string;
}

// Función para sanitizar entrada
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remover scripts
}

// Validar email
export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'El email es requerido' };
  }
  
  const sanitizedEmail = sanitizeInput(email);
  
  if (!PATTERNS.email.test(sanitizedEmail)) {
    return { field: 'email', message: 'Formato de email inválido' };
  }
  
  if (sanitizedEmail.length > 255) {
    return { field: 'email', message: 'El email es demasiado largo' };
  }
  
  return null;
}

// Validar contraseña
export function validatePassword(password: string, isRegistration: boolean = false): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'La contraseña es requerida' };
  }
  
  const sanitizedPassword = sanitizeInput(password);
  
  if (sanitizedPassword.length < 6) {
    return { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (sanitizedPassword.length > 128) {
    return { field: 'password', message: 'La contraseña es demasiado larga' };
  }
  
  // Para registro, validar formato más estricto
  if (isRegistration && !PATTERNS.password.test(sanitizedPassword)) {
    return { 
      field: 'password', 
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)' 
    };
  }
  
  return null;
}

// Validar nombres
export function validateName(name: string, fieldName: string): ValidationError | null {
  if (!name) {
    return { field: fieldName, message: `El ${fieldName} es requerido` };
  }
  
  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName.length < 2) {
    return { field: fieldName, message: `El ${fieldName} debe tener al menos 2 caracteres` };
  }
  
  if (sanitizedName.length > 50) {
    return { field: fieldName, message: `El ${fieldName} es demasiado largo` };
  }
  
  if (!PATTERNS.name.test(sanitizedName)) {
    return { field: fieldName, message: `El ${fieldName} contiene caracteres no permitidos` };
  }
  
  return null;
}

// Validar teléfono
export function validatePhone(phone: string): ValidationError | null {
  if (!phone) {
    return null; // Teléfono es opcional
  }
  
  const sanitizedPhone = sanitizeInput(phone);
  
  if (sanitizedPhone.length > 20) {
    return { field: 'telefono', message: 'El teléfono es demasiado largo' };
  }
  
  if (!PATTERNS.phone.test(sanitizedPhone)) {
    return { field: 'telefono', message: 'Formato de teléfono inválido' };
  }
  
  return null;
}

// Validar formulario de login
export function validateLoginForm(data: { email: string; password: string }): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(data.password, false);
  if (passwordError) errors.push(passwordError);
  
  return errors;
}

// Validar formulario de registro
export function validateRegistrationForm(data: {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const nombresError = validateName(data.nombres, 'nombres');
  if (nombresError) errors.push(nombresError);
  
  const apellidosError = validateName(data.apellidos, 'apellidos');
  if (apellidosError) errors.push(apellidosError);
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(data.password, true);
  if (passwordError) errors.push(passwordError);
  
  const phoneError = validatePhone(data.telefono || '');
  if (phoneError) errors.push(phoneError);
  
  return errors;
}

// Función para mostrar errores de validación
export function getFieldError(errors: ValidationError[], fieldName: string): string | null {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
}

// Función para validar en tiempo real
export function validateField(
  value: string, 
  fieldName: string, 
  validators: ((value: string) => ValidationError | null)[]
): string | null {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error.message;
  }
  return null;
}

// Función para formatear errores del backend
export function formatBackendErrors(backendErrors: any): ValidationError[] {
  if (!backendErrors || !Array.isArray(backendErrors)) {
    return [];
  }
  
  return backendErrors.map((error: string) => ({
    field: 'general',
    message: error
  }));
} 
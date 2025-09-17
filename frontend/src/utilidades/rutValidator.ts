/**
 * Utilidades para validación de RUT chileno
 */

export interface RutValidationResult {
  isValid: boolean;
  formattedRut: string;
  error?: string;
}

/**
 * Valida y formatea un RUT chileno
 * @param rut - RUT a validar (con o sin puntos y guión)
 * @returns Resultado de la validación
 */
export const validateRut = (rut: string): RutValidationResult => {
  // Limpiar el RUT (remover espacios, puntos y guiones)
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
  if (!cleanRut || cleanRut.length < 8) {
    return {
      isValid: false,
      formattedRut: rut,
      error: 'El RUT debe tener al menos 8 caracteres'
    };
  }

  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  // Validar que el número del RUT sea válido
  if (!/^[0-9]+$/.test(rutNumber)) {
    return {
      isValid: false,
      formattedRut: rut,
      error: 'El número del RUT debe contener solo dígitos'
    };
  }

  // Calcular dígito verificador
  const calculatedDv = calculateDv(rutNumber);
  
  if (calculatedDv !== dv) {
    return {
      isValid: false,
      formattedRut: rut,
      error: `Dígito verificador incorrecto. Debería ser ${calculatedDv}`
    };
  }

  // Formatear RUT con puntos y guión
  const formattedRut = formatRut(rutNumber, dv);

  return {
    isValid: true,
    formattedRut
  };
};

/**
 * Calcula el dígito verificador de un RUT
 * @param rutNumber - Número del RUT sin dígito verificador
 * @returns Dígito verificador calculado
 */
const calculateDv = (rutNumber: string): string => {
  let sum = 0;
  let multiplier = 2;

  // Recorrer el RUT de derecha a izquierda
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const dv = 11 - remainder;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
};

/**
 * Formatea un RUT con puntos y guión
 * @param rutNumber - Número del RUT
 * @param dv - Dígito verificador
 * @returns RUT formateado
 */
const formatRut = (rutNumber: string, dv: string): string => {
  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedNumber}-${dv}`;
};

/**
 * Limpia un RUT removiendo puntos, guiones y espacios
 * @param rut - RUT a limpiar
 * @returns RUT limpio
 */
export const cleanRut = (rut: string): string => {
  return rut.replace(/[^0-9kK]/g, '');
};

/**
 * Verifica si un RUT ya existe en el sistema
 * @param rut - RUT a verificar
 * @returns Promise<boolean> - true si existe, false si no existe
 */
export const checkRutExists = async (rut: string): Promise<boolean> => {
  try {
    // Esta función se implementará cuando tengamos el servicio de pacientes
    // Por ahora retornamos false
    return false;
  } catch (error) {
    console.error('Error verificando RUT:', error);
    return false;
  }
};

/**
 * Genera un identificador temporal para pacientes sin RUT
 * @returns Identificador temporal único
 */
export const generateTempId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `TEMP-${timestamp}-${random}`.toUpperCase();
};


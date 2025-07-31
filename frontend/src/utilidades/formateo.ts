// Utilidades para formateo de datos
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear fecha para mostrar
export const formatearFecha = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(fechaObj, 'dd/MM/yyyy', { locale: es });
};

// Formatear fecha y hora
export const formatearFechaHora = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(fechaObj, 'dd/MM/yyyy HH:mm', { locale: es });
};

// Formatear moneda
export const formatearMoneda = (cantidad: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(cantidad);
};

// Formatear número de teléfono
export const formatearTelefono = (telefono: string): string => {
  const limpiado = telefono.replace(/\D/g, '');
  if (limpiado.length === 9) {
    return `+56 ${limpiado.slice(0, 2)} ${limpiado.slice(2, 5)} ${limpiado.slice(5)}`;
  }
  return telefono;
};

// Capitalizar primera letra
export const capitalizar = (texto: string): string => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

/**
 * Formatea el género para mostrarlo de manera legible
 */
export const formatearGenero = (genero?: string): string => {
  if (!genero) return 'No especificado';
  
  const generosFormateados: Record<string, string> = {
    'masculino': 'Masculino',
    'femenino': 'Femenino',
    'no_binario': 'No binario',
    'otro': 'Otro',
    'prefiero_no_decir': 'Prefiero no decir'
  };
  
  return generosFormateados[genero] || genero;
};

/**
 * Convierte el género del frontend al formato del backend
 */
export const convertirGeneroParaBackend = (genero?: string): string | undefined => {
  if (!genero) return undefined;
  
  const mapeoFrontendBackend: Record<string, string> = {
    'no_binario': 'otro', // 'no_binario' se mapea a 'otro' en el backend
    'otro': 'otro'        // 'otro' se mantiene como 'otro'
  };
  
  return mapeoFrontendBackend[genero] || genero;
};

/**
 * Convierte el género del backend al formato del frontend
 */
export const convertirGeneroParaFrontend = (genero?: string): string | undefined => {
  if (!genero) return undefined;
  
  // Por defecto, 'otro' del backend se mapea a 'no_binario' en el frontend
  // para mantener compatibilidad con registros existentes
  const mapeoBackendFrontend: Record<string, string> = {
    'otro': 'no_binario' // Por defecto, 'otro' se mapea a 'no_binario'
  };
  
  return mapeoBackendFrontend[genero] || genero;
};

/**
 * Convierte específicamente 'otro' del frontend a 'otro' del backend
 * Esta función se usa cuando queremos distinguir entre 'no_binario' y 'otro'
 */
export const convertirOtroParaBackend = (genero?: string): string | undefined => {
  if (!genero) return undefined;
  
  if (genero === 'otro') {
    return 'otro'; // 'otro' del frontend va a 'otro' del backend
  }
  
  // Para otros valores, usar el mapeo normal
  return convertirGeneroParaBackend(genero);
}; 
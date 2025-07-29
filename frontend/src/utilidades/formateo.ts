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
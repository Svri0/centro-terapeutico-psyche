export interface EdadExacta {
  años: number;
  meses: number;
  días: number;
}

/**
 * Calcula la edad exacta en años, meses y días desde la fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento en formato string o Date
 * @returns Objeto con años, meses y días
 */
export function calcularEdadExacta(fechaNacimiento: string | Date): EdadExacta {
  const fechaNac = new Date(fechaNacimiento);
  const fechaActual = new Date();
  
  // Validar que la fecha de nacimiento sea válida
  if (isNaN(fechaNac.getTime())) {
    throw new Error('Fecha de nacimiento inválida');
  }
  
  // Validar que la fecha de nacimiento no sea en el futuro
  if (fechaNac > fechaActual) {
    throw new Error('La fecha de nacimiento no puede ser en el futuro');
  }
  
  let años = fechaActual.getFullYear() - fechaNac.getFullYear();
  let meses = fechaActual.getMonth() - fechaNac.getMonth();
  let días = fechaActual.getDate() - fechaNac.getDate();
  
  // Ajustar si el día del mes actual es menor que el día de nacimiento
  if (días < 0) {
    meses--;
    // Obtener el último día del mes anterior
    const ultimoDiaMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate();
    días += ultimoDiaMesAnterior;
  }
  
  // Ajustar si el mes actual es menor que el mes de nacimiento
  if (meses < 0) {
    años--;
    meses += 12;
  }
  
  return { años, meses, días };
}

/**
 * Formatea la edad exacta en un string legible
 * @param edad - Objeto con años, meses y días
 * @returns String formateado de la edad
 */
export function formatearEdadExacta(edad: EdadExacta): string {
  const partes: string[] = [];
  
  if (edad.años > 0) {
    partes.push(`${edad.años} año${edad.años !== 1 ? 's' : ''}`);
  }
  
  if (edad.meses > 0) {
    partes.push(`${edad.meses} mes${edad.meses !== 1 ? 'es' : ''}`);
  }
  
  if (edad.días > 0) {
    partes.push(`${edad.días} día${edad.días !== 1 ? 's' : ''}`);
  }
  
  if (partes.length === 0) {
    return 'Menos de 1 día';
  }
  
  return partes.join(', ');
}

/**
 * Calcula y formatea la edad exacta directamente desde la fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento en formato string o Date
 * @returns String formateado de la edad
 */
export function obtenerEdadFormateada(fechaNacimiento: string | Date): string {
  try {
    const edad = calcularEdadExacta(fechaNacimiento);
    return formatearEdadExacta(edad);
  } catch (error) {
    return 'Fecha inválida';
  }
}

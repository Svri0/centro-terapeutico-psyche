// Utilidades para manejar fechas y feriados chilenos

export interface Feriado {
  fecha: string;
  nombre: string;
  tipo: 'irrenunciable' | 'movible' | 'regular';
}

export interface Vacaciones {
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
}

// Feriados chilenos 2025
export const FERIADOS_2025: Feriado[] = [
  { fecha: '2025-01-01', nombre: 'Año Nuevo', tipo: 'irrenunciable' },
  { fecha: '2025-01-06', nombre: 'Día de los Santos Reyes', tipo: 'movible' },
  { fecha: '2025-04-18', nombre: 'Viernes Santo', tipo: 'movible' },
  { fecha: '2025-04-19', nombre: 'Sábado Santo', tipo: 'movible' },
  { fecha: '2025-04-20', nombre: 'Domingo de Resurrección', tipo: 'movible' },
  { fecha: '2025-05-01', nombre: 'Día del Trabajo', tipo: 'irrenunciable' },
  { fecha: '2025-05-21', nombre: 'Glorias Navales', tipo: 'irrenunciable' },
  { fecha: '2025-06-29', nombre: 'San Pedro y San Pablo', tipo: 'movible' },
  { fecha: '2025-07-16', nombre: 'Virgen del Carmen', tipo: 'irrenunciable' },
  { fecha: '2025-08-15', nombre: 'Asunción de la Virgen', tipo: 'irrenunciable' },
  { fecha: '2025-09-18', nombre: 'Independencia Nacional', tipo: 'irrenunciable' },
  { fecha: '2025-09-19', nombre: 'Glorias del Ejército', tipo: 'irrenunciable' },
  { fecha: '2025-10-12', nombre: 'Encuentro de Dos Mundos', tipo: 'movible' },
  { fecha: '2025-11-01', nombre: 'Día de Todos los Santos', tipo: 'irrenunciable' },
  { fecha: '2025-12-08', nombre: 'Inmaculada Concepción', tipo: 'irrenunciable' },
  { fecha: '2025-12-25', nombre: 'Navidad', tipo: 'irrenunciable' }
];

// Obtener el lunes de una semana
export function obtenerLunesSemana(fecha: Date): Date {
  const lunes = new Date(fecha);
  const dia = lunes.getDay();
  const diff = lunes.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar cuando es domingo
  lunes.setDate(diff);
  return lunes;
}

// Obtener el domingo de una semana
export function obtenerDomingoSemana(fecha: Date): Date {
  const domingo = new Date(fecha);
  const dia = domingo.getDay();
  const diff = domingo.getDate() - dia + (dia === 0 ? 0 : 7); // Ajustar cuando es domingo
  domingo.setDate(diff);
  return domingo;
}

// Obtener fechas de una semana
export function obtenerFechasSemana(fecha: Date): { lunes: Date; domingo: Date; fechas: Date[] } {
  const lunes = obtenerLunesSemana(fecha);
  const domingo = obtenerDomingoSemana(fecha);
  
  const fechas: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + i);
    fechas.push(fecha);
  }
  
  return { lunes, domingo, fechas };
}

// Verificar si una fecha es feriado
export function esFeriado(fecha: string): Feriado | null {
  return FERIADOS_2025.find(feriado => feriado.fecha === fecha) || null;
}

// Verificar si una fecha está en vacaciones
export function estaEnVacaciones(fecha: string, vacaciones: Vacaciones[]): boolean {
  return vacaciones.some(vacacion => {
    const fechaObj = new Date(fecha);
    const inicio = new Date(vacacion.fecha_inicio);
    const fin = new Date(vacacion.fecha_fin);
    return fechaObj >= inicio && fechaObj <= fin;
  });
}

// Calcular horas trabajadas en una semana
export function calcularHorasSemana(horarios: any[]): number {
  let total = 0;
  horarios.forEach(horario => {
    if (horario.activo && horario.hora_inicio && horario.hora_fin) {
      const inicio = new Date(`2000-01-01T${horario.hora_inicio}`);
      const fin = new Date(`2000-01-01T${horario.hora_fin}`);
      const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
      total += horas;
    }
  });
  return Math.round(total);
}

// Validar límite de 40 horas semanales
export function validarLimiteHoras(horas: number): boolean {
  return horas <= 40;
}

// Obtener feriados de una semana específica
export function obtenerFeriadosSemana(semanaInicio: string, semanaFin: string): Feriado[] {
  return FERIADOS_2025.filter(feriado => {
    const fechaFeriado = new Date(feriado.fecha);
    const inicio = new Date(semanaInicio);
    const fin = new Date(semanaFin);
    return fechaFeriado >= inicio && fechaFeriado <= fin;
  });
}

// Formatear fecha en formato chileno
export function formatearFechaChilena(fecha: Date): string {
  return fecha.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Obtener nombre del día en español
export function obtenerNombreDia(dia: number): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[dia] || 'Desconocido';
} 
import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';
import { obtenerEstadoColor, obtenerEstadoTexto } from '../utilidades/estados-citas';

interface CalendarioCitasProps {
  psicologoId: string;
}

const CalendarioCitas: React.FC<CalendarioCitasProps> = ({ psicologoId }) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarCitas();
  }, [psicologoId, currentDate]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const citasData = await citasService.obtenerCitas();
      setCitas(citasData);
    } catch (err: any) {
      console.error('Error al cargar citas:', err);
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  // Obtener el primer día del mes actual
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Obtener el último día del mes actual
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Obtener el primer día de la semana del primer día del mes
  const getFirstDayOfWeek = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const dayOfWeek = firstDay.getDay();
    return new Date(firstDay.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
  };

  // Generar días del calendario
  const generateCalendarDays = (date: Date) => {
    const days = [];
    const firstDay = getFirstDayOfWeek(date);
    const lastDay = getLastDayOfMonth(date);
    const lastDayOfWeek = new Date(lastDay.getTime() + (6 - lastDay.getDay()) * 24 * 60 * 60 * 1000);

    let currentDay = new Date(firstDay);
    while (currentDay <= lastDayOfWeek) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  // Verificar si una fecha tiene citas
  const getCitasForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return citas.filter(cita => cita.fecha === dateString);
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar si una fecha es del mes actual
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Ir a hoy
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = generateCalendarDays(currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando calendario...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
        >
          Hoy
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-500">⚠</div>
            <p className="ml-2 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden shadow-lg">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-amber-700">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const citasDelDia = getCitasForDate(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                  !isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isTodayDate
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md'
                        : isCurrentMonthDay
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  
                  {citasDelDia.length > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-semibold">
                      {citasDelDia.length}
                    </span>
                  )}
                </div>

                {/* Citas del día */}
                <div className="space-y-1">
                  {citasDelDia.slice(0, 3).map((cita) => (
                    <div
                      key={cita.id}
                      className={`text-xs p-1.5 rounded truncate cursor-pointer hover:bg-amber-50 transition-colors border ${
                        obtenerEstadoColor(cita.estado)
                      }`}
                      title={`${cita.paciente_nombres || ''} ${cita.paciente_apellidos || ''} - ${cita.hora_inicio}`.trim()}
                    >
                      <div className="font-medium truncate">
                        {cita.paciente_nombres && cita.paciente_apellidos 
                          ? `${cita.paciente_nombres} ${cita.paciente_apellidos}`
                          : cita.paciente_nombres || cita.paciente_apellidos || 'Paciente no disponible'
                        }
                      </div>
                      <div className="text-xs opacity-75">
                        {cita.hora_inicio.slice(0, 5)}
                      </div>
                    </div>
                  ))}
                  
                  {citasDelDia.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{citasDelDia.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda de Estados</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { estado: 'programada', color: 'bg-amber-100 text-amber-800' },
            { estado: 'confirmada', color: 'bg-orange-100 text-orange-800' },
            { estado: 'en_progreso', color: 'bg-yellow-100 text-yellow-800' },
            { estado: 'completada', color: 'bg-gray-100 text-gray-800' },
            { estado: 'cancelada', color: 'bg-red-100 text-red-800' },
            { estado: 'no_show', color: 'bg-orange-200 text-orange-900' },
            { estado: 'no_asistio', color: 'bg-orange-200 text-orange-900' }
          ].map(({ estado, color }) => (
            <div key={estado} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-').replace('bg-', 'bg-')}`}></div>
              <span className="text-xs text-gray-700 font-medium">{obtenerEstadoTexto(estado)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarioCitas; 
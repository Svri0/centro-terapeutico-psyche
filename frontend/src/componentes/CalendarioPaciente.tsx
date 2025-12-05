import React, { useState, useEffect } from 'react';
import { citasService } from '../servicios/citas.service';
import disponibilidadMensualService from '../servicios/disponibilidadMensual.service';
import { pacientesService, PsicologoAsignado } from '../servicios/pacientes.service';
import Modal from './Modal';
import { useNotificaciones } from '../hooks/useNotificaciones';
import ContenedorNotificaciones from './ContenedorNotificaciones';

interface CalendarioPacienteProps {
  pacienteId: string;
}


const CalendarioPaciente: React.FC<CalendarioPacienteProps> = ({ pacienteId }) => {
  const [psicologo, setPsicologo] = useState<PsicologoAsignado | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesActual, setMesActual] = useState(new Date(2025, 9, 1)); // Octubre 2025
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [vistaActual, setVistaActual] = useState<'calendario' | 'semana'>('calendario');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<Date | null>(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [pacienteRealId, setPacienteRealId] = useState<string>('');
  
  // Sistema de notificaciones
  const {
    notificaciones,
    mostrarExito,
    mostrarError,
    cerrarNotificacion
  } = useNotificaciones();

  const diasSemana = [
    { id: 1, nombre: 'Lunes', abreviacion: 'LU' },
    { id: 2, nombre: 'Martes', abreviacion: 'MA' },
    { id: 3, nombre: 'Miércoles', abreviacion: 'MI' },
    { id: 4, nombre: 'Jueves', abreviacion: 'JU' },
    { id: 5, nombre: 'Viernes', abreviacion: 'VI' },
    { id: 6, nombre: 'Sábado', abreviacion: 'SA' },
    { id: 0, nombre: 'Domingo', abreviacion: 'DO' }
  ];

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  useEffect(() => {
    if (psicologo?.id) {
      cargarDisponibilidadDelMes();
    }
  }, [mesActual, psicologo?.id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener psicólogo asignado al paciente desde la API
      const psicologoAsignado = await pacientesService.obtenerPsicologoAsignado();
      setPsicologo(psicologoAsignado);
      
      // Por ahora usar el ID del usuario directamente
      // TODO: Implementar obtención del ID real del paciente cuando el endpoint esté funcionando
      setPacienteRealId(pacienteId);
      
      // Cargar disponibilidad del psicólogo
      if (psicologoAsignado?.id) {
        await cargarDisponibilidadDelMes(psicologoAsignado.id);
      }
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarDisponibilidadDelMes = async (psicologoId?: string) => {
    const idPsicologo = psicologoId || psicologo?.id;
    if (!idPsicologo) return;
    
    try {
      console.log('🔍 Cargando disponibilidad para:', {
        psicologoId: idPsicologo,
        mes: mesActual.getMonth() + 1,
        año: mesActual.getFullYear()
      });
      
      const disponibilidadData = await disponibilidadMensualService.obtenerDisponibilidadPaciente(
        idPsicologo, 
        mesActual.getMonth() + 1, 
        mesActual.getFullYear()
      );
      
      console.log('✅ Disponibilidad cargada:', disponibilidadData);
      setDisponibilidad(disponibilidadData);
    } catch (err) {
      console.error('❌ Error al cargar disponibilidad:', err);
      // Si no hay disponibilidad configurada, mostrar datos vacíos
      setDisponibilidad({
        diasDisponibles: [],
        horariosPorDia: {}
      });
    }
  };

  // Función para verificar si un día está disponible usando datos reales
  const esDiaDisponible = (fecha: Date): boolean => {
    if (!disponibilidad || !disponibilidad.diasDisponibles || disponibilidad.diasDisponibles.length === 0) {
      console.log('🔍 Debug - esDiaDisponible: No hay disponibilidad configurada');
      return false;
    }
    
    // Usar toLocaleDateString para evitar problemas de zona horaria
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const fechaString = `${año}-${mes}-${dia}`;
    
    const esDisponible = disponibilidad.diasDisponibles.includes(fechaString);
    
    if (esDisponible) {
      console.log('🔍 Debug - esDiaDisponible: Día disponible encontrado:', fechaString);
    }
    
    return esDisponible;
  };

  // Generar horarios disponibles basados en la disponibilidad real
  const generarHorariosDisponibles = (fecha: Date): string[] => {
    if (!disponibilidad) {
      console.log('🔍 Debug - generarHorariosDisponibles: No hay disponibilidad');
      return [];
    }
    
    // Usar el mismo formato de fecha que en esDiaDisponible
    const año = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const fechaString = `${año}-${mes}-${dia}`;
    
    console.log('🔍 Debug - generarHorariosDisponibles:', {
      fechaString,
      horariosPorDia: disponibilidad.horariosPorDia,
      horarioDia: disponibilidad.horariosPorDia[fechaString]
    });
    
    const horarioDia = disponibilidad.horariosPorDia[fechaString];
    
    if (!horarioDia) {
      console.log('🔍 Debug - generarHorariosDisponibles: No hay horario para esta fecha');
      return [];
    }
    
    const horarios = [];
    const [horaInicio] = horarioDia.inicio.split(':').map(Number);
    const [horaFin] = horarioDia.fin.split(':').map(Number);
    
    console.log('🔍 Debug - generarHorariosDisponibles - Horario:', {
      inicio: horarioDia.inicio,
      fin: horarioDia.fin,
      horaInicio,
      horaFin
    });
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    
    console.log('🔍 Debug - generarHorariosDisponibles - Horarios generados:', horarios);
    
    return horarios;
  };

  // Verificar si hay disponibilidad configurada
  const tieneDisponibilidad = (): boolean => {
    console.log('🔍 Debug - tieneDisponibilidad:', {
      disponibilidad,
      diasDisponibles: disponibilidad?.diasDisponibles,
      length: disponibilidad?.diasDisponibles?.length
    });
    
    const tiene = disponibilidad && disponibilidad.diasDisponibles && disponibilidad.diasDisponibles.length > 0;
    console.log('🔍 Debug - tieneDisponibilidad resultado:', tiene);
    
    return tiene;
  };

  // Generar días del mes de forma simple y consistente
  const obtenerDiasDelMes = (fecha: Date): (Date | null)[] => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    
    const dias: (Date | null)[] = [];
    const primerDiaSemana = primerDia.getDay(); // 0 = Domingo, 1 = Lunes, 2 = Martes, etc.
    
    // Calcular cuántos días vacíos agregar al inicio
    // Si el primer día es domingo (0), necesitamos 0 días vacíos
    // Si el primer día es lunes (1), necesitamos 0 días vacíos  
    // Si el primer día es martes (2), necesitamos 1 día vacío
    // Si el primer día es miércoles (3), necesitamos 2 días vacíos
    // Si el primer día es jueves (4), necesitamos 3 días vacíos
    // Si el primer día es viernes (5), necesitamos 4 días vacíos
    // Si el primer día es sábado (6), necesitamos 5 días vacíos
    const diasVacios = primerDiaSemana === 0 ? 0 : primerDiaSemana - 1;
    
    // Agregar días vacíos del mes anterior
    for (let i = 0; i < diasVacios; i++) {
      dias.push(null);
    }
    
    // Agregar días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(año, mes, i));
    }
    
    return dias;
  };

  // Obtener días de la semana para la vista semanal
  const obtenerDiasDeLaSemana = (fecha: Date): Date[] => {
    const dias: Date[] = [];
    const inicioSemana = new Date(fecha);
    const diaSemana = fecha.getDay();
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    
    inicioSemana.setDate(fecha.getDate() - diasDesdeLunes);
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      dias.push(dia);
    }
    
    return dias;
  };

  // Formatear mes
  const formatearMes = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Formatear fecha completa
  const formatearFechaCompleta = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navegar entre meses
  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setMesActual(prev => {
      const nuevoMes = new Date(prev);
      if (direccion === 'anterior') {
        nuevoMes.setMonth(nuevoMes.getMonth() - 1);
      } else {
        nuevoMes.setMonth(nuevoMes.getMonth() + 1);
      }
      return nuevoMes;
    });
  };

  // Navegar entre semanas
  const navegarSemana = (direccion: 'anterior' | 'siguiente') => {
    setSemanaSeleccionada(prev => {
      if (!prev) return prev;
      const nuevaSemana = new Date(prev);
      if (direccion === 'anterior') {
        nuevaSemana.setDate(nuevaSemana.getDate() - 7);
      } else {
        nuevaSemana.setDate(nuevaSemana.getDate() + 7);
      }
      return nuevaSemana;
    });
  };

  // Obtener rango de semana
  const obtenerRangoSemana = (fecha: Date): string => {
    const dias = obtenerDiasDeLaSemana(fecha);
    const inicio = dias[0];
    const fin = dias[6];
    
    return `${inicio.getDate().toString().padStart(2, '0')} ${inicio.toLocaleDateString('es-ES', { month: 'short' })} al ${fin.getDate().toString().padStart(2, '0')} ${fin.toLocaleDateString('es-ES', { month: 'short' })}`;
  };

  // Manejar clic en día
  const handleDiaClick = (fecha: Date) => {
    if (esDiaDisponible(fecha)) {
      setDiaSeleccionado(fecha);
      setSemanaSeleccionada(fecha);
      setVistaActual('semana');
    }
  };

  // Manejar agendar cita
  const handleAgendarCita = async (horario: string) => {
    try {
      if (!psicologo?.id || !diaSeleccionado) {
        mostrarError(
          'Error al Agendar',
          'Faltan datos para agendar la cita. Por favor, inténtalo nuevamente.'
        );
        return;
      }

      // Validar que el horario esté disponible
      const horariosDisponibles = generarHorariosDisponibles(diaSeleccionado);
      if (!horariosDisponibles.includes(horario)) {
        mostrarError(
          'Horario No Disponible',
          'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.'
        );
        return;
      }

      // Validar que la fecha no sea en el pasado
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaSeleccionada = new Date(diaSeleccionado);
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        mostrarError(
          'Fecha Inválida',
          'No puedes agendar una cita en una fecha pasada. Por favor, selecciona una fecha futura.'
        );
        return;
      }

      console.log('🔍 Frontend - Iniciando agendamiento de cita');
      console.log('🔍 Frontend - Horario seleccionado:', horario);
      console.log('🔍 Frontend - Día seleccionado:', diaSeleccionado);
      console.log('🔍 Frontend - Psicólogo:', psicologo);
      console.log('🔍 Frontend - Paciente ID:', pacienteRealId || pacienteId);
      
      console.log('Agendando cita:', {
        psicologoId: psicologo.id,
        pacienteId: pacienteRealId || pacienteId,
        dia: diaSeleccionado.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        horario
      });
      
      // Calcular hora de fin (asumiendo 60 minutos por defecto)
      const horaInicio = new Date(`2000-01-01T${horario}:00`);
      const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000); // +60 minutos
      const horaFinStr = horaFin.toTimeString().slice(0, 5);
      
      const datosCita = {
        paciente_id: pacienteRealId || pacienteId,
        fecha: diaSeleccionado.toISOString().split('T')[0],
        hora_inicio: horario,
        hora_fin: horaFinStr,
        duracion_minutos: 60,
        tipo_sesion: 'presencial' as const,
        modalidad: 'presencial' as const,
        notas_paciente: 'Cita agendada desde el calendario del paciente'
      };

      console.log('🔍 Frontend - Datos de cita preparados:', datosCita);
      console.log('🔍 Frontend - Llamando a citasService.crearCita...');
      
      // Crear la cita usando el servicio
      await citasService.crearCita(datosCita);
      
      console.log('✅ Frontend - Cita creada exitosamente');
      
      mostrarExito(
        'Cita Agendada',
        'Tu cita ha sido agendada correctamente. Recibirás una confirmación por email.'
      );
      
      // Volver a la vista del calendario
      setVistaActual('calendario');
      setDiaSeleccionado(null);
      setSemanaSeleccionada(null);
    } catch (err: any) {
      console.error('❌ Frontend - Error al agendar cita:', err);
      console.error('❌ Frontend - Stack trace:', err.stack);
      console.error('❌ Frontend - Error completo:', {
        message: err.message,
        name: err.name,
        response: err.response,
        config: err.config
      });
      
      // Manejar errores específicos del backend
      if (err.message && err.message.includes('ya existe')) {
        mostrarError(
          'Cita Duplicada',
          'Ya tienes una cita programada en esa fecha y hora. Por favor, selecciona otro horario.'
        );
      } else if (err.message && err.message.includes('no disponible')) {
        mostrarError(
          'Horario Ocupado',
          'El horario seleccionado ya está ocupado. Por favor, elige otro horario disponible.'
        );
      } else {
        mostrarError(
          'Error al Agendar Cita',
          err.message || 'No se pudo agendar la cita. Por favor, inténtalo nuevamente.'
        );
      }
    }
  };

  // Volver al calendario
  const volverACalendario = () => {
    setVistaActual('calendario');
    setDiaSeleccionado(null);
    setSemanaSeleccionada(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando disponibilidad...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex">
          <div className="text-red-500">⚠️</div>
          <p className="ml-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Vista del calendario mensual
  if (vistaActual === 'calendario') {
    const diasDelMes = obtenerDiasDelMes(mesActual);

    const perfilModal = (
      <div className={`fixed inset-0 z-50 overflow-y-auto ${mostrarPerfil ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={() => setMostrarPerfil(false)}
        />
        
        {/* Contenido del modal */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-out">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Perfil de {psicologo?.nombres || ''} {psicologo?.apellidos || ''}
              </h3>
              <button
                onClick={() => setMostrarPerfil(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido */}
            <div className="p-6">
              {psicologo && (
                <div className="space-y-6">
                  {/* Layout responsivo: imagen y contenido */}
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Imagen del psicólogo */}
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {psicologo.avatar_url ? (
                        <img
                          src={psicologo.avatar_url}
                          alt={`${psicologo.nombres} ${psicologo.apellidos}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            (target.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${psicologo.avatar_url ? 'hidden' : ''} w-full h-full bg-gray-200 flex items-center justify-center`}>
                        <span className="text-2xl sm:text-3xl">👨‍⚕️</span>
                      </div>
                    </div>
                    
                    {/* Información del psicólogo */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 break-words">
                        {psicologo.nombres} {psicologo.apellidos}
                      </h3>
                      
                      {/* Información de contacto y especialidad */}
                      <div className="space-y-4 text-sm text-gray-700">
                        {/* Email y Teléfono en filas separadas para más espacio */}
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-800">Email:</span>
                            <div className="text-blue-600 break-all mt-1 pr-2">{psicologo.email}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Teléfono:</span>
                            <div className="mt-1">{psicologo.telefono || 'No especificado'}</div>
                          </div>
                        </div>
                        
                        {/* Especialidad y Atención */}
                        <div className="flex flex-col sm:flex-row sm:space-x-8">
                          <div className="mb-2 sm:mb-0">
                            <span className="font-medium text-gray-800">Especialidad:</span>
                            <div className="mt-1">{psicologo.especialidad || 'No especificada'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Atención:</span>
                            <div className="mt-1">Presencial y/o Online</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Descripción profesional */}
                      {psicologo.descripcion && (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-gray-800 mb-2">Descripción Profesional</div>
                          <div className="text-sm text-gray-700 bg-gray-50 rounded-md border border-gray-200 p-3 max-h-32 overflow-y-auto">
                            {psicologo.descripcion}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Layout principal: Psicólogo + Calendario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil del Psicólogo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {psicologo?.avatar_url ? (
                  <img 
                    src={psicologo.avatar_url}
                    alt={`${psicologo.nombres} ${psicologo.apellidos}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`${psicologo?.avatar_url ? 'hidden' : ''} w-full h-full bg-gray-300 flex items-center justify-center`}>
                  <span className="text-5xl">👨‍⚕️</span>
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-semibold text-gray-900 leading-tight">
                  {psicologo?.nombres} {psicologo?.apellidos}
                </h2>
                <button
                  onClick={() => setMostrarPerfil(true)}
                  className="px-8 py-3 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Ver perfil
                </button>
              </div>
            </div>
          </div>

          {/* Calendario Mensual */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header del calendario */}
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navegarMes('anterior')}
                    className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatearMes(mesActual)}
                  </h3>
                  <button
                    onClick={() => navegarMes('siguiente')}
                    className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {!tieneDisponibilidad() && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
                    <span>⚠</span>
                    <span>Sin disponibilidad</span>
                  </div>
                )}
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-px bg-amber-200">
              {diasSemana.map((dia) => (
                <div key={dia.id} className="bg-white p-3 text-center border-b border-amber-200">
                  <span className="text-sm font-semibold text-amber-700">{dia.abreviacion}</span>
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-px bg-amber-200">
              {diasDelMes.map((dia, index) => {
                const esHoy = dia && new Date().toDateString() === dia.toDateString();
                return (
                  <div key={index} className="bg-white min-h-[80px] p-2 border-r border-b border-amber-100">
                    {dia ? (
                      <button
                        onClick={() => handleDiaClick(dia)}
                        className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-colors ${
                          esDiaDisponible(dia)
                            ? 'hover:bg-amber-50 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          esHoy 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md'
                            : esDiaDisponible(dia) 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        }`}>
                          {dia.getDate()}
                        </span>
                        {esDiaDisponible(dia) && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-1"></div>
                        )}
                      </button>
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {!tieneDisponibilidad() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-red-600 text-4xl"></div>
              <div className="text-red-800">
                <p className="font-semibold text-lg">No hay días disponibles para agendar con este especialista</p>
                <p className="text-sm mt-2">
                  El psicólogo {psicologo?.nombres} {psicologo?.apellidos} no ha configurado su horario de disponibilidad aún.
                  Por favor, contacta directamente con el especialista o la administración del centro.
                </p>
              </div>
            </div>
          </div>
        )}
        {perfilModal}
        
        {/* Sistema de notificaciones */}
        <ContenedorNotificaciones
          notificaciones={notificaciones}
          onCerrar={cerrarNotificacion}
        />
      </div>
    );
  }

  // Vista de la semana seleccionada
  if (vistaActual === 'semana' && semanaSeleccionada) {
    const diasDeLaSemana = obtenerDiasDeLaSemana(semanaSeleccionada);

    return (
      <div className="space-y-6">
        {/* Header con fecha y botón de regreso */}
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">
            {semanaSeleccionada.toLocaleDateString('es-ES', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h2>
          <button
            onClick={volverACalendario}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Volver al calendario
          </button>
        </div>

        {/* Calendario Semanal Horizontal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header con navegación */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navegarSemana('anterior')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ‹
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {obtenerRangoSemana(semanaSeleccionada)}
              </h3>
              <button
                onClick={() => navegarSemana('siguiente')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ›
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {diasDeLaSemana.map((fecha) => {
                const esDisponible = esDiaDisponible(fecha);
                const diaSemana = diasSemana.find(d => d.id === fecha.getDay());
                const esSeleccionado = diaSeleccionado?.toDateString() === fecha.toDateString();

                return (
                  <button
                    key={fecha.toISOString()}
                    onClick={() => setDiaSeleccionado(fecha)}
                    disabled={!esDisponible}
                    className={`
                      flex flex-col items-center space-y-2 p-3 rounded-lg transition-all
                      ${esSeleccionado 
                        ? 'bg-blue-500 text-white' 
                        : esDisponible 
                          ? 'hover:bg-purple-50 cursor-pointer' 
                          : 'cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <div className={`text-sm font-medium ${esSeleccionado ? 'text-white' : 'text-gray-600'}`}>
                      {diaSemana?.abreviacion}
                    </div>
                    <div className={`text-lg font-semibold ${esSeleccionado ? 'text-white' : 'text-gray-900'}`}>
                      {fecha.getDate()}
                    </div>
                    {esDisponible && !esSeleccionado && (() => {
                      const año = fecha.getFullYear();
                      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                      const dia = fecha.getDate().toString().padStart(2, '0');
                      const fechaString = `${año}-${mes}-${dia}`;
                      const horarioDia = disponibilidad?.horariosPorDia[fechaString];
                      
                      return (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          {horarioDia && (
                            <div className="text-xs text-purple-600 font-medium text-center">
                              <div>{horarioDia.inicio.split(':').slice(0, 2).join(':')}</div>
                              <div>-</div>
                              <div>{horarioDia.fin.split(':').slice(0, 2).join(':')}</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Horarios disponibles */}
        {diaSeleccionado && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Horarios disponibles - {formatearFechaCompleta(diaSeleccionado)}
            </h3>
            <div className="flex flex-wrap gap-3">
              {generarHorariosDisponibles(diaSeleccionado).map((horario) => (
                <button
                  key={horario}
                  onClick={() => handleAgendarCita(horario)}
                  className="px-4 py-3 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                >
                  {horario}
                </button>
              ))}
            </div>
            <div className="mt-4 text-right">
              <span className="text-sm text-gray-500">Ver más ▼</span>
            </div>
          </div>
        )}
        {/* Modal de perfil también disponible en esta vista */}
        <Modal
          isOpen={mostrarPerfil}
          onClose={() => setMostrarPerfil(false)}
          title={`Perfil de ${psicologo?.nombres || ''} ${psicologo?.apellidos || ''}`.trim()}
          size="lg"
        >
          {psicologo && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  {psicologo.avatar_url ? (
                    <img
                      src={psicologo.avatar_url}
                      alt={`${psicologo.nombres} ${psicologo.apellidos}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        (target.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${psicologo.avatar_url ? 'hidden' : ''} w-full h-full bg-gray-200 flex items-center justify-center`}>
                    <span className="text-3xl">👨‍⚕️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {psicologo.nombres} {psicologo.apellidos}
                  </h3>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <div className="mb-1"><span className="font-medium">Email:</span> {psicologo.email}</div>
                      <div className="mb-1"><span className="font-medium">Teléfono:</span> {psicologo.telefono || 'No especificado'}</div>
                    </div>
                    <div>
                      <div className="mb-1"><span className="font-medium">Especialidad:</span> {psicologo.especialidad || 'No especificada'}</div>
                      <div className="mb-1"><span className="font-medium">Atención:</span> Presencial y/o Online</div>
                    </div>
                  </div>
                  {psicologo.descripcion && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-800 mb-1">Descripción Profesional</div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-md border border-gray-200 p-3">
                        {psicologo.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
        
        {/* Sistema de notificaciones */}
        <ContenedorNotificaciones
          notificaciones={notificaciones}
          onCerrar={cerrarNotificacion}
        />
      </div>
    );
  }

  return null;
};

export default CalendarioPaciente; 
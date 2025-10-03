import React, { useState, useEffect } from 'react';
import { citasService } from '../servicios/citas.service';
import disponibilidadMensualService from '../servicios/disponibilidadMensual.service';
import { pacientesService, PsicologoAsignado } from '../servicios/pacientes.service';
import Modal from './Modal';

interface CalendarioPacienteProps {
  pacienteId: string;
}

interface Psicologo {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  especialidad: string;
  avatar_url?: string;
}

const CalendarioPaciente: React.FC<CalendarioPacienteProps> = ({ pacienteId }) => {
  const [psicologo, setPsicologo] = useState<PsicologoAsignado | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesActual, setMesActual] = useState(new Date(2025, 8, 1)); // Septiembre 2025
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [vistaActual, setVistaActual] = useState<'calendario' | 'semana'>('calendario');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<Date | null>(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [usandoDatosSimulados, setUsandoDatosSimulados] = useState(false);

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

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener psicólogo asignado al paciente desde la API
      const psicologoAsignado = await pacientesService.obtenerPsicologoAsignado();
      setPsicologo(psicologoAsignado);
      
      // Obtener disponibilidad real del psicólogo
      try {
        const disponibilidadData = await disponibilidadMensualService.obtenerDisponibilidadPaciente(psicologoAsignado.id);
        setDisponibilidad(disponibilidadData);
      } catch (err) {
        console.warn('No se pudo cargar disponibilidad real, usando datos simulados');
        // Generar disponibilidad simulada más completa para todo el mes
        const mesActual = new Date(2025, 8, 1); // Septiembre 2025
        const diasEnMes = new Date(2025, 9, 0).getDate(); // 30 días
        
        const diasDisponibles = [];
        const horariosPorDia: Record<string, { inicio: string; fin: string }> = {};
        
        // Generar disponibilidad para todos los días laborables del mes (lunes a viernes)
        for (let dia = 1; dia <= diasEnMes; dia++) {
          const fecha = new Date(2025, 8, dia); // Mes 8 = Septiembre (0-indexed)
          const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
          
          // Solo incluir días laborables (lunes a viernes)
          // Convertir domingo de 0 a 7 para coincidir con el backend
          const diaSemanaAjustado = diaSemana === 0 ? 7 : diaSemana;
          
          if (diaSemanaAjustado >= 1 && diaSemanaAjustado <= 5) {
            const fechaString = fecha.toISOString().split('T')[0];
            diasDisponibles.push(fechaString);
            horariosPorDia[fechaString] = {
              inicio: '09:00',
              fin: '17:00'
            };
          }
        }
        
        setDisponibilidad({
          diasDisponibles,
          horariosPorDia
        });
        setUsandoDatosSimulados(true);
      }
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si un día está disponible usando datos reales
  const esDiaDisponible = (fecha: Date): boolean => {
    if (!disponibilidad || !disponibilidad.diasDisponibles) {
      console.warn('Disponibilidad no cargada o incompleta');
      return false;
    }
    
    const fechaString = fecha.toISOString().split('T')[0];
    const esDisponible = disponibilidad.diasDisponibles.includes(fechaString);
    
    // Debug: mostrar qué fechas se están verificando
    if (process.env.NODE_ENV === 'development') {
      const diaSemana = fecha.getDay();
      const diaSemanaAjustado = diaSemana === 0 ? 7 : diaSemana;
      console.log(`Verificando fecha ${fechaString} (día ${diaSemanaAjustado}): ${esDisponible ? 'Disponible' : 'No disponible'}`);
    }
    
    return esDisponible;
  };

  // Generar horarios disponibles basados en la disponibilidad real
  const generarHorariosDisponibles = (fecha: Date): string[] => {
    if (!disponibilidad) return [];
    
    const fechaString = fecha.toISOString().split('T')[0];
    const horarioDia = disponibilidad.horariosPorDia[fechaString];
    
    if (!horarioDia) return [];
    
    const horarios = [];
    const [horaInicio] = horarioDia.inicio.split(':').map(Number);
    const [horaFin] = horarioDia.fin.split(':').map(Number);
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    
    return horarios;
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
        alert('Error: Faltan datos para agendar la cita');
        return;
      }

      console.log('Agendando cita:', {
        psicologoId: psicologo.id,
        pacienteId,
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
      
      // Crear la cita usando el servicio
      await citasService.crearCita({
        paciente_id: pacienteId,
        fecha: diaSeleccionado.toISOString().split('T')[0],
        hora_inicio: horario,
        hora_fin: horaFinStr,
        duracion_minutos: 60,
        tipo_sesion: 'individual',
        modalidad: 'presencial',
        notas_paciente: 'Cita agendada desde el calendario del paciente'
      });
      
      alert('Cita agendada correctamente');
      
      // Volver a la vista del calendario
      setVistaActual('calendario');
      setDiaSeleccionado(null);
      setSemanaSeleccionada(null);
    } catch (err: any) {
      console.error('Error al agendar cita:', err);
      alert('Error al agendar la cita: ' + (err.message || 'Error desconocido'));
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
    const fechaActual = new Date();

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
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navegarMes('anterior')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    ‹
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatearMes(mesActual)}
                  </h3>
                  <button
                    onClick={() => navegarMes('siguiente')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    ›
                  </button>
                </div>
                {usandoDatosSimulados && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                    <span>⚠️</span>
                    <span>Datos simulados</span>
                  </div>
                )}
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {diasSemana.map((dia) => (
                <div key={dia.id} className="bg-white p-3 text-center">
                  <span className="text-sm font-medium text-gray-500">{dia.abreviacion}</span>
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {diasDelMes.map((dia, index) => (
                <div key={index} className="bg-white min-h-[80px] p-2">
                  {dia ? (
                    <button
                      onClick={() => handleDiaClick(dia)}
                      className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-colors ${
                        esDiaDisponible(dia)
                          ? 'hover:bg-blue-50 cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        esDiaDisponible(dia) ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {dia.getDate()}
                      </span>
                      {esDiaDisponible(dia) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {usandoDatosSimulados && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-amber-600 text-lg">ℹ️</div>
              <div className="text-amber-800">
                <p className="font-medium">Información importante:</p>
                <p className="text-sm mt-1">
                  Estamos mostrando horarios simulados porque no se pudo cargar la disponibilidad real del psicólogo. 
                  Los días laborables (lunes a viernes) están marcados como disponibles de 9:00 AM a 5:00 PM.
                </p>
              </div>
            </div>
          </div>
        )}
        {perfilModal}
      </div>
    );
  }

  // Vista de la semana seleccionada
  if (vistaActual === 'semana' && semanaSeleccionada) {
    const diasDeLaSemana = obtenerDiasDeLaSemana(semanaSeleccionada);
    const fechaActual = new Date();

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
              {diasDeLaSemana.map((fecha, index) => {
                const esDisponible = esDiaDisponible(fecha);
                const esHoy = fecha.toDateString() === fechaActual.toDateString();
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
                      ${esHoy && !esSeleccionado ? 'ring-2 ring-blue-300 bg-blue-50' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium ${esSeleccionado ? 'text-white' : 'text-gray-600'}`}>
                      {diaSemana?.abreviacion}
                    </div>
                    <div className={`text-lg font-semibold ${esSeleccionado ? 'text-white' : 'text-gray-900'}`}>
                      {fecha.getDate()}
                    </div>
                    {esDisponible && !esSeleccionado && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
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
              {generarHorariosDisponibles(diaSeleccionado).map((horario, index) => (
                <button
                  key={index}
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
      </div>
    );
  }

  return null;
};

export default CalendarioPaciente; 
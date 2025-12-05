import React, { useState, useEffect } from 'react';
import disponibilidadMensualService, { DisponibilidadMensual } from '../servicios/disponibilidadMensual.service';
import { useNotificaciones } from '../hooks/useNotificaciones';
import ContenedorNotificaciones from './ContenedorNotificaciones';
import '../styles/notificaciones.css';

interface GestionDisponibilidadMensualProps {
  psicologoId: string;
}

const GestionDisponibilidadMensual: React.FC<GestionDisponibilidadMensualProps> = ({ psicologoId }) => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadMensual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());
  const [disponibilidadTemporal, setDisponibilidadTemporal] = useState<DisponibilidadMensual[]>([]);
  const [horarioPredefinidoSeleccionado, setHorarioPredefinidoSeleccionado] = useState<number | null>(null);
  
  const {
    notificaciones,
    cerrarNotificacion,
    mostrarExito,
    mostrarError,
    mostrarInfo
  } = useNotificaciones();

  const horariosPredefinidos = [
    { nombre: 'Mañana', inicio: '08:00', fin: '12:00' },
    { nombre: 'Tarde', inicio: '13:00', fin: '17:00' },
    { nombre: 'Jornada Completa', inicio: '08:00', fin: '17:00' },
    { nombre: 'Media Jornada', inicio: '09:00', fin: '13:00' }
  ];

  useEffect(() => {
    cargarDisponibilidadMensual();
  }, [psicologoId, mesActual, añoActual]);

  const cargarDisponibilidadMensual = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const disponibilidadData = await disponibilidadMensualService.obtenerDisponibilidadMensual(
        psicologoId, 
        mesActual, 
        añoActual
      );
      
      setDisponibilidad(disponibilidadData);
      setDisponibilidadTemporal([...disponibilidadData]);
    } catch (err: any) {
      console.error('Error al cargar disponibilidad mensual:', err);
      setError(err.message || 'Error al cargar la disponibilidad mensual');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = () => {
    setDisponibilidadTemporal([...disponibilidad]);
    setModoEdicion(true);
    setHorarioPredefinidoSeleccionado(null);
  };

  const cancelarEdicion = () => {
    setDisponibilidadTemporal([...disponibilidad]);
    setModoEdicion(false);
    setHorarioPredefinidoSeleccionado(null);
  };

  const guardarCambios = async () => {
    try {
      setLoading(true);
      
      await disponibilidadMensualService.actualizarDisponibilidadMensualMultiple(
        psicologoId, 
        disponibilidadTemporal
      );
      
      setDisponibilidad([...disponibilidadTemporal]);
      setModoEdicion(false);
      setHorarioPredefinidoSeleccionado(null);
      
      mostrarExito(
        'Disponibilidad Actualizada',
        'Tu disponibilidad mensual ha sido guardada correctamente. Los pacientes podrán ver los horarios disponibles.'
      );
    } catch (err: any) {
      console.error('Error al guardar disponibilidad mensual:', err);
      mostrarError(
        'Error al Guardar',
        err.message || 'No se pudo actualizar la disponibilidad mensual. Por favor, inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generarDisponibilidadRecurrente = async () => {
    try {
      const fechaInicio = `${añoActual}-${String(mesActual).padStart(2, '0')}-01`;
      const fechaFin = `${añoActual}-${String(mesActual).padStart(2, '0')}-31`;
      
      // Horarios por defecto para días laborables
      const horarios = {
        1: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Lunes - ACTIVO
        2: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Martes - ACTIVO
        3: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Miércoles - ACTIVO
        4: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Jueves - ACTIVO
        5: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Viernes - ACTIVO
        6: { hora_inicio: '09:00', hora_fin: '13:00', activo: true }, // Sábado - ACTIVO
        0: { hora_inicio: '00:00', hora_fin: '00:00', activo: false }  // Domingo - INACTIVO
      };

      console.log('🔍 Debug - Generando disponibilidad recurrente:', {
        psicologoId,
        fechaInicio,
        fechaFin,
        horarios
      });

      await disponibilidadMensualService.generarDisponibilidadRecurrente(
        psicologoId,
        fechaInicio,
        fechaFin,
        horarios
      );

      await cargarDisponibilidadMensual();
      mostrarExito(
        'Disponibilidad Generada',
        'Se ha generado la disponibilidad recurrente para todo el mes. Los horarios están configurados automáticamente.'
      );
    } catch (err: any) {
      console.error('Error al generar disponibilidad recurrente:', err);
      mostrarError(
        'Error al Generar',
        err.message || 'No se pudo generar la disponibilidad recurrente. Por favor, inténtalo nuevamente.'
      );
    }
  };

  const aplicarHorarioPredefinido = (horario: any, index: number) => {
    const nuevaDisponibilidad = disponibilidadTemporal.map(disp => ({
      ...disp,
      hora_inicio: horario.inicio,
      hora_fin: horario.fin
    }));
    setDisponibilidadTemporal(nuevaDisponibilidad);
    setHorarioPredefinidoSeleccionado(index);
  };

  const handleCambiarHorario = (fecha: string, campo: 'hora_inicio' | 'hora_fin', valor: string) => {
    const nuevaDisponibilidad = disponibilidadTemporal.map(disp => 
      disp.fecha === fecha ? { ...disp, [campo]: valor } : disp
    );
    setDisponibilidadTemporal(nuevaDisponibilidad);
  };

  const handleToggleDia = (fecha: string) => {
    // PRUEBA ESPECÍFICA: Verificar diferentes formas de parsear la fecha
    console.log('🔍 Debug - handleToggleDia - PRUEBAS DE FECHA:');
    const fechaObj1 = new Date(fecha);
    const fechaObj2 = new Date(fecha + 'T00:00:00');
    const fechaObj3 = new Date(fecha.replace(/-/g, '/'));
    
    console.log('🔍 Debug - Fecha original:', fecha);
    console.log('🔍 Debug - Fecha 1 (new Date(fecha)):', fechaObj1.toDateString(), 'Día semana:', fechaObj1.getDay());
    console.log('🔍 Debug - Fecha 2 (new Date(fecha + "T00:00:00")):', fechaObj2.toDateString(), 'Día semana:', fechaObj2.getDay());
    console.log('🔍 Debug - Fecha 3 (new Date(fecha.replace(/-/g, "/"))):', fechaObj3.toDateString(), 'Día semana:', fechaObj3.getDay());
    
    // CORREGIR: Usar el formato que funciona (con T00:00:00)
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay();
    
    console.log('🔍 Debug - handleToggleDia - Fecha corregida:', fechaObj.toDateString(), 'Día semana:', diaSemana, 'Es domingo:', diaSemana === 0);
    
    if (diaSemana === 0) {
      mostrarInfo(
        'Domingo No Laborable',
        'Los domingos están configurados como días no laborables y no se pueden modificar.'
      );
      return;
    }

    const disponibilidadExistente = disponibilidadTemporal.find(disp => disp.fecha === fecha);
    
    if (disponibilidadExistente) {
      // Si ya existe, cambiar el estado activo
      const nuevaDisponibilidad = disponibilidadTemporal.map(disp => 
        disp.fecha === fecha ? { ...disp, activo: !disp.activo } : disp
      );
      setDisponibilidadTemporal(nuevaDisponibilidad);
    } else {
      // Si no existe, crear una nueva entrada
      const nuevaDisponibilidad = [
        ...disponibilidadTemporal,
        {
          psicologo_id: psicologoId,
          fecha,
          hora_inicio: '09:00',
          hora_fin: '17:00',
          activo: true,
          tipo_disponibilidad: 'individual' as const
        }
      ];
      setDisponibilidadTemporal(nuevaDisponibilidad);
    }
  };

  // Función de prueba para verificar el cálculo de fechas
  const verificarFecha = (dia: number, mes: number, año: number) => {
    const fecha = new Date(año, mes - 1, dia);
    const diaSemana = fecha.getDay();
    const nombreDia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana];
    
    console.log('🔍 Debug - Verificación fecha:', {
      dia,
      mes,
      año,
      fecha: fecha.toDateString(),
      diaSemana,
      nombreDia,
      esDomingo: diaSemana === 0
    });
    
    return { fecha, diaSemana, nombreDia, esDomingo: diaSemana === 0 };
  };

  const obtenerDiasDelMes = () => {
    // PRUEBA: Verificar el 4 de agosto de 2025
    console.log('🔍 Debug - PRUEBA ESPECÍFICA:');
    verificarFecha(4, 8, 2025);
    
    // PRUEBA ADICIONAL: Verificar diferentes formas de crear la fecha
    console.log('🔍 Debug - PRUEBAS ADICIONALES:');
    const fecha1 = new Date(2025, 7, 4); // mes 7 = agosto (0-indexed)
    const fecha2 = new Date('2025-08-04');
    const fecha3 = new Date('2025-08-04T00:00:00');
    
    console.log('🔍 Debug - Fecha 1 (new Date(2025, 7, 4)):', fecha1.toDateString(), 'Día semana:', fecha1.getDay());
    console.log('🔍 Debug - Fecha 2 (new Date("2025-08-04")):', fecha2.toDateString(), 'Día semana:', fecha2.getDay());
    console.log('🔍 Debug - Fecha 3 (new Date("2025-08-04T00:00:00")):', fecha3.toDateString(), 'Día semana:', fecha3.getDay());
    
    const primerDia = new Date(añoActual, mesActual - 1, 1);
    const ultimoDia = new Date(añoActual, mesActual, 0);
    const dias = [];

    // Calcular en qué día de la semana empieza el mes
    const diaSemanaInicio = primerDia.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    console.log('🔍 Debug - Calendario - Mes:', mesActual, 'Año:', añoActual);
    console.log('🔍 Debug - Calendario - Primer día del mes:', primerDia.toDateString());
    console.log('🔍 Debug - Calendario - Día de la semana de inicio:', diaSemanaInicio, '(', ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemanaInicio], ')');
    
    // Agregar días vacíos al inicio si el mes no empieza en domingo
    for (let i = 0; i < diaSemanaInicio; i++) {
      const diaSemanaReal = i; // 0 = Domingo, 1 = Lunes, etc.
      const esDomingo = diaSemanaReal === 0;
      
      dias.push({
        dia: null,
        fecha: '',
        diaSemana: diaSemanaReal,
        esDomingo,
        nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemanaReal],
        esDiaVacio: true
      });
    }

    // Agregar los días reales del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      // CORREGIR: Usar formato que funcione correctamente
      const fecha = new Date(añoActual, mesActual - 1, dia);
      const fechaString = fecha.toISOString().split('T')[0];
      const diaSemana = fecha.getDay();
      const esDomingo = diaSemana === 0; // 0 = Domingo
      
      console.log('🔍 Debug - Calendario - Día:', dia, 'Fecha:', fechaString, 'Día semana:', diaSemana, 'Es domingo:', esDomingo, 'Fecha objeto:', fecha.toDateString());
      
      dias.push({
        dia,
        fecha: fechaString,
        diaSemana,
        esDomingo,
        nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana],
        esDiaVacio: false
      });
    }

    console.log('🔍 Debug - Calendario - Total de días generados:', dias.length);
    console.log('🔍 Debug - Calendario - Días vacíos al inicio:', diaSemanaInicio);
    console.log('🔍 Debug - Calendario - Días reales del mes:', ultimoDia.getDate());

    return dias;
  };

  const obtenerDisponibilidadFecha = (fecha: string) => {
    // CORREGIR: Usar el formato que funciona para comparar fechas
    const fechaFormateada = fecha + 'T00:00:00';
    return disponibilidadTemporal.find(d => {
      const dFechaFormateada = d.fecha + 'T00:00:00';
      return dFechaFormateada === fechaFormateada;
    });
  };

  const obtenerDisponibilidadFechaOriginal = (fecha: string) => {
    // CORREGIR: Usar el formato que funciona para comparar fechas
    const fechaFormateada = fecha + 'T00:00:00';
    return disponibilidad.find(d => {
      const dFechaFormateada = d.fecha + 'T00:00:00';
      return dFechaFormateada === fechaFormateada;
    });
  };

  const cambiarMes = (incremento: number) => {
    let nuevoMes = mesActual + incremento;
    let nuevoAño = añoActual;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAño++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAño--;
    }

    setMesActual(nuevoMes);
    setAñoActual(nuevoAño);
  };

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando disponibilidad mensual...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600 mr-2">⚠️</span>
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Disponibilidad Mensual</h2>
          <p className="text-sm text-gray-600">Configura tu disponibilidad por fechas específicas</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={generarDisponibilidadRecurrente}
            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
          >
            Generar Recurrente
          </button>
          
          {!modoEdicion ? (
            <button
              onClick={iniciarEdicion}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
            >
              Editar Disponibilidad
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={cancelarEdicion}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg"
              >
                💾 Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navegación de Mes */}
      <div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => cambiarMes(-1)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          ← Mes Anterior
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {nombresMeses[mesActual - 1]} {añoActual}
        </h3>
        
        <button
          onClick={() => cambiarMes(1)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Mes Siguiente →
        </button>
      </div>

      {/* Horarios Predefinidos */}
      {modoEdicion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Horarios Predefinidos</h3>
          <div className="flex flex-wrap gap-2">
            {horariosPredefinidos.map((horario, index) => {
              const estaSeleccionado = horarioPredefinidoSeleccionado === index;
              return (
                <button
                  key={index}
                  onClick={() => aplicarHorarioPredefinido(horario, index)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                    estaSeleccionado
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {horario.nombre} ({horario.inicio}-{horario.fin})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendario Mensual */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendario Mensual</h3>
          <p className="text-sm text-gray-600 mb-6">Configura la disponibilidad para cada día del mes</p>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-sm font-medium text-gray-500 py-2">
                {dia}
              </div>
            ))}
          </div>
          
                     <div className="grid grid-cols-7 gap-2">
             {obtenerDiasDelMes().map(({ dia, fecha, diaSemana, esDomingo, nombreDia, esDiaVacio }, index) => {
               // Si es un día vacío, mostrar celda vacía
               if (esDiaVacio) {
                 return (
                   <div
                     key={`vacio-${index}`}
                     className="p-3 rounded-lg border-2 border-gray-100 bg-gray-50 min-h-[80px]"
                   >
                     <div className="text-center">
                       <div className="text-sm font-medium text-gray-400 mb-1">
                         {nombreDia}
                       </div>
                       <div className="text-xs text-gray-300">-</div>
                     </div>
                   </div>
                 );
               }

               // Si es un día real del mes
               const disponibilidadDia = obtenerDisponibilidadFecha(fecha);
               const disponibilidadOriginal = obtenerDisponibilidadFechaOriginal(fecha);
               const esActivo = disponibilidadDia?.activo || disponibilidadOriginal?.activo || false;
             
               return (
                 <div
                   key={fecha}
                   className={`
                     p-3 rounded-lg border-2 transition-all min-h-[80px]
                     ${esDomingo 
                       ? 'bg-red-50 border-red-200' // Domingo = Inactivo (rojo)
                       : esActivo 
                         ? 'bg-green-50 border-green-200' // Día activo = Verde
                         : 'bg-red-50 border-red-200' // Día inactivo = Rojo
                     }
                     ${modoEdicion && !esDomingo ? 'cursor-pointer hover:shadow-md' : ''}
                   `}
                   onClick={() => modoEdicion && !esDomingo && handleToggleDia(fecha)}
                 >
                   <div className="text-center">
                     <div className="text-sm font-medium text-gray-900 mb-1">{dia}</div>
                     
                     {esDomingo ? (
                       <div className="space-y-1">
                         <div className="flex items-center justify-center">
                           <div className="w-2 h-2 rounded-full mr-1 bg-red-500"></div>
                           <span className="text-xs text-red-600">Inactivo</span>
                         </div>
                         <div className="text-xs text-gray-500">No laborable</div>
                       </div>
                     ) : (
                       <div className="space-y-1">
                         <div className="flex items-center justify-center">
                           <div className={`w-2 h-2 rounded-full mr-1 ${esActivo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           <span className={`text-xs ${esActivo ? 'text-green-600' : 'text-red-600'}`}>
                             {esActivo ? 'Activo' : 'Inactivo'}
                           </span>
                         </div>
                         
                         {esActivo && (disponibilidadDia || disponibilidadOriginal) && (
                           <div className="text-xs text-gray-600">
                             <div>{disponibilidadDia?.hora_inicio || disponibilidadOriginal?.hora_inicio || '09:00'}</div>
                             <div>{disponibilidadDia?.hora_fin || disponibilidadOriginal?.hora_fin || '17:00'}</div>
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      {/* Información Importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <span className="text-blue-600 mr-2">⚠️</span>
          <h3 className="text-sm font-semibold text-blue-900">Información Importante</h3>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Domingos: No se trabaja en Chile (automáticamente deshabilitado)</li>
          <li>• Feriados 2025: Se consideran automáticamente como no laborables</li>
          <li>• "Generar Recurrente": Crea disponibilidad semanal para todo el mes</li>
          <li>• Los pacientes solo verán los días marcados como "Activo"</li>
        </ul>
      </div>

      {/* Contenedor de Notificaciones */}
      <ContenedorNotificaciones
        notificaciones={notificaciones}
        onCerrar={cerrarNotificacion}
      />
    </div>
  );
};

export default GestionDisponibilidadMensual;

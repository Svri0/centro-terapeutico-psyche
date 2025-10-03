import React, { useState, useEffect } from 'react';
import disponibilidadMensualService, { DisponibilidadMensual } from '../servicios/disponibilidadMensual.service';
import ModalFeriados from './ModalFeriados';

interface GestionDisponibilidadProps {
  psicologoId: string;
}

const GestionDisponibilidad: React.FC<GestionDisponibilidadProps> = ({ psicologoId }) => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadMensual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [disponibilidadTemporal, setDisponibilidadTemporal] = useState<DisponibilidadMensual[]>([]);
  const [modalFeriadosAbierto, setModalFeriadosAbierto] = useState(false);

  const diasSemana = [
    { id: 1, nombre: 'Lunes', abreviacion: 'LU', icono: '📅' },
    { id: 2, nombre: 'Martes', abreviacion: 'MA', icono: '📅' },
    { id: 3, nombre: 'Miércoles', abreviacion: 'MI', icono: '📅' },
    { id: 4, nombre: 'Jueves', abreviacion: 'JU', icono: '📅' },
    { id: 5, nombre: 'Viernes', abreviacion: 'VI', icono: '📅' },
    { id: 6, nombre: 'Sábado', abreviacion: 'SA', icono: '📅' },
    { id: 7, nombre: 'Domingo', abreviacion: 'DO', icono: '🏠' }
  ];

  const horariosPredefinidos = [
    { nombre: 'Mañana', inicio: '08:00', fin: '12:00' },
    { nombre: 'Tarde', inicio: '13:00', fin: '17:00' },
    { nombre: 'Jornada Completa', inicio: '08:00', fin: '17:00' },
    { nombre: 'Media Jornada', inicio: '09:00', fin: '13:00' }
  ];

  useEffect(() => {
    console.log('🔍 Debug - Componente GestionDisponibilidad - psicologoId:', psicologoId);
    cargarDisponibilidad();
  }, [psicologoId]);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Debug - cargarDisponibilidad - psicologoId:', psicologoId);
      
      const disponibilidadData = await disponibilidadMensualService.obtenerDisponibilidad(psicologoId);
      console.log('🔍 Debug - cargarDisponibilidad - data:', disponibilidadData);
      
      // Asegurar que disponibilidadData sea un array
      const disponibilidadArray = Array.isArray(disponibilidadData) ? disponibilidadData : [];
      
      if (disponibilidadArray.length === 0) {
        // Crear disponibilidad por defecto si no existe
        const disponibilidadInicial = diasSemana.map(dia => ({
          psicologo_id: psicologoId,
          dia_semana: dia.id,
          hora_inicio: dia.id === 7 ? '00:00' : '09:00', // Domingo inactivo
          hora_fin: dia.id === 7 ? '00:00' : '17:00',
          activo: dia.id !== 7 // Domingo inactivo por defecto
        }));
        
        setDisponibilidad(disponibilidadInicial);
        setDisponibilidadTemporal([...disponibilidadInicial]);
      } else {
        setDisponibilidad(disponibilidadArray);
        setDisponibilidadTemporal([...disponibilidadArray]);
      }
    } catch (err: any) {
      console.error('Error al cargar disponibilidad:', err);
      setError(err.message || 'Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = () => {
    setDisponibilidadTemporal([...disponibilidad]);
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setDisponibilidadTemporal([...disponibilidad]);
    setModoEdicion(false);
  };

  const guardarCambios = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Debug - psicologoId:', psicologoId);
      console.log('🔍 Debug - disponibilidadTemporal:', disponibilidadTemporal);
      
      await disponibilidadMensualService.actualizarDisponibilidadMultiple(psicologoId, disponibilidadTemporal);
      
      setDisponibilidad([...disponibilidadTemporal]);
      setModoEdicion(false);
      
      // Mostrar mensaje de éxito
      alert('Disponibilidad actualizada correctamente');
    } catch (err: any) {
      console.error('Error al guardar disponibilidad:', err);
      setError(err.message || 'Error al guardar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDia = (diaId: number) => {
    if (!modoEdicion) return;
    
    setDisponibilidadTemporal(prev => 
      prev.map(dia => 
        dia.dia_semana === diaId 
          ? { ...dia, activo: !dia.activo }
          : dia
      )
    );
  };

  const handleCambiarHorario = (diaId: number, campo: 'hora_inicio' | 'hora_fin', valor: string) => {
    if (!modoEdicion) return;
    
    setDisponibilidadTemporal(prev => 
      prev.map(dia => 
        dia.dia_semana === diaId 
          ? { ...dia, [campo]: valor }
          : dia
      )
    );
  };

  const aplicarHorarioPredefinido = (horario: typeof horariosPredefinidos[0]) => {
    if (!modoEdicion) return;
    
    setDisponibilidadTemporal(prev => 
      prev.map(dia => 
        dia.activo 
          ? { ...dia, hora_inicio: horario.inicio, hora_fin: horario.fin }
          : dia
      )
    );
  };

  const copiarHorario = (diaOrigen: number) => {
    if (!modoEdicion) return;
    
    const diaOrigenData = disponibilidadTemporal.find(d => d.dia_semana === diaOrigen);
    if (!diaOrigenData) return;
    
    setDisponibilidadTemporal(prev => 
      prev.map(dia => 
        dia.activo && dia.dia_semana !== diaOrigen
          ? { ...dia, hora_inicio: diaOrigenData.hora_inicio, hora_fin: diaOrigenData.hora_fin }
          : dia
      )
    );
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

  const disponibilidadActual = modoEdicion ? disponibilidadTemporal : disponibilidad;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Disponibilidad</h2>
          <p className="text-gray-600 mt-1">Configura tus horarios de atención para citas</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setModalFeriadosAbierto(true)}
            className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            📅 Ver Feriados 2025
          </button>
          
          {!modoEdicion ? (
            <button
              onClick={iniciarEdicion}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✏️ Editar Disponibilidad
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
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horarios Predefinidos */}
      {modoEdicion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Horarios Predefinidos</h3>
          <div className="flex flex-wrap gap-2">
            {horariosPredefinidos.map((horario, index) => (
              <button
                key={index}
                onClick={() => aplicarHorarioPredefinido(horario)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                {horario.nombre} ({horario.inicio}-{horario.fin})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendario Semanal */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendario Semanal</h3>
          <p className="text-sm text-gray-600 mb-6">Configura la disponibilidad para cada día</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {diasSemana.map((dia) => {
              const disponibilidadDia = disponibilidadActual.find(d => d.dia_semana === dia.id);
              const esDomingo = dia.id === 7;
              const esActivo = disponibilidadDia?.activo || false;
              
              return (
                <div
                  key={dia.id}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${esActivo 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                    }
                    ${modoEdicion ? 'cursor-pointer hover:shadow-md' : ''}
                  `}
                  onClick={() => modoEdicion && !esDomingo && handleToggleDia(dia.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{dia.icono}</span>
                    {modoEdicion && !esDomingo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (esActivo) copiarHorario(dia.id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        title="Copiar horario a otros días"
                      >
                        📋
                      </button>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{dia.nombre}</h4>
                  
                  {esDomingo ? (
                    <div className="space-y-1">
                      <div className="text-sm text-red-600">No laborable</div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs text-red-600">Inactivo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${esActivo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs ${esActivo ? 'text-green-600' : 'text-red-600'}`}>
                          {esActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      {esActivo && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-600">Inicio:</label>
                            {modoEdicion ? (
                              <input
                                type="time"
                                value={disponibilidadDia?.hora_inicio || '09:00'}
                                onChange={(e) => handleCambiarHorario(dia.id, 'hora_inicio', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {disponibilidadDia?.hora_inicio || '09:00'}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-600">Fin:</label>
                            {modoEdicion ? (
                              <input
                                type="time"
                                value={disponibilidadDia?.hora_fin || '17:00'}
                                onChange={(e) => handleCambiarHorario(dia.id, 'hora_fin', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {disponibilidadDia?.hora_fin || '17:00'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
          <li>• Los pacientes solo verán los horarios marcados como "Activo"</li>
        </ul>
      </div>

      {/* Modal de Feriados */}
      <ModalFeriados 
        isOpen={modalFeriadosAbierto}
        onClose={() => setModalFeriadosAbierto(false)}
      />
    </div>
  );
};

export default GestionDisponibilidad; 
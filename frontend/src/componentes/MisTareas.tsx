import React, { useState, useEffect } from 'react';
import { authService } from '../servicios/auth.service';
import { tareasService } from '../servicios/tareas.service';
import { Tarea } from '../types/tareas';
import ResponderTarea from './ResponderTarea';
import Modal from './Modal';

const MisTareas: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar el rol del usuario para usar el endpoint correcto
      const currentUser = authService.getCurrentUser();
      let tareasData;
      
      if (currentUser?.rol === 'paciente') {
        // Usar el endpoint específico para pacientes
        tareasData = await tareasService.obtenerMisTareas();
      } else {
        // Usar el endpoint para psicólogos
        tareasData = await tareasService.obtenerTareas();
      }
      
      setTareas(Array.isArray(tareasData) ? tareasData : []);
    } catch (err: any) {
      console.error('Error al cargar tareas:', err);
      setError(err.message || 'Error al cargar las tareas');
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoTarea = async (tareaId: string, nuevoEstado: string) => {
    try {
      // Verificar el rol del usuario para usar el endpoint correcto
      const currentUser = authService.getCurrentUser();
      
      if (currentUser?.rol === 'paciente') {
        // Usar el endpoint específico para pacientes
        await tareasService.actualizarMiTarea(tareaId, { estado: nuevoEstado as any });
      } else {
        // Usar el endpoint para psicólogos
        await tareasService.actualizarTarea(tareaId, { estado: nuevoEstado as any });
      }
      
      // Recargar tareas para obtener los datos actualizados
      await cargarTareas();
    } catch (err: any) {
      console.error('Error al actualizar tarea:', err);
      setError(err.message || 'Error al actualizar la tarea');
    }
  };

  const handleResponderTarea = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setShowResponderModal(true);
  };

  const handleRespuestaEnviada = async () => {
    setShowResponderModal(false);
    setSelectedTarea(null);
    await cargarTareas(); // Recargar para ver el estado actualizado
  };

  const obtenerEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-50 text-yellow-700 border-yellow-400';
      case 'en_progreso': return 'bg-blue-50 text-blue-700 border-blue-400';
      case 'completada': return 'bg-green-50 text-green-700 border-green-400';
      default: return 'bg-gray-50 text-gray-700 border-gray-400';
    }
  };

  const obtenerPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-50 text-red-700 border-red-400';
      case 'media': return 'bg-orange-50 text-orange-700 border-orange-400';
      case 'baja': return 'bg-green-50 text-green-700 border-green-400';
      default: return 'bg-gray-50 text-gray-700 border-gray-400';
    }
  };

  const obtenerTipoTareaIcono = (tipo: string) => {
    switch (tipo) {
      case 'texto_abierto': return '📝';
      case 'opcion_multiple': return '☑️';
      case 'test_psicologico': return '🧠';
      case 'test_imagenes': return '🖼️';
      case 'tarea_dibujo': return '🎨';
      case 'ejercicio': return '💪';
      case 'lectura': return '📖';
      case 'reflexion': return '🤔';
      case 'actividad': return '🎯';
      case 'evaluacion': return '📝';
      default: return '📋';
    }
  };

  const obtenerTipoTareaNombre = (tipo: string) => {
    switch (tipo) {
      case 'texto_abierto': return 'Texto Abierto';
      case 'opcion_multiple': return 'Opción Múltiple';
      case 'test_psicologico': return 'Test Psicológico';
      case 'test_imagenes': return 'Test con Imágenes';
      case 'tarea_dibujo': return 'Tarea de Dibujo';
      case 'ejercicio': return 'Ejercicio';
      case 'lectura': return 'Lectura';
      case 'reflexion': return 'Reflexión';
      case 'actividad': return 'Actividad';
      case 'evaluacion': return 'Evaluación';
      default: return 'Tarea';
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tareasFiltradas = filtroEstado 
    ? tareas.filter(tarea => tarea.estado === filtroEstado)
    : tareas;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        <span className="ml-4 text-gray-500 font-light">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-8">
      {/* Header con estilo del psicólogo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0 pb-6 border-b-2 border-gray-400">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MIS TAREAS</h2>
          <p className="text-gray-500 font-light">TAREAS ASIGNADAS POR TU PSICÓLOGO</p>
        </div>
        
        {/* Filtro de estado con borde más oscuro */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-600">Filtrar por:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white font-medium"
          >
            <option value="">Todas las tareas</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completadas</option>
          </select>
        </div>
      </div>

      {/* Mensajes de error con borde más oscuro */}
      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-400 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-red-500">⚠️</div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      <div className="space-y-6">
        {tareasFiltradas.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-500 rounded-lg">
            <div className="text-gray-400 text-8xl mb-6">📋</div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              {filtroEstado ? 'No hay tareas con ese estado' : 'No tienes tareas asignadas'}
            </h3>
            <p className="text-gray-500 font-light max-w-md mx-auto">
              {filtroEstado 
                ? 'Intenta cambiar el filtro para ver más tareas disponibles'
                : 'Tu psicólogo te asignará tareas cuando sea necesario para tu proceso terapéutico'
              }
            </p>
          </div>
        ) : (
          tareasFiltradas.map((tarea) => (
            <div key={tarea.id} className="bg-white rounded-lg border-2 border-gray-400 p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-6 pb-4 border-b-2 border-gray-300">
                    <span className="text-3xl">{obtenerTipoTareaIcono(tarea.tipo_tarea)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${obtenerEstadoColor(tarea.estado)}`}>
                          {tarea.estado === 'pendiente' ? 'Pendiente' : 
                           tarea.estado === 'en_progreso' ? 'En Progreso' : 'Completada'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${obtenerPrioridadColor(tarea.prioridad)}`}>
                          {tarea.prioridad === 'alta' ? 'Alta' : 
                           tarea.prioridad === 'media' ? 'Media' : 'Baja'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border-2 border-purple-400">
                          {obtenerTipoTareaNombre(tarea.tipo_tarea)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{tarea.titulo}</h3>
                      <p className="text-gray-600 font-light">{tarea.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 mb-6 pb-4 border-b-2 border-gray-300">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500">⭐</span>
                      <span className="font-medium text-gray-700">{tarea.puntos_asignados} puntos</span>
                    </div>
                    {tarea.fecha_vencimiento && (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500">📅</span>
                        <span className="text-sm text-gray-600 font-medium">
                          <span className="font-medium">Fecha límite:</span> {formatearFecha(tarea.fecha_vencimiento)}
                        </span>
                      </div>
                    )}
                    {tarea.fecha_completada && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✅</span>
                        <span className="text-sm text-green-700 font-medium">
                          <span className="font-medium">Completada el:</span> {formatearFecha(tarea.fecha_completada)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Instrucciones:</h4>
                    <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-400">
                      <p className="text-gray-700 font-light leading-relaxed">{tarea.instrucciones}</p>
                    </div>
                  </div>

                  {/* Mostrar contenido específico según el tipo de tarea */}
                  {tarea.contenido_tarea && (
                    <div className="mb-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-400">
                      <h4 className="font-bold text-blue-800 mb-2">Contenido de la Tarea:</h4>
                      <div className="text-blue-700 font-light">
                        {tarea.tipo_tarea === 'texto_abierto' && (
                          <p>Escribe libremente tu respuesta en el campo de texto.</p>
                        )}
                        {tarea.tipo_tarea === 'opcion_multiple' && (
                          <p>Selecciona una o más opciones de respuesta.</p>
                        )}
                        {tarea.tipo_tarea === 'test_psicologico' && (
                          <p>Responde las preguntas del test psicológico.</p>
                        )}
                        {tarea.tipo_tarea === 'test_imagenes' && (
                          <p>Analiza la imagen y responde las preguntas asociadas.</p>
                        )}
                        {tarea.tipo_tarea === 'tarea_dibujo' && (
                          <p>Utiliza la herramienta de dibujo para crear tu respuesta.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-3 ml-8 pl-6 border-l-2 border-gray-400">
                  {tarea.estado === 'pendiente' && (
                    <button
                      onClick={() => actualizarEstadoTarea(tarea.id, 'en_progreso')}
                      className="px-6 py-2 bg-blue-50 text-blue-700 border-2 border-blue-400 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      Iniciar
                    </button>
                  )}
                  
                  {tarea.estado === 'en_progreso' && (
                    <>
                      <button
                        onClick={() => handleResponderTarea(tarea)}
                        className="px-6 py-2 bg-green-50 text-green-700 border-2 border-green-400 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        Responder
                      </button>
                      <button
                        onClick={() => actualizarEstadoTarea(tarea.id, 'completada')}
                        className="px-6 py-2 bg-purple-50 text-purple-700 border-2 border-purple-400 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                      >
                        Completar
                      </button>
                    </>
                  )}
                  
                  {tarea.estado === 'completada' && (
                    <span className="px-6 py-2 bg-green-50 text-green-700 border-2 border-green-400 rounded-lg font-medium">
                      ✓ Completada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estadísticas con borde superior más oscuro */}
      {tareas.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-8 border-2 border-gray-400 mt-8 pt-8 border-t-2 border-gray-500">
          <h3 className="text-sm font-bold text-gray-700 mb-6">RESUMEN DE PROGRESO</h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-700 mb-2">
                {tareas.filter(t => t.estado === 'pendiente').length}
              </div>
              <div className="text-gray-600 font-medium">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {tareas.filter(t => t.estado === 'en_progreso').length}
              </div>
              <div className="text-gray-600 font-medium">En Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">
                {tareas.filter(t => t.estado === 'completada').length}
              </div>
              <div className="text-gray-600 font-medium">Completadas</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para responder tarea */}
      <Modal
        isOpen={showResponderModal}
        onClose={() => setShowResponderModal(false)}
        title="Responder Tarea"
        size="xl"
      >
        {selectedTarea && (
          <ResponderTarea
            tarea={selectedTarea}
            onSubmit={async (data) => {
              try {
                await tareasService.guardarRespuesta(selectedTarea.id, data);
                handleRespuestaEnviada();
              } catch (error: any) {
                console.error('Error al guardar respuesta:', error);
                setError(error.message || 'Error al guardar la respuesta');
              }
            }}
            onCancel={() => setShowResponderModal(false)}
            loading={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default MisTareas; 
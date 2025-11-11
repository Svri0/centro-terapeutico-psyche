import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { tareasService, Tarea, CrearTareaData } from '../servicios/tareas.service';
import { pacientesService } from '../servicios/pacientes.service';
import Modal from './Modal';
import Notificacion from './Notificacion';
import FormularioTareaAvanzada from './FormularioTareaAvanzada';
import RevisarRespuestas from './RevisarRespuestas';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  numero_ficha?: string;
}

const GestionTareas: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRespuestasModal, setShowRespuestasModal] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroPaciente, setFiltroPaciente] = useState<string>('');

  // Estado para nueva tarea
  const [nuevaTarea, setNuevaTarea] = useState<CrearTareaData>({
    paciente_id: '',
    titulo: '',
    descripcion: '',
    instrucciones: '',
    tipo_tarea: 'texto_abierto',
    prioridad: 'media',
    puntos_asignados: 2
  });

  // Estado para notificaciones
  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar tareas y pacientes en paralelo
      const [tareasData, pacientesData] = await Promise.all([
        tareasService.obtenerTareas(),
        pacientesService.obtenerPacientes()
      ]);

      console.log('📋 Tareas recibidas del backend:', tareasData);
      console.log('👥 Pacientes recibidos:', pacientesData);

      // Asegurar que los datos son arrays
      const tareasArray = Array.isArray(tareasData) ? tareasData : [];
      const pacientesArray = Array.isArray(pacientesData) ? pacientesData : [];
      
      console.log(`✅ Estableciendo ${tareasArray.length} tareas y ${pacientesArray.length} pacientes`);
      setTareas(tareasArray);
      setPacientes(pacientesArray);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos');
      // En caso de error, establecer arrays vacíos
      setTareas([]);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' | 'advertencia' | 'info') => {
    setNotificacion({
      visible: true,
      mensaje,
      tipo
    });
  };

  const cerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, visible: false }));
  };

  const handleCrearTarea = async (tareaData: CrearTareaData) => {
    try {
      console.log('📝 Creando tarea con datos:', tareaData);
      const tareaCreada = await tareasService.crearTareaAvanzada(tareaData);
      console.log('✅ Tarea creada exitosamente:', tareaCreada);
      
      // Recargar datos después de crear
      console.log('🔄 Recargando lista de tareas...');
      await cargarDatos();
      
      setShowModal(false);
      mostrarNotificacion('Tarea creada exitosamente', 'exito');
    } catch (err: any) {
      console.error('❌ Error al crear tarea:', err);
      mostrarNotificacion(err.message || 'Error al crear la tarea', 'error');
    }
  };

  const handleVerRespuestas = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setShowRespuestasModal(true);
  };

  const handleActualizarEstado = async (tareaId: string, nuevoEstado: string) => {
    try {
      await tareasService.actualizarTarea(tareaId, { estado: nuevoEstado as any });
      await cargarDatos();
      mostrarNotificacion('Estado de tarea actualizado exitosamente', 'exito');
    } catch (err: any) {
      mostrarNotificacion(err.message || 'Error al actualizar el estado', 'error');
    }
  };

  const handleEliminarTarea = async (tareaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await tareasService.eliminarTarea(tareaId);
      await cargarDatos();
      mostrarNotificacion('Tarea eliminada exitosamente', 'exito');
    } catch (err: any) {
      mostrarNotificacion(err.message || 'Error al eliminar la tarea', 'error');
    }
  };

  const obtenerEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerTipoTareaIcono = (tipo: string) => {
    switch (tipo) {
      case 'texto_abierto': return '📝';
      case 'opcion_multiple': return '☑️';
      case 'test_psicologico': return '🧠';
      case 'test_imagenes': return '🖼️';
      case 'tarea_dibujo': return '🎨';
      case 'ejercicio': return '🏃';
      case 'lectura': return '📖';
      case 'reflexion': return '💭';
      case 'practica': return '✍️';
      case 'evaluacion': return '📊';
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
      case 'practica': return 'Práctica';
      case 'evaluacion': return 'Evaluación';
      default: return 'Tarea';
    }
  };

  // Filtrar tareas
  const tareasFiltradas = tareas.filter(tarea => {
    if (filtroEstado && tarea.estado !== filtroEstado) return false;
    if (filtroTipo && tarea.tipo_tarea !== filtroTipo) return false;
    if (filtroPaciente && tarea.paciente_id !== filtroPaciente) return false;
    return true;
  });

  // Log para depuración
  useEffect(() => {
    console.log(`🔍 Tareas totales: ${tareas.length}, Tareas filtradas: ${tareasFiltradas.length}`);
    console.log('🔍 Filtros activos:', { filtroEstado, filtroTipo, filtroPaciente });
    if (tareas.length > 0) {
      console.log('📋 Primera tarea:', tareas[0]);
    }
  }, [tareas, tareasFiltradas, filtroEstado, filtroTipo, filtroPaciente]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
            <p className="text-gray-600 mt-2">Asigna y gestiona tareas avanzadas para tus pacientes</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Tarea Avanzada</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Tarea</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los tipos</option>
              <option value="texto_abierto">Texto Abierto</option>
              <option value="opcion_multiple">Opción Múltiple</option>
              <option value="test_psicologico">Test Psicológico</option>
              <option value="test_imagenes">Test con Imágenes</option>
              <option value="tarea_dibujo">Tarea de Dibujo</option>
              <option value="ejercicio">Ejercicio</option>
              <option value="lectura">Lectura</option>
              <option value="reflexion">Reflexión</option>
              <option value="practica">Práctica</option>
              <option value="evaluacion">Evaluación</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
            <select
              value={filtroPaciente}
              onChange={(e) => setFiltroPaciente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los pacientes</option>
              {Array.isArray(pacientes) && pacientes.map(paciente => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nombres} {paciente.apellidos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Tareas ({tareasFiltradas.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {tareasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay tareas
              </h3>
              <p className="text-gray-600">
                {filtroEstado || filtroTipo || filtroPaciente 
                  ? 'No hay tareas que coincidan con los filtros seleccionados'
                  : 'Crea tu primera tarea avanzada para comenzar'
                }
              </p>
            </div>
          ) : (
            tareasFiltradas.map((tarea) => (
              <div key={tarea.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{obtenerTipoTareaIcono(tarea.tipo_tarea)}</span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {obtenerTipoTareaNombre(tarea.tipo_tarea)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerEstadoColor(tarea.estado)}`}>
                        {tarea.estado.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerPrioridadColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{tarea.puntos_asignados} puntos</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tarea.titulo}
                    </h3>

                    <p className="text-gray-600 mb-3">{tarea.descripcion}</p>

                    {tarea.instrucciones && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-900">Instrucciones:</span>
                        <p className="text-blue-800 mt-1">{tarea.instrucciones}</p>
                      </div>
                    )}

                    {/* Mostrar contenido específico según el tipo de tarea */}
                    {tarea.contenido_tarea && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">Contenido de la Tarea:</span>
                        <div className="text-gray-700 mt-1">
                          {tarea.tipo_tarea === 'texto_abierto' && (
                            <p>El paciente debe escribir libremente su respuesta.</p>
                          )}
                          {tarea.tipo_tarea === 'opcion_multiple' && (
                            <p>Pregunta de opción múltiple con opciones predefinidas.</p>
                          )}
                          {tarea.tipo_tarea === 'test_psicologico' && (
                            <p>Test psicológico con preguntas estructuradas.</p>
                          )}
                          {tarea.tipo_tarea === 'test_imagenes' && (
                            <p>Test que incluye imágenes para análisis.</p>
                          )}
                          {tarea.tipo_tarea === 'tarea_dibujo' && (
                            <p>El paciente debe dibujar como parte de su respuesta.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Paciente:</span> {tarea.paciente_nombres} {tarea.paciente_apellidos}
                      </div>
                      <div>
                        <span className="font-medium">Asignada:</span> {format(new Date(tarea.fecha_asignacion), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      {tarea.fecha_vencimiento && (
                        <div>
                          <span className="font-medium">Vence:</span> {format(new Date(tarea.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      )}
                    </div>

                    {tarea.respuesta_paciente && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-900">Respuesta del Paciente:</span>
                        <p className="text-green-800 mt-1">{tarea.respuesta_paciente}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {tarea.estado === 'pendiente' && (
                      <button
                        onClick={() => handleActualizarEstado(tarea.id, 'en_progreso')}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Marcar en Progreso
                      </button>
                    )}
                    
                    {tarea.estado === 'en_progreso' && (
                      <button
                        onClick={() => handleActualizarEstado(tarea.id, 'completada')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                      >
                        Marcar Completada
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleVerRespuestas(tarea)}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                    >
                      Ver Respuestas
                    </button>
                    
                    <button
                      onClick={() => handleEliminarTarea(tarea.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para crear nueva tarea avanzada */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Nueva Tarea Avanzada"
        size="xl"
      >
        <FormularioTareaAvanzada
          pacientes={pacientes}
          onSubmit={handleCrearTarea}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Modal para revisar respuestas */}
      <Modal
        isOpen={showRespuestasModal}
        onClose={() => setShowRespuestasModal(false)}
        title="Revisar Respuestas"
        size="xl"
      >
        {selectedTarea && (
          <RevisarRespuestas
            tareaId={selectedTarea.id}
            onClose={() => setShowRespuestasModal(false)}
          />
        )}
      </Modal>

      {/* Componente de Notificación */}
      <Notificacion
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        visible={notificacion.visible}
        onCerrar={cerrarNotificacion}
      />
    </div>
  );
};

export default GestionTareas; 
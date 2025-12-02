import React, { useState, useEffect } from 'react';
import { 
  TipoTarea, 
  CrearTareaData, 
  ContenidoTarea, 
  ConfiguracionTarea,
  PreguntaOpcionMultiple,
  PreguntaTest,
  ImagenTest,
  OpcionRespuesta
} from '../types/tareas';

interface FormularioTareaAvanzadaProps {
  onSubmit: (data: CrearTareaData) => void;
  onCancel: () => void;
  loading?: boolean;
  pacientes: Array<{ id: string; nombres: string; apellidos: string; email: string }>;
}

const FormularioTareaAvanzada: React.FC<FormularioTareaAvanzadaProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  pacientes
}) => {
  const [formData, setFormData] = useState<CrearTareaData>({
    paciente_id: '',
    titulo: '',
    descripcion: '',
    instrucciones: '',
    tipo_tarea: 'texto_abierto',
    prioridad: 'media',
    puntos_asignados: 2,
    es_borrador: false,
    fecha_publicacion: undefined,
    contenido_tarea: {},
    configuracion_tarea: {}
  });

  const [contenidoTarea, setContenidoTarea] = useState<ContenidoTarea>({});
  const [configuracionTarea, setConfiguracionTarea] = useState<ConfiguracionTarea>({});

  const tiposTarea: { value: TipoTarea; label: string; descripcion: string }[] = [
    { value: 'texto_abierto', label: 'Texto Abierto', descripcion: 'El paciente escribe libremente su respuesta' },
    { value: 'opcion_multiple', label: 'Opción Múltiple', descripcion: 'Una o varias respuestas correctas' },
    { value: 'test_psicologico', label: 'Test Psicológico', descripcion: 'Conjunto de preguntas predefinidas' },
    { value: 'test_imagenes', label: 'Test con Imágenes', descripcion: 'Mostrar imágenes y solicitar descripción' },
    { value: 'tarea_dibujo', label: 'Tarea de Dibujo', descripcion: 'El paciente debe dibujar como respuesta' },
    { value: 'ejercicio', label: 'Ejercicio', descripcion: 'Ejercicio práctico' },
    { value: 'lectura', label: 'Lectura', descripcion: 'Material de lectura' },
    { value: 'reflexion', label: 'Reflexión', descripcion: 'Ejercicio de reflexión' },
    { value: 'practica', label: 'Práctica', descripcion: 'Ejercicio práctico' },
    { value: 'evaluacion', label: 'Evaluación', descripcion: 'Evaluación formal' }
  ];

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'text-green-600' },
    { value: 'media', label: 'Media', color: 'text-yellow-600' },
    { value: 'alta', label: 'Alta', color: 'text-orange-600' },
    { value: 'urgente', label: 'Urgente', color: 'text-red-600' }
  ];

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contenido_tarea: contenidoTarea,
      configuracion_tarea: configuracionTarea
    }));
  }, [contenidoTarea, configuracionTarea]);

  const handleInputChange = (field: keyof CrearTareaData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 FormularioTareaAvanzada - handleSubmit llamado');
    console.log('📝 formData antes de procesar:', formData);
    console.log('📝 contenidoTarea:', contenidoTarea);
    console.log('📝 configuracionTarea:', configuracionTarea);
    
    // Asegurar que tipo_tarea_avanzado esté presente
    // Asegurar que es_borrador sea false si no está marcado
    // Si no es borrador y no hay fecha de publicación, no enviar fecha_publicacion (NULL = publicar inmediatamente)
    const dataToSubmit = {
      ...formData,
      tipo_tarea_avanzado: formData.tipo_tarea,
      contenido_tarea: contenidoTarea,
      configuracion_tarea: configuracionTarea,
      es_borrador: formData.es_borrador === true,
      // Solo enviar fecha_publicacion si está definida y no es vacía
      fecha_publicacion: formData.fecha_publicacion && formData.fecha_publicacion.trim() !== '' 
        ? formData.fecha_publicacion 
        : undefined
    };
    
    console.log('📝 dataToSubmit final:', dataToSubmit);
    onSubmit(dataToSubmit);
  };

  const renderContenidoTarea = () => {
    switch (formData.tipo_tarea) {
      case 'texto_abierto':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pregunta o consigna
              </label>
              <textarea
                value={contenidoTarea.preguntaTexto || ''}
                onChange={(e) => setContenidoTarea(prev => ({ ...prev, preguntaTexto: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Escribe la pregunta o consigna para el paciente..."
              />
            </div>
          </div>
        );

      case 'opcion_multiple':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preguntas
              </label>
              <div className="space-y-4">
                {(contenidoTarea.preguntas || []).map((pregunta, index) => (
                  <div key={pregunta.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Pregunta {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const nuevasPreguntas = (contenidoTarea.preguntas || []).filter(p => p.id !== pregunta.id);
                          setContenidoTarea(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                    <input
                      type="text"
                      value={pregunta.pregunta}
                      onChange={(e) => {
                        const nuevasPreguntas = [...(contenidoTarea.preguntas || [])];
                        nuevasPreguntas[index].pregunta = e.target.value;
                        setContenidoTarea(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                      placeholder="Escribe la pregunta..."
                    />
                    <div className="space-y-2">
                      {pregunta.opciones.map((opcion, opcionIndex) => (
                        <div key={opcion.id} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={opcion.texto}
                            onChange={(e) => {
                              const nuevasPreguntas = [...(contenidoTarea.preguntas || [])];
                              nuevasPreguntas[index].opciones[opcionIndex].texto = e.target.value;
                              setContenidoTarea(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                            }}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder={`Opción ${opcionIndex + 1}`}
                          />
                          <input
                            type="checkbox"
                            checked={opcion.correcta || false}
                            onChange={(e) => {
                              const nuevasPreguntas = [...(contenidoTarea.preguntas || [])];
                              nuevasPreguntas[index].opciones[opcionIndex].correcta = e.target.checked;
                              setContenidoTarea(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                            }}
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-600">Correcta</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={pregunta.seleccionMultiple}
                          onChange={(e) => {
                            const nuevasPreguntas = [...(contenidoTarea.preguntas || [])];
                            nuevasPreguntas[index].seleccionMultiple = e.target.checked;
                            setContenidoTarea(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Selección múltiple</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={pregunta.requerida}
                          onChange={(e) => {
                            const nuevasPreguntas = [...(contenidoTarea.preguntas || [])];
                            nuevasPreguntas[index].requerida = e.target.checked;
                            setContenidoTarea(prev => ({ ...prev, preguntas: nuevasPreguntas }));
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Requerida</span>
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const nuevaPregunta: PreguntaOpcionMultiple = {
                      id: Date.now().toString(),
                      pregunta: '',
                      opciones: [
                        { id: '1', texto: '' },
                        { id: '2', texto: '' },
                        { id: '3', texto: '' },
                        { id: '4', texto: '' }
                      ],
                      seleccionMultiple: false,
                      requerida: true
                    };
                    setContenidoTarea(prev => ({
                      ...prev,
                      preguntas: [...(prev.preguntas || []), nuevaPregunta]
                    }));
                  }}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                >
                  + Agregar Pregunta
                </button>
              </div>
            </div>
          </div>
        );

      case 'tarea_dibujo':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrucciones para el dibujo
              </label>
              <textarea
                value={contenidoTarea.instruccionesDibujo || ''}
                onChange={(e) => setContenidoTarea(prev => ({ ...prev, instruccionesDibujo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe qué debe dibujar el paciente..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-sm">
            Este tipo de tarea no requiere configuración adicional específica.
          </div>
        );
    }
  };

  const renderConfiguracionTarea = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Configuración Avanzada</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo límite (minutos)
            </label>
            <input
              type="number"
              value={configuracionTarea.tiempoLimite || ''}
              onChange={(e) => setConfiguracionTarea(prev => ({ ...prev, tiempoLimite: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sin límite"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intentos permitidos
            </label>
            <input
              type="number"
              value={configuracionTarea.intentosPermitidos || ''}
              onChange={(e) => setConfiguracionTarea(prev => ({ ...prev, intentosPermitidos: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sin límite"
              min="1"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuracionTarea.mostrarResultados || false}
              onChange={(e) => setConfiguracionTarea(prev => ({ ...prev, mostrarResultados: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-sm">Mostrar resultados al paciente</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuracionTarea.retroalimentacionInmediata || false}
              onChange={(e) => setConfiguracionTarea(prev => ({ ...prev, retroalimentacionInmediata: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-sm">Retroalimentación inmediata</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configuracionTarea.aleatorizarPreguntas || false}
              onChange={(e) => setConfiguracionTarea(prev => ({ ...prev, aleatorizarPreguntas: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-sm">Aleatorizar preguntas</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paciente *
          </label>
          <select
            value={formData.paciente_id}
            onChange={(e) => handleInputChange('paciente_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar paciente</option>
            {pacientes.map(paciente => (
              <option key={paciente.id} value={paciente.id}>
                {paciente.nombres} {paciente.apellidos} - {paciente.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Título de la tarea"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Descripción detallada de la tarea"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instrucciones
          </label>
          <textarea
            value={formData.instrucciones || ''}
            onChange={(e) => handleInputChange('instrucciones', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Instrucciones específicas para el paciente"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Tarea *
            </label>
            <select
              value={formData.tipo_tarea}
              onChange={(e) => handleInputChange('tipo_tarea', e.target.value as TipoTarea)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {tiposTarea.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {tiposTarea.find(t => t.value === formData.tipo_tarea)?.descripcion}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) => handleInputChange('prioridad', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {prioridades.map(prioridad => (
                <option key={prioridad.value} value={prioridad.value}>
                  {prioridad.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntos
            </label>
            <input
              type="number"
              value={formData.puntos_asignados}
              onChange={(e) => handleInputChange('puntos_asignados', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de vencimiento
          </label>
          <input
            type="datetime-local"
            value={formData.fecha_vencimiento || ''}
            onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contenido específico según el tipo */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Contenido de la Tarea</h3>
        {renderContenidoTarea()}
      </div>

      {/* Configuración avanzada */}
      <div className="space-y-4">
        {renderConfiguracionTarea()}
      </div>

      {/* Opciones de publicación */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Publicación</h3>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.es_borrador || false}
            onChange={(e) => handleInputChange('es_borrador', e.target.checked)}
            className="text-blue-600"
          />
          <span className="text-sm">Guardar como borrador</span>
        </label>

        {!formData.es_borrador && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de publicación
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_publicacion || ''}
              onChange={(e) => handleInputChange('fecha_publicacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar vacío para publicar inmediatamente
            </p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : formData.es_borrador ? 'Guardar Borrador' : 'Crear Tarea'}
        </button>
      </div>
    </form>
  );
};

export default FormularioTareaAvanzada;

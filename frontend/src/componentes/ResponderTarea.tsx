import React, { useState } from 'react';
import { Tarea, GuardarRespuestaData } from '../types/tareas';
import HerramientaDibujo from './HerramientaDibujo';

interface ResponderTareaProps {
  tarea: Tarea;
  onSubmit: (data: GuardarRespuestaData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ResponderTarea: React.FC<ResponderTareaProps> = ({
  tarea,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [respuesta, setRespuesta] = useState('');
  const [dibujo, setDibujo] = useState<string | null>(null);
  const [mostrarDibujo, setMostrarDibujo] = useState(false);
  const [respuestasOpciones, setRespuestasOpciones] = useState<Record<string, string[]>>({});

  const getTipoTareaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'texto_abierto': 'Texto Abierto',
      'opcion_multiple': 'Opción Múltiple',
      'test_psicologico': 'Test Psicológico',
      'test_imagenes': 'Test con Imágenes',
      'tarea_dibujo': 'Tarea de Dibujo',
      'ejercicio': 'Ejercicio',
      'lectura': 'Lectura',
      'reflexion': 'Reflexión',
      'practica': 'Práctica',
      'evaluacion': 'Evaluación'
    };
    return labels[tipo] || tipo;
  };

  const getTipoTareaIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'texto_abierto': '📝',
      'opcion_multiple': '☑️',
      'test_psicologico': '🧠',
      'test_imagenes': '🖼️',
      'tarea_dibujo': '🎨',
      'ejercicio': '💪',
      'lectura': '📖',
      'reflexion': '🤔',
      'practica': '🔧',
      'evaluacion': '📊'
    };
    return icons[tipo] || '📋';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya hecho un dibujo para tareas de dibujo
    if (tarea.tipo_tarea === 'tarea_dibujo' && !dibujo) {
      alert('Por favor, haz un dibujo antes de enviar la respuesta.');
      return;
    }
    
    const data: GuardarRespuestaData = {};
    
    if (respuesta.trim()) {
      data.contenido_respuesta = respuesta;
    }
    
    if (dibujo) {
      data.archivo_respuesta = dibujo;
    }
    
    onSubmit(data);
  };

  const handleOpcionChange = (preguntaId: string, opcionId: string, checked: boolean) => {
    setRespuestasOpciones(prev => {
      const current = prev[preguntaId] || [];
      if (checked) {
        return { ...prev, [preguntaId]: [...current, opcionId] };
      } else {
        return { ...prev, [preguntaId]: current.filter(id => id !== opcionId) };
      }
    });
  };

  const renderContenidoTarea = () => {
    const contenido = tarea.contenido_tarea;
    if (!contenido) return null;

    switch (tarea.tipo_tarea) {
      case 'texto_abierto':
        return (
          <div className="space-y-4">
            {contenido.preguntaTexto && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Pregunta:</h4>
                <p className="text-blue-800">{contenido.preguntaTexto}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu respuesta
              </label>
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Escribe tu respuesta aquí..."
                required
              />
            </div>
          </div>
        );

      case 'opcion_multiple':
        return (
          <div className="space-y-6">
            {(contenido.preguntas || []).map((pregunta, index) => (
              <div key={pregunta.id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Pregunta {index + 1}: {pregunta.pregunta}
                </h4>
                <div className="space-y-2">
                  {pregunta.opciones.map((opcion) => (
                    <label key={opcion.id} className="flex items-center space-x-2">
                      <input
                        type={pregunta.seleccionMultiple ? 'checkbox' : 'radio'}
                        name={pregunta.id}
                        value={opcion.id}
                        onChange={(e) => handleOpcionChange(pregunta.id, opcion.id, e.target.checked)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">{opcion.texto}</span>
                    </label>
                  ))}
                </div>
                {pregunta.requerida && (
                  <p className="text-sm text-red-600 mt-2">* Esta pregunta es obligatoria</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'tarea_dibujo':
        return (
          <div className="space-y-4">
            {contenido.instruccionesDibujo && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Instrucciones:</h4>
                <p className="text-yellow-800">{contenido.instruccionesDibujo}</p>
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => setMostrarDibujo(true)}
                className="w-full py-6 px-6 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100"
              >
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-3xl">🎨</span>
                  <span className="font-medium">Haz clic aquí para dibujar</span>
                  <span className="text-sm">Utiliza la herramienta de dibujo para crear tu respuesta</span>
                </div>
              </button>
              {dibujo ? (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tu dibujo:</h4>
                  <img src={dibujo} alt="Dibujo del paciente" className="max-w-full h-auto border border-gray-300 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setMostrarDibujo(true)}
                    className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Editar dibujo
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">⚠️ Importante:</span> Debes hacer un dibujo para completar esta tarea.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu respuesta
            </label>
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Escribe tu respuesta aquí..."
            />
          </div>
        );
    }
  };

  if (mostrarDibujo) {
    return (
      <HerramientaDibujo
        onSave={(imageData) => {
          setDibujo(imageData);
          setMostrarDibujo(false);
        }}
        onCancel={() => setMostrarDibujo(false)}
        loading={loading}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header de la tarea */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{getTipoTareaIcon(tarea.tipo_tarea)}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tarea.titulo}</h2>
            <p className="text-sm text-gray-600">
              Tipo: {getTipoTareaLabel(tarea.tipo_tarea)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Descripción:</h3>
          <p className="text-gray-700">{tarea.descripcion}</p>
        </div>

        {tarea.instrucciones && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Instrucciones:</h3>
            <p className="text-blue-800">{tarea.instrucciones}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Prioridad:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              tarea.prioridad === 'urgente' ? 'bg-red-100 text-red-800' :
              tarea.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
              tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {tarea.prioridad}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Puntos:</span>
            <span className="ml-2 text-gray-600">{tarea.puntos_asignados}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Asignada:</span>
            <span className="ml-2 text-gray-600">
              {new Date(tarea.fecha_asignacion).toLocaleDateString('es-CL')}
            </span>
          </div>
          {tarea.fecha_vencimiento && (
            <div>
              <span className="font-medium text-gray-700">Vence:</span>
              <span className="ml-2 text-gray-600">
                {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-CL')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de respuesta */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tu Respuesta</h3>
          {renderContenidoTarea()}
        </div>

        {/* Información adicional */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Importante:</p>
              <ul className="mt-1 space-y-1">
                <li>• Una vez enviada la respuesta, no podrás modificarla</li>
                <li>• Asegúrate de revisar tu respuesta antes de enviarla</li>
                <li>• Si tienes dudas, contacta a tu psicólogo</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || (tarea.tipo_tarea === 'tarea_dibujo' && !dibujo)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 
             tarea.tipo_tarea === 'tarea_dibujo' && !dibujo ? 'Haz un dibujo primero' : 'Enviar Respuesta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResponderTarea;

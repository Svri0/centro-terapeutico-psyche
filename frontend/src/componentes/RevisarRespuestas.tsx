import React, { useState, useEffect } from 'react';
import { tareasService } from '../servicios/tareas.service';
import { RespuestaTarea, EvaluarRespuestaData } from '../types/tareas';
import Notificacion from './Notificacion';

interface RevisarRespuestasProps {
  tareaId: string;
  onClose: () => void;
}

const RevisarRespuestas: React.FC<RevisarRespuestasProps> = ({ tareaId, onClose }) => {
  const [respuestas, setRespuestas] = useState<RespuestaTarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluacion, setEvaluacion] = useState<{ [key: string]: string }>({});
  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });

  useEffect(() => {
    cargarRespuestas();
  }, [tareaId]);

  const cargarRespuestas = async () => {
    try {
      setLoading(true);
      setError(null);
      const respuestasData = await tareasService.obtenerRespuestas(tareaId);
      setRespuestas(respuestasData);
    } catch (err: any) {
      console.error('Error al cargar respuestas:', err);
      setError(err.message || 'Error al cargar las respuestas');
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

  const handleEvaluarRespuesta = async (respuestaId: string) => {
    const evaluacionTexto = evaluacion[respuestaId];
    if (!evaluacionTexto?.trim()) {
      mostrarNotificacion('Por favor ingresa una evaluación', 'error');
      return;
    }

    try {
      const data: EvaluarRespuestaData = {
        evaluacion_psicologo: {
          comentario: evaluacionTexto,
          fecha_evaluacion: new Date().toISOString(),
          calificacion: 'satisfactoria' // Por defecto, se puede expandir
        }
      };

      await tareasService.evaluarRespuesta(respuestaId, data);
      mostrarNotificacion('Respuesta evaluada exitosamente', 'exito');
      
      // Limpiar la evaluación del estado
      setEvaluacion(prev => {
        const nuevo = { ...prev };
        delete nuevo[respuestaId];
        return nuevo;
      });
      
      // Recargar respuestas para ver la evaluación actualizada
      await cargarRespuestas();
    } catch (err: any) {
      mostrarNotificacion(err.message || 'Error al evaluar la respuesta', 'error');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando respuestas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Respuestas de Pacientes</h2>
          <p className="text-gray-600 mt-1">Revisa y evalúa las respuestas de tus pacientes</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ✕ Cerrar
        </button>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-500">⚠️</div>
            <p className="ml-2 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de respuestas */}
      <div className="space-y-4">
        {respuestas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay respuestas
            </h3>
            <p className="text-gray-600">
              Los pacientes aún no han enviado respuestas para esta tarea
            </p>
          </div>
        ) : (
          respuestas.map((respuesta) => (
            <div key={respuesta.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Información del paciente */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {respuesta.paciente?.usuario?.nombres} {respuesta.paciente?.usuario?.apellidos}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enviado el {formatearFecha(respuesta.fecha_envio)}
                    </p>
                  </div>
                </div>

                {/* Contenido de la respuesta */}
                {respuesta.contenido_respuesta && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Respuesta:</h4>
                    <p className="text-blue-800 whitespace-pre-wrap">
                      {respuesta.contenido_respuesta}
                    </p>
                  </div>
                )}

                {/* Archivo de respuesta (dibujo/imagen) */}
                {respuesta.archivo_respuesta && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Archivo adjunto:</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700">🎨</span>
                      <span className="text-green-800">Dibujo o imagen enviada</span>
                      <button
                        onClick={() => {
                          // Abrir la imagen en una nueva ventana
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>Respuesta del Paciente</title></head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
                                  <img src="${respuesta.archivo_respuesta}" style="max-width:90%;max-height:90%;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
                                </body>
                              </html>
                            `);
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  </div>
                )}

                {/* Evaluación existente */}
                {respuesta.evaluacion_psicologo && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Tu evaluación:</h4>
                    <p className="text-yellow-800">
                      {typeof respuesta.evaluacion_psicologo === 'string' 
                        ? respuesta.evaluacion_psicologo 
                        : respuesta.evaluacion_psicologo.comentario || 'Evaluación guardada'
                      }
                    </p>
                    {typeof respuesta.evaluacion_psicologo === 'object' && respuesta.evaluacion_psicologo.fecha_evaluacion && (
                      <p className="text-yellow-700 text-sm mt-1">
                        Evaluado el {formatearFecha(respuesta.evaluacion_psicologo.fecha_evaluacion)}
                      </p>
                    )}
                  </div>
                )}

                {/* Formulario de evaluación */}
                {!respuesta.evaluacion_psicologo && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Evaluar respuesta:</h4>
                    <div className="space-y-3">
                      <textarea
                        value={evaluacion[respuesta.id] || ''}
                        onChange={(e) => setEvaluacion(prev => ({
                          ...prev,
                          [respuesta.id]: e.target.value
                        }))}
                        placeholder="Escribe tu evaluación, comentarios o retroalimentación..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleEvaluarRespuesta(respuesta.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Enviar Evaluación
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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

export default RevisarRespuestas;

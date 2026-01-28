import React, { useState, useEffect } from 'react';
import { politicasService, Politica } from '../servicios/politicas.service';

interface ModalPoliticasProps {
  isOpen: boolean;
  onAceptar: () => void;
  onAceptarLoading?: boolean;
  modoPublico?: boolean; // Si es true, permite cerrar el modal sin aceptar
  onCerrar?: () => void; // Función para cerrar el modal en modo público
}

const ModalPoliticas: React.FC<ModalPoliticasProps> = ({ 
  isOpen, 
  onAceptar,
  onAceptarLoading = false,
  modoPublico = false,
  onCerrar
}) => {
  const [politicaSeguridadLeida, setPoliticaSeguridadLeida] = useState(false);
  const [politicaPrivacidadLeida, setPoliticaPrivacidadLeida] = useState(false);
  const [activeTab, setActiveTab] = useState<'seguridad' | 'privacidad'>('seguridad');
  const [politicaSeguridad, setPoliticaSeguridad] = useState<Politica | null>(null);
  const [politicaPrivacidad, setPoliticaPrivacidad] = useState<Politica | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar políticas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarPoliticas();
    }
  }, [isOpen]);

  const cargarPoliticas = async () => {
    setCargando(true);
    setError(null);
    try {
      const [seguridad, privacidad] = await Promise.all([
        politicasService.obtenerPoliticaPorTipo('seguridad'),
        politicasService.obtenerPoliticaPorTipo('privacidad'),
      ]);
      
      // Si alguna política no existe, mostrar mensaje específico
      if (!seguridad && !privacidad) {
        setError('Las políticas aún no están disponibles. Por favor, contacta al administrador.');
      } else if (!seguridad) {
        setError('La política de seguridad no está disponible.');
      } else if (!privacidad) {
        setError('La política de privacidad no está disponible.');
      } else {
        setPoliticaSeguridad(seguridad);
        setPoliticaPrivacidad(privacidad);
      }
    } catch (err: any) {
      console.error('Error al cargar políticas:', err);
      const mensajeError = err?.response?.data?.mensaje || err?.message || 'Error desconocido';
      console.error('Detalles del error:', {
        status: err?.response?.status,
        mensaje: mensajeError,
        codigo: err?.response?.data?.codigo,
      });
      
      // Mensaje más específico según el tipo de error
      if (err?.response?.status === 404) {
        setError('Las políticas no se encontraron en la base de datos. Por favor, ejecuta la migración de base de datos.');
      } else if (err?.response?.status === 500) {
        setError(`Error del servidor: ${mensajeError}. Verifica que la tabla de políticas exista en la base de datos.`);
      } else if (!err?.response) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError(`No se pudieron cargar las políticas: ${mensajeError}`);
      }
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  // En modo público, se puede aceptar sin leer todo (opcional)
  // En modo autenticado, se requiere leer ambas políticas
  const puedeAceptar = modoPublico ? true : (politicaSeguridadLeida && politicaPrivacidadLeida);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop - se puede cerrar solo en modo público */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={modoPublico && onCerrar ? onCerrar : undefined}
      />
      
      {/* Contenido del modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out">
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Políticas de Seguridad y Privacidad
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {modoPublico 
                  ? 'Revisa nuestras políticas de seguridad y privacidad'
                  : 'Por favor, lee y acepta nuestras políticas para continuar'
                }
              </p>
            </div>
            {modoPublico && onCerrar && (
              <button
                onClick={onCerrar}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('seguridad')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'seguridad'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Política de Seguridad
            </button>
            <button
              onClick={() => setActiveTab('privacidad')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'privacidad'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Política de Privacidad
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-6">
            {cargando && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Cargando políticas...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={cargarPoliticas}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!cargando && !error && activeTab === 'seguridad' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {politicaSeguridad?.titulo || 'Política de Seguridad de Datos'}
                </h3>
                
                {politicaSeguridad?.contenido?.secciones ? (
                  <div className="prose max-w-none text-gray-700 space-y-4">
                    {politicaSeguridad.contenido.secciones.map((seccion, index) => (
                      <section key={index}>
                        <h4 className="font-semibold text-gray-900 mb-2">{seccion.titulo}</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{seccion.contenido}</p>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No se pudo cargar el contenido de la política de seguridad.
                  </div>
                )}

                {!modoPublico && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={politicaSeguridadLeida}
                        onChange={(e) => setPoliticaSeguridadLeida(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        He leído y comprendo la Política de Seguridad de Datos
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {!cargando && !error && activeTab === 'privacidad' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {politicaPrivacidad?.titulo || 'Política de Privacidad'}
                </h3>
                
                {politicaPrivacidad?.contenido?.secciones ? (
                  <div className="prose max-w-none text-gray-700 space-y-4">
                    {politicaPrivacidad.contenido.secciones.map((seccion, index) => (
                      <section key={index}>
                        <h4 className="font-semibold text-gray-900 mb-2">{seccion.titulo}</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{seccion.contenido}</p>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No se pudo cargar el contenido de la política de privacidad.
                  </div>
                )}

                {!modoPublico && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={politicaPrivacidadLeida}
                        onChange={(e) => setPoliticaPrivacidadLeida(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        He leído y comprendo la Política de Privacidad
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer con botón de aceptar */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {!modoPublico && !puedeAceptar && (
                  <span className="text-amber-600 font-medium">
                    Por favor, lee y acepta ambas políticas para continuar
                  </span>
                )}
                {modoPublico && (
                  <span className="text-gray-600">
                    Puedes leer nuestras políticas completas o aceptar directamente
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {modoPublico && onCerrar && (
                  <button
                    onClick={onCerrar}
                    className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                )}
                <button
                  onClick={onAceptar}
                  disabled={(!modoPublico && !puedeAceptar) || onAceptarLoading}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                    (modoPublico || puedeAceptar) && !onAceptarLoading
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {onAceptarLoading ? 'Procesando...' : 'Aceptar Políticas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPoliticas;


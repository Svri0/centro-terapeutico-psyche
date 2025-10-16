import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PaginaErrorProps {
  tipo: 'sistema-caido' | '404' | 'error-generico' | 'sin-conexion' | 'sin-permisos';
  mensaje?: string;
  detalles?: string;
  codigoError?: string;
  mostrarEstadoSistema?: boolean;
}

const PaginaError: React.FC<PaginaErrorProps> = ({ 
  tipo, 
  mensaje, 
  detalles, 
  codigoError,
  mostrarEstadoSistema = false
}) => {
  const navigate = useNavigate();

  const getErrorConfig = () => {
    switch (tipo) {
      case 'sistema-caido':
        return {
          titulo: 'Sistema Temporalmente No Disponible',
          icono: '⚠️',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          mensaje: mensaje || 'El sistema está experimentando problemas técnicos y no está disponible en este momento.',
          detalles: detalles || 'Nuestro equipo técnico está trabajando para resolver el problema lo antes posible.',
          acciones: [
            { texto: 'Reintentar', accion: () => window.location.reload() },
            { texto: 'Volver al Inicio', accion: () => navigate('/') }
          ]
        };
      
      case '404':
        return {
          titulo: 'Página No Encontrada',
          icono: '🔍',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          mensaje: mensaje || 'La página que estás buscando no existe o ha sido movida.',
          detalles: detalles || 'Verifica la URL o utiliza el menú de navegación para encontrar lo que necesitas.',
          acciones: [
            { texto: 'Volver al Inicio', accion: () => navigate('/') },
            { texto: 'Página Anterior', accion: () => navigate(-1) }
          ]
        };
      
      case 'sin-conexion':
        return {
          titulo: 'Sin Conexión al Servidor',
          icono: '🌐',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          mensaje: mensaje || 'No se puede conectar con el servidor. Verifica tu conexión a internet.',
          detalles: detalles || 'El problema puede ser temporal. Intenta nuevamente en unos momentos.',
          acciones: [
            { texto: 'Reintentar', accion: () => window.location.reload() },
            { texto: 'Verificar Conexión', accion: () => window.open('https://www.google.com', '_blank') }
          ]
        };
      
      case 'sin-permisos':
        return {
          titulo: 'Acceso Denegado',
          icono: '🚫',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          mensaje: mensaje || 'No tienes permisos para acceder a esta sección del sistema.',
          detalles: detalles || 'Tu rol actual no te permite ver esta página. Si crees que esto es un error, contacta al administrador del sistema.',
          acciones: [
            { texto: 'Volver al Inicio', accion: () => navigate('/') },
            { texto: 'Página Anterior', accion: () => navigate(-1) }
          ]
        };
      
      case 'error-generico':
      default:
        return {
          titulo: 'Error del Sistema',
          icono: '❌',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          mensaje: mensaje || 'Ha ocurrido un error inesperado en el sistema.',
          detalles: detalles || 'Por favor, intenta nuevamente o contacta al soporte técnico si el problema persiste.',
          acciones: [
            { texto: 'Reintentar', accion: () => window.location.reload() },
            { texto: 'Volver al Inicio', accion: () => navigate('/') }
          ]
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img src="/psyche.svg" alt="Psyche" className="h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-light text-gray-800 tracking-widest uppercase">
                  Centro Terapéutico Psyche
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-8 text-center`}>
            {/* Icono */}
            <div className="text-6xl mb-6">
              {config.icono}
            </div>

            {/* Título */}
            <h1 className={`text-3xl font-bold ${config.color} mb-4`}>
              {config.titulo}
            </h1>

            {/* Mensaje principal */}
            <p className="text-lg text-gray-700 mb-4">
              {config.mensaje}
            </p>

            {/* Detalles */}
            <p className="text-sm text-gray-600 mb-8">
              {config.detalles}
            </p>

            {/* Código de error si existe */}
            {codigoError && (
              <div className="bg-gray-100 border border-gray-300 rounded-md p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Código de Error:</p>
                <code className="text-sm font-mono text-gray-700">{codigoError}</code>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {config.acciones.map((accion, index) => (
                <button
                  key={index}
                  onClick={accion.accion}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    index === 0
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                  }`}
                >
                  {accion.texto}
                </button>
              ))}
            </div>

            {/* Información de contacto */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                ¿Necesitas ayuda inmediata?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a 
                  href="mailto:dentrodepsyche@gmail.com" 
                  className="text-amber-600 hover:text-amber-800 transition-colors"
                >
                  📧 dentrodepsyche@gmail.com
                </a>
                <a 
                  href="tel:+56912345678" 
                  className="text-amber-600 hover:text-amber-800 transition-colors"
                >
                  📞 +56 9 1234 5678
                </a>
                <span className="text-gray-500">
                  🕒 Lunes a Viernes 9:00 - 18:00
                </span>
              </div>
            </div>

            {/* Estado del Sistema */}
            {mostrarEstadoSistema && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-green-600 text-lg mr-2">✅</span>
                    <h3 className="text-sm font-medium text-green-800">Estado del Sistema</h3>
                  </div>
                  <div className="text-sm text-green-700 text-center">
                    <p className="mb-1">🟢 Servidor: Funcionando correctamente</p>
                    <p className="mb-1">🟢 Base de Datos: Conectada</p>
                    <p className="mb-1">🟢 API: Operativa</p>
                    <p className="text-xs text-green-600 mt-2">
                      El problema es específico de permisos, no del sistema
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Centro Terapéutico Psyche - Sistema de Gestión v1.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Si este problema persiste, por favor contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaginaError;

import React, { useEffect } from 'react';

export interface NotificacionProps {
  id?: string;
  titulo: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
  visible: boolean;
  duracion?: number; // en milisegundos, 0 = no auto-cerrar
  onCerrar: () => void;
}

const Notificacion: React.FC<NotificacionProps> = ({
  titulo,
  mensaje,
  tipo,
  visible,
  duracion = 4000,
  onCerrar
}) => {
  useEffect(() => {
    if (visible && duracion > 0) {
      const timer = setTimeout(() => {
        onCerrar();
      }, duracion);

      return () => clearTimeout(timer);
    }
  }, [visible, duracion, onCerrar]);

  if (!visible) return null;

  const getIconos = () => {
    switch (tipo) {
      case 'exito':
        return '✅';
      case 'error':
        return '❌';
      case 'advertencia':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getEstilos = () => {
    switch (tipo) {
      case 'exito':
        return {
          container: 'bg-green-50 border-green-200 shadow-green-100',
          titulo: 'text-green-900',
          mensaje: 'text-green-800',
          icono: 'text-green-600'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 shadow-red-100',
          titulo: 'text-red-900',
          mensaje: 'text-red-800',
          icono: 'text-red-600'
        };
      case 'advertencia':
        return {
          container: 'bg-yellow-50 border-yellow-200 shadow-yellow-100',
          titulo: 'text-yellow-900',
          mensaje: 'text-yellow-800',
          icono: 'text-yellow-600'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 shadow-blue-100',
          titulo: 'text-blue-900',
          mensaje: 'text-blue-800',
          icono: 'text-blue-600'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 shadow-gray-100',
          titulo: 'text-gray-900',
          mensaje: 'text-gray-800',
          icono: 'text-gray-600'
        };
    }
  };

  const estilos = getEstilos();

  return (
    <div className="max-w-sm w-full mb-2">
      <div className={`
        ${estilos.container}
        border-2 rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
      `}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 text-xl ${estilos.icono}`}>
            {getIconos()}
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-semibold ${estilos.titulo}`}>
              {titulo}
            </h3>
            <p className={`text-sm mt-1 ${estilos.mensaje}`}>
              {mensaje}
            </p>
          </div>
          
          <button
            onClick={onCerrar}
            className={`
              ml-2 flex-shrink-0 p-1 rounded-full
              hover:bg-black hover:bg-opacity-10
              transition-colors duration-200
              ${estilos.titulo}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notificacion;
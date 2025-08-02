import React, { useEffect } from 'react';

interface NotificacionProps {
  mensaje: string;
  tipo: 'exito' | 'error' | 'advertencia' | 'info';
  visible: boolean;
  onCerrar: () => void;
}

const Notificacion: React.FC<NotificacionProps> = ({ mensaje, tipo, visible, onCerrar }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onCerrar();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onCerrar]);

  if (!visible) return null;

  const getTipoEstilos = () => {
    switch (tipo) {
      case 'exito':
        return 'bg-green-500 border-green-600 text-white';
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      case 'advertencia':
        return 'bg-yellow-500 border-yellow-600 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getIcono = () => {
    switch (tipo) {
      case 'exito':
        return '✓';
      case 'error':
        return '✕';
      case 'advertencia':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${getTipoEstilos()} max-w-sm`}>
        <div className="flex-shrink-0 mr-3">
          <span className="text-lg font-bold">{getIcono()}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{mensaje}</p>
        </div>
        <button
          onClick={onCerrar}
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
};

export default Notificacion; 
import React, { useEffect, useState } from 'react';

interface NotificacionProps {
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duracion?: number;
}

const Notificacion: React.FC<NotificacionProps> = ({
  mensaje,
  tipo,
  isVisible,
  onClose,
  duracion = 3000 // Cambiado a 3 segundos
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsAnimating(false);
          onClose();
        }, 500); // Tiempo para la animación de salida
      }, duracion);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duracion, onClose]);

  const getIcono = () => {
    switch (tipo) {
      case 'exito':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getEstilos = () => {
    switch (tipo) {
      case 'exito':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          progress: 'bg-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          progress: 'bg-red-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          progress: 'bg-blue-600'
        };
    }
  };

  const estilos = getEstilos();

  if (!isVisible && !isAnimating) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${estilos.bg} border rounded-lg shadow-lg p-4 max-w-sm w-full
          transform transition-all duration-500 ease-out
          ${isAnimating && !isExiting 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
          }
        `}
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${estilos.icon}`}>
            {getIcono()}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${estilos.text}`}>
              {mensaje}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsExiting(true);
                setTimeout(() => {
                  setIsAnimating(false);
                  onClose();
                }, 500);
              }}
              className={`inline-flex ${estilos.text} hover:${estilos.text.replace('800', '900')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${tipo === 'exito' ? 'green' : tipo === 'error' ? 'red' : 'blue'}-500`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Barra de progreso mejorada */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            className={`h-1 rounded-full ${estilos.progress} transition-all duration-300 ease-linear`}
            style={{
              width: isAnimating && !isExiting ? '100%' : '0%',
              transition: `width ${duracion}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notificacion; 
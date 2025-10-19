import { useEffect } from 'react';

interface ErrorHandlerHookProps {
  onError?: (error: Error) => void;
}

export const useErrorHandler = ({ onError }: ErrorHandlerHookProps = {}) => {
  useEffect(() => {
    // Manejar errores no capturados de JavaScript
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error('🚨 Error no capturado:', event.error);
      
      // Redirigir a página de error del sistema si no estamos ya en una página de error
      if (!window.location.pathname.includes('/error')) {
        window.location.href = '/error/sistema-caido';
      }
      
      if (onError) {
        onError(event.error);
      }
    };

    // Manejar promesas rechazadas no capturadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Promesa rechazada no capturada:', event.reason);
      
      // Solo redirigir si es un error de conexión o del servidor
      if (event.reason?.code === 'ECONNREFUSED' || 
          event.reason?.message?.includes('Network Error') ||
          event.reason?.response?.status >= 500) {
        if (!window.location.pathname.includes('/error')) {
          window.location.href = '/error/sistema-caido';
        }
      }
      
      if (onError) {
        onError(event.reason);
      }
    };

    // Agregar listeners
    window.addEventListener('error', handleUncaughtError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleUncaughtError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);
};

export default useErrorHandler;

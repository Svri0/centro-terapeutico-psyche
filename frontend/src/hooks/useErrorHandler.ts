import { useEffect } from 'react';

interface ErrorHandlerHookProps {
  onError?: (error: Error) => void;
}

export const useErrorHandler = ({ onError }: ErrorHandlerHookProps = {}) => {
  useEffect(() => {
    // Manejar errores no capturados de JavaScript
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error('🚨 Error no capturado:', event.error);
      
      // NO redirigir automáticamente desde la página de inicio
      // Solo redirigir si estamos en rutas protegidas
      if (!window.location.pathname.includes('/error') && 
          window.location.pathname !== '/' &&
          (window.location.pathname.startsWith('/dashboard') ||
           window.location.pathname.startsWith('/admin') ||
           window.location.pathname.startsWith('/psicologo') ||
           window.location.pathname.startsWith('/paciente'))) {
        window.location.href = '/error/sistema-caido';
      }
      
      if (onError) {
        onError(event.error);
      }
    };

    // Manejar promesas rechazadas no capturadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Promesa rechazada no capturada:', event.reason);
      
      // NO redirigir automáticamente desde la página de inicio
      // Solo redirigir si es un error de conexión o del servidor Y estamos en rutas protegidas
      if (event.reason?.code === 'ECONNREFUSED' || 
          event.reason?.message?.includes('Network Error') ||
          event.reason?.response?.status >= 500) {
        if (!window.location.pathname.includes('/error') && 
            window.location.pathname !== '/' &&
            (window.location.pathname.startsWith('/dashboard') ||
             window.location.pathname.startsWith('/admin') ||
             window.location.pathname.startsWith('/psicologo') ||
             window.location.pathname.startsWith('/paciente'))) {
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

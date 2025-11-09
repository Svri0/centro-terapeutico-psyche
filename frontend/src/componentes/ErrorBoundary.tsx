import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error capturado por ErrorBoundary:', error);
    console.error('🚨 Stack:', error.stack);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
    console.error('🚨 Error Info completo:', errorInfo);
    
    // Guardar error en localStorage para persistencia
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    try {
      localStorage.setItem('lastError', JSON.stringify(errorData));
      console.log('✅ Error guardado en localStorage como "lastError"');
    } catch (e) {
      console.warn('⚠️ No se pudo guardar error en localStorage:', e);
    }
    
    // NO redirigir - mostrar error en la página
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      
      // Intentar leer error guardado
      let savedError = null;
      try {
        const savedErrorStr = localStorage.getItem('lastError');
        if (savedErrorStr) {
          savedError = JSON.parse(savedErrorStr);
        }
      } catch (e) {
        console.warn('No se pudo leer error guardado');
      }
      
      const displayError = savedError || {
        message: error?.message || 'Error desconocido',
        stack: error?.stack || 'No hay stack trace disponible',
        componentStack: 'No disponible',
        timestamp: new Date().toISOString()
      };
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Error del Sistema
              </h1>
              <p className="text-gray-600 mb-4">
                Ha ocurrido un error inesperado. Revisa los detalles abajo.
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-red-800 mb-2">Mensaje de Error:</h2>
              <p className="text-red-700 font-mono text-sm break-all">{displayError.message}</p>
            </div>
            
            <details className="mb-4">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2 hover:text-gray-900">
                🔍 Ver Stack Trace (click para expandir)
              </summary>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 font-mono">
                {displayError.stack || 'No disponible'}
              </pre>
            </details>
            
            <details className="mb-4">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2 hover:text-gray-900">
                🔍 Ver Component Stack (click para expandir)
              </summary>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 font-mono">
                {displayError.componentStack || 'No disponible'}
              </pre>
            </details>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Información del Error:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Timestamp:</strong> {displayError.timestamp}</li>
                <li><strong>URL:</strong> {displayError.url || window.location.href}</li>
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  localStorage.removeItem('lastError');
                  window.location.reload();
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Recargar Página
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(displayError, null, 2));
                  alert('Error copiado al portapapeles');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                📋 Copiar Error
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('lastError');
                  window.location.href = '/login';
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                🚪 Ir al Login
              </button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Este error ha sido guardado en localStorage como "lastError"</p>
              <p>Puedes revisarlo en la consola del navegador (F12) → Application → Local Storage</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

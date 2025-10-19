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
    console.error('🚨 Error capturado por ErrorBoundary:', error, errorInfo);
    
    // Redirigir a página de error del sistema
    setTimeout(() => {
      if (!window.location.pathname.includes('/error')) {
        window.location.href = '/error/sistema-caido';
      }
    }, 1000);
  }

  render() {
    if (this.state.hasError) {
      // Mostrar mensaje de error temporal mientras se redirige
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error del Sistema
            </h1>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado. Redirigiendo...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

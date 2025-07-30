import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    // Limpiar cualquier dato residual
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Si se requieren roles específicos, verificar que el usuario tenga el rol
  if (requiredRoles && user && !requiredRoles.includes(user.rol)) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Acceso Denegado</h1>
          <p className='text-gray-600 mb-4'>No tienes permisos para acceder a esta página.</p>
          <button
            onClick={() => window.history.back()}
            className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

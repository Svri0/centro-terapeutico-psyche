import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './componentes/Login';
import ProtectedRoute from './componentes/ProtectedRoute';
import Registro from './componentes/Registro';
import { AuthProvider, useAuth } from './contextos/AuthContext';
import PanelPrincipal from './paginas/PanelPrincipal';

// Wrapper para Login con callback
const LoginWrapper: React.FC = () => {
  const { login } = useAuth();
  return <Login onLoginSuccess={login} />;
};

// Wrapper para Registro con callback
const RegistroWrapper: React.FC = () => {
  const { register } = useAuth();
  return <Registro onRegistroSuccess={register} />;
};

// Componente para manejar la redirección inicial
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path='/login'
        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <LoginWrapper />}
      />
      <Route
        path='/registro'
        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <RegistroWrapper />}
      />

      {/* Rutas protegidas */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <PanelPrincipal />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route
        path='/'
        element={
          isAuthenticated ? <Navigate to='/dashboard' replace /> : <Navigate to='/login' replace />
        }
      />

      {/* Ruta para cualquier otra URL */}
      <Route
        path='*'
        element={
          isAuthenticated ? <Navigate to='/dashboard' replace /> : <Navigate to='/login' replace />
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className='App'>
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

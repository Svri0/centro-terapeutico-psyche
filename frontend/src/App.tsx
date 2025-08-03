import React from 'react';
import './App.css';
import Login from './paginas/Login';
import PanelAdmin from './paginas/PanelAdmin';
import PanelPsicologo from './paginas/PanelPsicologo';
import PanelPaciente from './paginas/PanelPaciente';
import PanelRecepcionista from './paginas/PanelRecepcionista';
import { authService } from './servicios/auth.service';

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  const isPsicologo = authService.isPsicologo();
  const isPaciente = authService.isPaciente();
  const isRecepcionista = authService.isRecepcionista();

  console.log('🔍 App.tsx - isAuthenticated:', isAuthenticated);
  console.log('🔍 App.tsx - isAdmin:', isAdmin);
  console.log('🔍 App.tsx - isPsicologo:', isPsicologo);
  console.log('🔍 App.tsx - isPaciente:', isPaciente);
  console.log('🔍 App.tsx - isRecepcionista:', isRecepcionista);
  console.log('🔍 App.tsx - User:', authService.getUser());

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Si está autenticado y es admin, mostrar panel de administrador
  if (isAdmin) {
    return <PanelAdmin />;
  }

  // Si está autenticado y es psicólogo, mostrar panel del psicólogo
  if (isPsicologo) {
    return <PanelPsicologo />;
  }

  // Si está autenticado y es recepcionista, mostrar panel del recepcionista
  if (isRecepcionista) {
    return <PanelRecepcionista />;
  }

  // Si está autenticado y es paciente, mostrar panel del paciente
  if (isPaciente) {
    return <PanelPaciente />;
  }

  // Si está autenticado pero no tiene un rol válido, mostrar mensaje de error
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Rol No Válido</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tu cuenta no tiene un rol válido asignado. Contacta al administrador.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

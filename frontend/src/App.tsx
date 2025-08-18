import React from 'react';
import './App.css';
import Login from './paginas/Login';
import PanelAdmin from './paginas/PanelAdmin';
import PanelPsicologo from './paginas/PanelPsicologo';
import PanelPaciente from './paginas/PanelPaciente';
import { authService } from './servicios/auth.service';

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  const isPsicologo = authService.isPsicologo();
  const isPaciente = authService.isPaciente();

  // Debug del usuario
  authService.debugUser();

  console.log('🔍 App.tsx - isAuthenticated:', isAuthenticated);
  console.log('🔍 App.tsx - isAdmin:', isAdmin);
  console.log('🔍 App.tsx - isPsicologo:', isPsicologo);
  console.log('🔍 App.tsx - isPaciente:', isPaciente);
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

  // Si está autenticado y es paciente, mostrar panel del paciente
  if (isPaciente) {
    return <PanelPaciente />;
  }

  // Si está autenticado pero no tiene un rol válido, limpiar y mostrar login
  console.log('⚠️ Usuario autenticado pero sin datos válidos. Limpiando...');
  localStorage.clear();
  window.location.reload();
  return <Login />;
}

export default App;

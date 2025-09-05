import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './paginas/Login';
import PanelAdmin from './paginas/PanelAdmin';
import PanelPsicologo from './paginas/PanelPsicologo';
import PanelPaciente from './paginas/PanelPaciente';
import PerfilPaciente from './componentes/PerfilPaciente';
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

  return (
    <Router>
      <Routes>
        {/* Ruta para el perfil del paciente */}
        <Route 
          path="/perfil-paciente" 
          element={
            isPaciente ? <PerfilPaciente /> : <Navigate to="/" replace />
          } 
        />
        
        {/* Ruta principal */}
        <Route 
          path="/" 
          element={
            isAdmin ? <PanelAdmin /> :
            isPsicologo ? <PanelPsicologo /> :
            isPaciente ? <PanelPaciente /> :
            <Navigate to="/login" replace />
          } 
        />
        
        {/* Ruta de login */}
        <Route 
          path="/login" 
          element={<Login />} 
        />
        
        {/* Ruta por defecto */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

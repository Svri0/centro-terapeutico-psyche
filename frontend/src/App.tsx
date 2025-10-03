import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Inicio from './paginas/Inicio';
import LoginNuevo from './paginas/LoginNuevo';
import PanelPrincipal from './paginas/PanelPrincipal';
import PanelAdmin from './paginas/PanelAdmin';
import PanelPsicologo from './paginas/PanelPsicologo';
import PanelPaciente from './paginas/PanelPaciente';
import PanelRecepcionista from './paginas/PanelRecepcionista';
import PerfilPaciente from './componentes/PerfilPaciente';
import TestImages from './paginas/TestImages';
import { authService } from './servicios/auth.service';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal - Página de inicio PÚBLICA */}
        <Route path="/" element={<Inicio />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<LoginNuevo />} />
        
        {/* Ruta de prueba para imágenes */}
        <Route path="/test-images" element={<TestImages />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard/*" element={<ProtectedRoutes />} />
        
        {/* Ruta por defecto - Página de inicio */}
        <Route path="*" element={<Inicio />} />
      </Routes>
    </Router>
  );
}

// Componente para rutas protegidas
function ProtectedRoutes() {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  const isPsicologo = authService.isPsicologo();
  const isPaciente = authService.isPaciente();
  const isRecepcionista = authService.isRecepcionista();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAdmin ? <PanelAdmin /> :
          isPsicologo ? <PanelPsicologo /> :
          isPaciente ? <PanelPaciente /> :
          isRecepcionista ? <PanelRecepcionista /> :
          <PanelPrincipal />
        } 
      />
      <Route 
        path="/perfil-paciente" 
        element={
          isPaciente ? <PerfilPaciente /> : <Navigate to="/dashboard" replace />
        } 
      />
    </Routes>
  );
}

export default App;

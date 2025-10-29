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
import Pagina404 from './paginas/Pagina404';
import PaginaSistemaCaido from './paginas/PaginaSistemaCaido';
import PaginaSinConexion from './paginas/PaginaSinConexion';
import PaginaSinPermisos from './paginas/PaginaSinPermisos';
import PanelAdminProtegido from './componentes/PanelAdminProtegido';
import PanelPsicologoProtegido from './componentes/PanelPsicologoProtegido';
import { authService } from './servicios/auth.service';
import { useErrorHandler } from './hooks/useErrorHandler';
import SessionTimeoutWrapper from './componentes/SessionTimeoutWrapper';

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

function App() {
  // Manejar errores globales
  useErrorHandler();

  return (
    <SessionTimeoutWrapper>
      <Router>
        <Routes>
          {/* Ruta principal - Página de inicio PÚBLICA */}
          <Route path="/" element={<Inicio />} />
          
          {/* Ruta de login */}
          <Route path="/login" element={<LoginNuevo />} />
          
          {/* Ruta de prueba para imágenes */}
          <Route path="/test-images" element={<TestImages />} />
          
          {/* Rutas de error */}
          <Route path="/error/404" element={<Pagina404 />} />
          <Route path="/error/sistema-caido" element={<PaginaSistemaCaido />} />
          <Route path="/error/sin-conexion" element={<PaginaSinConexion />} />
          <Route path="/error/sin-permisos" element={<PaginaSinPermisos />} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard/*" element={<ProtectedRoutes />} />
          
          {/* Rutas específicas de admin */}
          <Route path="/admin/*" element={<PanelAdminProtegido />} />
          
          {/* Rutas específicas de psicólogo */}
          <Route path="/psicologo/*" element={<PanelPsicologoProtegido />} />
          
          {/* Ruta por defecto - Página 404 */}
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </Router>
    </SessionTimeoutWrapper>
  );
}

export default App;

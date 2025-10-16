import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../servicios/auth.service';
import PaginaSinPermisos from '../paginas/PaginaSinPermisos';

interface VerificarPermisosProps {
  children: React.ReactNode;
  rolesPermitidos: string[];
  redirectTo?: string;
}

const VerificarPermisos: React.FC<VerificarPermisosProps> = ({ 
  children, 
  rolesPermitidos, 
  redirectTo 
}) => {
  const usuario = authService.getCurrentUser();
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const tienePermiso = rolesPermitidos.includes(usuario.rol);
  
  if (!tienePermiso) {
    // Si se especifica una redirección, usar esa, sino mostrar página de error
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <PaginaSinPermisos />;
  }

  return <>{children}</>;
};

export default VerificarPermisos;

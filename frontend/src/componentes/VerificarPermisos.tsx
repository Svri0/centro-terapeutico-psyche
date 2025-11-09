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
  
  // Logging para debug
  console.log('🔍 VerificarPermisos - usuario:', usuario);
  console.log('🔍 VerificarPermisos - rolesPermitidos:', rolesPermitidos);
  console.log('🔍 VerificarPermisos - usuario.rol:', usuario?.rol);
  console.log('🔍 VerificarPermisos - usuario.rol_id:', usuario?.rol_id);
  
  if (!usuario) {
    console.warn('⚠️ VerificarPermisos - No hay usuario, redirigiendo al login');
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos usando tanto rol como rol_id
  const rolNormalizado = usuario.rol?.toLowerCase()?.trim();
  const tienePermisoPorRol = rolNormalizado && rolesPermitidos.some(rol => rol.toLowerCase().trim() === rolNormalizado);
  
  // Verificación adicional por rol_id (mapping manual)
  const rolIdMap: { [key: number]: string } = {
    1: 'admin',
    2: 'psicologo',
    3: 'recepcionista',
    4: 'paciente'
  };
  const rolDesdeId = usuario.rol_id ? rolIdMap[usuario.rol_id] : null;
  const tienePermisoPorId = rolDesdeId && rolesPermitidos.some(rol => rol.toLowerCase().trim() === rolDesdeId.toLowerCase().trim());
  
  const tienePermiso = tienePermisoPorRol || tienePermisoPorId;
  
  console.log('🔍 VerificarPermisos - tienePermiso:', tienePermiso);
  console.log('🔍 VerificarPermisos - tienePermisoPorRol:', tienePermisoPorRol);
  console.log('🔍 VerificarPermisos - tienePermisoPorId:', tienePermisoPorId);
  
  if (!tienePermiso) {
    console.warn('⚠️ VerificarPermisos - Sin permisos. Usuario rol:', usuario.rol, 'Roles permitidos:', rolesPermitidos);
    // Si se especifica una redirección, usar esa, sino mostrar página de error
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <PaginaSinPermisos />;
  }

  return <>{children}</>;
};

export default VerificarPermisos;

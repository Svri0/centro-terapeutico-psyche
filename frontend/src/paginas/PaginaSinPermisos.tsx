import React from 'react';
import PaginaError from '../componentes/PaginaError';

const PaginaSinPermisos: React.FC = () => {
  return (
    <PaginaError
      tipo="sin-permisos"
      mensaje="No tienes permisos para acceder a esta sección del sistema."
      detalles="Tu rol actual no te permite ver esta página. Si crees que esto es un error, contacta al administrador del sistema."
      codigoError="PERMISSION_DENIED"
      mostrarEstadoSistema={true}
    />
  );
};

export default PaginaSinPermisos;

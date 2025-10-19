import React from 'react';
import PaginaError from '../componentes/PaginaError';

const PaginaSinConexion: React.FC = () => {
  return (
    <PaginaError
      tipo="sin-conexion"
      mensaje="No se puede conectar con el servidor. Verifica tu conexión a internet."
      detalles="El problema puede ser temporal. Intenta nuevamente en unos momentos o verifica tu conexión a internet."
    />
  );
};

export default PaginaSinConexion;

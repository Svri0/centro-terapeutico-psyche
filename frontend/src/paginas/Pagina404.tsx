import React from 'react';
import PaginaError from '../componentes/PaginaError';

const Pagina404: React.FC = () => {
  return (
    <PaginaError
      tipo="404"
      mensaje="La página que estás buscando no existe o ha sido movida."
      detalles="Verifica la URL o utiliza el menú de navegación para encontrar lo que necesitas."
    />
  );
};

export default Pagina404;

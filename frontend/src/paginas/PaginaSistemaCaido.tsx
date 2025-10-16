import React from 'react';
import PaginaError from '../componentes/PaginaError';

const PaginaSistemaCaido: React.FC = () => {
  return (
    <PaginaError
      tipo="sistema-caido"
      mensaje="El sistema está experimentando problemas técnicos y no está disponible en este momento."
      detalles="Nuestro equipo técnico está trabajando para resolver el problema lo antes posible. Por favor, intenta nuevamente en unos minutos."
      mostrarEstadoSistema={true}
    />
  );
};

export default PaginaSistemaCaido;

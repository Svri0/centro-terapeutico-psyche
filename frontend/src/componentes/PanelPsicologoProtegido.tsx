import React from 'react';
import PanelPsicologo from '../paginas/PanelPsicologo';
import VerificarPermisos from '../componentes/VerificarPermisos';

const PanelPsicologoProtegido: React.FC = () => {
  return (
    <VerificarPermisos rolesPermitidos={['psicologo']}>
      <PanelPsicologo />
    </VerificarPermisos>
  );
};

export default PanelPsicologoProtegido;

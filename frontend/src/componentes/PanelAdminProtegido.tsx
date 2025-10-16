import React from 'react';
import PanelAdmin from '../paginas/PanelAdmin';
import VerificarPermisos from '../componentes/VerificarPermisos';

const PanelAdminProtegido: React.FC = () => {
  return (
    <VerificarPermisos rolesPermitidos={['admin']}>
      <PanelAdmin />
    </VerificarPermisos>
  );
};

export default PanelAdminProtegido;

import React from 'react';
import Plantilla from '../componentes/Plantilla';

const PanelPrincipal: React.FC = () => {
  return (
    <Plantilla>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Panel Principal
          </h2>
          <p className="text-gray-600">
            Bienvenido al Sistema de Gestión del Centro Terapéutico Psyche
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Pacientes</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-gray-500">Total registrados</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Sesiones</h3>
            <p className="text-3xl font-bold text-secondary-600">0</p>
            <p className="text-sm text-gray-500">Programadas hoy</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Tareas</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Pendientes</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Reportes</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Generados este mes</p>
          </div>
        </div>
      </div>
    </Plantilla>
  );
};

export default PanelPrincipal; 
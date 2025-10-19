import React from 'react';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rut?: string;
  activo: boolean;
  fecha_creacion: string;
  avatar_url?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones?: string;
  psicologo_asignado?: string;
}

interface DetallesPacienteProps {
  paciente: Paciente;
  isOpen: boolean;
  onClose: () => void;
}

const DetallesPaciente: React.FC<DetallesPacienteProps> = ({
  paciente,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Detalles del Paciente</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Información Personal</h4>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-16 w-16">
                {paciente.avatar_url ? (
                  <img className="h-16 w-16 rounded-full" src={paciente.avatar_url} alt="" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {paciente.nombres.charAt(0)}{paciente.apellidos.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h5 className="text-xl font-semibold text-gray-900">
                  {paciente.nombres} {paciente.apellidos}
                </h5>
                <p className="text-gray-600">Paciente</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombres</label>
                <p className="text-gray-900">{paciente.nombres}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                <p className="text-gray-900">{paciente.apellidos}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">RUT</label>
                <p className="text-gray-900">{paciente.rut || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  paciente.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {paciente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Información de Contacto</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{paciente.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="text-gray-900">{paciente.telefono || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <p className="text-gray-900">{paciente.direccion || 'No especificada'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="text-gray-900">{formatearFecha(paciente.fecha_creacion)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        {paciente.contacto_emergencia_nombre && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Contacto de Emergencia</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="text-gray-900">{paciente.contacto_emergencia_nombre}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="text-gray-900">{paciente.contacto_emergencia_telefono}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Relación</label>
                <p className="text-gray-900">{paciente.contacto_emergencia_relacion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información Clínica */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Información Clínica</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Psicólogo Asignado</label>
              <p className="text-gray-900">{paciente.psicologo_asignado || 'No asignado'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">ID del Paciente</label>
              <p className="text-gray-900 font-mono text-sm">{paciente.id}</p>
            </div>
          </div>

          {paciente.observaciones && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Observaciones</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md mt-1">{paciente.observaciones}</p>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 pt-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetallesPaciente;
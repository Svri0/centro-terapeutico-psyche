import React, { useState } from 'react';
import { Paciente } from '../servicios/pacientes.service';
import { obtenerEdadFormateada } from '../utilidades/calculoEdad';
import { formatearFecha } from '../utilidades/formateo';

interface FichaClinicaProps {
  paciente: Paciente;
  onClose: () => void;
  onEdit?: () => void;
}

const FichaClinica: React.FC<FichaClinicaProps> = ({ paciente, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'datos' | 'antecedentes' | 'sesiones'>('datos');

  const renderListaItems = (items: any[], titulo: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-gray-500 italic">
          No hay {titulo.toLowerCase()} registrados
        </div>
      );
    }

    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-amber-600 mt-1">•</span>
            <span className="text-gray-700">
              {typeof item === 'string' ? item : item.nombre || item.descripcion || JSON.stringify(item)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const renderCampoMedico = (valor: any, titulo: string, tipo: 'lista' | 'texto' = 'texto') => {
    if (tipo === 'lista') {
      return (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">{titulo}</h4>
          {renderListaItems(Array.isArray(valor) ? valor : [], titulo)}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="font-medium text-gray-800 mb-2">{titulo}</h4>
        <p className="text-gray-700">
          {valor || `No hay ${titulo.toLowerCase()} registrado`}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Ficha Clínica - {paciente.nombres} {paciente.apellidos}
              </h2>
              <p className="text-gray-600">
                Número de Ficha: {paciente.numero_ficha}
              </p>
            </div>
            <div className="flex space-x-3">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium text-amber-800 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Editar
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('datos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'datos'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Datos Básicos
              </button>
              <button
                onClick={() => setActiveTab('antecedentes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'antecedentes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Antecedentes Médicos
              </button>
              <button
                onClick={() => setActiveTab('sesiones')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sesiones'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Historial de Sesiones
              </button>
            </nav>
          </div>

          {/* Contenido de las tabs */}
          {activeTab === 'datos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Nombres:</span>
                    <span className="ml-2 text-gray-900">{paciente.nombres}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Apellidos:</span>
                    <span className="ml-2 text-gray-900">{paciente.apellidos}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{paciente.email}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>
                    <span className="ml-2 text-gray-900">{paciente.telefono || 'No registrado'}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">RUT:</span>
                    <span className="ml-2 text-gray-900">{paciente.rut || 'No registrado'}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Género:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.genero ? paciente.genero.charAt(0).toUpperCase() + paciente.genero.slice(1) : 'No especificado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Médica</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Fecha de Nacimiento:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.fecha_nacimiento ? formatearFecha(paciente.fecha_nacimiento) : 'No registrada'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Edad Exacta:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.fecha_nacimiento ? obtenerEdadFormateada(paciente.fecha_nacimiento) : 'No calculable'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Contacto de Emergencia */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contacto de Emergencia</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.contacto_emergencia_nombre || 'No registrado'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.contacto_emergencia_telefono || 'No registrado'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Relación:</span>
                    <span className="ml-2 text-gray-900">
                      {paciente.contacto_emergencia_relacion || 'No especificada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dirección</h3>
                <p className="text-gray-900">
                  {paciente.direccion || 'No registrada'}
                </p>
              </div>

              {/* Observaciones Generales */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Observaciones Generales</h3>
                <p className="text-gray-900">
                  {paciente.observaciones || 'No hay observaciones registradas'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'antecedentes' && (
            <div className="space-y-6">
              {/* Antecedentes Médicos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Antecedentes Médicos</h3>
                {renderCampoMedico(paciente.antecedentes_medicos, 'Antecedentes Médicos', 'lista')}
              </div>

              {/* Medicación Actual */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Medicación Actual</h3>
                {renderCampoMedico(paciente.medicacion_actual, 'Medicación', 'lista')}
              </div>

              {/* Alergias */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alergias</h3>
                {renderCampoMedico(paciente.alergias, 'Alergias', 'lista')}
              </div>

              {/* Condiciones Crónicas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Condiciones Crónicas</h3>
                {renderCampoMedico(paciente.condiciones_cronicas, 'Condiciones Crónicas', 'lista')}
              </div>

              {/* Historial Psiquiátrico */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial Psiquiátrico</h3>
                {renderCampoMedico(paciente.historial_psiquiatrico, 'Historial Psiquiátrico', 'lista')}
              </div>

              {/* Observaciones Médicas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Observaciones Médicas</h3>
                {renderCampoMedico(paciente.observaciones_medicas, 'Observaciones Médicas', 'texto')}
              </div>
            </div>
          )}

          {activeTab === 'sesiones' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Sesiones</h3>
              <p className="text-gray-600">
                Esta funcionalidad estará disponible próximamente. Aquí se mostrará el historial completo de sesiones con bitácoras detalladas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FichaClinica;

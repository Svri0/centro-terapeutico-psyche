import React, { useState, useEffect } from 'react';
import { Paciente } from '../utilidades/tipos';
import { pacientesService } from '../servicios/pacientes.service';

interface DetallesPacienteProps {
  pacienteId: string;
  onClose: () => void;
  onEdit: () => void;
}

const DetallesPaciente: React.FC<DetallesPacienteProps> = ({ pacienteId, onClose, onEdit }) => {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPaciente();
  }, [pacienteId]);

  const cargarPaciente = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await pacientesService.obtenerPacientePorId(pacienteId);
      setPaciente(datos);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar los detalles del paciente');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const obtenerIniciales = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando detalles...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cargarPaciente}
                className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-lg transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {obtenerIniciales(paciente.nombres, paciente.apellidos)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {paciente.nombres} {paciente.apellidos}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  paciente.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {paciente.estado}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Ficha: {paciente.numero_ficha}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-lg transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Información del Paciente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Información Personal
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{paciente.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-gray-900">{paciente.telefono || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">RUT</label>
                <p className="text-gray-900">{paciente.rut || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="text-gray-900">{formatearFecha(paciente.fecha_nacimiento)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Género</label>
                <p className="text-gray-900">{paciente.genero || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-gray-900">{paciente.direccion || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Información Clínica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Información Clínica
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                <p className="text-gray-900">{formatearFecha(paciente.fecha_ingreso)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Puntos Acumulados</label>
                <p className="text-gray-900">{paciente.puntos_acumulados || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Diagnósticos</label>
                <p className="text-gray-900">
                  {paciente.diagnosticos && paciente.diagnosticos.length > 0 
                    ? paciente.diagnosticos.join(', ') 
                    : 'No especificados'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Etiquetas</label>
                <p className="text-gray-900">
                  {paciente.etiquetas && paciente.etiquetas.length > 0 
                    ? paciente.etiquetas.join(', ') 
                    : 'No especificadas'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estrategias de Autorregulación</label>
                <p className="text-gray-900">
                  {paciente.estrategias_autorregulacion && paciente.estrategias_autorregulacion.length > 0 
                    ? paciente.estrategias_autorregulacion.join(', ') 
                    : 'No especificadas'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        {(paciente.contacto_emergencia_nombre || paciente.contacto_emergencia_telefono || paciente.contacto_emergencia_relacion) && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Contacto de Emergencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{paciente.contacto_emergencia_nombre || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-gray-900">{paciente.contacto_emergencia_telefono || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Relación</label>
                <p className="text-gray-900">{paciente.contacto_emergencia_relacion || 'No especificada'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        {paciente.observaciones && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Observaciones
            </h3>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
              {paciente.observaciones}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetallesPaciente; 
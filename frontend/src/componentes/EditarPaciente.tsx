import React, { useState, useEffect } from 'react';
import { Paciente } from '../utilidades/tipos';
import { pacientesService } from '../servicios/pacientes.service';

interface EditarPacienteProps {
  pacienteId: string;
  onClose: () => void;
  onSave: () => void;
}

const EditarPaciente: React.FC<EditarPacienteProps> = ({ pacienteId, onClose, onSave }) => {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    rut: '',
    direccion: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones: '',
    estado: 'activo'
  });

  useEffect(() => {
    cargarPaciente();
  }, [pacienteId]);

  const cargarPaciente = async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await pacientesService.obtenerPacientePorId(pacienteId);
      setPaciente(datos);
      
      // Llenar formulario con datos existentes
      setFormData({
        nombres: datos.nombres || '',
        apellidos: datos.apellidos || '',
        email: datos.email || '',
        telefono: datos.telefono || '',
        fecha_nacimiento: datos.fecha_nacimiento ? datos.fecha_nacimiento.split('T')[0] : '',
        genero: datos.genero || '',
        rut: datos.rut || '',
        direccion: datos.direccion || '',
        contacto_emergencia_nombre: datos.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: datos.contacto_emergencia_telefono || '',
        contacto_emergencia_relacion: datos.contacto_emergencia_relacion || '',
        observaciones: datos.observaciones || '',
        estado: datos.estado || 'activo'
      });
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await pacientesService.actualizarPaciente(pacienteId, formData);
      
      setSuccess('Paciente actualizado exitosamente');
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el paciente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !paciente) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Paciente</h2>
            <p className="text-gray-600">Modifica la información del paciente</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="text-red-500">⚠️</div>
              <p className="ml-2 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Mensaje de éxito mostrado como toast abajo */}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Contacto de Emergencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="contacto_emergencia_nombre"
                  value={formData.contacto_emergencia_nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="contacto_emergencia_telefono"
                  value={formData.contacto_emergencia_telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relación
                </label>
                <input
                  type="text"
                  name="contacto_emergencia_relacion"
                  value={formData.contacto_emergencia_relacion}
                  onChange={handleInputChange}
                  placeholder="Ej: Padre, Madre, Hermano..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Estado y Observaciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Estado y Observaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Observaciones adicionales sobre el paciente..."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast de éxito fijo abajo con animación */}
      {success && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="pointer-events-auto bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-md px-4 py-3 flex items-center space-x-2 animate-[fadeSlideUp_0.3s_ease-out]">
            <span>✅</span>
            <span className="font-medium">{success}</span>
          </div>

          <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default EditarPaciente; 
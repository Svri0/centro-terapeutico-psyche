import React, { useState, useEffect } from 'react';

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

interface ModalEditarPacienteProps {
  paciente: Paciente | null;
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (paciente: Paciente) => void;
}

const ModalEditarPaciente: React.FC<ModalEditarPacienteProps> = ({
  paciente,
  isOpen,
  onClose,
  onGuardar
}) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    rut: '',
    direccion: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones: '',
    avatar_url: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (paciente) {
      setFormData({
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        email: paciente.email,
        telefono: paciente.telefono || '',
        rut: paciente.rut || '',
        direccion: paciente.direccion || '',
        contacto_emergencia_nombre: paciente.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: paciente.contacto_emergencia_telefono || '',
        contacto_emergencia_relacion: paciente.contacto_emergencia_relacion || '',
        observaciones: paciente.observaciones || '',
        avatar_url: paciente.avatar_url || ''
      });
    }
  }, [paciente]);

  // Función para formatear RUT automáticamente
  const formatRUT = (rut: string): string => {
    // Solo permitir números
    const soloNumeros = rut.replace(/[^0-9]/g, '');
    
    if (soloNumeros.length === 0) return '';
    
    // Si tiene más de 9 dígitos (8 + DV), tomar solo los primeros 9
    const numero = soloNumeros.slice(0, 9);
    
    // Formatear según la longitud
    if (numero.length <= 2) {
      return numero;
    } else if (numero.length <= 5) {
      return `${numero.slice(0, 2)}.${numero.slice(2)}`;
    } else if (numero.length <= 8) {
      return `${numero.slice(0, 2)}.${numero.slice(2, 5)}.${numero.slice(5)}`;
    } else {
      // 9 dígitos: formato completo XX.XXX.XXX-X
      return `${numero.slice(0, 2)}.${numero.slice(2, 5)}.${numero.slice(5, 8)}-${numero.slice(8)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatear RUT automáticamente
    if (name === 'rut') {
      const rutFormateado = formatRUT(value);
      setFormData(prev => ({
        ...prev,
        [name]: rutFormateado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    if (formData.rut && !/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(formData.rut)) {
      newErrors.rut = 'El formato del RUT no es válido';
    }

    if (formData.contacto_emergencia_telefono && !/^\+?[\d\s-()]+$/.test(formData.contacto_emergencia_telefono)) {
      newErrors.contacto_emergencia_telefono = 'El formato del teléfono no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !paciente) return;

    const pacienteActualizado: Paciente = {
      ...paciente,
      ...formData,
      telefono: formData.telefono || undefined,
      rut: formData.rut || undefined,
      direccion: formData.direccion || undefined,
      contacto_emergencia_nombre: formData.contacto_emergencia_nombre || undefined,
      contacto_emergencia_telefono: formData.contacto_emergencia_telefono || undefined,
      contacto_emergencia_relacion: formData.contacto_emergencia_relacion || undefined,
      observaciones: formData.observaciones || undefined
    };

    onGuardar(pacienteActualizado);
  };

  if (!isOpen || !paciente) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Editar Paciente</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Información del Sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-800">ID:</span>
              <p className="text-blue-700 font-mono">{paciente.id}</p>
            </div>
            <div>
              <span className="font-semibold text-blue-800">Estado:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                paciente.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {paciente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-blue-800">Psicólogo asignado:</span>
              <span className="ml-2 text-blue-700">{paciente.psicologo_asignado || 'No asignado'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa los nombres"
              />
              {errors.nombres && (
                <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apellidos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa los apellidos"
              />
              {errors.apellidos && (
                <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+56 9 1234 5678"
              />
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RUT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUT
              </label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rut ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345678K (escribe tú el dígito verificador)"
              />
              {errors.rut && (
                <p className="text-red-500 text-xs mt-1">{errors.rut}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Calle 123, Comuna, Región"
              />
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Contacto de Emergencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="contacto_emergencia_nombre"
                  value={formData.contacto_emergencia_nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contacto_emergencia_telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+56 9 1234 5678"
                />
                {errors.contacto_emergencia_telefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.contacto_emergencia_telefono}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relación
                </label>
                <select
                  name="contacto_emergencia_relacion"
                  value={formData.contacto_emergencia_relacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar relación</option>
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Hijo(a)">Hijo(a)</option>
                  <option value="Hermano(a)">Hermano(a)</option>
                  <option value="Cónyuge">Cónyuge</option>
                  <option value="Otro familiar">Otro familiar</option>
                  <option value="Amigo(a)">Amigo(a)</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Foto de Perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de Perfil
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-16 w-16">
                {formData.avatar_url ? (
                  <img className="h-16 w-16 rounded-full" src={formData.avatar_url} alt="" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {formData.nombres.charAt(0)}{formData.apellidos.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o GIF. Máximo 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones adicionales sobre el paciente..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarPaciente;














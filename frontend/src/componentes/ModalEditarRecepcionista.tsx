import React, { useState, useEffect } from 'react';

interface Recepcionista {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  activo: boolean;
  fecha_creacion: string;
  avatar_url?: string;
}

interface ModalEditarRecepcionistaProps {
  recepcionista: Recepcionista | null;
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (recepcionista: Recepcionista) => void;
}

const ModalEditarRecepcionista: React.FC<ModalEditarRecepcionistaProps> = ({
  recepcionista,
  isOpen,
  onClose,
  onGuardar
}) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    avatar_url: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (recepcionista) {
      setFormData({
        nombres: recepcionista.nombres,
        apellidos: recepcionista.apellidos,
        email: recepcionista.email,
        telefono: recepcionista.telefono || '',
        avatar_url: recepcionista.avatar_url || ''
      });
    }
  }, [recepcionista]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !recepcionista) return;

    const recepcionistaActualizado: Recepcionista = {
      ...recepcionista,
      ...formData,
      telefono: formData.telefono || undefined
    };

    onGuardar(recepcionistaActualizado);
  };

  if (!isOpen || !recepcionista) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Editar Recepcionista</h3>
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
              <p className="text-blue-700 font-mono">{recepcionista.id}</p>
            </div>
            <div>
              <span className="font-semibold text-blue-800">Estado:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                recepcionista.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {recepcionista.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-blue-800">Email verificado:</span>
              <span className="ml-2 text-blue-700">No</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

export default ModalEditarRecepcionista;














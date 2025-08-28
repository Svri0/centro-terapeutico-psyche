import React, { useState, useEffect } from 'react';
import { Psicologo, ActualizarPsicologoData } from '../servicios/admin.service';

interface ModalEditarPsicologoProps {
  psicologo: Psicologo;
  onClose: () => void;
  onSubmit: (data: ActualizarPsicologoData, avatar?: File | null) => void;
}

const ModalEditarPsicologo: React.FC<ModalEditarPsicologoProps> = ({ 
  psicologo, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<ActualizarPsicologoData>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    especialidad: '',
    descripcion: '',
    codigo_sbs: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Cargar datos del psicólogo al abrir el modal
    setFormData({
      nombres: psicologo.nombres,
      apellidos: psicologo.apellidos,
      email: psicologo.email,
      telefono: psicologo.telefono || '',
      fecha_nacimiento: psicologo.fecha_nacimiento || '',
      genero: psicologo.genero || '',
      especialidad: psicologo.especialidad || '',
      descripcion: psicologo.descripcion || '',
      codigo_sbs: psicologo.codigo_sbs || ''
    });
  }, [psicologo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres?.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }

    if (!formData.apellidos?.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.telefono && !/^\+?[\d\s\-\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido';
    }

    // Validar código SBS si se proporciona
    if (formData.codigo_sbs && !/^\d{6,8}$/.test(formData.codigo_sbs.trim())) {
      newErrors.codigo_sbs = 'El código SBS debe tener entre 6 y 8 dígitos numéricos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, selectedImage);
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Editar Psicólogo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>ID:</strong> {psicologo.id}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Estado:</strong> {psicologo.activo ? 'Activo' : 'Inactivo'}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email verificado:</strong> {psicologo.email_verificado ? 'Sí' : 'No'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.nombres ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese los nombres"
              />
              {errors.nombres && (
                <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.apellidos ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese los apellidos"
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.telefono ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+56 9 1234 5678"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Género
              </label>
              <select
                name="genero"
                value={formData.genero || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Seleccionar género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no_binario">No binario</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>

            {/* Foto de Perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Foto de Perfil
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {psicologo.avatar_url && (
                  <img
                    src={psicologo.avatar_url}
                    alt="Avatar actual"
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                value={formData.especialidad || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ej: Psicología Clínica, Terapia Cognitivo-Conductual, etc."
              />
            </div>

            {/* Código SBS */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código SBS
              </label>
              <input
                type="text"
                name="codigo_sbs"
                value={formData.codigo_sbs || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.codigo_sbs ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: 123456 o 12345678"
                maxLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Código único de identificación en el sistema de salud (6-8 dígitos)
              </p>
              {errors.codigo_sbs && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo_sbs}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción Profesional
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe tu experiencia, enfoque terapéutico, y cómo puedes ayudar a tus pacientes..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPsicologo; 
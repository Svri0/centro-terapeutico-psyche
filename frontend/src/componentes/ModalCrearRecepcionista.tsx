import React, { useState } from 'react';

interface ModalCrearRecepcionistaProps {
  isOpen: boolean;
  onClose: () => void;
  onCrear: (data: any, avatar?: File | null) => Promise<void>;
}

interface FormData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;
}

const ModalCrearRecepcionista: React.FC<ModalCrearRecepcionistaProps> = ({
  isOpen,
  onClose,
  onCrear
}) => {
  const [formData, setFormData] = useState<FormData>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Funciones de validación
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-ñáéíóúüÑÁÉÍÓÚÜ]+@[a-zA-Z0-9.-]+\.(com|cl)$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+56\s?)?[2-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) {
          return 'El email es requerido';
        } else if (!validateEmail(value)) {
          return 'Ingresa un email válido que termine en .com o .cl';
        }
        break;
      case 'telefono':
        if (!value.trim()) {
          return 'El teléfono es requerido';
        } else if (!validatePhone(value)) {
          return 'Ingresa un número de teléfono válido (ej: +56 9 1234 5678)';
        }
        break;
      case 'nombres':
        if (!value.trim()) {
          return 'Los nombres son obligatorios';
        } else if (value.trim().length < 2) {
          return 'Los nombres deben tener al menos 2 caracteres';
        }
        break;
      case 'apellidos':
        if (!value.trim()) {
          return 'Los apellidos son obligatorios';
        } else if (value.trim().length < 2) {
          return 'Los apellidos deben tener al menos 2 caracteres';
        }
        break;
      case 'password':
        if (!value.trim()) {
          return 'La contraseña es obligatoria';
        } else if (value.length < 6) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          return 'Confirma la contraseña';
        } else if (value !== formData.password) {
          return 'Las contraseñas no coinciden';
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validar todos los campos
    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onCrear({
        ...formData,
        rol_id: 4, // Recepcionista
        activo: true
      }, avatar);
      
      // Reset form
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setAvatar(null);
    } catch (error: any) {
      setError(error.message || 'Error al crear recepcionista');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar campo en tiempo real
    const error = validateField(name as keyof FormData, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md my-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Recepcionista</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.apellidos ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingresa los apellidos"
            />
            {errors.apellidos && (
              <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ejemplo@gmail.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
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
              <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Repite la contraseña"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Recepcionista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearRecepcionista;














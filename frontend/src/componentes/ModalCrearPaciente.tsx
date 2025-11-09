import React, { useState } from 'react';

interface ModalCrearPacienteProps {
  isOpen: boolean;
  onClose: () => void;
  onCrear: (data: any, avatar?: File | null) => Promise<void>;
}

const ModalCrearPaciente: React.FC<ModalCrearPacienteProps> = ({
  isOpen,
  onClose,
  onCrear
}) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rut: '',
    direccion: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Funciones de validación
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-ñáéíóúüÑÁÉÍÓÚÜ]+@[a-zA-Z0-9.-]+\.(com|cl)$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+56\s?)?[2-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

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

  const validateRUT = (rut: string): boolean => {
    if (!rut) return true; // RUT es opcional
    
    // Limpiar el RUT (quitar puntos y espacios)
    const rutLimpio = rut.replace(/[.\s]/g, '');
    
    // Verificar formato básico: números seguidos de guión y dígito verificador
    const rutRegex = /^[0-9]+-[0-9kK]$/;
    if (!rutRegex.test(rutLimpio)) {
      return false;
    }
    
    // Separar número y dígito verificador
    const [numero, dv] = rutLimpio.split('-');
    
    // Verificar que el número tenga entre 7 y 8 dígitos
    if (numero.length < 7 || numero.length > 8) {
      return false;
    }
    
    // Solo verificar que el DV sea un número o K
    return /^[0-9kK]$/.test(dv);
  };

  const validateField = (field: string, value: string): string | undefined => {
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
      case 'rut':
        if (!value.trim()) {
          return 'El RUT es requerido';
        } else if (!validateRUT(value)) {
          return 'Formato de RUT inválido (ej: 12.345.678-9)';
        }
        break;
      case 'contacto_emergencia_telefono':
        if (!value.trim()) {
          return 'El teléfono de emergencia es requerido';
        } else if (!validatePhone(value)) {
          return 'Ingresa un número de teléfono válido (ej: +56 9 1234 5678)';
        }
        break;
      case 'contacto_emergencia_nombre':
        if (!value.trim()) {
          return 'El nombre del contacto de emergencia es requerido';
        } else if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'contacto_emergencia_relacion':
        if (!value.trim()) {
          return 'La relación con el contacto de emergencia es requerida';
        } else if (value.trim().length < 2) {
          return 'La relación debe tener al menos 2 caracteres';
        }
        break;
      case 'observaciones':
        if (!value.trim()) {
          return 'Las observaciones son requeridas';
        } else if (value.trim().length < 10) {
          return 'Las observaciones deben tener al menos 10 caracteres';
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Formatear RUT automáticamente
    if (name === 'rut') {
      const rutFormateado = formatRUT(value);
      setFormData(prev => ({ ...prev, [name]: rutFormateado }));
      
      // Validar el campo en tiempo real
      const error = validateField(name, rutFormateado);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validar el campo en tiempo real
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar todos los campos usando la función validateField
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
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
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onCrear({
        ...formData,
        rol_id: 3, // Paciente
        activo: true
      }, avatar);
      
      // Reset form
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        rut: '',
        direccion: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        contacto_emergencia_relacion: '',
        observaciones: ''
      });
      setAvatar(null);
      setErrors({});
    } catch (error: any) {
      setError(error.message || 'Error al crear paciente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Paciente</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese los nombres"
                required
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
                placeholder="Ingrese los apellidos"
                required
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
                minLength={6}
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
                required
                minLength={6}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RUT *
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
              <p className="mt-1 text-sm text-red-600">{errors.rut}</p>
            )}
          </div>

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
              placeholder="Dirección completa..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto Emergencia *
              </label>
              <input
                type="text"
                name="contacto_emergencia_nombre"
                value={formData.contacto_emergencia_nombre}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contacto_emergencia_nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre completo"
              />
              {errors.contacto_emergencia_nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.contacto_emergencia_nombre}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Emergencia *
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
                <p className="mt-1 text-sm text-red-600">{errors.contacto_emergencia_telefono}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relación *
              </label>
              <input
                type="text"
                name="contacto_emergencia_relacion"
                value={formData.contacto_emergencia_relacion}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contacto_emergencia_relacion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Madre, Padre, Esposo/a..."
              />
              {errors.contacto_emergencia_relacion && (
                <p className="mt-1 text-sm text-red-600">{errors.contacto_emergencia_relacion}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones *
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.observaciones ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Observaciones adicionales..."
            />
            {errors.observaciones && (
              <p className="mt-1 text-sm text-red-600">{errors.observaciones}</p>
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
              {loading ? 'Creando...' : 'Crear Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearPaciente;












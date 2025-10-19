import React, { useState } from 'react';
import { CrearPsicologoData } from '../servicios/admin.service';
import { convertirOtroParaBackend } from '../utilidades/formateo';
import DatePickerPersonalizado from './DatePickerPersonalizado';
import AvatarSelector from './AvatarSelector';
import { getRandomAvatar } from '../assets/avatars/default-avatars';
import '../styles/datepicker-custom.css';

interface ModalCrearPsicologoProps {
  onClose: () => void;
  onSubmit: (data: CrearPsicologoData, avatar?: File | null) => void;
}

const ModalCrearPsicologo: React.FC<ModalCrearPsicologoProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CrearPsicologoData>({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    especialidad: '',
    descripcion: '',
    codigo_sbs: ''
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(getRandomAvatar().id);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(getRandomAvatar().url);
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
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
      case 'codigo_sbs':
        if (!value.trim()) {
          return 'El código SBS es obligatorio';
        } else if (!/^\d{6,8}$/.test(value.trim())) {
          return 'El código SBS debe tener entre 6 y 8 dígitos numéricos';
        }
        break;
      case 'rut':
        if (value && !validateRUT(value)) {
          return 'Formato de RUT inválido (ej: 12.345.678-9)';
        }
        break;
      case 'genero':
        if (!value) {
          return 'Selecciona un género';
        }
        break;
      case 'especialidad':
        if (!value.trim()) {
          return 'La especialidad es obligatoria';
        } else if (value.trim().length < 3) {
          return 'La especialidad debe tener al menos 3 caracteres';
        }
        break;
      case 'descripcion':
        if (!value.trim()) {
          return 'La descripción profesional es obligatoria';
        } else if (value.trim().length < 10) {
          return 'La descripción debe tener al menos 10 caracteres';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Formatear RUT automáticamente
    if (name === 'rut') {
      const rutFormateado = formatRUT(value);
      setFormData(prev => ({
        ...prev,
        [name]: rutFormateado
      }));
      
      // Validar el campo en tiempo real
      const error = validateField(name, rutFormateado);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validar el campo en tiempo real
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };

  const handleFechaChange = (date: Date | null) => {
    setFechaNacimiento(date);
    if (date) {
      const fechaFormateada = date.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha_nacimiento: fechaFormateada
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fecha_nacimiento: ''
      }));
    }
    
    // Limpiar error de fecha
    if (errors.fecha_nacimiento) {
      setErrors(prev => ({
        ...prev,
        fecha_nacimiento: ''
      }));
    }
  };

  const handleAvatarSelect = (avatarId: string, avatarUrl: string) => {
    setSelectedAvatarId(avatarId);
    setSelectedAvatarUrl(avatarUrl);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar todos los campos usando la función validateField
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof CrearPsicologoData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validar fecha de nacimiento
    if (!fechaNacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const today = new Date();
      const minAge = 21;
      const maxAge = 80;
      const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
      
      if (fechaNacimiento > maxDate) {
        newErrors.fecha_nacimiento = `La edad mínima para ejercer como psicólogo es ${minAge} años`;
      } else if (fechaNacimiento < minDate) {
        newErrors.fecha_nacimiento = `La edad máxima permitida es ${maxAge} años`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convertir el género para el backend
      const dataParaBackend = {
        ...formData,
        genero: convertirOtroParaBackend(formData.genero),
        avatar_url: selectedAvatarUrl
      };
      
      // Pasar tanto los datos como la imagen seleccionada
      await onSubmit(dataParaBackend, null);
      onClose();
    } catch (error) {
      console.error('Error al crear psicólogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 animate-fade-in">
      <div className="relative top-20 mx-auto p-5 border w-4xl max-w-4xl shadow-lg rounded-md bg-white animate-bounce-in shadow-glow">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 animate-fade-in">
              Crear Nuevo Psicólogo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover-bounce transition-transform duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primera fila: Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.nombres ? 'border-red-500' : 'border-gray-300'
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
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.apellidos ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese los apellidos"
                />
                {errors.apellidos && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                )}
              </div>
            </div>

            {/* Segunda fila: Email y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ejemplo@gmail.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+56 9 1234 5678"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>
            </div>

            {/* Contraseña (ancho completo) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña Temporal *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-l-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Contraseña temporal"
                />
                <button
                  type="button"
                  onClick={generarPassword}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                >
                  Generar
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Tercera fila: Fecha de Nacimiento y Género */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento *
                </label>
                <DatePickerPersonalizado
                  selected={fechaNacimiento}
                  onChange={handleFechaChange}
                  placeholderText="dd/mm/aaaa"
                  error={!!errors.fecha_nacimiento}
                />
                {errors.fecha_nacimiento && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>
                )}
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Género *
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.genero ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
                {errors.genero && (
                  <p className="mt-1 text-sm text-red-600">{errors.genero}</p>
                )}
              </div>
            </div>

            {/* Avatar asignado automáticamente */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-300">
                  <img
                    src={selectedAvatarUrl}
                    alt="Avatar asignado"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Su avatar ha sido asignado automáticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Especialidad y Código SBS */}
            <div className="grid grid-cols-2 gap-4">
              {/* Especialidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Especialidad *
                </label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.especialidad ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Psicología Clínica, Terapia Cognitivo-Conductual, etc."
                />
                {errors.especialidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.especialidad}</p>
                )}
              </div>

              {/* Código SBS */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código SBS *
                </label>
                <input
                  type="text"
                  name="codigo_sbs"
                  value={formData.codigo_sbs}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
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
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción Profesional *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe tu experiencia, enfoque terapéutico, y cómo puedes ayudar a tus pacientes..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
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
                className="px-4 py-2 text-sm font-medium text-amber-800 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Psicólogo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearPsicologo; 
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

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar código SBS
    if (!formData.codigo_sbs.trim()) {
      newErrors.codigo_sbs = 'El código SBS es obligatorio';
    } else if (!/^\d{6,8}$/.test(formData.codigo_sbs.trim())) {
      newErrors.codigo_sbs = 'El código SBS debe tener entre 6 y 8 dígitos numéricos';
    }

    if (formData.telefono && !/^\+?[\d\s\-()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido';
    }

    // Validar fecha de nacimiento
    if (fechaNacimiento) {
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
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.apellidos ? 'border-red-300' : 'border-gray-300'
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
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                    errors.telefono ? 'border-red-300' : 'border-gray-300'
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
                  Fecha de Nacimiento
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
                  Género
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                >
                  <option value="">Seleccionar género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
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
                  Especialidad
                </label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="Ej: Psicología Clínica, Terapia Cognitivo-Conductual, etc."
                />
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
                Descripción Profesional
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
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
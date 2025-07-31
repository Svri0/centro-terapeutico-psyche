import React, { useState, useRef, useEffect } from 'react';
import { authService, LoginData } from '../servicios/auth.service';
import { validateLoginForm, getFieldError, sanitizeInput, ValidationError } from '../utilidades/validation';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  // Ref para mantener el error persistente
  const errorRef = useRef<string>('');
  const hasAttemptedLogin = useRef<boolean>(false);

  // Cargar error persistente al montar el componente
  useEffect(() => {
    const persistedError = localStorage.getItem('loginError');
    if (persistedError) {
      setError(persistedError);
      setShowError(true);
      errorRef.current = persistedError;
    }
  }, []);

  // Sincronizar el error del ref con el estado
  useEffect(() => {
    if (errorRef.current !== error) {
      errorRef.current = error;
      setShowError(!!error);
      
      // Persistir error en localStorage
      if (error) {
        localStorage.setItem('loginError', error);
      } else {
        localStorage.removeItem('loginError');
      }
    }
  }, [error]);

  const clearError = () => {
    setError('');
    setShowError(false);
    errorRef.current = '';
    localStorage.removeItem('loginError');
    hasAttemptedLogin.current = false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    // Limpiar error cuando el usuario modifica las credenciales
    if (errorRef.current) {
      clearError();
    }
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });

    // Validar en tiempo real si el campo ha sido tocado
    if (touchedFields.has(name)) {
      const errors = validateLoginForm({ ...formData, [name]: sanitizedValue });
      setValidationErrors(errors);
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    const errors = validateLoginForm(formData);
    setValidationErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    hasAttemptedLogin.current = true;
    // NO limpiar el error aquí, solo cuando el usuario modifique los campos

    // Validar formulario completo
    const errors = validateLoginForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(formData);
      
      // Limpiar error si el login es exitoso
      clearError();
      
      // Redirigir según el rol del usuario
      const usuario = response.data.usuario;
      if (usuario.rol_id === 1) {
        window.location.href = '/admin';
      } else if (usuario.rol_id === 2) {
        window.location.href = '/psicologo';
      } else if (usuario.rol_id === 3) {
        window.location.href = '/paciente';
      } else {
        window.location.href = '/admin';
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error de autenticación';
      setError(errorMessage);
      errorRef.current = errorMessage;
      setShowError(true);
      localStorage.setItem('loginError', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFieldErrorDisplay = (fieldName: string): string | null => {
    return getFieldError(validationErrors, fieldName);
  };

  return (
         <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-aesthetic" style={{ backgroundColor: '#fff6ed' }}>
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8">
          {/* Logo y título */}
          <div className="text-center">
            {/* Logo oficial "de psyche" */}
                         <div className="mx-auto mb-6">
                                               <div className="flex justify-center mb-1">
                  <img src="/src/img/psyche.svg" alt="de psyche" className="h-32 w-auto" />
                </div>
                <div className="text-sm text-amber-600 tracking-wider uppercase mt-1">
                  Centro Terapéutico
                </div>
             </div>
            <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
              Sistema de Gestión Terapéutica
            </h2>
            <p className="text-center text-sm text-gray-600 mb-4">
              Plataforma integral para el bienestar mental
            </p>
            <div className="flex justify-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                🧠 Psicología
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                🎯 Gamificación
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                💻 Tecnología
              </span>
            </div>
          </div>
          
          {/* Formulario */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                      getFieldErrorDisplay('email') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                  />
                </div>
                {getFieldErrorDisplay('email') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldErrorDisplay('email')}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                      getFieldErrorDisplay('password') ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {getFieldErrorDisplay('password') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldErrorDisplay('password')}</p>
                )}
              </div>
            </div>

            {/* Mensaje de error general */}
            {showError && error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Error de autenticación
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      Credenciales incorrectas. Verifica tu email o contraseña.
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={clearError}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de login */}
            <div>
              <button
                type="submit"
                disabled={loading}
                                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-amber-800 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </div>

            {/* Información de credenciales */}
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Credenciales de Prueba</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Administrador:</strong> admin@admin.com / admin123</p>
                  <p><strong>Psicólogo:</strong> laura.fernandez@psyche.cl / psicologo123</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-amber-700">
            © 2024 de psyche. Centro Terapéutico. Sistema de gestión terapéutica con gamificación.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 
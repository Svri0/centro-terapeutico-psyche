import React, { useState, useRef, useEffect } from 'react';
import { authService, LoginData } from '../servicios/auth.service';
import { validateLoginForm, getFieldError, sanitizeInput, ValidationError } from '../utilidades/validation';

const LoginNuevo: React.FC = () => {
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
  
  // Estados para recuperación de contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Limpiar error al escribir
    if (error) {
      clearError();
    }

    // Limpiar errores de validación del campo específico
    if (validationErrors.length > 0) {
      setValidationErrors(prev => prev.filter(err => err.field !== name));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hasAttemptedLogin.current = true;
    setLoading(true);
    clearError();

    try {
      // Validar formulario
      const errors = validateLoginForm(formData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      // Limpiar errores de validación
      setValidationErrors([]);
      
      // Intentar login
      await authService.login(formData);
      
      // Redirigir al dashboard
      window.location.href = '/dashboard';
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

  // Función para manejar recuperación de contraseña
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    try {
      // Simular envío de email (aquí iría la llamada real a la API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setForgotMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      setForgotEmail('');
      
      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotMessage('');
      }, 3000);
      
    } catch (error: any) {
      setForgotError('Error al enviar el email. Intenta nuevamente.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado izquierdo - Formulario */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="w-full max-w-md mx-auto">

          {/* Título principal */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors bg-gray-50 ${
                    getFieldErrorDisplay('email') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {getFieldErrorDisplay('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldErrorDisplay('email')}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors bg-gray-50 ${
                    getFieldErrorDisplay('password') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {getFieldErrorDisplay('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldErrorDisplay('password')}</p>
              )}
            </div>

            {/* Enlace de recuperación de contraseña */}
            <div className="text-right mb-6">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center mb-3">
              <svg className="h-5 w-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-sm font-medium text-amber-800">Credenciales de Prueba</h3>
            </div>
            <div className="space-y-2 text-sm text-amber-700">
              <div className="flex items-center justify-between">
                <span className="font-medium">Administrador:</span>
                <span className="font-mono text-xs">admin@admin.cl / admin123</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Psicólogo:</span>
                <span className="font-mono text-xs">laura.fernandez@psyche.cl / psicologo123</span>
              </div>
            </div>
          </div>

          {/* Error persistente */}
          {showError && error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error de Autenticación</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lado derecho - Fondo pastel */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"></div>
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <div className="text-center">
            {/* Logo grande */}
            <img src="/psyche.svg" alt="Dentro de Psyché" className="h-48 w-auto mx-auto" />
          </div>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            {/* Botón de cerrar */}
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotError('');
                setForgotMessage('');
                setForgotEmail('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido del modal */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h3>
              <p className="text-gray-600">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
            </div>

            {/* Formulario de recuperación */}
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="forgot-email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors bg-gray-50"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Mensajes de estado */}
              {forgotMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">{forgotMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {forgotError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{forgotError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotError('');
                    setForgotMessage('');
                    setForgotEmail('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {forgotLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Enlace'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginNuevo;

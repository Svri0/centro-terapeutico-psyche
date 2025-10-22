// Servicio de API para comunicación con el backend
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api/v1';

console.log('🔍 API_BASE_URL configurado:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔍 Request URL:', (config.baseURL || '') + (config.url || ''));
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error de conexión (servidor caído)
    if (!error.response) {
      console.error('🚨 Error de conexión - Servidor no disponible');
      // NO redirigir automáticamente, dejar que el componente maneje el error
      return Promise.reject(error);
    }

    const status = error.response.status;
    const errorMessage = error.response?.data?.mensaje || '';
    const errorCode = error.response?.data?.codigo || '';

    // Error 500 - Error interno del servidor
    if (status === 500) {
      console.error('🚨 Error interno del servidor');
      // NO redirigir automáticamente, dejar que el componente maneje el error
      return Promise.reject(error);
    }

    // Error 503 - Servicio no disponible
    if (status === 503) {
      console.error('🚨 Servicio no disponible');
      // NO redirigir automáticamente, dejar que el componente maneje el error
      return Promise.reject(error);
    }

    // Error 401 - No autorizado
    if (status === 401) {
      // Solo cerrar sesión si es un error de token expirado o inválido
      // Y solo si estamos en rutas protegidas (NUNCA en la página de inicio)
      
      // NUNCA redirigir desde la página de inicio (/)
      if (window.location.pathname === '/') {
        console.log('🏠 Página de inicio - No redirigir por errores de autenticación');
        return Promise.reject(error);
      }
      
      // Solo cerrar sesión para errores de autenticación en rutas protegidas
      if ((errorCode.includes('AUTH_101') || errorCode.includes('AUTH_102') || 
          errorMessage.includes('Token') || errorMessage.includes('token')) &&
          (window.location.pathname.startsWith('/dashboard') || 
           window.location.pathname.startsWith('/admin') ||
           window.location.pathname.startsWith('/psicologo') ||
           window.location.pathname.startsWith('/paciente'))) {
        console.log('🔒 Token inválido o expirado, cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.log('🚫 Error de permisos, no cerrando sesión:', errorMessage);
      }
    }

    // Error 404 - Recurso no encontrado
    if (status === 404) {
      console.error('🚨 Recurso no encontrado');
      // Solo redirigir si es un error de API, no de página
      if (error.config?.url && !window.location.pathname.includes('/error')) {
        // Es un error de API, no de página
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api; 
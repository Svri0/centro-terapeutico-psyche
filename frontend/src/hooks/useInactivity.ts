import { useEffect, useRef, useCallback } from 'react';
import { authService } from '../servicios/auth.service';

interface UseInactivityOptions {
  timeout: number; // en milisegundos
  onTimeout: () => void;
  onActivity?: () => void;
  events?: string[];
}

export const useInactivity = ({
  timeout,
  onTimeout,
  onActivity,
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
}: UseInactivityOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    lastActivityRef.current = Date.now();
    
    // Solo configurar timeout si es mayor a 0
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Sesión expirada por inactividad');
        onTimeout();
      }, timeout);
    }
  }, [timeout, onTimeout]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Solo resetear si ha pasado al menos 1 segundo desde la última actividad
    if (timeSinceLastActivity > 1000) {
      console.log('🔄 Actividad detectada, reseteando timeout');
      resetTimeout();
      onActivity?.();
    }
  }, [resetTimeout, onActivity]);

  useEffect(() => {
    // Solo agregar listeners si timeout es mayor a 0
    if (timeout > 0) {
      // Agregar listeners de eventos
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      // Inicializar timeout
      resetTimeout();
    }

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [events, handleActivity, resetTimeout, timeout]);

  return {
    resetTimeout,
    getLastActivity: () => lastActivityRef.current
  };
};

// Hook específico para manejo de sesión con logout automático
export const useSessionTimeout = (timeoutMinutes: number = 15) => {
  const timeoutMs = timeoutMinutes * 60 * 1000; // Convertir minutos a milisegundos

  const handleSessionTimeout = useCallback(() => {
    console.log('🚪 Cerrando sesión por inactividad');
    
    // Mostrar notificación al usuario
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⏰</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Sesión Expirada</div>
          <div style="font-size: 12px; opacity: 0.9;">Tu sesión ha expirado por inactividad. Serás redirigido al login.</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover notificación después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    // Cerrar sesión después de un breve delay
    setTimeout(() => {
      authService.cerrarSesion();
      window.location.href = '/login';
    }, 2000);
  }, []);

  const handleActivity = useCallback(() => {
    console.log('🔄 Actividad detectada, sesión activa');
  }, []);

  // Si timeoutMinutes es 0, no activar el hook
  if (timeoutMinutes <= 0) {
    return {
      resetTimeout: () => {},
      getLastActivity: () => Date.now()
    };
  }

  return useInactivity({
    timeout: timeoutMs,
    onTimeout: handleSessionTimeout,
    onActivity: handleActivity
  });
};

// Hook para mostrar advertencia antes del timeout
export const useSessionWarning = (warningMinutes: number = 2, timeoutMinutes: number = 15) => {
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
  const timeoutMs = timeoutMinutes * 60 * 1000;
  
  const warningShownRef = useRef(false);

  const handleWarning = useCallback(() => {
    if (warningShownRef.current) return;
    
    warningShownRef.current = true;
    console.log('⚠️ Mostrando advertencia de sesión');
    
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    warning.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">⚠️</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Sesión por Expirar</div>
          <div style="font-size: 12px; opacity: 0.9;">Tu sesión expirará en ${warningMinutes} minutos por inactividad.</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    // Remover advertencia después de 10 segundos
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 10000);
  }, [warningMinutes]);

  const handleActivity = useCallback(() => {
    warningShownRef.current = false;
  }, []);

  const handleTimeout = useCallback(() => {
    console.log('🚪 Cerrando sesión por inactividad');
    authService.cerrarSesion();
    window.location.href = '/login';
  }, []);

  // Hook para la advertencia
  useInactivity({
    timeout: warningMs,
    onTimeout: handleWarning,
    onActivity: handleActivity
  });

  // Hook para el timeout final
  useInactivity({
    timeout: timeoutMs,
    onTimeout: handleTimeout,
    onActivity: handleActivity
  });
};

export default useInactivity;

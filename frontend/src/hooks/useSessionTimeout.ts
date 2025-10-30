import { useEffect, useRef } from 'react';

export const useSessionTimeout = (timeoutMinutes: number = 15) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000; // Convertir minutos a milisegundos

    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      lastActivityRef.current = Date.now();
      
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Sesión expirada por inactividad');
        
        // Mostrar notificación
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

        // Cerrar sesión y redirigir
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      }, timeoutMs);
    };

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Solo resetear si ha pasado al menos 1 segundo desde la última actividad
      if (timeSinceLastActivity > 1000) {
        console.log('🔄 Actividad detectada, reseteando timeout');
        resetTimeout();
      }
    };

    // Inicializar timeout
    resetTimeout();

    // Agregar listeners de eventos
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutMinutes]);

  return {
    resetTimeout: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      lastActivityRef.current = Date.now();
    }
  };
};

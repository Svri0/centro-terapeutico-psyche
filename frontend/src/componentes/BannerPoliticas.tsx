import React, { useState, useEffect, useCallback } from 'react';
import ModalPoliticas from './ModalPoliticas';
import { authService } from '../servicios/auth.service';

const BannerPoliticas: React.FC = () => {
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const verificarYMostrarBanner = useCallback(() => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = authService.isAuthenticated();
    
    // Verificar si ya se aceptaron las políticas en localStorage
    const politicasAceptadas = localStorage.getItem('politicas_publicas_aceptadas');
    
    console.log('🔍 Verificando banner:', { isAuthenticated, politicasAceptadas });
    
    // Solo mostrar el banner si:
    // 1. El usuario NO está autenticado
    // 2. Las políticas públicas NO han sido aceptadas
    if (!isAuthenticated && !politicasAceptadas) {
      console.log('✅ Mostrando banner');
      setMostrarBanner(true);
    } else {
      console.log('❌ Ocultando banner');
      setMostrarBanner(false);
    }
  }, []);

  useEffect(() => {
    // Verificar inicialmente
    verificarYMostrarBanner();

    // Escuchar cambios en localStorage entre pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'politicas_publicas_aceptadas' || e.key === null) {
        verificarYMostrarBanner();
      }
    };

    // Escuchar evento personalizado para actualizar desde la misma pestaña
    const handleCustomStorageChange = () => {
      verificarYMostrarBanner();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('politicasStorageChange', handleCustomStorageChange);

    // Exponer funciones globales para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      (window as any).refrescarBannerPoliticas = () => {
        console.log('🔄 Refrescando banner manualmente');
        verificarYMostrarBanner();
      };
      
      // Función helper para resetear las políticas (útil para testing)
      (window as any).resetearPoliticas = () => {
        console.log('🗑️ Eliminando políticas aceptadas');
        localStorage.removeItem('politicas_publicas_aceptadas');
        localStorage.removeItem('politicas_publicas_fecha_aceptacion');
        window.dispatchEvent(new Event('politicasStorageChange'));
        console.log('✅ Políticas eliminadas. El banner debería aparecer ahora.');
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('politicasStorageChange', handleCustomStorageChange);
      if (import.meta.env.DEV) {
        delete (window as any).refrescarBannerPoliticas;
      }
    };
  }, [verificarYMostrarBanner]);

  const handleAceptarTodo = () => {
    // Guardar la aceptación en localStorage
    localStorage.setItem('politicas_publicas_aceptadas', 'true');
    localStorage.setItem('politicas_publicas_fecha_aceptacion', new Date().toISOString());
    // Disparar evento personalizado para actualizar
    window.dispatchEvent(new Event('politicasStorageChange'));
    setMostrarBanner(false);
  };

  const handleMostrarMas = () => {
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
  };

  const handleAceptarEnModal = () => {
    // Guardar la aceptación en localStorage
    localStorage.setItem('politicas_publicas_aceptadas', 'true');
    localStorage.setItem('politicas_publicas_fecha_aceptacion', new Date().toISOString());
    // Disparar evento personalizado para actualizar
    window.dispatchEvent(new Event('politicasStorageChange'));
    setMostrarModal(false);
    setMostrarBanner(false);
  };

  if (!mostrarBanner) return null;

  return (
    <>
      {/* Banner en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 border-t border-gray-300 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Contenido del banner */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-2 text-center lg:text-left uppercase tracking-wide">
                Uso de Políticas
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed text-center lg:text-left">
                Usamos políticas de seguridad y privacidad para proteger tu información personal y garantizar 
                un servicio seguro. Revisa nuestras{' '}
                <button
                  onClick={handleMostrarMas}
                  className="text-amber-600 hover:text-amber-700 underline font-medium"
                >
                  Políticas de Privacidad
                </button>
                {' '}y{' '}
                <button
                  onClick={handleMostrarMas}
                  className="text-amber-600 hover:text-amber-700 underline font-medium"
                >
                  Políticas de Seguridad
                </button>
                {' '}para obtener más información al respecto.
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-row gap-3 w-full lg:w-auto justify-center lg:justify-end">
              <button
                onClick={handleMostrarMas}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm shadow-sm"
              >
                Mostrar más
              </button>
              <button
                onClick={handleAceptarTodo}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de políticas completas */}
      {mostrarModal && (
        <ModalPoliticas
          isOpen={mostrarModal}
          onAceptar={handleAceptarEnModal}
          onAceptarLoading={false}
          modoPublico={true}
          onCerrar={handleCerrarModal}
        />
      )}
    </>
  );
};

export default BannerPoliticas;

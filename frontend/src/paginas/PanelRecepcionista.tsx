import React, { useState, useEffect } from 'react';
import { authService } from '../servicios/auth.service';
import Logo from '../componentes/Logo';

const PanelRecepcionista: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center" style={{ backgroundColor: '#fff6ed' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        <span className="ml-4 text-amber-600 text-lg tracking-wide">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center" style={{ backgroundColor: '#fff6ed' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img src="/src/img/psyche.svg" alt="de psyche" className="h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-light text-gray-800 tracking-widest uppercase">
                  Panel de Recepción
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">Gestión de Recepción</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Bienvenido, {user.nombres} {user.apellidos}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-6">
        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-widest uppercase mb-4">
              Bienvenido a la Vista Recepcionista
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aquí podrás gestionar las citas, pacientes y el flujo de trabajo del centro terapéutico.
            </p>
          </div>
        </div>

        {/* Content Cards */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card: Gestión de Citas */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Citas</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Programa, modifica y gestiona las citas de los pacientes con los psicólogos.
              </p>
              <button className="w-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Gestionar Citas
              </button>
            </div>

            {/* Card: Registro de Pacientes */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Registro de Pacientes</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Registra nuevos pacientes y mantén actualizada su información personal.
              </p>
              <button className="w-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Registrar Paciente
              </button>
            </div>

            {/* Card: Consulta de Horarios */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Consulta de Horarios</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Consulta la disponibilidad de los psicólogos y sus horarios de atención.
              </p>
              <button className="w-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Ver Horarios
              </button>
            </div>

            {/* Card: Reportes */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reportes</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Genera reportes de citas, pacientes y estadísticas del centro.
              </p>
              <button className="w-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Generar Reportes
              </button>
            </div>

            {/* Card: Mensajes */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mensajes</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gestiona la comunicación con pacientes y psicólogos del centro.
              </p>
              <button className="w-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Ver Mensajes
              </button>
            </div>

            {/* Card: Configuración */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configura tu perfil y preferencias del sistema.
              </p>
              <button className="w-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-md p-8 border border-amber-100">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Bienvenido al Sistema de Gestión!
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                Como recepcionista, tienes acceso a las herramientas necesarias para gestionar eficientemente 
                el flujo de trabajo del centro terapéutico. Desde aquí podrás coordinar citas, registrar pacientes 
                y mantener una comunicación efectiva con todo el equipo.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <div className="text-sm text-gray-600">Citas Hoy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <div className="text-sm text-gray-600">Pacientes Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <div className="text-sm text-gray-600">Mensajes Nuevos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PanelRecepcionista; 
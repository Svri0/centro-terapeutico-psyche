import React from 'react';
import Chatbot from '../componentes/Chatbot';
import { useAuth } from '../contextos/AuthContext';

const PanelPrincipal: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      admin: 'Administrador',
      psicologo: 'Psicólogo',
      paciente: 'Paciente',
      recepcionista: 'Recepcionista'
    };
    return roleNames[role] || role;
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <h1 className='text-2xl font-bold text-indigo-600'>Centro Terapéutico Psyche</h1>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-700'>
                <span className='font-medium'>
                  {user?.nombres} {user?.apellidos}
                </span>
                <span className='ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full'>
                  {getRoleDisplayName(user?.rol || '')}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Welcome Section */}
        <div className='px-4 py-6 sm:px-0'>
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>
                ¡Bienvenido, {user?.nombres}!
              </h2>
              <p className='text-gray-600'>
                Has iniciado sesión como {getRoleDisplayName(user?.rol || '')} en el Centro
                Terapéutico Psyche.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='mt-8'>
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Total Pacientes */}
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-6 w-6 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                      />
                    </svg>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Total Pacientes
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>156</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Sesiones Hoy */}
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-6 w-6 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8'
                      />
                    </svg>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>Sesiones Hoy</dt>
                      <dd className='text-lg font-medium text-gray-900'>12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Tareas Pendientes */}
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-6 w-6 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Tareas Pendientes
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>8</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingresos Mensuales */}
            <div className='bg-white overflow-hidden shadow rounded-lg'>
              <div className='p-5'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-6 w-6 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                      />
                    </svg>
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        Ingresos Mensuales
                      </dt>
                      <dd className='text-lg font-medium text-gray-900'>$2.4M</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Section */}
        <div className='mt-8'>
          <div className='bg-white overflow-hidden shadow rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Asistente Virtual</h3>
              <Chatbot />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PanelPrincipal;

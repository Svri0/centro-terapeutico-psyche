import React, { useState } from 'react';
import ChatSistema from './ChatSistema';

const EjemploChat: React.FC = () => {
  const [tipoUsuario, setTipoUsuario] = useState<'psicologo' | 'paciente'>('psicologo');
  const [mostrarChat, setMostrarChat] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de ejemplo */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Centro Terapéutico Psyche
                </h1>
                <p className="text-sm text-gray-500">
                  Sistema de Comunicación
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Usuario:</span>
                <select
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value as 'psicologo' | 'paciente')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="psicologo">Psicólogo</option>
                  <option value="paciente">Paciente</option>
                </select>
              </div>
              
              <button
                onClick={() => setMostrarChat(!mostrarChat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mostrarChat
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {mostrarChat ? 'Ocultar Chat' : 'Mostrar Chat'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {mostrarChat ? (
        <ChatSistema 
          tipoUsuario={tipoUsuario} 
          usuarioId="usuario-ejemplo" 
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sistema de Chat Integrado
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Sistema de comunicación en tiempo real entre psicólogos y pacientes. 
              Incluye pestañas múltiples, búsqueda, indicadores de estado y diseño responsive.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat en Tiempo Real</h3>
                <p className="text-gray-600 text-sm">
                  Comunicación instantánea con indicadores de estado online/offline
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Búsqueda Inteligente</h3>
                <p className="text-gray-600 text-sm">
                  Encuentra conversaciones rápidamente con búsqueda en tiempo real
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Diseño Responsive</h3>
                <p className="text-gray-600 text-sm">
                  Funciona perfectamente en desktop, tablet y móvil
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setMostrarChat(true)}
              className="mt-8 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Probar Sistema de Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EjemploChat;

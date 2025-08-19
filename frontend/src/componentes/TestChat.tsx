import React, { useState } from 'react';
import ChatSistema from './ChatSistema';

const TestChat: React.FC = () => {
  const [tipoUsuario, setTipoUsuario] = useState<'psicologo' | 'paciente'>('psicologo');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de prueba */}
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
                  Sistema de Chat - Modo Prueba
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
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">ID:</span> usuario-prueba-123
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de Chat */}
      <div className="h-[calc(100vh-4rem)]">
        <ChatSistema 
          tipoUsuario={tipoUsuario} 
          usuarioId="usuario-prueba-123" 
        />
      </div>

      {/* Instrucciones */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
        <h3 className="font-medium text-gray-900 mb-2">💡 Instrucciones</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Cambia el tipo de usuario arriba</li>
          <li>• Selecciona diferentes chats</li>
          <li>• Envía mensajes de prueba</li>
          <li>• Prueba la búsqueda</li>
          <li>• Verifica el responsive design</li>
        </ul>
      </div>
    </div>
  );
};

export default TestChat;

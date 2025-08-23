import React, { useState } from 'react';

interface ConfiguracionChatProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteNombre: string;
  pacienteId: string;
  onCambiarTema: (tema: string) => void;
  onBorrarChat: () => void;
  temaActual: string;
}

const TEMAS_CHAT = [
  {
    id: 'default',
    nombre: 'Tema Clásico',
    descripcion: 'Fondo blanco con bordes suaves',
    preview: 'bg-white border border-gray-200'
  },
  {
    id: 'dark',
    nombre: 'Tema Oscuro',
    descripcion: 'Fondo oscuro elegante',
    preview: 'bg-gray-900 text-white'
  },
  {
    id: 'blue',
    nombre: 'Tema Azul',
    descripcion: 'Fondo azul relajante',
    preview: 'bg-blue-50 border border-blue-200'
  },
  {
    id: 'green',
    nombre: 'Tema Verde',
    descripcion: 'Fondo verde natural',
    preview: 'bg-green-50 border border-green-200'
  },
  {
    id: 'purple',
    nombre: 'Tema Púrpura',
    descripcion: 'Fondo púrpura creativo',
    preview: 'bg-purple-50 border border-purple-200'
  },
  {
    id: 'warm',
    nombre: 'Tema Cálido',
    descripcion: 'Fondo cálido y acogedor',
    preview: 'bg-orange-50 border border-orange-200'
  }
];

const ConfiguracionChat: React.FC<ConfiguracionChatProps> = ({
  isOpen,
  onClose,
  pacienteNombre,
  pacienteId,
  onCambiarTema,
  onBorrarChat,
  temaActual
}) => {
  const [temaSeleccionado, setTemaSeleccionado] = useState(temaActual);
  const [mostrarBorrado, setMostrarBorrado] = useState(false);
  const [confirmacionNombre, setConfirmacionNombre] = useState('');
  const [errorConfirmacion, setErrorConfirmacion] = useState('');

  const handleCambiarTema = () => {
    onCambiarTema(temaSeleccionado);
    onClose();
  };

  const handleBorrarChat = () => {
    if (confirmacionNombre.trim().toLowerCase() === pacienteNombre.toLowerCase()) {
      onBorrarChat();
      onClose();
      setMostrarBorrado(false);
      setConfirmacionNombre('');
      setErrorConfirmacion('');
    } else {
      setErrorConfirmacion('El nombre no coincide. Por favor, escribe exactamente el nombre del paciente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Configuración del Chat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información del paciente */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Chat con</p>
            <p className="text-lg font-semibold text-gray-800">{pacienteNombre}</p>
          </div>

          {/* Selección de tema */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Elegir tema del chat
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TEMAS_CHAT.map((tema) => (
                <div
                  key={tema.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    temaSeleccionado === tema.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTemaSeleccionado(tema.id)}
                >
                  <div className={`w-full h-16 rounded ${tema.preview} mb-2`}></div>
                  <p className="text-sm font-medium text-gray-800">{tema.nombre}</p>
                  <p className="text-xs text-gray-600">{tema.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Botón cambiar tema */}
          <button
            onClick={handleCambiarTema}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Aplicar Tema
          </button>

          {/* Separador */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-red-600 mb-4">
              Zona de Peligro
            </h3>
            
            {!mostrarBorrado ? (
              <button
                onClick={() => setMostrarBorrado(true)}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Borrar Chat
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>⚠️ ADVERTENCIA:</strong> Esta acción es irreversible y eliminará 
                  completamente todos los mensajes de esta conversación.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Para confirmar, escribe el nombre del paciente: <strong>{pacienteNombre}</strong>
                  </label>
                  <input
                    type="text"
                    value={confirmacionNombre}
                    onChange={(e) => setConfirmacionNombre(e.target.value)}
                    placeholder="Escribe el nombre exacto"
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {errorConfirmacion && (
                    <p className="text-sm text-red-600 mt-1">{errorConfirmacion}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setMostrarBorrado(false);
                      setConfirmacionNombre('');
                      setErrorConfirmacion('');
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBorrarChat}
                    disabled={confirmacionNombre.trim().toLowerCase() !== pacienteNombre.toLowerCase()}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                    Confirmar Borrado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionChat;

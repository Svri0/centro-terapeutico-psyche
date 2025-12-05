import React from 'react';

interface ModalConfirmarCancelarCitaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  citaInfo?: {
    fecha?: string;
    hora?: string;
    paciente?: string;
  };
}

const ModalConfirmarCancelarCita: React.FC<ModalConfirmarCancelarCitaProps> = ({
  isOpen,
  onClose,
  onConfirmar,
  citaInfo
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in-up">
        {/* Header con icono */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 rounded-t-2xl border-b border-red-100">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center">
            ¿Cancelar esta cita?
          </h3>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">
          <p className="text-gray-700 mb-4 text-center">
            ¿Estás seguro de que quieres cancelar esta cita?
          </p>
          
          {citaInfo && (citaInfo.fecha || citaInfo.hora || citaInfo.paciente) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                {citaInfo.paciente && (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-semibold">👤 Paciente:</span>
                    <span className="text-gray-700">{citaInfo.paciente}</span>
                  </div>
                )}
                {citaInfo.fecha && (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-semibold">Fecha:</span>
                    <span className="text-gray-700">{citaInfo.fecha}</span>
                  </div>
                )}
                {citaInfo.hora && (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-semibold">🕐 Hora:</span>
                    <span className="text-gray-700">{citaInfo.hora}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 text-center mb-6">
            Esta acción no se puede deshacer. Si cancelas, deberás agendar una nueva cita.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              No, mantener cita
            </button>
            <button
              onClick={onConfirmar}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              Sí, cancelar cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarCancelarCita;


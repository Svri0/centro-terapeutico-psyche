import React from 'react';

interface AlertaDisponibilidadProps {
  nombrePsicologo: string;
  semanaInicio: string;
  semanaFin: string;
  onActualizar: () => void;
}

const AlertaDisponibilidad: React.FC<AlertaDisponibilidadProps> = ({
  nombrePsicologo,
  semanaInicio,
  semanaFin,
  onActualizar
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Alerta Psicólogo/a {nombrePsicologo}
            </h3>
            <p className="text-sm text-gray-600">
              Para acceder a la página principal debes editar tu disponibilidad semanal primero.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Semana Actual</h4>
            <p className="text-sm text-amber-800">
              {semanaInicio} - {semanaFin}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Información Importante:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Debes configurar tu disponibilidad semanal cada lunes</li>
            <li>• El límite máximo es de 40 horas semanales</li>
            <li>• Se consideran automáticamente los feriados chilenos</li>
            <li>• Puedes marcar días de vacaciones</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onActualizar}
            className="px-6 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-lg transition-colors font-medium"
          >
            Configurar Disponibilidad
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertaDisponibilidad; 
import React from 'react';

interface ModalFeriadosProps {
  isOpen: boolean;
  onClose: () => void;
}

const feriados2025 = [
  { fecha: '2025-01-01', nombre: 'Año Nuevo', dia: 'Miércoles' },
  { fecha: '2025-01-20', nombre: 'Día de la Independencia', dia: 'Lunes' },
  { fecha: '2025-04-18', nombre: 'Viernes Santo', dia: 'Viernes' },
  { fecha: '2025-04-20', nombre: 'Domingo de Resurrección', dia: 'Domingo' },
  { fecha: '2025-05-01', nombre: 'Día del Trabajo', dia: 'Jueves' },
  { fecha: '2025-05-21', nombre: 'Día de las Glorias Navales', dia: 'Miércoles' },
  { fecha: '2025-06-29', nombre: 'San Pedro y San Pablo', dia: 'Domingo' },
  { fecha: '2025-07-16', nombre: 'Día de la Virgen del Carmen', dia: 'Miércoles' },
  { fecha: '2025-08-15', nombre: 'Asunción de la Virgen', dia: 'Viernes' },
  { fecha: '2025-09-18', nombre: 'Independencia Nacional', dia: 'Jueves' },
  { fecha: '2025-09-19', nombre: 'Día de las Glorias del Ejército', dia: 'Viernes' },
  { fecha: '2025-10-12', nombre: 'Encuentro de Dos Mundos', dia: 'Domingo' },
  { fecha: '2025-10-31', nombre: 'Día de las Iglesias Evangélicas y Protestantes', dia: 'Viernes' },
  { fecha: '2025-11-01', nombre: 'Día de Todos los Santos', dia: 'Sábado' },
  { fecha: '2025-12-08', nombre: 'Inmaculada Concepción', dia: 'Lunes' },
  { fecha: '2025-12-25', nombre: 'Navidad', dia: 'Jueves' }
];

const ModalFeriados: React.FC<ModalFeriadosProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Feriados 2025 - Chile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Los siguientes días son feriados legales en Chile y se consideran automáticamente como no laborables.
          </p>
        </div>

        <div className="grid gap-3">
          {feriados2025.map((feriado, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-semibold">
                    {new Date(feriado.fecha).getDate()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{feriado.nombre}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(feriado.fecha).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} - {feriado.dia}
                  </div>
                </div>
              </div>
              <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                No laborable
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-blue-600 mr-2">ℹ️</span>
            <h3 className="text-sm font-semibold text-blue-900">Información Importante</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los feriados se aplican automáticamente a todos los psicólogos</li>
            <li>• No es necesario configurar manualmente estos días</li>
            <li>• Los pacientes no podrán agendar citas en estos días</li>
            <li>• Los domingos también se consideran no laborables</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFeriados;

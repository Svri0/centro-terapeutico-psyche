import React, { useState } from 'react';

interface ModalConfirmarDesactivarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  tipoUsuario: 'psicologo' | 'recepcionista' | 'paciente';
  nombreUsuario: string;
  accion: 'desactivar' | 'reactivar' | 'eliminar';
}

const ModalConfirmarDesactivar: React.FC<ModalConfirmarDesactivarProps> = ({
  isOpen,
  onClose,
  onConfirmar,
  tipoUsuario,
  nombreUsuario,
  accion
}) => {
  const [confirmacion, setConfirmacion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmacion.toLowerCase() === 'confirmar') {
      onConfirmar();
      setConfirmacion('');
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmacion('');
    onClose();
  };

  if (!isOpen) return null;

  const getTituloAccion = () => {
    switch (accion) {
      case 'desactivar':
        return 'Desactivar';
      case 'reactivar':
        return 'Reactivar';
      case 'eliminar':
        return 'Eliminar';
      default:
        return 'Confirmar';
    }
  };

  const getTituloUsuario = () => {
    switch (tipoUsuario) {
      case 'psicologo':
        return 'psicólogo';
      case 'recepcionista':
        return 'recepcionista';
      case 'paciente':
        return 'paciente';
      default:
        return 'usuario';
    }
  };

  const getMensajeAccion = () => {
    switch (accion) {
      case 'desactivar':
        return `¿Estás seguro de que quieres desactivar el ${getTituloUsuario()} "${nombreUsuario}"?`;
      case 'reactivar':
        return `¿Estás seguro de que quieres reactivar el ${getTituloUsuario()} "${nombreUsuario}"?`;
      case 'eliminar':
        return `¿Estás seguro de que quieres eliminar el ${getTituloUsuario()} "${nombreUsuario}"? Esta acción no se puede deshacer.`;
      default:
        return `¿Estás seguro de que quieres realizar esta acción con el ${getTituloUsuario()} "${nombreUsuario}"?`;
    }
  };

  const getColorBoton = () => {
    switch (accion) {
      case 'desactivar':
        return 'bg-red-600 hover:bg-red-700';
      case 'reactivar':
        return 'bg-green-600 hover:bg-green-700';
      case 'eliminar':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Confirmar Acción</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {getMensajeAccion()}
          </p>
          <p className="text-sm text-gray-600">
            Escribe "confirmar" para continuar:
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder="confirmar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={confirmacion.toLowerCase() !== 'confirmar'}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                confirmacion.toLowerCase() === 'confirmar'
                  ? getColorBoton()
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {getTituloAccion()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalConfirmarDesactivar;












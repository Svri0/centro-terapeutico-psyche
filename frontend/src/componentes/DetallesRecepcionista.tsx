import React, { useState, useEffect } from 'react';
import { Recepcionista } from '../servicios/admin.service';
import { formatearGenero } from '../utilidades/formateo';

interface DetallesRecepcionistaProps {
  recepcionista: Recepcionista;
  onClose: () => void;
}

const DetallesRecepcionista: React.FC<DetallesRecepcionistaProps> = ({ recepcionista, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'actividad'>('general');

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearUltimoAcceso = (fecha?: string) => {
    if (!fecha) return 'Nunca ha iniciado sesión';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minuto = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'p.m.' : 'a.m.';
    const hora12 = date.getHours() % 12 || 12;
    
    return `${dia}-${mes}-${año} ${hora12}:${minuto} ${ampm}`;
  };

  const obtenerIniciales = (nombres: string, apellidos: string) => {
    const inicialNombre = nombres.charAt(0).toUpperCase();
    const inicialApellido = apellidos.charAt(0).toUpperCase();
    return `${inicialNombre}${inicialApellido}`;
  };

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return 'No especificada';
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      return edad - 1;
    }
    return edad;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999] animate-fade-in">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white animate-slide-in-right shadow-glow">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 mr-4">
                {recepcionista.avatar_url ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={recepcionista.avatar_url}
                    alt={`${recepcionista.nombres} ${recepcionista.apellidos}`}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {obtenerIniciales(recepcionista.nombres, recepcionista.apellidos)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {recepcionista.nombres} {recepcionista.apellidos}
                </h3>
                <p className="text-blue-600 font-medium">Recepcionista</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    recepcionista.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {recepcionista.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  {!recepcionista.email_verificado && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 ml-2">
                      Email no verificado
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Información General
              </button>
              <button
                onClick={() => setActiveTab('actividad')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'actividad'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Actividad
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombres</label>
                    <p className="mt-1 text-sm text-gray-900">{recepcionista.nombres}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <p className="mt-1 text-sm text-gray-900">{recepcionista.apellidos}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <p className="mt-1 text-sm text-gray-900">{formatearGenero(recepcionista.genero)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {recepcionista.fecha_nacimiento 
                        ? `${formatearFecha(recepcionista.fecha_nacimiento)} (${calcularEdad(recepcionista.fecha_nacimiento)} años)`
                        : 'No especificada'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{recepcionista.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {recepcionista.telefono || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de la Cuenta */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cuenta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{recepcionista.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de la Cuenta</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        recepcionista.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {recepcionista.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verificación de Email</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        recepcionista.email_verificado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {recepcionista.email_verificado ? 'Verificado' : 'No verificado'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                    <p className="mt-1 text-sm text-gray-900">{formatearFecha(recepcionista.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actividad' && (
            <div className="space-y-6">
              {/* Último Acceso */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Último Acceso</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatearUltimoAcceso(recepcionista.ultimo_acceso)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatearFecha(recepcionista.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas (Placeholder para futuras funcionalidades) */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Citas Gestionadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Pacientes Atendidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Horas Trabajadas</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Las estadísticas se mostrarán cuando se implementen las funcionalidades de gestión de citas
                </p>
              </div>

              {/* Notas (Placeholder para futuras funcionalidades) */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Notas y Comentarios</h4>
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    No hay notas registradas para este recepcionista
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md hover-scale transition-transform duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesRecepcionista; 
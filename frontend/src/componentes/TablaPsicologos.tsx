import React, { useState } from 'react';
import { Psicologo } from '../servicios/admin.service';
import { formatearGenero } from '../utilidades/formateo';
import DetallesPsicologo from './DetallesPsicologo';

interface TablaPsicologosProps {
  psicologos: Psicologo[];
  onEditar: (psicologo: Psicologo) => void;
  onDesactivar: (id: string) => void;
  onReactivar: (id: string) => void;
  onEliminar: (id: string) => void;
  onEliminarCita: (citaId: string) => Promise<void>;
  onReasignarPaciente: (pacienteId: string, nuevoPsicologoId: string) => Promise<void>;
}

const TablaPsicologos: React.FC<TablaPsicologosProps> = ({
  psicologos,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminar,
  onEliminarCita,
  onReasignarPaciente
}) => {
  const [selectedPsicologo, setSelectedPsicologo] = useState<Psicologo | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const formatearUltimoAcceso = (fecha?: string) => {
    if (!fecha) return 'Nunca';
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

  const truncarEspecialidad = (especialidad: string, maxLength: number = 40) => {
    if (!especialidad) return 'Sin especialidad';
    if (especialidad.length <= maxLength) return especialidad;
    return especialidad.substring(0, maxLength) + '...';
  };

  if (!psicologos || psicologos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay psicólogos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando el primer psicólogo del sistema.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg border border-gray-100 w-full">
        <div className="w-full">
          <table className="w-full divide-y divide-gray-100">
            <thead className="bg-gray-25">
              <tr>
                                 <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/6">
                   Psicólogo
                 </th>
                 <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/6">
                   Contacto
                 </th>
                                 <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/5">
                   Especialidad
                 </th>
                 <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/8">
                   Código SBS
                 </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/8">
                  Estado
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/8">
                  Último Acceso
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/8">
                  Fecha Creación
                </th>
                                 <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-widest w-1/6">
                   Acciones
                 </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {psicologos?.map((psicologo) => (
                <tr key={psicologo.id} className="hover:bg-gray-25">
                  <td className="px-3 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {psicologo.avatar_url ? (
                          <img
                            src={psicologo.avatar_url}
                            alt={`${psicologo.nombres} ${psicologo.apellidos}`}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-xs font-light text-amber-600">
                              {psicologo.nombres.charAt(0)}{psicologo.apellidos.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {psicologo.nombres} {psicologo.apellidos}
                        </div>
                        <div className="text-xs font-medium text-gray-600 tracking-wide">
                          {formatearGenero(psicologo.genero)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-semibold text-gray-900 truncate">{psicologo.email}</div>
                    <div className="text-xs font-medium text-gray-600 truncate">{psicologo.telefono || 'Sin teléfono'}</div>
                  </td>
                                     <td className="px-3 py-3">
                     <div className="text-sm font-medium text-gray-900" title={psicologo.especialidad || 'Sin especialidad'}>
                       {truncarEspecialidad(psicologo.especialidad || '')}
                     </div>
                   </td>
                   <td className="px-3 py-3">
                     <div className="text-sm font-medium text-gray-900">
                       {psicologo.codigo_sbs ? (
                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                           {psicologo.codigo_sbs}
                         </span>
                       ) : (
                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-600">
                           Sin SBS
                         </span>
                       )}
                     </div>
                   </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        psicologo.activo
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {psicologo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {!psicologo.email_verificado && (
                        <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700">
                          Email no verificado
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-700 whitespace-nowrap">
                    {formatearUltimoAcceso(psicologo.ultimo_acceso)}
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-700">
                    {formatearFecha(psicologo.created_at)}
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-medium">
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedPsicologo(psicologo);
                          setShowDetalles(true);
                        }}
                        className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 rounded-md transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
                      >
                                                 Detalles
                      </button>
                      <button
                        onClick={() => onEditar(psicologo)}
                        className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 rounded-md transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
                      >
                                                 Editar
                      </button>
                      {psicologo.activo ? (
                        <button
                          onClick={() => onDesactivar(psicologo.id)}
                          className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 rounded-md transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
                        >
                                                     Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => onReactivar(psicologo.id)}
                          className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-green-200 to-green-300 hover:from-green-300 hover:to-green-400 text-green-800 rounded-md transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
                        >
                                                     Reactivar
                        </button>
                      )}
                      <button
                        onClick={() => onEliminar(psicologo.id)}
                        className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-md transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
                      >
                                                 Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedPsicologo && (
        <DetallesPsicologo
          psicologo={selectedPsicologo}
          isOpen={showDetalles}
          onClose={() => {
            setShowDetalles(false);
            setSelectedPsicologo(null);
          }}
          onEliminarCita={onEliminarCita}
          onReasignarPaciente={onReasignarPaciente}
        />
      )}
    </>
  );
};

export default TablaPsicologos; 
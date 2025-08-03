import React, { useState } from 'react';
import { Psicologo, Recepcionista } from '../servicios/admin.service';
import { formatearGenero } from '../utilidades/formateo';
import DetallesPsicologo from './DetallesPsicologo';
import DetallesRecepcionista from './DetallesRecepcionista';

type Usuario = Psicologo | Recepcionista;

interface TablaUsuariosProps {
  psicologos: Psicologo[];
  recepcionistas: Recepcionista[];
  onEditar: (usuario: Usuario) => void;
  onDesactivar: (id: string, tipo: 'psicologo' | 'recepcionista') => void;
  onReactivar: (id: string, tipo: 'psicologo' | 'recepcionista') => void;
  onEliminar: (id: string, tipo: 'psicologo' | 'recepcionista') => void;
  onEliminarCita: (citaId: string) => Promise<void>;
  onReasignarPaciente: (pacienteId: string, nuevoPsicologoId: string) => Promise<void>;
}

const TablaUsuarios: React.FC<TablaUsuariosProps> = ({
  psicologos,
  recepcionistas,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminar,
  onEliminarCita,
  onReasignarPaciente
}) => {
  const [selectedPsicologo, setSelectedPsicologo] = useState<Psicologo | null>(null);
  const [selectedRecepcionista, setSelectedRecepcionista] = useState<Recepcionista | null>(null);
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

  const obtenerIniciales = (nombres: string, apellidos: string) => {
    const inicialNombre = nombres.charAt(0).toUpperCase();
    const inicialApellido = apellidos.charAt(0).toUpperCase();
    return `${inicialNombre}${inicialApellido}`;
  };

  const obtenerCargo = (usuario: Usuario): 'Psicólogo' | 'Recepcionista' => {
    return 'especialidad' in usuario ? 'Psicólogo' : 'Recepcionista';
  };

  const obtenerTipoUsuario = (usuario: Usuario): 'psicologo' | 'recepcionista' => {
    return 'especialidad' in usuario ? 'psicologo' : 'recepcionista';
  };

  // Combinar psicólogos y recepcionistas en una sola lista
  const usuarios = [
    ...psicologos.map(p => ({ ...p, tipo: 'psicologo' as const })),
    ...recepcionistas.map(r => ({ ...r, tipo: 'recepcionista' as const }))
  ];

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando el primer usuario del sistema.
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
                  Nombre
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/8">
                  Cargo
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/6">
                  Contacto
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-1/5">
                  Especialidad
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
              {usuarios?.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-25">
                  <td className="px-3 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {usuario.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={usuario.avatar_url}
                            alt={`${usuario.nombres} ${usuario.apellidos}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm">
                            {obtenerIniciales(usuario.nombres, usuario.apellidos)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatearGenero(usuario.genero)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      obtenerCargo(usuario) === 'Psicólogo' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {obtenerCargo(usuario)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                    <div className="text-sm text-gray-500">
                      {usuario.telefono || 'Sin teléfono'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      {usuario.tipo === 'psicologo' 
                        ? truncarEspecialidad(usuario.especialidad || '')
                        : 'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {!usuario.email_verificado && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mt-1">
                          Email no verificado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      {formatearUltimoAcceso(usuario.ultimo_acceso)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      {formatearFecha(usuario.created_at)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center space-x-1">
                      {/* Botón Detalles - Para ambos tipos de usuarios */}
                      <button
                        onClick={() => {
                          if (usuario.tipo === 'psicologo') {
                            setSelectedPsicologo(usuario as Psicologo);
                          } else {
                            setSelectedRecepcionista(usuario as Recepcionista);
                          }
                          setShowDetalles(true);
                        }}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                      >
                        Detalles
                      </button>
                      
                      <button
                        onClick={() => onEditar(usuario)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Editar
                      </button>
                      
                      {usuario.activo ? (
                        <button
                          onClick={() => onDesactivar(usuario.id, usuario.tipo)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => onReactivar(usuario.id, usuario.tipo)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          Reactivar
                        </button>
                      )}
                      
                      <button
                        onClick={() => onEliminar(usuario.id, usuario.tipo)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
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

      {/* Modal de Detalles - Para psicólogos y recepcionistas */}
      {showDetalles && selectedPsicologo && (
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
      
      {showDetalles && selectedRecepcionista && (
        <DetallesRecepcionista
          recepcionista={selectedRecepcionista}
          onClose={() => {
            setShowDetalles(false);
            setSelectedRecepcionista(null);
          }}
        />
      )}
    </>
  );
};

export default TablaUsuarios; 
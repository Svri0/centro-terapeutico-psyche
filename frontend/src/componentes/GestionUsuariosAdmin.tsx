import React, { useState, useEffect } from 'react';
import { adminService } from '../servicios/admin.service';

interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: string;
  rol_id: number;
  activo: boolean;
  fecha_creacion: string;
  ultimo_acceso?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  // Campos específicos de pacientes
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones?: string;
  psicologo_asignado?: string;
}

interface GestionUsuariosAdminProps {
  tipoUsuario?: 'pacientes' | 'recepcionistas' | 'todos';
}

const GestionUsuariosAdmin: React.FC<GestionUsuariosAdminProps> = ({ tipoUsuario = 'todos' }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para filtros
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    rol_id: tipoUsuario === 'pacientes' ? 3 : tipoUsuario === 'recepcionistas' ? 4 : 2,
    activo: true,
    especialidad: '',
    descripcion: '',
    // Campos específicos de pacientes
    rut: '',
    direccion: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones: ''
  });

  const roles = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
    { id: 2, nombre: 'Psicólogo', descripcion: 'Gestión de pacientes y sesiones' },
    { id: 3, nombre: 'Paciente', descripcion: 'Acceso limitado a su información' },
    { id: 4, nombre: 'Recepcionista', descripcion: 'Gestión de agenda y pagos' }
  ];

  useEffect(() => {
    cargarUsuarios();
  }, [filtroRol, filtroEstado, tipoUsuario]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada al servicio de usuarios
      // const response = await usuariosService.obtenerTodos({
      //   rol: filtroRol,
      //   activo: filtroEstado,
      //   tipo: tipoUsuario
      // });
      // setUsuarios(response.data);
      
      // Datos de ejemplo - filtrar según tipoUsuario
      const todosUsuarios = [
        {
          id: '1',
          nombres: 'María',
          apellidos: 'González',
          email: 'maria.gonzalez@centro.com',
          telefono: '+56912345678',
          rol: 'psicologo',
          rol_id: 2,
          activo: true,
          fecha_creacion: '2024-01-15',
          especialidad: 'Psicología Clínica',
          descripcion: 'Especialista en terapia cognitivo-conductual'
        },
        {
          id: '2',
          nombres: 'Carlos',
          apellidos: 'Rodríguez',
          email: 'carlos.rodriguez@centro.com',
          telefono: '+56987654321',
          rol: 'psicologo',
          rol_id: 2,
          activo: true,
          fecha_creacion: '2024-01-10',
          especialidad: 'Terapia Familiar',
          descripcion: 'Especialista en terapia sistémica'
        },
        {
          id: '3',
          nombres: 'Ana',
          apellidos: 'Silva',
          email: 'ana.silva@centro.com',
          telefono: '+56911223344',
          rol: 'recepcionista',
          rol_id: 4,
          activo: true,
          fecha_creacion: '2024-01-20',
          ultimo_acceso: '2024-01-20T10:30:00'
        },
        {
          id: '5',
          nombres: 'Pedro',
          apellidos: 'Martínez',
          email: 'pedro.martinez@centro.com',
          telefono: '+56922334455',
          rol: 'recepcionista',
          rol_id: 4,
          activo: true,
          fecha_creacion: '2024-01-22',
          ultimo_acceso: '2024-01-22T14:15:00'
        },
        {
          id: '4',
          nombres: 'Juan',
          apellidos: 'Pérez',
          email: 'juan.perez@email.com',
          telefono: '+56955667788',
          rol: 'paciente',
          rol_id: 3,
          activo: true,
          fecha_creacion: '2024-01-18',
          rut: '12.345.678-9',
          direccion: 'Av. Principal 123, Santiago',
          contacto_emergencia_nombre: 'María Pérez',
          contacto_emergencia_telefono: '+56999887766',
          contacto_emergencia_relacion: 'Madre',
          observaciones: 'Paciente nuevo, requiere evaluación inicial',
          psicologo_asignado: 'Dr. María González'
        },
        {
          id: '6',
          nombres: 'Sofía',
          apellidos: 'López',
          email: 'sofia.lopez@email.com',
          telefono: '+56966778899',
          rol: 'paciente',
          rol_id: 3,
          activo: true,
          fecha_creacion: '2024-01-19',
          rut: '98.765.432-1',
          direccion: 'Calle Secundaria 456, Santiago',
          contacto_emergencia_nombre: 'Carlos López',
          contacto_emergencia_telefono: '+56988776655',
          contacto_emergencia_relacion: 'Padre',
          observaciones: 'Paciente en tratamiento',
          psicologo_asignado: 'Dr. Carlos Rodríguez'
        }
      ];

      // Filtrar usuarios según el tipo
      let usuariosFiltrados = todosUsuarios;
      if (tipoUsuario === 'pacientes') {
        usuariosFiltrados = todosUsuarios.filter(u => u.rol_id === 3);
      } else if (tipoUsuario === 'recepcionistas') {
        usuariosFiltrados = todosUsuarios.filter(u => u.rol_id === 4);
      }

      setUsuarios(usuariosFiltrados);
    } catch (error) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      // TODO: Implementar llamada al servicio para crear/editar usuario
      // if (selectedUsuario) {
      //   await usuariosService.actualizar(selectedUsuario.id, formData);
      //   setSuccess('Usuario actualizado exitosamente');
      // } else {
      //   await usuariosService.crear(formData);
      //   setSuccess('Usuario creado exitosamente');
      // }
      
      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      cargarUsuarios();
    } catch (error: any) {
      setError(error.message || 'Error al procesar usuario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      password: '',
      rol_id: tipoUsuario === 'pacientes' ? 3 : tipoUsuario === 'recepcionistas' ? 4 : 2,
      activo: true,
      especialidad: '',
      descripcion: '',
      rut: '',
      direccion: '',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      contacto_emergencia_relacion: '',
      observaciones: ''
    });
    setSelectedUsuario(null);
  };

  const cambiarEstadoUsuario = async (usuarioId: string, nuevoEstado: boolean) => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al servicio para cambiar estado
      // await usuariosService.cambiarEstado(usuarioId, nuevoEstado);
      setSuccess(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      cargarUsuarios();
    } catch (error: any) {
      setError(error.message || 'Error al cambiar estado del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (usuarioId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        
        // Encontrar el usuario para determinar su rol
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }
        
        // Eliminar según el rol del usuario
        if (usuario.rol_id === 2) {
          // Es psicólogo
          await adminService.eliminarPsicologo(usuarioId);
        } else if (usuario.rol_id === 3) {
          // Es recepcionista
          await adminService.eliminarRecepcionista(usuarioId);
        } else if (usuario.rol_id === 4) {
          // Es paciente
          await adminService.eliminarPaciente(usuarioId);
        } else {
          throw new Error('Tipo de usuario no soportado para eliminación');
        }
        
        // Actualizar la lista local
        setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
        
        setSuccess('Usuario eliminado correctamente');
      } catch (error: any) {
        setError(error.message || 'Error al eliminar usuario');
      } finally {
        setLoading(false);
      }
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'psicologo': return 'bg-blue-100 text-blue-800';
      case 'paciente': return 'bg-green-100 text-green-800';
      case 'recepcionista': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (activo: boolean) => {
    return activo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    if (searchTerm && !usuario.nombres.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !usuario.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !usuario.rut?.includes(searchTerm)) {
      return false;
    }
    return true;
  });

  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    psicologos: usuarios.filter(u => u.rol_id === 2).length,
    pacientes: usuarios.filter(u => u.rol_id === 3).length,
    recepcionistas: usuarios.filter(u => u.rol_id === 4).length
  };

  // Título dinámico según el tipo de usuario
  const getTitulo = () => {
    switch (tipoUsuario) {
      case 'pacientes': return 'Gestión de Pacientes';
      case 'recepcionistas': return 'Gestión de Recepcionistas';
      default: return 'Gestión de Usuarios';
    }
  };

  const getDescripcion = () => {
    switch (tipoUsuario) {
      case 'pacientes': return 'Administra la información de los pacientes del centro';
      case 'recepcionistas': return 'Administra las cuentas de recepcionistas del sistema';
      default: return 'Administra todos los usuarios del sistema';
    }
  };

  const getTituloColumnaUsuario = () => {
    switch (tipoUsuario) {
      case 'pacientes': return 'Paciente';
      case 'recepcionistas': return 'Recepcionista';
      default: return 'Usuario';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getTitulo()}</h2>
          <p className="text-gray-600">{getDescripcion()}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {tipoUsuario === 'pacientes' ? '+ Nuevo Paciente' : 
           tipoUsuario === 'recepcionistas' ? '+ Nuevo Recepcionista' : 
           '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Estadísticas */}
      <div className={`grid grid-cols-1 md:grid-cols-${tipoUsuario === 'todos' ? '5' : '3'} gap-4`}>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{estadisticas.total}</div>
          <div className="text-sm text-gray-600">
            {tipoUsuario === 'pacientes' ? 'Total Pacientes' : 
             tipoUsuario === 'recepcionistas' ? 'Total Recepcionistas' : 
             'Total Usuarios'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{estadisticas.activos}</div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{estadisticas.total - estadisticas.activos}</div>
          <div className="text-sm text-gray-600">Inactivos</div>
        </div>
        {tipoUsuario === 'todos' && (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.psicologos}</div>
              <div className="text-sm text-gray-600">Psicólogos</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.recepcionistas}</div>
              <div className="text-sm text-gray-600">Recepcionistas</div>
            </div>
          </>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className={`grid grid-cols-1 md:grid-cols-${tipoUsuario === 'todos' ? '4' : '3'} gap-4`}>
          {tipoUsuario === 'todos' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, email o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={cargarUsuarios}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {getTituloColumnaUsuario()}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {usuario.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={usuario.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          {usuario.rut || 'Sin RUT'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                    <div className="text-sm text-gray-500">{usuario.telefono || 'Sin teléfono'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(usuario.activo)}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.fecha_creacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUsuario(usuario);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-1 text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-md transition-colors"
                      >
                        Detalles
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUsuario(usuario);
                          setFormData({
                            nombres: usuario.nombres,
                            apellidos: usuario.apellidos,
                            email: usuario.email,
                            telefono: usuario.telefono || '',
                            password: '',
                            rol_id: usuario.rol_id,
                            activo: usuario.activo,
                            especialidad: usuario.especialidad || '',
                            descripcion: usuario.descripcion || '',
                            rut: usuario.rut || '',
                            direccion: usuario.direccion || '',
                            contacto_emergencia_nombre: usuario.contacto_emergencia_nombre || '',
                            contacto_emergencia_telefono: usuario.contacto_emergencia_telefono || '',
                            contacto_emergencia_relacion: usuario.contacto_emergencia_relacion || '',
                            observaciones: usuario.observaciones || ''
                          });
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => cambiarEstadoUsuario(usuario.id, !usuario.activo)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          usuario.activo 
                            ? 'text-white bg-red-500 hover:bg-red-600' 
                            : 'text-white bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {usuario.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleEliminar(usuario.id)}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
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

      {/* Modal de Creación/Edición */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {showCreateModal ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      value={formData.nombres}
                      onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {showCreateModal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={showCreateModal}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      value={formData.rol_id}
                      onChange={(e) => setFormData({ ...formData, rol_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {tipoUsuario === 'pacientes' ? (
                        <option value={3}>Paciente</option>
                      ) : tipoUsuario === 'recepcionistas' ? (
                        <option value={4}>Recepcionista</option>
                      ) : (
                        roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="activo" className="text-sm text-gray-700">
                      Usuario activo
                    </label>
                  </div>
                </div>

                {/* Campos específicos para psicólogos */}
                {formData.rol_id === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        value={formData.especialidad}
                        onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Psicología Clínica, Terapia Familiar..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descripción profesional..."
                      />
                    </div>
                  </>
                )}

                {/* Campos específicos para pacientes */}
                {formData.rol_id === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RUT
                      </label>
                      <input
                        type="text"
                        value={formData.rut}
                        onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="12.345.678-9"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dirección completa..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contacto Emergencia
                        </label>
                        <input
                          type="text"
                          value={formData.contacto_emergencia_nombre}
                          onChange={(e) => setFormData({ ...formData, contacto_emergencia_nombre: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono Emergencia
                        </label>
                        <input
                          type="tel"
                          value={formData.contacto_emergencia_telefono}
                          onChange={(e) => setFormData({ ...formData, contacto_emergencia_telefono: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+56912345678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relación
                        </label>
                        <input
                          type="text"
                          value={formData.contacto_emergencia_relacion}
                          onChange={(e) => setFormData({ ...formData, contacto_emergencia_relacion: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Madre, Padre, Esposo/a..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </>
                )}

                {/* Mensajes de Error y Éxito */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Procesando...' : (showCreateModal ? 'Crear Usuario' : 'Actualizar Usuario')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedUsuario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Usuario
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    {selectedUsuario.avatar_url ? (
                      <img className="h-16 w-16 rounded-full" src={selectedUsuario.avatar_url} alt="" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-700">
                          {selectedUsuario.nombres.charAt(0)}{selectedUsuario.apellidos.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUsuario.nombres} {selectedUsuario.apellidos}
                    </h4>
                    <p className="text-gray-600">{selectedUsuario.email}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolColor(selectedUsuario.rol)}`}>
                        {roles.find(r => r.id === selectedUsuario.rol_id)?.nombre || selectedUsuario.rol}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(selectedUsuario.activo)}`}>
                        {selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-gray-900">{selectedUsuario.telefono || 'No registrado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RUT</label>
                    <p className="text-gray-900">{selectedUsuario.rut || 'No registrado'}</p>
                  </div>
                </div>

                {selectedUsuario.especialidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                    <p className="text-gray-900">{selectedUsuario.especialidad}</p>
                  </div>
                )}

                {selectedUsuario.descripcion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-900">{selectedUsuario.descripcion}</p>
                  </div>
                )}

                {selectedUsuario.direccion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <p className="text-gray-900">{selectedUsuario.direccion}</p>
                  </div>
                )}

                {selectedUsuario.contacto_emergencia_nombre && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia</label>
                    <p className="text-gray-900">
                      {selectedUsuario.contacto_emergencia_nombre} - {selectedUsuario.contacto_emergencia_telefono}
                    </p>
                    <p className="text-sm text-gray-500">
                      Relación: {selectedUsuario.contacto_emergencia_relacion}
                    </p>
                  </div>
                )}

                {selectedUsuario.observaciones && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                    <p className="text-gray-900">{selectedUsuario.observaciones}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                    <p className="text-gray-900">
                      {new Date(selectedUsuario.fecha_creacion).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Último Acceso</label>
                    <p className="text-gray-900">
                      {selectedUsuario.ultimo_acceso 
                        ? new Date(selectedUsuario.ultimo_acceso).toLocaleDateString('es-CL')
                        : 'Nunca'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedUsuario(selectedUsuario);
                    setFormData({
                      nombres: selectedUsuario.nombres,
                      apellidos: selectedUsuario.apellidos,
                      email: selectedUsuario.email,
                      telefono: selectedUsuario.telefono || '',
                      password: '',
                      rol_id: selectedUsuario.rol_id,
                      activo: selectedUsuario.activo,
                      especialidad: selectedUsuario.especialidad || '',
                      descripcion: selectedUsuario.descripcion || '',
                      rut: selectedUsuario.rut || '',
                      direccion: selectedUsuario.direccion || '',
                      contacto_emergencia_nombre: selectedUsuario.contacto_emergencia_nombre || '',
                      contacto_emergencia_telefono: selectedUsuario.contacto_emergencia_telefono || '',
                      contacto_emergencia_relacion: selectedUsuario.contacto_emergencia_relacion || '',
                      observaciones: selectedUsuario.observaciones || ''
                    });
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuariosAdmin;

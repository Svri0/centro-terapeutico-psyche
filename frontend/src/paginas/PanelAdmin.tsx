import React, { useState, useEffect } from 'react';
import { Psicologo, Recepcionista } from '../servicios/admin.service';
import { adminService } from '../servicios/admin.service';
import { authService } from '../servicios/auth.service';
import TablaUsuarios from '../componentes/TablaUsuarios';
import ModalCrearPsicologo from '../componentes/ModalCrearPsicologo';
import ModalEditarPsicologo from '../componentes/ModalEditarPsicologo';
import ModalCrearRecepcionista from '../componentes/ModalCrearRecepcionista';
import Logo from '../componentes/Logo';

const PanelAdmin: React.FC = () => {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [recepcionistas, setRecepcionistas] = useState<Recepcionista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showCrearRecepcionistaModal, setShowCrearRecepcionistaModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'desactivar' | 'reactivar' | 'eliminar';
    id: string;
    nombre: string;
    tipo: 'psicologo' | 'recepcionista';
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  } | null>(null);
  const [notificationExiting, setNotificationExiting] = useState(false);
  
  // Estados para validación de confirmación
  const [confirmText, setConfirmText] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [confirmEliminarCheckbox, setConfirmEliminarCheckbox] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Debug para el modal de cambiar contraseña
  useEffect(() => {
    console.log('🔍 Estado showChangePassword cambiado:', showChangePassword);
  }, [showChangePassword]);

  // Efecto para ocultar notificaciones después de 3 segundos
  useEffect(() => {
    if (notification?.visible) {
      const timer = setTimeout(() => {
        setNotificationExiting(true);
        setTimeout(() => {
          setNotification(null);
          setNotificationExiting(false);
        }, 500); // Tiempo de la animación de salida
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error') => {
    setNotification({
      message: mensaje,
      type: tipo,
      visible: true
    });
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      console.log('🔍 Intentando cargar usuarios...');
      console.log('🔍 Token:', localStorage.getItem('token'));
      console.log('🔍 Usuario:', localStorage.getItem('user'));
      
      // Cargar psicólogos y recepcionistas en paralelo
      const [psicologosData, recepcionistasData] = await Promise.all([
        adminService.obtenerPsicologos(),
        adminService.obtenerRecepcionistas()
      ]);
      
      console.log('🔍 Psicólogos cargados:', psicologosData);
      console.log('🔍 Recepcionistas cargados:', recepcionistasData);
      
      setPsicologos(psicologosData);
      setRecepcionistas(recepcionistasData);
    } catch (error: any) {
      console.error('❌ Error al cargar usuarios:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPsicologo = async (data: any, avatar?: File | null) => {
    try {
      await adminService.crearPsicologo(data, avatar || undefined);
      setShowCrearModal(false);
      cargarUsuarios();
      mostrarNotificacion('Psicólogo creado exitosamente', 'success');
    } catch (error: any) {
      setError(error.message);
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleCrearRecepcionista = async (data: any, avatar?: File | null) => {
    try {
      await adminService.crearRecepcionista(data, avatar || undefined);
      setShowCrearRecepcionistaModal(false);
      cargarUsuarios();
      mostrarNotificacion('Recepcionista creada exitosamente', 'success');
    } catch (error: any) {
      setError(error.message);
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleEditarPsicologo = async (id: string, data: any, avatar?: File | null) => {
    try {
      await adminService.actualizarPsicologo(id, data, avatar || undefined);
      setShowEditarModal(false);
      setPsicologoSeleccionado(null);
      cargarUsuarios();
      mostrarNotificacion('Psicólogo actualizado exitosamente', 'success');
    } catch (error: any) {
      setError(error.message);
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleDesactivarUsuario = async (id: string, tipo: 'psicologo' | 'recepcionista') => {
    if (isConfirming) return;
    let usuario;
    if (tipo === 'psicologo') {
      usuario = psicologos.find(p => p.id === id);
    } else {
      usuario = recepcionistas.find(r => r.id === id);
    }
    
    if (usuario) {
      setConfirmAction({
        type: 'desactivar',
        id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        tipo
      });
      setShowConfirmModal(true);
      setConfirmText('');
      setConfirmError('');
      setConfirmCheckbox(false);
    }
  };

  const handleReactivarUsuario = async (id: string, tipo: 'psicologo' | 'recepcionista') => {
    if (isConfirming) return;
    let usuario;
    if (tipo === 'psicologo') {
      usuario = psicologos.find(p => p.id === id);
    } else {
      usuario = recepcionistas.find(r => r.id === id);
    }
    
    if (usuario) {
      setConfirmAction({
        type: 'reactivar',
        id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        tipo
      });
      setShowConfirmModal(true);
      setConfirmText('');
      setConfirmError('');
      setConfirmCheckbox(false);
    }
  };

  const handleEliminarUsuario = async (id: string, tipo: 'psicologo' | 'recepcionista') => {
    if (isConfirming) return;
    let usuario;
    if (tipo === 'psicologo') {
      usuario = psicologos.find(p => p.id === id);
    } else {
      usuario = recepcionistas.find(r => r.id === id);
    }
    
    if (usuario) {
      setConfirmAction({
        type: 'eliminar',
        id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        tipo
      });
      setShowConfirmModal(true);
      setConfirmText('');
      setConfirmError('');
      setConfirmCheckbox(false);
      setConfirmEliminarCheckbox(false);
    }
  };

  const handleEliminarCita = async (citaId: string) => {
    try {
      await adminService.eliminarCita(citaId);
      setNotification({
        message: 'Cita eliminada exitosamente',
        type: 'success',
        visible: true
      });
    } catch (error: any) {
      setNotification({
        message: error.message || 'Error al eliminar la cita',
        type: 'error',
        visible: true
      });
    }
  };

  const handleReasignarPaciente = async (pacienteId: string, nuevoPsicologoId: string) => {
    try {
      await adminService.reasignarPaciente(pacienteId, nuevoPsicologoId);
      setNotification({
        message: 'Paciente reasignado exitosamente',
        type: 'success',
        visible: true
      });
    } catch (error: any) {
      setNotification({
        message: error.message || 'Error al reasignar el paciente',
        type: 'error',
        visible: true
      });
    }
  };

  const confirmarAccion = async () => {
    if (isConfirming || !confirmAction) return;
    
    // Validar que el texto sea exactamente "confirmar" para desactivar y eliminar
    if (confirmAction.type === 'desactivar' || confirmAction.type === 'eliminar') {
      if (confirmText.toLowerCase() !== 'confirmar') {
        setConfirmError('Debes escribir exactamente "confirmar" para continuar');
        return;
      }
    }
    
    // Validar checkbox para reactivar
    if (confirmAction.type === 'reactivar' && !confirmCheckbox) {
      setConfirmError('Debes marcar la casilla de confirmación para continuar');
      return;
    }
    
    // Validar checkbox para eliminar
    if (confirmAction.type === 'eliminar' && !confirmEliminarCheckbox) {
      setConfirmError('Debes marcar la casilla de confirmación para continuar');
      return;
    }
    
    setIsConfirming(true);
    
    try {
      if (confirmAction.type === 'desactivar') {
        if (confirmAction.tipo === 'psicologo') {
          await adminService.desactivarPsicologo(confirmAction.id);
        } else {
          await adminService.desactivarRecepcionista(confirmAction.id);
        }
        setNotification({
          message: `La cuenta del ${confirmAction.tipo === 'psicologo' ? 'psicólogo' : 'recepcionista'} ${confirmAction.nombre} ha sido desactivada correctamente`,
          type: 'success',
          visible: true
        });
      } else if (confirmAction.type === 'reactivar') {
        if (confirmAction.tipo === 'psicologo') {
          await adminService.activarPsicologo(confirmAction.id);
        } else {
          await adminService.activarRecepcionista(confirmAction.id);
        }
        setNotification({
          message: `La cuenta del ${confirmAction.tipo === 'psicologo' ? 'psicólogo' : 'recepcionista'} ${confirmAction.nombre} ha sido reactivada correctamente`,
          type: 'success',
          visible: true
        });
      } else if (confirmAction.type === 'eliminar') {
        if (confirmAction.tipo === 'psicologo') {
          await adminService.eliminarPsicologo(confirmAction.id);
        } else {
          await adminService.eliminarRecepcionista(confirmAction.id);
        }
        setNotification({
          message: `La cuenta del ${confirmAction.tipo === 'psicologo' ? 'psicólogo' : 'recepcionista'} ${confirmAction.nombre} ha sido eliminada correctamente`,
          type: 'success',
          visible: true
        });
      }
      
      cargarUsuarios();
      setShowConfirmModal(false);
      setConfirmText('');
      setConfirmError('');
      setConfirmCheckbox(false);
      setConfirmEliminarCheckbox(false);
    } catch (error: any) {
      setNotification({
        message: error.message || 'Error al procesar la acción',
        type: 'error',
        visible: true
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const cancelarAccion = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmCheckbox(false);
    setConfirmEliminarCheckbox(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('La nueva contraseña debe tener al menos 8 caracteres');
      setPasswordLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setMessage('Contraseña cambiada exitosamente');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setMessage(error.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const abrirModalEditar = (usuario: Psicologo | Recepcionista) => {
    // Por ahora solo manejamos edición de psicólogos
    if ('especialidad' in usuario) {
      setPsicologoSeleccionado(usuario as Psicologo);
      setShowEditarModal(true);
    } else {
      // TODO: Implementar modal de editar recepcionista
      mostrarNotificacion('Funcionalidad de editar recepcionista en desarrollo', 'error');
    }
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img src="/src/img/psyche.svg" alt="de psyche" className="h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-light text-gray-800 tracking-widest uppercase">
                  Panel de Administración
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">Gestión del Sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Bienvenido, {user.nombres} {user.apellidos}
              </div>
              <button
                onClick={() => {
                  console.log('🔍 Botón Cambiar Contraseña clickeado');
                  setShowChangePassword(true);
                }}
                className="text-sm text-amber-600 hover:text-amber-800 transition-colors"
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-6">
        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-widest uppercase">Gestión de Usuarios</h2>
              <p className="mt-1 text-xs font-semibold text-gray-600 tracking-widest uppercase">
                Administra las cuentas de psicólogos y recepcionistas del sistema
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCrearModal(true)}
                className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
              >
                <svg className="w-4 h-4 mr-2 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Psicólogo
              </button>
              <button
                onClick={() => setShowCrearRecepcionistaModal(true)}
                className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-800 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
              >
                <svg className="w-4 h-4 mr-2 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nueva Recepcionista
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
                     {loading ? (
             <div className="flex justify-center items-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
               <span className="ml-2 text-amber-600 text-sm tracking-wide">Cargando usuarios...</span>
             </div>
           ) : (
             <TablaUsuarios
               psicologos={psicologos}
               recepcionistas={recepcionistas}
               onEditar={abrirModalEditar}
               onDesactivar={handleDesactivarUsuario}
               onReactivar={handleReactivarUsuario}
               onEliminar={handleEliminarUsuario}
               onEliminarCita={handleEliminarCita}
               onReasignarPaciente={handleReasignarPaciente}
             />
           )}
        </div>
      </main>

      {/* Modals */}
      {showCrearModal && (
        <ModalCrearPsicologo
          onClose={() => setShowCrearModal(false)}
          onSubmit={handleCrearPsicologo}
        />
      )}

      {showCrearRecepcionistaModal && (
        <ModalCrearRecepcionista
          onClose={() => setShowCrearRecepcionistaModal(false)}
          onSubmit={handleCrearRecepcionista}
        />
      )}

      {showEditarModal && psicologoSeleccionado && (
        <ModalEditarPsicologo
          psicologo={psicologoSeleccionado}
          onClose={() => {
            setShowEditarModal(false);
            setPsicologoSeleccionado(null);
          }}
          onSubmit={(data) => handleEditarPsicologo(psicologoSeleccionado.id, data)}
        />
      )}

      {/* Modal Cambiar Contraseña */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999] animate-fade-in">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white animate-slide-in-right shadow-glow">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {message && (
                  <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </p>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md hover-scale transition-transform duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 hover-scale transition-transform duration-200"
                  >
                    {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9998] animate-fade-in">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white animate-slide-in-right shadow-glow">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Acción</h3>
                             <p className="text-sm text-gray-700 mb-4">
                 ¿Estás seguro de que quieres {confirmAction.type === 'desactivar' ? 'desactivar' : confirmAction.type === 'reactivar' ? 'reactivar' : 'eliminar'} el {confirmAction.tipo === 'psicologo' ? 'psicólogo' : 'recepcionista'} "{confirmAction.nombre}"?
               </p>
              
              {/* Campo de confirmación para desactivar y eliminar */}
              {(confirmAction.type === 'desactivar' || confirmAction.type === 'eliminar') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escribe "confirmar" para continuar:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      if (confirmError) setConfirmError('');
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      confirmError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="confirmar"
                    disabled={isConfirming}
                  />
                  {confirmError && (
                    <p className="mt-1 text-sm text-red-600">{confirmError}</p>
                  )}
                </div>
              )}
              
              {/* Checkbox de confirmación para reactivar */}
              {confirmAction.type === 'reactivar' && (
                <div className="mb-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="confirm-checkbox"
                        type="checkbox"
                        checked={confirmCheckbox}
                        onChange={(e) => {
                          setConfirmCheckbox(e.target.checked);
                          if (confirmError) setConfirmError('');
                        }}
                        disabled={isConfirming}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                                             <label htmlFor="confirm-checkbox" className="font-medium text-gray-700">
                         Estoy seguro/a de reactivar la cuenta del {confirmAction.tipo === 'psicologo' ? 'psicólogo' : 'recepcionista'} {confirmAction.nombre}
                       </label>
                    </div>
                  </div>
                  {confirmError && (
                    <p className="mt-1 text-sm text-red-600">{confirmError}</p>
                  )}
                </div>
              )}
              
              {/* Checkbox de confirmación para eliminar */}
              {confirmAction.type === 'eliminar' && (
                <div className="mb-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="confirm-eliminar-checkbox"
                        type="checkbox"
                        checked={confirmEliminarCheckbox}
                        onChange={(e) => {
                          setConfirmEliminarCheckbox(e.target.checked);
                          if (confirmError) setConfirmError('');
                        }}
                        disabled={isConfirming}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                                             <label htmlFor="confirm-eliminar-checkbox" className="font-medium text-gray-700">
                         ¿Estás seguro/a que quieres <span className="text-red-600 font-bold">eliminar</span> de los registros al {confirmAction.tipo === 'psicologo' ? 'psicólogo/a' : 'recepcionista'} <span className="font-bold">{confirmAction.nombre}</span> para siempre?
                       </label>
                    </div>
                  </div>
                  {confirmError && (
                    <p className="mt-1 text-sm text-red-600">{confirmError}</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelarAccion}
                  disabled={isConfirming}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover-scale transition-transform duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAccion}
                  disabled={isConfirming || 
                    (confirmAction.type === 'desactivar' && confirmText.toLowerCase() !== 'confirmar') ||
                    (confirmAction.type === 'eliminar' && !confirmEliminarCheckbox) ||
                    (confirmAction.type === 'reactivar' && !confirmCheckbox)
                  }
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover-scale transition-transform duration-200 ${
                    confirmAction.type === 'desactivar'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmAction.type === 'reactivar'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isConfirming ? 'Procesando...' : confirmAction.type === 'desactivar' ? 'Desactivar' : confirmAction.type === 'reactivar' ? 'Reactivar' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 shadow-glow ${
          notificationExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}>
          <div className={`px-6 py-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-500 ease-out hover-scale ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800 shadow-green-100' 
              : 'bg-red-50 border-red-400 text-red-800 shadow-red-100'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0 animate-fade-in">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 animate-fade-in">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelAdmin; 
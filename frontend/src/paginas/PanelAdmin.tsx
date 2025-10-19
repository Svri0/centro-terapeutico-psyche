import React, { useState, useEffect } from 'react';
import { Psicologo } from '../servicios/admin.service';
import { adminService } from '../servicios/admin.service';
import { authService } from '../servicios/auth.service';
import TablaPsicologos from '../componentes/TablaPsicologos';
import TablaRecepcionistas from '../componentes/TablaRecepcionistas';
import TablaPacientes from '../componentes/TablaPacientes';
import TablaAuditoria from '../componentes/TablaAuditoria';
import ModalCrearPsicologo from '../componentes/ModalCrearPsicologo';
import ModalCrearRecepcionista from '../componentes/ModalCrearRecepcionista';
import ModalCrearPaciente from '../componentes/ModalCrearPaciente';
import ModalEditarPsicologo from '../componentes/ModalEditarPsicologo';
import Logo from '../componentes/Logo';
import ChatAdmin from '../componentes/ChatAdmin';

const PanelAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'psicologos' | 'pacientes' | 'recepcionistas' | 'chat' | 'auditoria'>('psicologos');
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [recepcionistas, setRecepcionistas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showCrearRecepcionistaModal, setShowCrearRecepcionistaModal] = useState(false);
  const [showCrearPacienteModal, setShowCrearPacienteModal] = useState(false);
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
    if (activeTab === 'psicologos') {
      cargarPsicologos();
    } else if (activeTab === 'recepcionistas') {
      cargarRecepcionistas();
    } else if (activeTab === 'pacientes') {
      cargarPacientes();
    }
  }, [activeTab]);

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

  const cargarPsicologos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Intentando cargar psicólogos...');
      console.log('🔍 Token:', localStorage.getItem('token'));
      console.log('🔍 Usuario:', localStorage.getItem('user'));
      const data = await adminService.obtenerPsicologos();
      console.log('🔍 Psicólogos cargados:', data);
      setPsicologos(data);
    } catch (error: any) {
      console.error('❌ Error al cargar psicólogos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarRecepcionistas = async () => {
    try {
      setLoading(true);
      const data = await adminService.obtenerRecepcionistas();
      setRecepcionistas(data);
    } catch (error: any) {
      console.error('❌ Error al cargar recepcionistas:', error);
      setError(error.message || 'Error al cargar recepcionistas');
    } finally {
      setLoading(false);
    }
  };

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const data = await adminService.obtenerTodosPacientes();
      setPacientes(data);
    } catch (error: any) {
      console.error('❌ Error al cargar pacientes:', error);
      setError(error.message || 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPsicologo = async (data: any, avatar?: File | null) => {
    try {
      await adminService.crearPsicologo(data, avatar || undefined);
      setShowCrearModal(false);
      cargarPsicologos();
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
      cargarRecepcionistas();
      mostrarNotificacion('Recepcionista creado exitosamente', 'success');
    } catch (error: any) {
      setError(error.message);
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleCrearPaciente = async (data: any, avatar?: File | null) => {
    try {
      await adminService.crearPaciente(data);
      setShowCrearPacienteModal(false);
      cargarPacientes();
      mostrarNotificacion('Paciente creado exitosamente', 'success');
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
      cargarPsicologos();
      mostrarNotificacion('Psicólogo actualizado exitosamente', 'success');
    } catch (error: any) {
      setError(error.message);
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleDesactivarPsicologo = async (id: string) => {
    if (isConfirming) return;
    const psicologo = psicologos.find(p => p.id === id);
    if (psicologo) {
      setConfirmAction({
        type: 'desactivar',
        id,
        nombre: `${psicologo.nombres} ${psicologo.apellidos}`
      });
      setShowConfirmModal(true);
      setConfirmText('');
      setConfirmError('');
      setConfirmCheckbox(false);
    }
  };

  const handleReactivarPsicologo = async (id: string) => {
    if (isConfirming) return;
    const psicologo = psicologos.find(p => p.id === id);
    if (psicologo) {
      setConfirmAction({
        type: 'reactivar',
        id,
        nombre: `${psicologo.nombres} ${psicologo.apellidos}`
      });
      setShowConfirmModal(true);
      setConfirmText('');
      setConfirmError('');
      setConfirmCheckbox(false);
    }
  };

  const handleEliminarPsicologo = async (id: string) => {
    if (isConfirming) return;
    const psicologo = psicologos.find(p => p.id === id);
    if (psicologo) {
      setConfirmAction({
        type: 'eliminar',
        id,
        nombre: `${psicologo.nombres} ${psicologo.apellidos}`
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
        await adminService.desactivarPsicologo(confirmAction.id);
        setNotification({
          message: `La cuenta del psicólogo ${confirmAction.nombre} ha sido desactivada correctamente`,
          type: 'success',
          visible: true
        });
      } else if (confirmAction.type === 'reactivar') {
        await adminService.activarPsicologo(confirmAction.id);
        setNotification({
          message: `La cuenta del psicólogo ${confirmAction.nombre} ha sido reactivada correctamente`,
          type: 'success',
          visible: true
        });
      } else if (confirmAction.type === 'eliminar') {
        await adminService.eliminarPsicologo(confirmAction.id);
        setNotification({
          message: `La cuenta del psicólogo ${confirmAction.nombre} ha sido eliminada correctamente`,
          type: 'success',
          visible: true
        });
      }
      
      cargarPsicologos();
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

  const abrirModalEditar = (psicologo: Psicologo) => {
    setPsicologoSeleccionado(psicologo);
    setShowEditarModal(true);
  };

  // Funciones para recepcionistas
  const handleEditarRecepcionista = async (recepcionista: any) => {
    try {
      await adminService.actualizarRecepcionista(recepcionista.id, recepcionista);
      cargarRecepcionistas();
      mostrarNotificacion('Recepcionista actualizado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleDesactivarRecepcionista = async (id: string) => {
    try {
      await adminService.desactivarRecepcionista(id);
      cargarRecepcionistas();
      mostrarNotificacion('Recepcionista desactivado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleReactivarRecepcionista = async (id: string) => {
    try {
      await adminService.activarRecepcionista(id);
      cargarRecepcionistas();
      mostrarNotificacion('Recepcionista reactivado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleEliminarRecepcionista = async (id: string) => {
    try {
      await adminService.eliminarRecepcionista(id);
      cargarRecepcionistas();
      mostrarNotificacion('Recepcionista eliminado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  // Funciones para pacientes
  const handleEditarPaciente = async (paciente: any) => {
    try {
      await adminService.actualizarPaciente(paciente.id, paciente);
      cargarPacientes();
      mostrarNotificacion('Paciente actualizado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleDesactivarPaciente = async (id: string) => {
    try {
      await adminService.desactivarPaciente(id);
      cargarPacientes();
      mostrarNotificacion('Paciente desactivado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleReactivarPaciente = async (id: string) => {
    try {
      await adminService.activarPaciente(id);
      cargarPacientes();
      mostrarNotificacion('Paciente reactivado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
    }
  };

  const handleEliminarPaciente = async (id: string) => {
    try {
      await adminService.eliminarPaciente(id);
      cargarPacientes();
      mostrarNotificacion('Paciente eliminado exitosamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message, 'error');
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
                <img src="/psyche.svg" alt="de psyche" className="h-20 w-auto" />
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
              <h2 className="text-xl font-bold text-gray-900 tracking-widest uppercase">
                {activeTab === 'chat' && 'Chat'}
                {activeTab !== 'chat' && 'Panel de Administración'}
              </h2>
              <p className="mt-1 text-xs font-semibold text-gray-600 tracking-widest uppercase">
                {activeTab === 'chat' && 'Comunícate con tus trabajadores'}
                {activeTab !== 'chat' && 'Gestiona todos los usuarios del sistema'}
              </p>
            </div>
            {activeTab === 'psicologos' && (
              <button
                onClick={() => setShowCrearModal(true)}
                className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
              >
                <svg className="w-4 h-4 mr-2 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Psicólogo
              </button>
            )}
            {activeTab === 'recepcionistas' && (
              <button
                onClick={() => setShowCrearRecepcionistaModal(true)}
                className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
              >
                <svg className="w-4 h-4 mr-2 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Recepcionista
              </button>
            )}
            {activeTab === 'pacientes' && (
              <button
                onClick={() => setShowCrearPacienteModal(true)}
                className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover-bounce shadow-sm hover:shadow-md animate-bounce-in"
              >
                <svg className="w-4 h-4 mr-2 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Paciente
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('psicologos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'psicologos'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👨‍⚕️ Psicólogos
              </button>
              <button
                onClick={() => setActiveTab('pacientes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pacientes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Pacientes
              </button>
              <button
                onClick={() => setActiveTab('recepcionistas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'recepcionistas'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Recepcionistas
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'chat'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('auditoria')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'auditoria'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Registro de Accesos
              </button>
            </nav>
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
          {activeTab === 'psicologos' ? (
            loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-2 text-amber-600 text-sm tracking-wide">Cargando psicólogos...</span>
              </div>
            ) : (
              <TablaPsicologos
                psicologos={psicologos}
                onEditar={abrirModalEditar}
                onDesactivar={handleDesactivarPsicologo}
                onReactivar={handleReactivarPsicologo}
                onEliminar={handleEliminarPsicologo}
                onEliminarCita={handleEliminarCita}
                onReasignarPaciente={handleReasignarPaciente}
              />
            )
          ) : activeTab === 'recepcionistas' ? (
            loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-2 text-amber-600 text-sm tracking-wide">Cargando recepcionistas...</span>
              </div>
            ) : (
              <TablaRecepcionistas
                recepcionistas={recepcionistas}
                onEditar={handleEditarRecepcionista}
                onDesactivar={handleDesactivarRecepcionista}
                onReactivar={handleReactivarRecepcionista}
                onEliminar={handleEliminarRecepcionista}
              />
            )
          ) : activeTab === 'chat' ? (
            <div className="space-y-6">
              <ChatAdmin adminId={user?.id || ''} />
            </div>
          ) : activeTab === 'auditoria' ? (
            <TablaAuditoria />
          ) : (
            loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="ml-2 text-amber-600 text-sm tracking-wide">Cargando pacientes...</span>
              </div>
            ) : (
              <TablaPacientes
                pacientes={pacientes}
                onEditar={handleEditarPaciente}
                onDesactivar={handleDesactivarPaciente}
                onReactivar={handleReactivarPaciente}
                onEliminar={handleEliminarPaciente}
              />
            )
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
          isOpen={showCrearRecepcionistaModal}
          onClose={() => setShowCrearRecepcionistaModal(false)}
          onCrear={handleCrearRecepcionista}
        />
      )}

      {showCrearPacienteModal && (
        <ModalCrearPaciente
          isOpen={showCrearPacienteModal}
          onClose={() => setShowCrearPacienteModal(false)}
          onCrear={handleCrearPaciente}
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
                ¿Estás seguro de que quieres {confirmAction.type === 'desactivar' ? 'desactivar' : confirmAction.type === 'reactivar' ? 'reactivar' : 'eliminar'} el psicólogo "{confirmAction.nombre}"?
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
                        Estoy seguro/a de reactivar la cuenta del psicólogo {confirmAction.nombre}
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
                        ¿Estás seguro/a que quieres <span className="text-red-600 font-bold">eliminar</span> de los registros al psicólogo/a <span className="font-bold">{confirmAction.nombre}</span> para siempre?
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
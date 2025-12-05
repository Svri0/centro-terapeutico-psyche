import React, { useState, useEffect } from 'react';
import { authService } from '../servicios/auth.service';
import DashboardRecepcionista from '../componentes/DashboardRecepcionista';
import AgendaRecepcionista from '../componentes/AgendaRecepcionista';
import GestionPacientesRecepcionista from '../componentes/GestionPacientesRecepcionista';
import GestionPagos from '../componentes/GestionPagos';
import ReportesRecepcionista from '../componentes/ReportesRecepcionista';
import ChatRecepcionista from '../componentes/ChatRecepcionista';
import Logo from '../componentes/Logo';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { useLogViewPerformance } from '../utilidades/performanceLogger';

const PanelRecepcionista: React.FC = () => {
  useLogViewPerformance('PanelRecepcionista');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'pacientes' | 'pagos' | 'reportes' | 'chat'>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [numeroMensajesNoLeidos, setNumeroMensajesNoLeidos] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Hook para timeout de sesión (15 minutos)
  useSessionTimeout(15); // 15 minutos

  // Ocultar badge cuando se entra al chat
  useEffect(() => {
    if (activeTab === 'chat') {
      setNumeroMensajesNoLeidos(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const user = authService.getUser();
    setUserData(user);
    setLoading(false);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setPasswordLoading(true);
      setMessage('');
      
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setMessage('Contraseña cambiada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setShowChangePassword(false);
        setMessage('');
      }, 2000);
      
    } catch (error: any) {
      setMessage(error.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center" style={{ backgroundColor: '#fff6ed' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '' },
    { id: 'agenda', label: 'Agenda', icon: '' },
    { id: 'pacientes', label: 'Pacientes', icon: '' },
    { id: 'pagos', label: 'Pagos', icon: '' },
    { id: 'reportes', label: 'Reportes', icon: '' },
    { id: 'chat', label: 'Chat', icon: '' }
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-2 sm:mr-4">
                <img src="/psyche.svg" alt="de psyche" className="h-12 sm:h-16 lg:h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base lg:text-lg font-light text-gray-800 tracking-widest uppercase">
                  Panel de Recepción
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">Gestión de Pacientes y Citas</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                Bienvenido, <span className="font-medium">{userData?.nombres} {userData?.apellidos}</span>
              </div>
              <div className="flex gap-2 sm:gap-4 order-1 sm:order-2">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-xs sm:text-sm text-amber-600 hover:text-amber-800 transition-colors whitespace-nowrap"
                >
                  Cambiar Contraseña
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-amber-200'
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-1 sm:mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'chat' && numeroMensajesNoLeidos > 0 && activeTab !== 'chat' && (
                    <span className="ml-1 sm:ml-2 flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {numeroMensajesNoLeidos > 99 ? '99+' : numeroMensajesNoLeidos}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full py-6">
        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-widest uppercase">Panel de Recepción</h2>
              <p className="mt-1 text-xs font-semibold text-gray-600 tracking-widest uppercase">
                Gestiona pacientes y agenda de citas
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <DashboardRecepcionista />}
          {activeTab === 'agenda' && <AgendaRecepcionista />}
          {activeTab === 'pacientes' && <GestionPacientesRecepcionista />}
          {activeTab === 'pagos' && <GestionPagos />}
          {activeTab === 'reportes' && <ReportesRecepcionista />}
          {/* Chat - siempre montado para escuchar mensajes, pero oculto cuando no está activo */}
          <div className={activeTab === 'chat' ? 'block' : 'hidden'}>
            <ChatRecepcionista 
              recepcionistaId={userData?.id || ''} 
              onMensajesNoLeidosChange={(numeroMensajes) => {
                // Usar función de actualización para obtener el valor actual de activeTab
                setNumeroMensajesNoLeidos(prev => {
                  // Si estamos en el chat, siempre ocultar el badge
                  if (activeTab === 'chat') {
                    return 0;
                  }
                  // Si no estamos en el chat, mostrar badge con el número
                  return numeroMensajes;
                });
              }}
            />
          </div>
        </div>
      </main>

      {/* Modal de Cambio de Contraseña */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              {message && (
                <div className={`text-sm ${message.includes('exitosamente') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setMessage('');
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-md transition-colors disabled:opacity-50 font-medium"
                >
                  {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelRecepcionista;


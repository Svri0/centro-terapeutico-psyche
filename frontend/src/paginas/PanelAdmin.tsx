import React, { useState, useEffect } from 'react';
import { authService } from '../servicios/auth.service';
import { adminService, Psicologo } from '../servicios/admin.service';
import TablaPsicologos from '../componentes/TablaPsicologos';
import ModalCrearPsicologo from '../componentes/ModalCrearPsicologo';
import ModalEditarPsicologo from '../componentes/ModalEditarPsicologo';

const PanelAdmin: React.FC = () => {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [user, setUser] = useState(authService.getUser());
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      window.location.href = '/login';
      return;
    }
    cargarPsicologos();
  }, []);

  const cargarPsicologos = async () => {
    try {
      setLoading(true);
      const data = await adminService.obtenerPsicologos();
      setPsicologos(data);
      setError('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPsicologo = async (data: any) => {
    try {
      await adminService.crearPsicologo(data);
      setShowCrearModal(false);
      cargarPsicologos();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEditarPsicologo = async (id: string, data: any) => {
    try {
      await adminService.actualizarPsicologo(id, data);
      setShowEditarModal(false);
      setPsicologoSeleccionado(null);
      cargarPsicologos();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDesactivarPsicologo = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este psicólogo?')) {
      try {
        await adminService.desactivarPsicologo(id);
        cargarPsicologos();
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleReactivarPsicologo = async (id: string) => {
    try {
      await adminService.reactivarPsicologo(id);
      cargarPsicologos();
    } catch (error: any) {
      setError(error.message);
    }
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

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Centro Terapéutico Psyche
                </h1>
                <p className="text-sm text-gray-500">Panel de Administración</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Bienvenido, {user.nombres} {user.apellidos}
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Psicólogos</h2>
              <p className="mt-1 text-sm text-gray-600">
                Administra las cuentas de psicólogos del sistema
              </p>
            </div>
            <button
              onClick={() => setShowCrearModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Psicólogo
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Cargando psicólogos...</span>
            </div>
          ) : (
            <TablaPsicologos
              psicologos={psicologos}
              onEditar={abrirModalEditar}
              onDesactivar={handleDesactivarPsicologo}
              onReactivar={handleReactivarPsicologo}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelAdmin; 
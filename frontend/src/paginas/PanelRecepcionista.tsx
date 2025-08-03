import React, { useState, useEffect } from 'react';
import { authService } from '../servicios/auth.service';
import Logo from '../componentes/Logo';
import AvatarSelector from '../componentes/AvatarSelector';
import ImageUpload from '../componentes/ImageUpload';
import { actualizarPerfilRecepcionista, subirImagenReal } from '../servicios/usuarios.service';
import { getAvatarById, AVATARS_ANIMALES } from '../assets/avatars/default-avatars';

const PanelRecepcionista: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gestion-citas' | 'registro-pacientes' | 'consulta-horarios' | 'perfil'>('dashboard');
  
  // Estados para el perfil
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [perfilData, setPerfilData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    avatar_url: ''
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [useRealImage, setUseRealImage] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    if (currentUser) {
      cargarPerfil();
    }
  }, []);

  const cargarPerfil = () => {
    if (user) {
      setPerfilData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        avatar_url: user.avatar_url || ''
      });
      setSelectedAvatarUrl(user.avatar_url || '');
      
      // Si el usuario tiene un avatar_url, verificar si es uno de los avatares predefinidos
      if (user.avatar_url) {
        const avatar = AVATARS_ANIMALES.find(av => av.url === user.avatar_url);
        if (avatar) {
          setSelectedAvatarId(avatar.id);
        }
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Las contraseñas no coinciden');
      setLoadingProfile(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('La nueva contraseña debe tener al menos 8 caracteres');
      setLoadingProfile(false);
      return;
    }

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage('Contraseña cambiada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
    } catch (error: any) {
      setPasswordMessage(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handleAvatarSelect = (avatarId: string, avatarUrl: string) => {
    setSelectedAvatarId(avatarId);
    setSelectedAvatarUrl(avatarUrl);
    setUseRealImage(false);
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setUseRealImage(true);
    setSelectedAvatarId('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setMessage('');

    try {
      console.log('🔍 Iniciando actualización de perfil...');
      console.log('📋 Estado actual:', {
        useRealImage,
        uploadedImage: uploadedImage ? 'IMAGEN_PRESENTE' : 'SIN_IMAGEN',
        selectedAvatarUrl,
        perfilData: perfilData
      });

      let finalAvatarUrl = selectedAvatarUrl;

      // Si se subió una imagen real, procesarla primero
      if (useRealImage && uploadedImage) {
        console.log('📤 Subiendo imagen real...');
        const uploadResponse = await subirImagenReal(uploadedImage);
        finalAvatarUrl = uploadResponse.data.avatar_url;
        console.log('✅ Imagen subida, URL:', finalAvatarUrl.substring(0, 50) + '...');
      }

      const updatedData = {
        ...perfilData,
        avatar_url: finalAvatarUrl
      };
      
      console.log('📝 Datos a enviar:', {
        ...updatedData,
        avatar_url: finalAvatarUrl ? 'BASE64_IMAGE' : 'SIN_IMAGEN'
      });
      
      const response = await actualizarPerfilRecepcionista(updatedData);
      console.log('✅ Respuesta del servidor:', response);
      
      // Actualizar el usuario en localStorage con todos los datos actualizados
      const updatedUser = { 
        ...user, 
        ...response.data,
        avatar_url: finalAvatarUrl // Asegurar que el avatar_url se guarde correctamente
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Actualizar el estado local para reflejar los cambios inmediatamente
      setPerfilData(prev => ({
        ...prev,
        avatar_url: finalAvatarUrl
      }));
      setSelectedAvatarUrl(finalAvatarUrl);
      
      setMessage('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('💥 Error en handleUpdateProfile:', error);
      console.error('📋 Error response:', error.response?.data);
      setMessage(error.response?.data?.message || error.message || 'Error al actualizar el perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center" style={{ backgroundColor: '#fff6ed' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        <span className="ml-4 text-amber-600 text-lg tracking-wide">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center" style={{ backgroundColor: '#fff6ed' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo y título - Izquierda */}
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img src="/src/img/psyche.svg" alt="de psyche" className="h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-light text-gray-800 tracking-widest uppercase">
                  Panel de Recepción
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">Gestión de Recepción</p>
              </div>
            </div>
            
            {/* Frase motivadora - Centro */}
            <div className="hidden lg:flex flex-col items-center justify-center flex-1 px-8">
              <h2 className="text-lg lg:text-xl font-bold text-gray-600 tracking-wide text-center leading-relaxed">
                Coordinando el bienestar de nuestros pacientes
              </h2>
            </div>
            
            {/* Información del usuario - Derecha */}
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300 shadow-sm flex-shrink-0">
                <img
                  src={useRealImage && uploadedImage 
                    ? URL.createObjectURL(uploadedImage)
                    : selectedAvatarUrl || perfilData.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default&backgroundColor=ffdfbf&scale=80'
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-sm text-gray-700">
                Bienvenido, {user.nombres} {user.apellidos}
              </div>

              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setPasswordMessage('');
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
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex justify-between items-start sm:items-center">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-widest uppercase truncate">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'gestion-citas' && 'Gestión de Citas'}
                  {activeTab === 'registro-pacientes' && 'Registro de Pacientes'}
                  {activeTab === 'consulta-horarios' && 'Consulta de Horarios'}
                  {activeTab === 'perfil' && 'Mi Perfil'}
                </h2>
                <p className="mt-1 text-xs font-semibold text-gray-600 tracking-widest uppercase truncate">
                  {activeTab === 'dashboard' && 'Resumen de actividades y estadísticas'}
                  {activeTab === 'gestion-citas' && 'Programa, modifica y gestiona las citas'}
                  {activeTab === 'registro-pacientes' && 'Registra y administra la información de pacientes'}
                  {activeTab === 'consulta-horarios' && 'Consulta la disponibilidad de los psicólogos'}
                  {activeTab === 'perfil' && 'Actualiza tu información personal'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="border-b border-amber-200 mb-6 sm:mb-8">
              <nav className="-mb-px flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'dashboard'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('gestion-citas')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'gestion-citas'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Gestión de Citas
                </button>
                <button
                  onClick={() => setActiveTab('registro-pacientes')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'registro-pacientes'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Registro de Pacientes
                </button>
                <button
                  onClick={() => setActiveTab('consulta-horarios')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'consulta-horarios'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Consulta de Horarios
                </button>
                <button
                  onClick={() => setActiveTab('perfil')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'perfil'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Mi Perfil
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Citas Hoy</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Pacientes Activos</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Mensajes Nuevos</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">0</p>
                </div>
              </div>

              {/* Mensaje de bienvenida */}
              <div className="bg-white rounded-lg shadow-sm border border-amber-100">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-amber-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">¡Bienvenido al Sistema de Gestión!</h3>
                </div>
                <div className="p-4 sm:p-6">
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto text-center">
                    Como recepcionista, tienes acceso a las herramientas necesarias para gestionar eficientemente 
                    el flujo de trabajo del centro terapéutico. Desde aquí podrás coordinar citas, registrar pacientes 
                    y mantener una comunicación efectiva con todo el equipo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gestion-citas' && (
            <div className="bg-white rounded-lg shadow-sm border border-amber-100">
              <div className="px-6 py-4 border-b border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Citas</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📅</div>
                  <p className="text-gray-500">Funcionalidad de gestión de citas en desarrollo</p>
                  <p className="text-gray-400 text-sm mt-1">Aquí podrás programar, modificar y gestionar las citas</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registro-pacientes' && (
            <div className="bg-white rounded-lg shadow-sm border border-amber-100">
              <div className="px-6 py-4 border-b border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900">Registro de Pacientes</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">👥</div>
                  <p className="text-gray-500">Funcionalidad de registro de pacientes en desarrollo</p>
                  <p className="text-gray-400 text-sm mt-1">Aquí podrás registrar y administrar la información de pacientes</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consulta-horarios' && (
            <div className="bg-white rounded-lg shadow-sm border border-amber-100">
              <div className="px-6 py-4 border-b border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900">Consulta de Horarios</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">⏰</div>
                  <p className="text-gray-500">Funcionalidad de consulta de horarios en desarrollo</p>
                  <p className="text-gray-400 text-sm mt-1">Aquí podrás consultar la disponibilidad de los psicólogos</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Mi Perfil</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Avatar actual */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-orange-300">
                      <img
                        src={useRealImage && uploadedImage 
                          ? URL.createObjectURL(uploadedImage)
                          : selectedAvatarUrl || perfilData.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default&backgroundColor=ffdfbf&scale=80'
                        }
                        alt="Avatar actual"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Avatar Actual</h4>
                      <p className="text-sm text-gray-600">
                        {useRealImage ? 'Imagen real subida' : 'Avatar seleccionado'}
                      </p>
                    </div>
                  </div>

                  {/* Opciones de avatar */}
                  <div className="space-y-6">
                    {/* Subir imagen real */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Subir Foto Real</h4>
                      <ImageUpload
                        onImageSelect={handleImageUpload}
                        currentImageUrl={useRealImage && uploadedImage ? URL.createObjectURL(uploadedImage) : undefined}
                      />
                    </div>

                    {/* O separador */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">O</span>
                      </div>
                    </div>

                    {/* Selector de Avatar */}
                    <AvatarSelector
                      selectedAvatarId={selectedAvatarId}
                      onAvatarSelect={handleAvatarSelect}
                      title="Seleccionar Avatar de Animal"
                    />
                  </div>

                  {/* Información Personal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres
                      </label>
                      <input
                        type="text"
                        value={perfilData.nombres}
                        onChange={(e) => setPerfilData({...perfilData, nombres: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        value={perfilData.apellidos}
                        onChange={(e) => setPerfilData({...perfilData, apellidos: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={perfilData.email}
                        onChange={(e) => setPerfilData({...perfilData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={perfilData.telefono}
                        onChange={(e) => setPerfilData({...perfilData, telefono: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-md ${
                      message.includes('exitosamente') 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingProfile}
                      className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingProfile ? 'Actualizando...' : 'Actualizar Perfil'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Cambiar Contraseña */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Cambiar Contraseña</h3>
            <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>
              {passwordMessage && (
                <div className={`p-3 rounded-md ${
                  passwordMessage.includes('exitosamente') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {passwordMessage}
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordMessage('');
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 text-center"
                >
                  {loadingProfile ? 'Cambiando...' : 'Cambiar Contraseña'}
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
import React, { useState, useEffect } from 'react';
import MisTareas from '../componentes/MisTareas';
import MisCitas from '../componentes/MisCitas';
import CalendarioPaciente from '../componentes/CalendarioPaciente';
import TestHerramientaDibujo from '../componentes/TestHerramientaDibujo';
import AvatarSelector from '../componentes/AvatarSelector';
import ImageUpload from '../componentes/ImageUpload';
import ChatPaciente from '../componentes/ChatPaciente';
import { authService } from '../servicios/auth.service';
import { actualizarPerfilPaciente, subirImagenReal } from '../servicios/usuarios.service';
import { AVATARS_ANIMALES } from '../assets/avatars/default-avatars';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { useLogViewPerformance } from '../utilidades/performanceLogger';

const PanelPaciente: React.FC = () => {
  useLogViewPerformance('PanelPaciente');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'citas' | 'tareas' | 'calendario' | 'test-dibujo' | 'chat' | 'perfil'>('citas');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Estados para el perfil
  const [perfilData, setPerfilData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    avatar_url: '',
    // Campos específicos del paciente
    rut: '',
    direccion: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones: ''
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [useRealImage, setUseRealImage] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [numeroMensajesNoLeidos, setNumeroMensajesNoLeidos] = useState(0);

  // Hook para timeout de sesión (15 minutos)
  useSessionTimeout(15); // 15 minutos

  // No ocultar el badge automáticamente al entrar al chat
  // El badge desaparecerá cuando se carguen los mensajes en ChatPaciente

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setUserData(user);
    console.log('🔍 userData establecido:', user);
    cargarDatosPaciente();
    cargarPerfil();
  }, []);

  const cargarDatosPaciente = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Por ahora, usar solo los datos del localStorage
      // Los campos se rellenarán en cargarPerfil()
      console.log('🔍 Usando datos del localStorage para el perfil');
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };


  const cargarPerfil = () => {
    if (userData) {
      console.log('🔍 Cargando perfil con datos:', userData);
      
      const perfilCompleto = {
        nombres: userData.nombres || '',
        apellidos: userData.apellidos || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        fecha_nacimiento: userData.fecha_nacimiento || '',
        genero: userData.genero || '',
        avatar_url: userData.avatar_url || '',
        rut: userData.rut || '',
        direccion: userData.direccion || '',
        contacto_emergencia_nombre: userData.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: userData.contacto_emergencia_telefono || '',
        contacto_emergencia_relacion: userData.contacto_emergencia_relacion || '',
        observaciones: userData.observaciones || ''
      };
      
      console.log('🔍 Perfil completo preparado:', perfilCompleto);
      setPerfilData(perfilCompleto);
      setSelectedAvatarUrl(userData.avatar_url || '');
      
      // Si el usuario tiene un avatar_url, verificar si es uno de los avatares predefinidos
      if (userData.avatar_url) {
        const avatar = AVATARS_ANIMALES.find(av => av.url === userData.avatar_url);
        if (avatar) {
          setSelectedAvatarId(avatar.id);
          console.log('✅ Avatar predefinido encontrado:', avatar.id);
        } else {
          console.log('ℹ️ Avatar no es predefinido, usando imagen personalizada');
        }
      }
      
      console.log('✅ Perfil cargado exitosamente');
    } else {
      console.warn('⚠️ No hay userData para cargar perfil');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Las contraseñas no coinciden');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('La nueva contraseña debe tener al menos 8 caracteres');
      setPasswordLoading(false);
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
      
      // Mostrar notificación de éxito
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000); // Ocultar después de 5 segundos
      
    } catch (error: any) {
      setPasswordMessage(error.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
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
    setProfileLoading(true);
    setProfileMessage('');

    try {
      console.log('🔍 Iniciando actualización inteligente de perfil...');
      
      let finalAvatarUrl = selectedAvatarUrl;

      // Si se subió una imagen real, procesarla primero
      if (useRealImage && uploadedImage) {
        console.log('📤 Subiendo imagen real...');
        const uploadResponse = await subirImagenReal(uploadedImage);
        finalAvatarUrl = uploadResponse.data.avatar_url;
        console.log('✅ Imagen subida, URL:', finalAvatarUrl.substring(0, 50) + '...');
      }

      // Crear objeto solo con campos modificados
      const updatedData: any = {};
      
      // Solo incluir campos que realmente cambiaron Y no estén vacíos
      if (perfilData.nombres !== userData?.nombres && perfilData.nombres && perfilData.nombres.trim() !== '') {
        updatedData.nombres = perfilData.nombres;
      }
      if (perfilData.apellidos !== userData?.apellidos && perfilData.apellidos && perfilData.apellidos.trim() !== '') {
        updatedData.apellidos = perfilData.apellidos;
      }
      if (perfilData.email !== userData?.email && perfilData.email && perfilData.email.trim() !== '') {
        updatedData.email = perfilData.email;
      }
      if (perfilData.telefono !== userData?.telefono && perfilData.telefono && perfilData.telefono.trim() !== '') {
        updatedData.telefono = perfilData.telefono;
      }
      if (perfilData.fecha_nacimiento !== userData?.fecha_nacimiento && perfilData.fecha_nacimiento && perfilData.fecha_nacimiento.trim() !== '') {
        updatedData.fecha_nacimiento = perfilData.fecha_nacimiento;
      }
      if (perfilData.genero !== userData?.genero && perfilData.genero && perfilData.genero.trim() !== '') {
        updatedData.genero = perfilData.genero;
      }
      if (perfilData.rut !== userData?.rut && perfilData.rut && perfilData.rut.trim() !== '') {
        updatedData.rut = perfilData.rut;
      }
      if (perfilData.direccion !== userData?.direccion && perfilData.direccion && perfilData.direccion.trim() !== '') {
        updatedData.direccion = perfilData.direccion;
      }
      if (perfilData.contacto_emergencia_nombre !== userData?.contacto_emergencia_nombre && perfilData.contacto_emergencia_nombre && perfilData.contacto_emergencia_nombre.trim() !== '') {
        updatedData.contacto_emergencia_nombre = perfilData.contacto_emergencia_nombre;
      }
      if (perfilData.contacto_emergencia_telefono !== userData?.contacto_emergencia_telefono && perfilData.contacto_emergencia_telefono && perfilData.contacto_emergencia_telefono.trim() !== '') {
        updatedData.contacto_emergencia_telefono = perfilData.contacto_emergencia_telefono;
      }
      if (perfilData.contacto_emergencia_relacion !== userData?.contacto_emergencia_relacion && perfilData.contacto_emergencia_relacion && perfilData.contacto_emergencia_relacion.trim() !== '') {
        updatedData.contacto_emergencia_relacion = perfilData.contacto_emergencia_relacion;
      }
      if (perfilData.observaciones !== userData?.observaciones && perfilData.observaciones && perfilData.observaciones.trim() !== '') {
        updatedData.observaciones = perfilData.observaciones;
      }
      
      // Si hay nueva foto, incluirla
      if (finalAvatarUrl && finalAvatarUrl !== userData?.avatar_url) {
        updatedData.avatar_url = finalAvatarUrl;
      }

      console.log('🔍 Campos a actualizar:', Object.keys(updatedData));
      console.log('🔍 Datos a enviar:', updatedData);
      
      // Validación adicional: no enviar campos vacíos
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === '' || updatedData[key] === null || updatedData[key] === undefined) {
          console.log(`⚠️ Eliminando campo vacío: ${key}`);
          delete updatedData[key];
        }
      });
      
      console.log('🔍 Datos finales después de limpieza:', updatedData);

      // Solo hacer la llamada si hay algo que actualizar
      if (Object.keys(updatedData).length === 0) {
        setProfileMessage('No hay cambios para guardar');
        return;
      }

      const response = await actualizarPerfilPaciente(userData?.id || '', updatedData);
      console.log('✅ Respuesta del servidor:', response);
      
      // Actualizar el usuario en localStorage solo con los campos modificados
      const updatedUser = { 
        ...userData, 
        ...updatedData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Actualizar el estado local
      setUserData(updatedUser);
      setPerfilData(prev => ({
        ...prev,
        ...updatedData
      }));
      if (finalAvatarUrl) {
        setSelectedAvatarUrl(finalAvatarUrl);
      }
      
      setProfileMessage(`Perfil actualizado exitosamente. Campos modificados: ${Object.keys(updatedData).join(', ')}`);
      
      // Mostrar notificación de éxito
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      
    } catch (error: any) {
      console.error('💥 Error en handleUpdateProfile:', error);
      setProfileMessage(error.response?.data?.message || error.message || 'Error al actualizar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-300 mx-auto mb-4"></div>
          <p className="text-gray-500 font-light">Cargando tu espacio personal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-400 text-6xl mb-4">⚠</div>
          <h2 className="text-2xl font-light text-gray-700 mb-4">Error de Conexión</h2>
          <p className="text-gray-500 mb-6 font-light">{error}</p>
          <button 
            onClick={cargarDatosPaciente}
            className="px-6 py-3 bg-orange-200 text-orange-700 rounded-lg hover:bg-orange-300 transition-colors font-light"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Notificación de éxito */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border-2 border-green-400 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="text-green-500 text-xl">✓</div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-green-800">¡Éxito!</h4>
              <p className="text-sm text-green-700">Tu perfil ha sido actualizado correctamente</p>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="text-green-500 hover:text-green-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            {/* Logo y título - Izquierda */}
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-2 sm:mr-4">
                <img src="/psyche.svg" alt="de psyche" className="h-12 sm:h-16 lg:h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base lg:text-lg font-light text-gray-800 tracking-widest uppercase">
                  Panel del Paciente
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">Gestión de Tareas</p>
              </div>
            </div>
            
            {/* Frase motivadora - Centro */}
            <div className="hidden lg:flex flex-col items-center justify-center flex-1 px-4 lg:px-8">
              <h2 className="text-base lg:text-xl font-bold text-gray-600 tracking-wide text-center leading-relaxed">
                Transformando vidas a través de la salud mental
              </h2>
            </div>
            
            {/* Información del usuario - Derecha */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-4 order-1">
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-amber-300 shadow-sm flex-shrink-0">
                  <img
                    src={userData?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default&backgroundColor=ffdfbf&scale=80'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  Bienvenido, <span className="font-medium">{userData?.nombres} {userData?.apellidos}</span>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-4 order-2">
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

      {/* Main Content */}
      <main className="w-full py-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex justify-between items-start sm:items-center">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-widest uppercase truncate">
                  {activeTab === 'citas' && 'Mis Citas'}
                  {activeTab === 'tareas' && 'Mis Tareas'}
                  {activeTab === 'calendario' && 'Agendar Cita'}
                  {activeTab === 'test-dibujo' && 'Test de Dibujo'}
                  {activeTab === 'chat' && 'Chat'}
                  {activeTab === 'perfil' && 'Mi Perfil'}
                </h2>
                <p className="mt-1 text-xs font-semibold text-gray-600 tracking-widest uppercase truncate">
                  {activeTab === 'citas' && 'Gestiona tus citas y sesiones programadas'}
                  {activeTab === 'tareas' && 'Tareas asignadas por tu psicólogo'}
                  {activeTab === 'calendario' && 'Programa tu próxima sesión terapéutica'}
                  {activeTab === 'test-dibujo' && 'Herramienta terapéutica para expresión artística'}
                  {activeTab === 'chat' && 'Comunícate con tu psicólogo en tiempo real'}
                  {activeTab === 'perfil' && 'Gestiona tu información personal'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="border-b border-amber-200 mb-6 sm:mb-8">
              <nav className="-mb-px flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('citas')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'citas'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Mis Citas
                </button>
                <button
                  onClick={() => setActiveTab('tareas')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'tareas'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Mis Tareas
                </button>
                <button
                  onClick={() => setActiveTab('calendario')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'calendario'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Agendar Cita
                </button>
                <button
                  onClick={() => setActiveTab('test-dibujo')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'test-dibujo'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  Test Dibujo
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap relative ${
                    activeTab === 'chat'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                  }`}
                >
                  <span className="flex items-center">
                    Chat
                    {numeroMensajesNoLeidos > 0 && activeTab !== 'chat' && (
                      <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {numeroMensajesNoLeidos > 99 ? '99+' : numeroMensajesNoLeidos}
                      </span>
                    )}
                  </span>
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

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8">
            {activeTab === 'citas' && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <MisCitas />
              </div>
            )}

            {activeTab === 'tareas' && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <MisTareas />
              </div>
            )}

            {activeTab === 'calendario' && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <CalendarioPaciente pacienteId={userData?.id || ''} />
              </div>
            )}

                        {activeTab === 'test-dibujo' && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
                <TestHerramientaDibujo />
              </div>
            )}

            {/* Chat - siempre montado para escuchar mensajes, pero oculto cuando no está activo */}
            <div className={activeTab === 'chat' ? 'block' : 'hidden'}>
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
                <ChatPaciente 
                  pacienteId={userData?.id || ''} 
                  isChatVisible={activeTab === 'chat'}
                  onMensajesNoLeidosChange={(numeroMensajes) => {
                    // Actualizar el contador siempre
                    // El componente ChatPaciente se encargará de ponerlo en 0 cuando se carguen los mensajes
                    setNumeroMensajesNoLeidos(numeroMensajes);
                  }}
                />
              </div>
            </div>

            {activeTab === 'perfil' && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">MI PERFIL</h3>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Avatar actual */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-300">
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

                    {/* Información Personal - Campos básicos */}
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      <h4 className="text-md font-bold text-gray-700 mb-6">Información Personal</h4>
                      
                      {/* Mensaje sobre carga automática */}
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700">
                          <strong>Carga Automática:</strong> Todos los campos se rellenan automáticamente con tus datos guardados. 
                          Solo modifica los campos que quieras cambiar.
                        </p>
                      </div>
                      
                      {/* Mensaje sobre campos */}
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>Nota:</strong> Los campos marcados con * son importantes pero opcionales para actualizaciones parciales. 
                          Solo se guardarán los campos que modifiques.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombres *
                          </label>
                          <input
                            type="text"
                            value={perfilData.nombres}
                            onChange={(e) => setPerfilData({...perfilData, nombres: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellidos *
                          </label>
                          <input
                            type="text"
                            value={perfilData.apellidos}
                            onChange={(e) => setPerfilData({...perfilData, apellidos: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={perfilData.email}
                            onChange={(e) => setPerfilData({...perfilData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Nacimiento
                          </label>
                          <input
                            type="date"
                            value={perfilData.fecha_nacimiento}
                            onChange={(e) => setPerfilData({...perfilData, fecha_nacimiento: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Género
                          </label>
                          <select
                            value={perfilData.genero}
                            onChange={(e) => setPerfilData({...perfilData, genero: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="">Seleccionar género</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                            <option value="prefiero_no_decir">Prefiero no decir</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Información Adicional - Campos específicos del paciente */}
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      <h4 className="text-md font-bold text-gray-700 mb-6">Información Adicional</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            RUT
                          </label>
                          <input
                            type="text"
                            value={perfilData.rut}
                            onChange={(e) => setPerfilData({...perfilData, rut: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="12.345.678-9"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección
                          </label>
                          <input
                            type="text"
                            value={perfilData.direccion}
                            onChange={(e) => setPerfilData({...perfilData, direccion: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Calle, número, comuna"
                          />
                        </div>
                      </div>

                      {/* Contacto de Emergencia */}
                      <div className="mt-6">
                        <h5 className="text-sm font-bold text-gray-700 mb-4">Contacto de Emergencia</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre del Contacto
                            </label>
                            <input
                              type="text"
                              value={perfilData.contacto_emergencia_nombre}
                              onChange={(e) => setPerfilData({...perfilData, contacto_emergencia_nombre: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              placeholder="Nombre completo"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              value={perfilData.contacto_emergencia_telefono}
                              onChange={(e) => setPerfilData({...perfilData, contacto_emergencia_telefono: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              placeholder="+56 9 1234 5678"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Relación
                            </label>
                            <input
                              type="text"
                              value={perfilData.contacto_emergencia_relacion}
                              onChange={(e) => setPerfilData({...perfilData, contacto_emergencia_relacion: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              placeholder="Padre, madre, cónyuge, etc."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Observaciones */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observaciones
                        </label>
                        <textarea
                          value={perfilData.observaciones}
                          onChange={(e) => setPerfilData({...perfilData, observaciones: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="Información adicional relevante..."
                        />
                      </div>
                    </div>

                    {/* Mensaje de estado */}
                    {profileMessage && (
                      <div className={`p-4 rounded-md ${
                        profileMessage.includes('exitosamente') 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {profileMessage}
                      </div>
                    )}

                    {/* Mensaje informativo sobre la actualización inteligente */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-green-500 text-lg">✓</div>
                        <div className="text-sm text-green-700">
                          <p className="font-medium mb-1">Actualización Inteligente</p>
                          <p className="text-xs">
                            Solo se actualizarán los campos que realmente hayas modificado. 
                            Los campos sin cambios mantendrán sus valores anteriores.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => cargarPerfil()}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors"
                      >
                        Restaurar
                      </button>
                      
                      {/* Botón inteligente que solo actualiza campos modificados */}
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                        title="Actualiza solo los campos que hayas modificado"
                      >
                        {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
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
                  onClick={() => setShowChangePassword(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 text-center"
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

export default PanelPaciente; 
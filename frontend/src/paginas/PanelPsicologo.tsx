import React, { useState, useEffect } from 'react';
import { authService } from '../servicios/auth.service';
import GestionPacientes from '../componentes/GestionPacientes';

import AvatarSelector from '../componentes/AvatarSelector';
import ImageUpload from '../componentes/ImageUpload';
import GestionTareas from '../componentes/GestionTareas';
import CitasPsicologo from '../componentes/CitasPsicologo';
import EstadisticasPsicologo from '../componentes/EstadisticasPsicologo';
import GestionDisponibilidadMensual from '../componentes/GestionDisponibilidadMensual';
import ChatPsicologo from '../componentes/ChatPsicologo';
import { GenerarAgendaPDF } from '../componentes/GenerarAgendaPDF';
import { TIPOS_SERVICIOS, TipoServicio, obtenerCategorias } from '../utilidades/tipos-servicios';
import { obtenerServicios, crearServicio, eliminarServicio, ServicioPsicologo } from '../servicios/servicios.service';
import Notificacion from '../componentes/Notificacion';
import GestionReportesProgreso from '../componentes/GestionReportesProgreso';

import { PacienteCreado } from '../servicios/pacientes.service';
import { actualizarPerfilPsicologo, subirImagenReal } from '../servicios/usuarios.service';
import { AVATARS_ANIMALES } from '../assets/avatars/default-avatars';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

interface Sesion {
  id: string;
  paciente: string;
  fecha: string;
  hora: string;
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada' | 'confirmada' | 'en_progreso' | 'no_show';
  notas?: string;
}

const PanelPsicologo: React.FC = () => {
  const [sesionesHoy, setSesionesHoy] = useState<Sesion[]>([]);
  const [sesionesRealizadas, setSesionesRealizadas] = useState<Sesion[]>([]);
  const [totalSesiones, setTotalSesiones] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pacientes' | 'citas' | 'disponibilidad' | 'servicios' | 'tareas' | 'reportes' | 'chat' | 'pdf' | 'perfil'>('dashboard');
  const [perfilData, setPerfilData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    especialidad: '',
    descripcion: '',
    avatar_url: ''
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [useRealImage, setUseRealImage] = useState(false);

  const [mostrarAgregarServicio, setMostrarAgregarServicio] = useState(false);
  const [servicios, setServicios] = useState<ServicioPsicologo[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<TipoServicio | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  
  // Estado para notificaciones
  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });



  // Frase motivadora elegante

  // Función para mostrar notificaciones
  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' | 'advertencia' | 'info') => {
    setNotificacion({
      visible: true,
      mensaje,
      tipo
    });
  };

  const cerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, visible: false }));
  };



  const user = authService.getUser();
  console.log('🔍 Debug - PanelPsicologo - user:', user);

  // Hook para timeout de sesión (15 minutos)
  useSessionTimeout(15); // 15 minutos

  useEffect(() => {
    // Cargar datos reales
    cargarDatos();
    cargarPerfil();
    cargarServicios();
  }, []);

  const cargarPerfil = () => {
    if (user) {
      setPerfilData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        especialidad: user.especialidad || '',
        descripcion: user.descripcion || '',
        avatar_url: user.avatar_url || ''
      });
      setSelectedAvatarUrl(user.avatar_url || '');
      
      // Si el usuario tiene un avatar_url, verificar si es uno de los avatares predefinidos
      if (user.avatar_url) {
        const avatar = AVATARS_ANIMALES.find((av: any) => av.url === user.avatar_url);
        if (avatar) {
          setSelectedAvatarId(avatar.id);
        }
      }
    }
  };

  const cargarDatos = async () => {
    try {
      if (!user?.id) return;

      // Importar el servicio de citas dinámicamente para evitar dependencias circulares
      const { citasService } = await import('../servicios/citas.service');
      
      // Obtener sesiones del psicólogo
      const sesionesData = await citasService.obtenerCitasPsicologo(user.id);
      
      // Obtener fecha de hoy
      const hoy = new Date().toISOString().split('T')[0];
      
      // Filtrar sesiones de hoy
      const sesionesHoy = sesionesData.filter(sesion => sesion.fecha === hoy);
      
      // Filtrar sesiones realizadas (completadas o en progreso)
      const sesionesRealizadas = sesionesData.filter(sesion => 
        sesion.estado === 'completada' || sesion.estado === 'en_progreso'
      );
      
      setSesionesHoy(sesionesHoy.map(sesion => ({
        id: sesion.id,
        paciente: `${sesion.paciente_nombres} ${sesion.paciente_apellidos}`,
        fecha: sesion.fecha,
        hora: sesion.hora_inicio,
        estado: sesion.estado,
        notas: sesion.notas_psicologo
      })));
      
      setSesionesRealizadas(sesionesRealizadas.map(sesion => ({
        id: sesion.id,
        paciente: `${sesion.paciente_nombres} ${sesion.paciente_apellidos}`,
        fecha: sesion.fecha,
        hora: sesion.hora_inicio,
        estado: sesion.estado,
        notas: sesion.notas_psicologo
      })));
      
      setTotalSesiones(sesionesData.length);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setSesionesHoy([]);
      setSesionesRealizadas([]);
      setTotalSesiones(0);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('La nueva contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Contraseña cambiada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
    } catch (error: any) {
      setMessage(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      // Si falla el logout, limpiar localStorage y redirigir
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const handlePacienteCreado = (paciente: PacienteCreado) => {
    // Aquí podrías mostrar una notificación o actualizar estadísticas
    console.log('Paciente creado:', paciente);
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
    setLoading(true);
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
      
      const response = await actualizarPerfilPsicologo(user?.id || '', updatedData);
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
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-amber-100 text-amber-800';
      case 'en_curso': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En Curso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  // Funciones para manejar servicios
  const cargarServicios = async () => {
    try {
      const response = await obtenerServicios();
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const agregarServicio = async () => {
    if (servicioSeleccionado) {
      try {
        const nuevoServicio = await crearServicio({
          tipo_servicio_id: servicioSeleccionado.id,
          nombre: servicioSeleccionado.nombre,
          descripcion: servicioSeleccionado.descripcion,
          duracion: servicioSeleccionado.duracion,
          categoria: servicioSeleccionado.categoria
        });
        
        setServicios(prev => [...prev, nuevoServicio.data]);
        setServicioSeleccionado(null);
        setCategoriaSeleccionada('');
        setMostrarAgregarServicio(false);
        mostrarNotificacion('Servicio agregado exitosamente', 'exito');
      } catch (error: any) {
        console.error('Error al agregar servicio:', error);
        console.log('Error completo:', error);
        console.log('Error response:', error.response);
        console.log('Error response data:', error.response?.data);
        console.log('Error message:', error.response?.data?.message);
        console.log('Error status:', error.response?.status);
        
        // Verificar si es un error de servicio duplicado (código 400)
        if (error.response?.status === 400) {
          console.log('Mostrando notificación de duplicado');
          mostrarNotificacion('⚠️ Ya existe un servicio con este tipo en los servicios configurados.', 'error');
        } else {
          console.log('Mostrando notificación de error general');
          mostrarNotificacion('Error al agregar el servicio. Inténtalo de nuevo.', 'error');
        }
      }
    }
  };

  const eliminarServicioHandler = async (id: number) => {
    try {
      await eliminarServicio(id);
      setServicios(prev => prev.filter(servicio => servicio.id !== id));
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
    }
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fff6ed' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo y título - Izquierda */}
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img src="/psyche.svg" alt="de psyche" className="h-20 w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-light text-gray-800 tracking-widest uppercase">
                  Panel del Psicólogo
                </h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase font-light">Gestión de Pacientes</p>
              </div>
            </div>
            
            {/* Frase motivadora - Centro */}
            <div className="hidden lg:flex flex-col items-center justify-center flex-1 px-8">
              <h2 className="text-lg lg:text-xl font-bold text-gray-600 tracking-wide text-center leading-relaxed">
                Transformando vidas a través de la salud mental
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
                Bienvenido, {user?.nombres} {user?.apellidos}
              </div>

              <button
                onClick={() => setShowChangePassword(true)}
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
                {activeTab === 'pacientes' && 'Gestión de Pacientes'}
                {activeTab === 'citas' && 'Mis Citas'}
                {activeTab === 'disponibilidad' && 'Disponibilidad'}
                {activeTab === 'servicios' && 'Mis Servicios'}
                {activeTab === 'tareas' && 'Gestión de Tareas'}
                {activeTab === 'reportes' && 'Reportes de Progreso'}
                {activeTab === 'chat' && 'Chat'}
                {activeTab === 'pdf' && 'Generar PDF'}
                {activeTab === 'perfil' && 'Mi Perfil'}
              </h2>
              <p className="mt-1 text-xs font-semibold text-gray-600 tracking-widest uppercase truncate">
                {activeTab === 'dashboard' && 'Resumen de actividades y estadísticas'}
                {activeTab === 'pacientes' && 'Administra la información de tus pacientes'}
                {activeTab === 'citas' && 'Gestiona las citas de tus pacientes'}
                {activeTab === 'disponibilidad' && 'Configura tus horarios disponibles'}
                {activeTab === 'servicios' && 'Configura los servicios que ofreces a los pacientes'}
                {activeTab === 'tareas' && 'Asigna y gestiona tareas para tus pacientes'}
                {activeTab === 'reportes' && 'Registra y consulta reportes de seguimiento'}
                {activeTab === 'chat' && 'Comunícate en tiempo real con tus pacientes'}
                {activeTab === 'pdf' && 'Descarga tu agenda en formato PDF'}
                {activeTab === 'perfil' && 'Actualiza tu información personal y profesional'}
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
                onClick={() => setActiveTab('pacientes')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'pacientes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                Gestión de Pacientes
              </button>

              <button
                onClick={() => setActiveTab('citas')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'citas'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                Citas
              </button>

              <button
                onClick={() => setActiveTab('disponibilidad')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'disponibilidad'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                Disponibilidad
              </button>

              <button
                onClick={() => setActiveTab('servicios')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'servicios'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                Servicios
              </button>
              <button
                onClick={() => setActiveTab('tareas')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'tareas'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                Tareas
              </button>
              <button
                onClick={() => setActiveTab('reportes')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'reportes'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                📊 Reportes
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'pdf'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
                }`}
              >
                PDF
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
            {/* Estadísticas detalladas */}
            <EstadisticasPsicologo psicologoId={user?.id || ''} />
            
            {/* Estadísticas básicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Sesiones Hoy</h3>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">{sesionesHoy.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Total Sesiones</h3>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">{totalSesiones}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Pacientes Activos</h3>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                  {new Set(sesionesHoy.map(s => s.paciente)).size + new Set(sesionesRealizadas.map(s => s.paciente)).size}
                </p>
              </div>
            </div>

            {/* Sesiones de Hoy */}
            <div className="bg-white rounded-lg shadow-sm border border-amber-100">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-amber-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sesiones de Hoy</h3>
              </div>
              <div className="p-4 sm:p-6">
                {sesionesHoy.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {sesionesHoy.map((sesion) => (
                      <div key={sesion.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-2 sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{sesion.paciente}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{sesion.fecha} - {sesion.hora}</p>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(sesion.estado)} whitespace-nowrap`}>
                          {getEstadoText(sesion.estado)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay sesiones programadas para hoy</p>
                )}
              </div>
            </div>

            {/* Sesiones Recientes */}
            <div className="bg-white rounded-lg shadow-sm border border-amber-100">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-amber-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sesiones Recientes</h3>
              </div>
              <div className="p-4 sm:p-6">
                {sesionesRealizadas.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {sesionesRealizadas.map((sesion) => (
                      <div key={sesion.id} className="border-b border-amber-200 pb-3 sm:pb-4 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-1 sm:space-y-0">
                          <h4 className="font-medium text-gray-900 truncate">{sesion.paciente}</h4>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(sesion.estado)} whitespace-nowrap`}>
                            {getEstadoText(sesion.estado)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{sesion.fecha} - {sesion.hora}</p>
                        {sesion.notas && (
                          <p className="text-xs sm:text-sm text-gray-700 bg-amber-50 p-2 sm:p-3 rounded border border-amber-200">
                            <strong>Notas:</strong> {sesion.notas}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay sesiones recientes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pacientes' && (
          <GestionPacientes onPacienteCreado={handlePacienteCreado} />
        )}

        {activeTab === 'citas' && (
          <CitasPsicologo />
        )}

        {activeTab === 'disponibilidad' && (
          <GestionDisponibilidadMensual psicologoId={user?.id || ''} />
        )}

        {activeTab === 'servicios' && (
          <div className="space-y-6">
            {/* Botón de agregar servicio */}
            <div className="flex justify-end">
              <button
                onClick={() => setMostrarAgregarServicio(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Agregar Servicio</span>
              </button>
            </div>

            {/* Lista de servicios */}
            <div className="bg-white rounded-lg shadow-sm border border-amber-100">
              <div className="px-6 py-4 border-b border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900">Servicios Configurados</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {servicios.length > 0 ? (
                    servicios.map((servicio) => (
                      <div key={servicio.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{servicio.nombre}</h4>
                          <p className="text-sm text-gray-600">{servicio.descripcion}</p>
                          <p className="text-xs text-amber-600 font-medium">Duración: {servicio.duracion} minutos</p>
                          <p className="text-xs text-gray-500">Categoría: {servicio.categoria}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                                                      <button 
                              onClick={() => eliminarServicioHandler(servicio.id)}
                              className="text-red-400 hover:text-red-600 p-1"
                              title="Eliminar servicio"
                            >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">📋</div>
                      <p className="text-gray-500">No hay servicios configurados</p>
                      <p className="text-gray-400 text-sm mt-1">Agrega servicios para que los pacientes puedan seleccionarlos</p>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Información Importante</h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Los servicios que configures aquí aparecerán en la vista del paciente</li>
                    <li>• Cada servicio debe tener una duración específica</li>
                    <li>• Los pacientes podrán seleccionar el tipo de consulta que necesitan</li>
                    <li>• Asegúrate de que los servicios estén activos para que sean visibles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tareas' && (
          <GestionTareas />
        )}

        {activeTab === 'reportes' && (
          <GestionReportesProgreso />
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <ChatPsicologo psicologoId={user?.id || ''} />
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="space-y-6">
            <GenerarAgendaPDF psicologoId={user?.id || ''} />
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={perfilData.especialidad}
                      onChange={(e) => setPerfilData({...perfilData, especialidad: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={perfilData.descripcion}
                    onChange={(e) => setPerfilData({...perfilData, descripcion: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Perfil'}
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
              {message && (
                <div className={`p-3 rounded-md ${
                  message.includes('exitosamente') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message}
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
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 text-center"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal Agregar Servicio */}
      {mostrarAgregarServicio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Seleccionar Tipo de Servicio</h3>
              <button
                onClick={() => setMostrarAgregarServicio(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Selección de categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categoría del Servicio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {obtenerCategorias().map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => setCategoriaSeleccionada(categoria)}
                      className={`p-3 text-left rounded-lg border-2 transition-colors ${
                        categoriaSeleccionada === categoria
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="font-medium">{categoria}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {TIPOS_SERVICIOS.filter(s => s.categoria === categoria).length} servicios disponibles
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de servicios de la categoría seleccionada */}
              {categoriaSeleccionada && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Servicios de {categoriaSeleccionada}
                  </label>
                  <div className="space-y-3">
                    {TIPOS_SERVICIOS.filter(servicio => servicio.categoria === categoriaSeleccionada).map((servicio) => (
                      <button
                        key={servicio.id}
                        onClick={() => setServicioSeleccionado(servicio)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          servicioSeleccionado?.id === servicio.id
                            ? 'border-amber-500 bg-amber-50 text-amber-800'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{servicio.nombre}</h4>
                            <p className="text-sm text-gray-600 mt-1">{servicio.descripcion}</p>
                            <p className="text-xs text-amber-600 font-medium mt-2">Duración: {servicio.duracion} minutos</p>
                          </div>
                          <div className="ml-4">
                            {servicioSeleccionado?.id === servicio.id && (
                              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Información del servicio seleccionado */}
              {servicioSeleccionado && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Servicio Seleccionado:</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Nombre:</span> {servicioSeleccionado.nombre}</p>
                    <p className="text-sm"><span className="font-medium">Descripción:</span> {servicioSeleccionado.descripcion}</p>
                    <p className="text-sm"><span className="font-medium">Duración:</span> {servicioSeleccionado.duracion} minutos</p>
                    <p className="text-sm"><span className="font-medium">Categoría:</span> {servicioSeleccionado.categoria}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setMostrarAgregarServicio(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={agregarServicio}
                disabled={!servicioSeleccionado}
                className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar Servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Notificación */}
      <Notificacion
        titulo={notificacion.tipo === 'exito' ? 'Éxito' : notificacion.tipo === 'error' ? 'Error' : notificacion.tipo === 'advertencia' ? 'Advertencia' : 'Información'}
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        visible={notificacion.visible}
        onCerrar={cerrarNotificacion}
      />
    </div>
  );
};

export default PanelPsicologo; 
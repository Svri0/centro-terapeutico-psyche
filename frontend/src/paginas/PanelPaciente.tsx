import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
}

interface HorarioDisponible {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  servicio: Servicio;
}

interface Psicologo {
  id: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  descripcion: string;
}

const PanelPaciente: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [psicologo, setPsicologo] = useState<Psicologo | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    cargarDatosPaciente();
  }, [navigate]);

  const cargarDatosPaciente = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamadas a la API para obtener:
      // 1. Psicólogo asignado al paciente
      // 2. Servicios disponibles del psicólogo
      // 3. Horarios disponibles para la semana actual
      
      // Datos de ejemplo
      setPsicologo({
        id: '1',
        nombres: 'María',
        apellidos: 'González',
        especialidad: 'Psicología Clínica',
        descripcion: 'Especialista en terapia cognitivo-conductual'
      });

      setServicios([
        {
          id: 1,
          nombre: 'Consulta Psicología General',
          descripcion: 'Sesiones de psicología para adultos (mayor a 15 años)',
          duracion: 60
        },
        {
          id: 2,
          nombre: 'Terapia de Parejas',
          descripcion: 'Sesiones especializadas para parejas',
          duracion: 90
        }
      ]);

      setHorariosDisponibles([
        {
          id: '1',
          fecha: '2025-08-01',
          hora_inicio: '09:00',
          hora_fin: '10:00',
          servicio: {
            id: 1,
            nombre: 'Consulta Psicología General',
            descripcion: 'Sesiones de psicología para adultos (mayor a 15 años)',
            duracion: 60
          }
        },
        {
          id: '2',
          fecha: '2025-08-01',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          servicio: {
            id: 1,
            nombre: 'Consulta Psicología General',
            descripcion: 'Sesiones de psicología para adultos (mayor a 15 años)',
            duracion: 60
          }
        },
        {
          id: '3',
          fecha: '2025-08-01',
          hora_inicio: '11:00',
          hora_fin: '12:30',
          servicio: {
            id: 2,
            nombre: 'Terapia de Parejas',
            descripcion: 'Sesiones especializadas para parejas',
            duracion: 90
          }
        }
      ]);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string) => {
    return hora.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src="/src/img/psyche.svg" alt="Psyche" className="h-12 w-auto" />
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Panel del Paciente</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.nombres} {user?.apellidos}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Psicólogo */}
        {psicologo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {psicologo.nombres} {psicologo.apellidos}
                </h2>
                <p className="text-gray-600">{psicologo.especialidad}</p>
                <p className="text-sm text-gray-500">{psicologo.descripcion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Selección de Fecha */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu hora</h3>
          
          {/* Navegación de semanas */}
          <div className="flex items-center justify-between mb-6">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-600">Semana desde el 1 al 7 de Agosto</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Vie 1', 'S 2', 'D 3', 'L 4', 'M 5', 'M 6', 'J 7'].map((dia, index) => (
              <button
                key={index}
                className={`p-3 text-center rounded-lg border-2 transition-colors ${
                  index === 0 
                    ? 'border-purple-500 bg-pink-100 text-purple-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-medium">{dia}</div>
                {index !== 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </button>
            ))}
          </div>

          {/* Fecha seleccionada */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-purple-700">Viernes 1 de Agosto</h4>
          </div>
        </div>

        {/* Horarios Disponibles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios Disponibles</h3>
          
          {horariosDisponibles.length > 0 ? (
            <div className="space-y-4">
              {horariosDisponibles.map((horario) => (
                <div key={horario.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {psicologo?.nombres} {psicologo?.apellidos}
                        </h4>
                        <p className="text-sm text-gray-600">{horario.servicio.nombre}</p>
                        <p className="text-xs text-gray-500">{horario.servicio.descripcion}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                        </p>
                        <p className="text-xs text-gray-500">{horario.servicio.duracion} minutos</p>
                      </div>
                      
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">📅</div>
              <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
              <p className="text-gray-400 text-sm mt-1">Intenta con otra fecha</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PanelPaciente; 
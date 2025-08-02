import React, { useState, useEffect } from 'react';
import { disponibilidadSemanalService, DisponibilidadSemanal } from '../servicios/disponibilidad-semanal.service';

interface Horario {
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

interface VisualizarDisponibilidadProps {
  // Sin filtros - disponibilidad semanal
}

const VisualizarDisponibilidad: React.FC<VisualizarDisponibilidadProps> = () => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadSemanal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const diasSemana = [
    { id: 'lunes', nombre: 'Lunes' },
    { id: 'martes', nombre: 'Martes' },
    { id: 'miercoles', nombre: 'Miércoles' },
    { id: 'jueves', nombre: 'Jueves' },
    { id: 'viernes', nombre: 'Viernes' },
    { id: 'sabado', nombre: 'Sábado' }
  ];

  useEffect(() => {
    cargarDisponibilidad();
  }, []);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await disponibilidadSemanalService.obtenerDisponibilidadSemanal();
      setDisponibilidad(response.disponibilidad);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const obtenerHorariosPorDia = (dia: string) => {
    if (!disponibilidad) return [];
    return disponibilidad[`${dia}_horarios` as keyof DisponibilidadSemanal] as Horario[] || [];
  };

  const formatearHora = (hora: string) => {
    return hora.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3 text-gray-600">Cargando disponibilidad...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
                   {/* Header con información de la semana */}
      <div className="mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Disponibilidad Semanal</h2>
          <p className="text-gray-600 text-sm">Configuración actual de la semana</p>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-500">⚠️</div>
            <p className="ml-2 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de días */}
      <div className="grid gap-6">
        {diasSemana.map((dia) => {
          const horariosDia = obtenerHorariosPorDia(dia.id);
          const horariosActivos = horariosDia.filter(h => h.activo);
          
          return (
            <div key={dia.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{dia.nombre}</h2>
                <p className="text-gray-600 text-sm">
                  {horariosActivos.length > 0 
                    ? `${horariosActivos.length} horario${horariosActivos.length !== 1 ? 's' : ''} disponible${horariosActivos.length !== 1 ? 's' : ''}`
                    : 'No hay horarios disponibles'
                  }
                </p>
              </div>
              
              <div className="p-6">
                {horariosActivos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">📅</div>
                    <p className="text-gray-500">No hay horarios configurados para este día</p>
                    <p className="text-gray-400 text-sm mt-1">Los pacientes no podrán agendar citas en este día</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {horariosActivos.map((horario, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-amber-600 font-medium">
                              {formatearHora(horario.hora_inicio)}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className="text-amber-600 font-medium">
                              {formatearHora(horario.hora_fin)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({Math.round((new Date(`2000-01-01T${horario.hora_fin}`).getTime() - new Date(`2000-01-01T${horario.hora_inicio}`).getTime()) / (1000 * 60))} minutos)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Disponible
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

             {/* Información adicional */}
       <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
         <h3 className="text-lg font-semibold text-amber-900 mb-2">Sistema Semanal</h3>
         <ul className="text-amber-800 space-y-1 text-sm">
           <li>• Cada semana debes configurar tu disponibilidad</li>
           <li>• Máximo 40 horas semanales según ley chilena</li>
           <li>• Los feriados se consideran automáticamente</li>
           <li>• Para editar, usa "Editar Horarios" en la pestaña Disponibilidad</li>
         </ul>
       </div>
    </div>
  );
};

export default VisualizarDisponibilidad; 
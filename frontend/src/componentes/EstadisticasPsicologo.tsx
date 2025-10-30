import React, { useState, useEffect } from 'react';
import { citasService } from '../servicios/citas.service';
import { authService } from '../servicios/auth.service';
import HorasTrabajadas from './HorasTrabajadas';
import CrearCitasPrueba from './CrearCitasPrueba';

interface EstadisticasPsicologoProps {
  psicologoId: string;
}

interface Estadisticas {
  totalCitas: number;
  citasHoy: number;
  citasEstaSemana: number;
  citasEsteMes: number;
  pacientesActivos: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasNoShow: number;
  promedioDuracion: number;
}

const EstadisticasPsicologo: React.FC<EstadisticasPsicologoProps> = ({ psicologoId }) => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalCitas: 0,
    citasHoy: 0,
    citasEstaSemana: 0,
    citasEsteMes: 0,
    pacientesActivos: 0,
    citasCompletadas: 0,
    citasCanceladas: 0,
    citasNoShow: 0,
    promedioDuracion: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [psicologoId]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);

      const citas = await citasService.obtenerCitas();
      
      console.log('🔍 Citas obtenidas:', citas);
      console.log('🔍 Tipo de citas:', typeof citas);
      console.log('🔍 Es array:', Array.isArray(citas));
      
      // Verificar que las citas tengan la estructura esperada
      if (!Array.isArray(citas)) {
        console.error('Las citas no son un array:', citas);
        setError('Error en el formato de datos de citas');
        return;
      }
      
      // Si no hay citas, mostrar estadísticas vacías
      if (citas.length === 0) {
        console.log('📝 No hay citas disponibles');
        setEstadisticas({
          totalCitas: 0,
          citasHoy: 0,
          citasEstaSemana: 0,
          citasEsteMes: 0,
          pacientesActivos: 0,
          citasCompletadas: 0,
          citasCanceladas: 0,
          citasNoShow: 0,
          promedioDuracion: 0
        });
        setLoading(false);
        return;
      }
      
      const hoy = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
      
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const inicioMesStr = inicioMes.toISOString().split('T')[0];

      const estadisticasCalculadas: Estadisticas = {
        totalCitas: citas.length,
        citasHoy: citas.filter(c => c.fecha === hoy).length,
        citasEstaSemana: citas.filter(c => c.fecha >= inicioSemanaStr).length,
        citasEsteMes: citas.filter(c => c.fecha >= inicioMesStr).length,
        pacientesActivos: new Set(citas.map(c => c.paciente_id)).size,
        citasCompletadas: citas.filter(c => c.estado === 'completada').length,
        citasCanceladas: citas.filter(c => c.estado === 'cancelada').length,
        citasNoShow: citas.filter(c => c.estado === 'no_show').length,
        promedioDuracion: citas.length > 0 
          ? Math.round(citas.reduce((sum, c) => sum + c.duracion_minutos, 0) / citas.length)
          : 0
      };

      setEstadisticas(estadisticasCalculadas);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      // Manejar diferentes tipos de errores
      if (err.message && err.message.includes('obtenerCitasPsicologo')) {
        setError('Error: Método no encontrado en el servicio de citas');
      } else if (err.response && err.response.status === 500) {
        setError('Error del servidor: Problema interno del backend');
      } else if (err.response && err.response.status === 401) {
        setError('Error de autenticación: Token inválido o expirado');
      } else {
        setError(err.message || 'Error al cargar las estadísticas');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex">
          <div className="text-red-500">⚠️</div>
          <p className="ml-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const user = authService.getUser();

  return (
    <div className="space-y-6">
      {/* Botón de exportar PDF */}
      <ExportarDashboardPDF 
        estadisticas={estadisticas}
        nombrePsicologo={`${user?.nombres} ${user?.apellidos}`}
      />
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.citasHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.pacientesActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Duración</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.promedioDuracion} min</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Citas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.totalCitas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas por período */}
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Citas por Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Esta semana</span>
              <span className="font-semibold text-gray-900">{estadisticas.citasEstaSemana}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Este mes</span>
              <span className="font-semibold text-gray-900">{estadisticas.citasEsteMes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{estadisticas.totalCitas}</span>
            </div>
          </div>
        </div>

        {/* Estados de citas */}
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados de Citas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completadas</span>
              <span className="font-semibold text-green-600">{estadisticas.citasCompletadas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Canceladas</span>
              <span className="font-semibold text-red-600">{estadisticas.citasCanceladas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">No asistió</span>
              <span className="font-semibold text-orange-600">{estadisticas.citasNoShow}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de rendimiento */}
      <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tasa de asistencia</span>
              <span>
                {estadisticas.totalCitas > 0 
                  ? Math.round(((estadisticas.totalCitas - estadisticas.citasCanceladas - estadisticas.citasNoShow) / estadisticas.totalCitas) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${estadisticas.totalCitas > 0 
                    ? ((estadisticas.totalCitas - estadisticas.citasCanceladas - estadisticas.citasNoShow) / estadisticas.totalCitas) * 100
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tasa de completación</span>
              <span>
                {estadisticas.totalCitas > 0 
                  ? Math.round((estadisticas.citasCompletadas / estadisticas.totalCitas) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${estadisticas.totalCitas > 0 
                    ? (estadisticas.citasCompletadas / estadisticas.totalCitas) * 100
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Componente temporal para crear citas de prueba */}
      <div className="mt-8">
        <CrearCitasPrueba />
      </div>

      {/* Sección de Horas Trabajadas */}
      <div className="mt-8">
        <HorasTrabajadas psicologoId={psicologoId} />
      </div>
    </div>
  );
};

export default EstadisticasPsicologo; 
import React, { useState, useEffect } from 'react';
import { citasService } from '../servicios/citas.service';

interface HorasTrabajadasProps {
  psicologoId?: string; // Si no se proporciona, muestra todas las horas (admin)
  esAdmin?: boolean;
}

interface HorasPorDia {
  fecha: string;
  horas: number;
  sesiones: number;
}

interface HorasPorMes {
  mes: string;
  totalHoras: number;
  totalSesiones: number;
  diasTrabajados: number;
  promedioHorasPorDia: number;
  detallePorDia: HorasPorDia[];
}

const HorasTrabajadas: React.FC<HorasTrabajadasProps> = ({ 
  psicologoId, 
  esAdmin = false 
}) => {
  const [horasMensuales, setHorasMensuales] = useState<HorasPorMes[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHorasTrabajadas();
  }, [psicologoId]);

  const cargarHorasTrabajadas = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar llamada al backend para obtener horas trabajadas
      // const response = await horasService.obtenerHorasTrabajadas({
      //   psicologoId,
      //   esAdmin
      // });

      // Datos de ejemplo por ahora
      const datosEjemplo: HorasPorMes[] = [
        {
          mes: '2024-10',
          totalHoras: 120,
          totalSesiones: 120,
          diasTrabajados: 20,
          promedioHorasPorDia: 6,
          detallePorDia: [
            { fecha: '2024-10-01', horas: 8, sesiones: 8 },
            { fecha: '2024-10-02', horas: 6, sesiones: 6 },
            { fecha: '2024-10-03', horas: 7, sesiones: 7 },
            { fecha: '2024-10-04', horas: 5, sesiones: 5 },
            { fecha: '2024-10-05', horas: 8, sesiones: 8 },
            { fecha: '2024-10-08', horas: 6, sesiones: 6 },
            { fecha: '2024-10-09', horas: 7, sesiones: 7 },
            { fecha: '2024-10-10', horas: 8, sesiones: 8 },
            { fecha: '2024-10-11', horas: 5, sesiones: 5 },
            { fecha: '2024-10-12', horas: 6, sesiones: 6 },
            { fecha: '2024-10-15', horas: 8, sesiones: 8 },
            { fecha: '2024-10-16', horas: 7, sesiones: 7 },
            { fecha: '2024-10-17', horas: 6, sesiones: 6 },
            { fecha: '2024-10-18', horas: 8, sesiones: 8 },
            { fecha: '2024-10-19', horas: 5, sesiones: 5 },
            { fecha: '2024-10-22', horas: 7, sesiones: 7 },
            { fecha: '2024-10-23', horas: 6, sesiones: 6 },
            { fecha: '2024-10-24', horas: 8, sesiones: 8 },
            { fecha: '2024-10-25', horas: 5, sesiones: 5 },
            { fecha: '2024-10-26', horas: 6, sesiones: 6 }
          ]
        },
        {
          mes: '2024-09',
          totalHoras: 140,
          totalSesiones: 140,
          diasTrabajados: 22,
          promedioHorasPorDia: 6.4,
          detallePorDia: [
            { fecha: '2024-09-02', horas: 8, sesiones: 8 },
            { fecha: '2024-09-03', horas: 6, sesiones: 6 },
            { fecha: '2024-09-04', horas: 7, sesiones: 7 },
            { fecha: '2024-09-05', horas: 8, sesiones: 8 },
            { fecha: '2024-09-06', horas: 5, sesiones: 5 },
            { fecha: '2024-09-09', horas: 7, sesiones: 7 },
            { fecha: '2024-09-10', horas: 6, sesiones: 6 },
            { fecha: '2024-09-11', horas: 8, sesiones: 8 },
            { fecha: '2024-09-12', horas: 6, sesiones: 6 },
            { fecha: '2024-09-13', horas: 7, sesiones: 7 },
            { fecha: '2024-09-16', horas: 8, sesiones: 8 },
            { fecha: '2024-09-17', horas: 5, sesiones: 5 },
            { fecha: '2024-09-18', horas: 6, sesiones: 6 },
            { fecha: '2024-09-19', horas: 8, sesiones: 8 },
            { fecha: '2024-09-20', horas: 7, sesiones: 7 },
            { fecha: '2024-09-23', horas: 6, sesiones: 6 },
            { fecha: '2024-09-24', horas: 8, sesiones: 8 },
            { fecha: '2024-09-25', horas: 5, sesiones: 5 },
            { fecha: '2024-09-26', horas: 7, sesiones: 7 },
            { fecha: '2024-09-27', horas: 6, sesiones: 6 },
            { fecha: '2024-09-30', horas: 8, sesiones: 8 }
          ]
        }
      ];

      setHorasMensuales(datosEjemplo);
      if (datosEjemplo.length > 0) {
        setMesSeleccionado(datosEjemplo[0].mes);
      }
    } catch (err: any) {
      console.error('Error al cargar horas trabajadas:', err);
      setError('Error al cargar las horas trabajadas');
    } finally {
      setLoading(false);
    }
  };

  const formatearMes = (mes: string) => {
    const [año, mesNum] = mes.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[parseInt(mesNum) - 1]} ${año}`;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const mesActual = horasMensuales.find(mes => mes.mes === mesSeleccionado);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando horas trabajadas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {esAdmin ? '📊 Horas Trabajadas - Todos los Psicólogos' : '⏰ Mis Horas Trabajadas'}
          </h2>
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {horasMensuales.map((mes) => (
              <option key={mes.mes} value={mes.mes}>
                {formatearMes(mes.mes)}
              </option>
            ))}
          </select>
        </div>

        {/* Resumen del mes seleccionado */}
        {mesActual && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{mesActual.totalHoras}h</div>
              <div className="text-sm text-blue-700">Total Horas</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{mesActual.totalSesiones}</div>
              <div className="text-sm text-green-700">Sesiones Completadas</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{mesActual.diasTrabajados}</div>
              <div className="text-sm text-yellow-700">Días Trabajados</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{mesActual.promedioHorasPorDia.toFixed(1)}h</div>
              <div className="text-sm text-purple-700">Promedio por Día</div>
            </div>
          </div>
        )}
      </div>

      {/* Detalle por día */}
      {mesActual && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📅 Desglose Diario - {formatearMes(mesActual.mes)}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Trabajadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sesiones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mesActual.detallePorDia.map((dia, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatearFecha(dia.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dia.horas}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dia.sesiones}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        dia.horas >= 8 ? 'bg-green-100 text-green-800' :
                        dia.horas >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dia.horas >= 8 ? 'Completo' : dia.horas >= 6 ? 'Parcial' : 'Bajo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráfico de barras simple */}
      {mesActual && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📈 Gráfico de Horas por Día
          </h3>
          <div className="space-y-2">
            {mesActual.detallePorDia.map((dia, index) => (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">
                  {formatearFecha(dia.fecha)}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${(dia.horas / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm font-medium text-gray-900">
                  {dia.horas}h
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorasTrabajadas;





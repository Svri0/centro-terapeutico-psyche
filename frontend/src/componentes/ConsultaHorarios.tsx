import React, { useState, useEffect } from 'react';
import horariosService, { HorarioCompleto } from '../servicios/horarios.service';

interface ConsultaHorariosProps {
  onClose: () => void;
}

interface Horario {
  hora: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
  sabado: string;
  domingo: string;
}

const ConsultaHorarios: React.FC<ConsultaHorariosProps> = ({ onClose }) => {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [mostrarHorario, setMostrarHorario] = useState(false);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [horarioActual, setHorarioActual] = useState<HorarioCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar especialidades al montar el componente
  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        setLoading(true);
        const especialidadesData = await horariosService.obtenerEspecialidades();
        setEspecialidades(especialidadesData);
      } catch (err: any) {
        setError(err.message);
        // Fallback a especialidades estáticas si falla la API
        setEspecialidades([
          'Psicología Clínica',
          'Psicología Infantil',
          'Psicología de Pareja',
          'Psicología Laboral',
          'Psicología Forense',
          'Neuropsicología',
          'Psicología Deportiva',
          'Psicología Educacional'
        ]);
      } finally {
        setLoading(false);
      }
    };

    cargarEspecialidades();
  }, []);

  const handleConsultarHorario = async () => {
    if (especialidadSeleccionada) {
      try {
        setLoading(true);
        setError('');
        const horario = await horariosService.obtenerHorariosPorEspecialidad(especialidadSeleccionada);
        setHorarioActual(horario);
        setMostrarHorario(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getCellStyle = (content: string) => {
    if (content === 'Cerrado') {
      return 'bg-red-50 text-red-600 font-medium';
    }
    if (content === 'Almuerzo') {
      return 'bg-yellow-50 text-yellow-700 font-medium';
    }
    return 'bg-green-50 text-green-700 font-medium';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Consulta de Horarios</h2>

        {/* Selección de Especialidad */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona una Especialidad
          </label>
          {loading && especialidades.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="ml-3 text-gray-600">Cargando especialidades...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {especialidades.map((especialidad) => (
                <button
                  key={especialidad}
                  onClick={() => setEspecialidadSeleccionada(especialidad)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    especialidadSeleccionada === especialidad
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-25'
                  }`}
                >
                  <div className="text-sm font-medium">{especialidad}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botón para consultar horario */}
        {especialidadSeleccionada && (
          <div className="mb-6">
            <button
              onClick={handleConsultarHorario}
              disabled={loading}
              className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Consultando...' : `Consultar Horario - ${especialidadSeleccionada}`}
            </button>
          </div>
        )}

        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Horario Semanal */}
        {mostrarHorario && horarioActual && (
          <div className="mt-8">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Horario Semanal - {horarioActual.especialidad}
              </h3>
              <p className="text-sm text-gray-600">
                Horarios de atención de los profesionales especializados
                {horarioActual.tipo === 'ejemplo' && (
                  <span className="text-amber-600 font-medium"> (Datos de ejemplo)</span>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Lunes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Martes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Miércoles
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Jueves
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Viernes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-r border-amber-200">
                      Sábado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Domingo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {horarioActual.horario.map((fila, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {fila.hora}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.lunes)} border-r border-gray-200`}>
                        {fila.lunes}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.martes)} border-r border-gray-200`}>
                        {fila.martes}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.miercoles)} border-r border-gray-200`}>
                        {fila.miercoles}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.jueves)} border-r border-gray-200`}>
                        {fila.jueves}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.viernes)} border-r border-gray-200`}>
                        {fila.viernes}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.sabado)} border-r border-gray-200`}>
                        {fila.sabado}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getCellStyle(fila.domingo)}`}>
                        {fila.domingo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Leyenda:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
                  <span className="text-green-700">Disponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-2"></div>
                  <span className="text-yellow-700">Almuerzo</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-2"></div>
                  <span className="text-red-600">Cerrado</span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Información Importante:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Los horarios están sujetos a cambios sin previo aviso</li>
                <li>• Se recomienda agendar citas con al menos 24 horas de anticipación</li>
                <li>• Para emergencias, contactar al número de emergencias: +56 9 1234 5678</li>
                <li>• Los sábados y domingos el centro permanece cerrado</li>
              </ul>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cerrar
          </button>
          {mostrarHorario && (
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-800 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Imprimir Horario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaHorarios; 
import React, { useState, useEffect } from 'react';
import HorasTrabajadas from './HorasTrabajadas';

interface Psicologo {
  id: string;
  nombre: string;
  email: string;
  especialidad: string;
  totalHoras: number;
  totalSesiones: number;
  ultimaActividad: string;
}

interface DashboardAdminProps {
  adminId: string;
}

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ adminId }) => {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPsicologos();
  }, []);

  const cargarPsicologos = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar llamada al backend para obtener lista de psicólogos
      // const response = await adminService.obtenerPsicologos();

      // Datos de ejemplo por ahora
      const datosEjemplo: Psicologo[] = [
        {
          id: '1',
          nombre: 'Dr. María González',
          email: 'maria.gonzalez@centro.com',
          especialidad: 'Psicología Clínica',
          totalHoras: 120,
          totalSesiones: 120,
          ultimaActividad: '2024-10-22'
        },
        {
          id: '2',
          nombre: 'Dr. Carlos Rodríguez',
          email: 'carlos.rodriguez@centro.com',
          especialidad: 'Terapia Cognitivo-Conductual',
          totalHoras: 140,
          totalSesiones: 140,
          ultimaActividad: '2024-10-22'
        },
        {
          id: '3',
          nombre: 'Dra. Ana Martínez',
          email: 'ana.martinez@centro.com',
          especialidad: 'Psicología Infantil',
          totalHoras: 100,
          totalSesiones: 100,
          ultimaActividad: '2024-10-21'
        },
        {
          id: '4',
          nombre: 'Dr. Luis Pérez',
          email: 'luis.perez@centro.com',
          especialidad: 'Psicología Forense',
          totalHoras: 80,
          totalSesiones: 80,
          ultimaActividad: '2024-10-20'
        }
      ];

      setPsicologos(datosEjemplo);
      if (datosEjemplo.length > 0) {
        setPsicologoSeleccionado(datosEjemplo[0].id);
      }
    } catch (err: any) {
      console.error('Error al cargar psicólogos:', err);
      setError('Error al cargar la información de los psicólogos');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando dashboard de administrador...</span>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Dashboard Administrador
        </h1>
        <p className="text-gray-600">
          Gestión y supervisión de horas trabajadas del equipo de psicólogos
        </p>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600">
            {psicologos.length}
          </div>
          <div className="text-sm text-blue-700">Psicólogos Activos</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">
            {psicologos.reduce((sum, p) => sum + p.totalHoras, 0)}h
          </div>
          <div className="text-sm text-green-700">Total Horas Trabajadas</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-yellow-600">
            {psicologos.reduce((sum, p) => sum + p.totalSesiones, 0)}
          </div>
          <div className="text-sm text-yellow-700">Total Sesiones</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-600">
            {Math.round(psicologos.reduce((sum, p) => sum + p.totalHoras, 0) / psicologos.length)}h
          </div>
          <div className="text-sm text-purple-700">Promedio por Psicólogo</div>
        </div>
      </div>

      {/* Lista de psicólogos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          👥 Equipo de Psicólogos
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Trabajadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {psicologos.map((psicologo) => (
                <tr key={psicologo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {psicologo.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {psicologo.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {psicologo.especialidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {psicologo.totalHoras}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {psicologo.totalSesiones}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(psicologo.ultimaActividad)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setPsicologoSeleccionado(psicologo.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selector de psicólogo para ver horas detalladas */}
      {psicologos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              📈 Horas Trabajadas Detalladas
            </h2>
            <select
              value={psicologoSeleccionado}
              onChange={(e) => setPsicologoSeleccionado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {psicologos.map((psicologo) => (
                <option key={psicologo.id} value={psicologo.id}>
                  {psicologo.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <HorasTrabajadas 
            psicologoId={psicologoSeleccionado} 
            esAdmin={true}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;



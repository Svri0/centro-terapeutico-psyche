import React, { useState, useEffect } from 'react';
import { recordatoriosService, ConfiguracionRecordatorio, CrearConfiguracionRecordatorioData } from '../servicios/recordatorios.service';

const ConfiguracionRecordatorios: React.FC = () => {
  const [configuraciones, setConfiguraciones] = useState<Record<string, ConfiguracionRecordatorio[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [configuracionEditando, setConfiguracionEditando] = useState<ConfiguracionRecordatorio | null>(null);

  // Opciones disponibles
  const tiposEventos = recordatoriosService.obtenerTiposEventos();
  const canalesNotificacion = recordatoriosService.obtenerCanalesNotificacion();
  const diasSemana = recordatoriosService.obtenerDiasSemana();

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      const respuesta = await recordatoriosService.obtenerConfiguraciones();
      setConfiguraciones(respuesta.configuraciones);
    } catch (error) {
      setError('Error al cargar las configuraciones');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearConfiguracion = () => {
    setConfiguracionEditando(null);
    setMostrarModal(true);
  };

  const handleEditarConfiguracion = (configuracion: ConfiguracionRecordatorio) => {
    setConfiguracionEditando(configuracion);
    setMostrarModal(true);
  };

  const handleEliminarConfiguracion = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      return;
    }

    try {
      await recordatoriosService.eliminarConfiguracion(id);
      await cargarConfiguraciones();
    } catch (error) {
      setError('Error al eliminar la configuración');
      console.error('Error:', error);
    }
  };

  const handleGuardarConfiguracion = async (data: CrearConfiguracionRecordatorioData) => {
    try {
      await recordatoriosService.crearActualizarConfiguracion(data);
      setMostrarModal(false);
      await cargarConfiguraciones();
    } catch (error) {
      setError('Error al guardar la configuración');
      console.error('Error:', error);
    }
  };

  const obtenerConfiguracionExistente = (tipoEvento: string, canal: string) => {
    const configsDelTipo = configuraciones[tipoEvento] || [];
    return configsDelTipo.find(config => config.canal_notificacion === canal);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de Recordatorios</h2>
          <p className="text-gray-600 mt-1">Gestiona cómo y cuándo recibir notificaciones</p>
        </div>
        <button
          onClick={handleCrearConfiguracion}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nueva Configuración
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabla de configuraciones agrupadas por tipo de evento */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canales Configurados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiposEventos.map((tipoEvento) => {
                const configsDelTipo = configuraciones[tipoEvento.value] || [];
                const configsActivas = configsDelTipo.filter(config => config.activo);
                
                return (
                  <tr key={tipoEvento.value}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tipoEvento.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tipoEvento.descripcion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {configsDelTipo.map((config) => {
                          const canal = canalesNotificacion.find(c => c.value === config.canal_notificacion);
                          return (
                            <span
                              key={config.id}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                config.activo 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {canal?.icono} {canal?.label}
                            </span>
                          );
                        })}
                        {configsDelTipo.length === 0 && (
                          <span className="text-sm text-gray-500">Sin configuraciones</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        configsActivas.length > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {configsActivas.length > 0 ? `${configsActivas.length} activas` : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setMostrarModal(true)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          Configurar
                        </button>
                        {configsDelTipo.map((config) => (
                          <div key={config.id} className="flex space-x-1">
                            <button
                              onClick={() => handleEditarConfiguracion(config)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarConfiguracion(config.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar configuración */}
      {mostrarModal && (
        <ModalConfiguracion
          configuracion={configuracionEditando}
          tiposEventos={tiposEventos}
          canalesNotificacion={canalesNotificacion}
          diasSemana={diasSemana}
          onGuardar={handleGuardarConfiguracion}
          onCerrar={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente Modal para crear/editar configuración
interface ModalConfiguracionProps {
  configuracion: ConfiguracionRecordatorio | null;
  tiposEventos: any[];
  canalesNotificacion: any[];
  diasSemana: any[];
  onGuardar: (data: CrearConfiguracionRecordatorioData) => void;
  onCerrar: () => void;
}

const ModalConfiguracion: React.FC<ModalConfiguracionProps> = ({
  configuracion,
  tiposEventos,
  canalesNotificacion,
  diasSemana,
  onGuardar,
  onCerrar
}) => {
  const [formData, setFormData] = useState<CrearConfiguracionRecordatorioData>({
    tipo_evento: configuracion?.tipo_evento || '',
    canal_notificacion: configuracion?.canal_notificacion || '',
    activo: configuracion?.activo ?? true,
    configuracion_personalizada: configuracion?.configuracion_personalizada || {},
    horario_preferido: configuracion?.horario_preferido || '',
    dias_semana: configuracion?.dias_semana || [1, 2, 3, 4, 5]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  const handleDiaSemanaChange = (dia: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        dias_semana: [...(prev.dias_semana || []), dia]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dias_semana: prev.dias_semana?.filter(d => d !== dia) || []
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {configuracion ? 'Editar Configuración' : 'Nueva Configuración'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evento
              </label>
              <select
                value={formData.tipo_evento}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_evento: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Seleccionar tipo de evento</option>
                {tiposEventos.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Canal de Notificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal de Notificación
              </label>
              <select
                value={formData.canal_notificacion}
                onChange={(e) => setFormData(prev => ({ ...prev, canal_notificacion: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Seleccionar canal</option>
                {canalesNotificacion.map((canal) => (
                  <option key={canal.value} value={canal.value}>
                    {canal.icono} {canal.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado Activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Configuración activa
              </label>
            </div>

            {/* Horario Preferido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horario Preferido (opcional)
              </label>
              <input
                type="time"
                value={formData.horario_preferido}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_preferido: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Días de la Semana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de la Semana
              </label>
              <div className="grid grid-cols-2 gap-2">
                {diasSemana.map((dia) => (
                  <label key={dia.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dias_semana?.includes(dia.value)}
                      onChange={(e) => handleDiaSemanaChange(dia.value, e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{dia.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCerrar}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              >
                {configuracion ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionRecordatorios;

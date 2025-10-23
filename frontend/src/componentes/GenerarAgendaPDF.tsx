import React, { useState, useEffect } from 'react';
import { AgendaPDFService, PeriodosDisponibles, GenerarPDFRequest } from '../servicios/agendaPDF.service';
import { useNotificaciones } from '../hooks/useNotificaciones';

interface GenerarAgendaPDFProps {
  psicologoId: string;
}

export const GenerarAgendaPDF: React.FC<GenerarAgendaPDFProps> = ({ psicologoId }) => {
  const [periodosDisponibles, setPeriodosDisponibles] = useState<PeriodosDisponibles | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'diario' | 'semanal' | 'mensual'>('semanal');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true);
  const { mostrarNotificacion } = useNotificaciones();

  useEffect(() => {
    cargarPeriodosDisponibles();
  }, []);

  useEffect(() => {
    if (periodosDisponibles) {
      // Establecer fechas por defecto basadas en el período seleccionado
      establecerFechasPorDefecto();
    }
  }, [periodoSeleccionado, periodosDisponibles]);

  const cargarPeriodosDisponibles = async () => {
    try {
      setCargandoPeriodos(true);
      const periodos = await AgendaPDFService.obtenerPeriodosDisponibles();
      setPeriodosDisponibles(periodos);
    } catch (error: any) {
      console.error('Error al cargar períodos:', error);
      mostrarNotificacion('Error al cargar períodos disponibles', 'error');
    } finally {
      setCargandoPeriodos(false);
    }
  };

  const establecerFechasPorDefecto = () => {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];
    
    if (periodoSeleccionado === 'diario') {
      setFechaInicio(fechaHoy);
      setFechaFin(fechaHoy);
    } else if (periodoSeleccionado === 'semanal') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      setFechaInicio(inicioSemana.toISOString().split('T')[0]);
      setFechaFin(finSemana.toISOString().split('T')[0]);
    } else if (periodoSeleccionado === 'mensual') {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      setFechaInicio(inicioMes.toISOString().split('T')[0]);
      setFechaFin(finMes.toISOString().split('T')[0]);
    }
  };

  const handleGenerarPDF = async () => {
    if (!fechaInicio || !fechaFin) {
      mostrarNotificacion('Por favor selecciona las fechas', 'error');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      mostrarNotificacion('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return;
    }

    try {
      setCargando(true);
      
      const datosPDF: GenerarPDFRequest = {
        periodo: periodoSeleccionado,
        fechaInicio,
        fechaFin
      };

      await AgendaPDFService.generarPDF(datosPDF);
      mostrarNotificacion('PDF generado y descargado exitosamente', 'success');
      
    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      mostrarNotificacion(error.message || 'Error al generar el PDF', 'error');
    } finally {
      setCargando(false);
    }
  };

  const handlePeriodoChange = (nuevoPeriodo: 'diario' | 'semanal' | 'mensual') => {
    setPeriodoSeleccionado(nuevoPeriodo);
  };

  const handleFechaInicioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFechaInicio(event.target.value);
  };

  const handleFechaFinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFechaFin(event.target.value);
  };

  if (cargandoPeriodos) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando períodos disponibles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📄 Generar Agenda PDF</h2>
        <p className="text-gray-600">
          Descarga tu agenda en formato PDF para períodos específicos
        </p>
      </div>

      <div className="space-y-6">
        {/* Selección de período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Agenda
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['diario', 'semanal', 'mensual'] as const).map((periodo) => (
              <button
                key={periodo}
                onClick={() => handlePeriodoChange(periodo)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  periodoSeleccionado === periodo
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {periodo === 'diario' && '📅'}
                    {periodo === 'semanal' && '📆'}
                    {periodo === 'mensual' && '🗓️'}
                  </div>
                  <div className="font-medium">
                    {AgendaPDFService.obtenerTextoPeriodo(periodo)}
                  </div>
                  {periodosDisponibles && periodosDisponibles[periodo] && (
                    <div className="text-xs text-gray-500 mt-1">
                      {periodosDisponibles[periodo].length} períodos disponibles
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selección de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={handleFechaInicioChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={handleFechaFinChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Períodos disponibles */}
        {periodosDisponibles && periodosDisponibles[periodoSeleccionado].length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Períodos Disponibles (haz clic para seleccionar)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
              {periodosDisponibles[periodoSeleccionado].map((periodo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFechaInicio(periodo.fechaInicio);
                    setFechaFin(periodo.fechaFin);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                >
                  <span className="text-sm text-gray-700">
                    {AgendaPDFService.formatearRangoFechas(periodo.fechaInicio, periodo.fechaFin)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {periodo.sesiones} sesiones
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón de generar */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerarPDF}
            disabled={cargando || !fechaInicio || !fechaFin}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              cargando || !fechaInicio || !fechaFin
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {cargando ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando PDF...
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">📄</span>
                Generar y Descargar PDF
              </div>
            )}
          </button>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-500 mr-3 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Información sobre la descarga:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>El PDF incluirá todas las sesiones programadas en el período seleccionado</li>
                <li>Se mostrará información del paciente, horarios y observaciones</li>
                <li>Si no hay sesiones en el período, se generará un PDF vacío</li>
                <li>El archivo se descargará automáticamente a tu dispositivo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

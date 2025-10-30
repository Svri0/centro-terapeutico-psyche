import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface ExportarDashboardPDFProps {
  estadisticas: Estadisticas;
  nombrePsicologo: string;
  fechaInicio?: string;
  fechaFin?: string;
}

const ExportarDashboardPDF: React.FC<ExportarDashboardPDFProps> = ({
  estadisticas,
  nombrePsicologo,
  fechaInicio,
  fechaFin
}) => {
  const [generando, setGenerando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(fechaInicio || '');
  const [filtroFechaFin, setFiltroFechaFin] = useState(fechaFin || '');

  const generarPDF = async () => {
    try {
      setGenerando(true);

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // === ENCABEZADO ===
      doc.setFillColor(245, 158, 11); // Amber
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Centro Terapeutico Dentro de Psyche', margin, 20);
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Reporte de Dashboard del Psicologo', margin, 28);
      
      // Fecha - debajo del subtítulo para evitar sobreposición
      const fechaGen = format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });
      doc.setFontSize(10);
      doc.text('Fecha de generacion: ' + fechaGen, margin, 36);

      yPos = 55;

      // === INFORMACIÓN DEL PSICÓLOGO ===
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Informacion del Psicologo', margin, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Nombre: ' + nombrePsicologo, margin, yPos);
      yPos += 10;

      // === PERÍODO ===
      if (filtroFechaInicio || filtroFechaFin) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Periodo del Reporte', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let periodoTexto = '';
        if (filtroFechaInicio && filtroFechaFin) {
          periodoTexto = 'Del ' + format(new Date(filtroFechaInicio), 'dd/MM/yyyy') + ' al ' + format(new Date(filtroFechaFin), 'dd/MM/yyyy');
        } else if (filtroFechaInicio) {
          periodoTexto = 'Desde el ' + format(new Date(filtroFechaInicio), 'dd/MM/yyyy');
        } else {
          periodoTexto = 'Hasta el ' + format(new Date(filtroFechaFin), 'dd/MM/yyyy');
        }
        doc.text(periodoTexto, margin, yPos);
        yPos += 10;
      }

      yPos += 5;

      // === MÉTRICAS PRINCIPALES ===
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('Metricas Principales', margin, yPos);
      yPos += 12;

      // Tabla de métricas
      const tableStartY = yPos;
      const rowHeight = 10;
      const col1Width = (contentWidth - 20) / 2;
      const col2Width = (contentWidth - 20) / 2;
      
      // Fondo gris claro para la tabla
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, tableStartY, contentWidth, rowHeight * 3, 'F');
      
      // Bordes de la tabla
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      
      // Dibujar líneas horizontales
      for (let i = 0; i <= 3; i++) {
        doc.line(margin, tableStartY + i * rowHeight, margin + contentWidth, tableStartY + i * rowHeight);
      }
      // Dibujar línea vertical del medio
      doc.line(margin + col1Width + 10, tableStartY, margin + col1Width + 10, tableStartY + rowHeight * 3);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      // Fila 1
      doc.setFont('helvetica', 'bold');
      doc.text('Citas Hoy', margin + 3, tableStartY + 7);
      doc.text(String(estadisticas.citasHoy), margin + 5 + col1Width, tableStartY + 7, { align: 'right' });
      
      doc.text('Pacientes Activos', margin + 3, tableStartY + 7 + rowHeight);
      doc.text(String(estadisticas.pacientesActivos), margin + 5 + col1Width, tableStartY + 7 + rowHeight, { align: 'right' });
      
      doc.text('Total Citas', margin + 3, tableStartY + 7 + rowHeight * 2);
      doc.text(String(estadisticas.totalCitas), margin + 5 + col1Width, tableStartY + 7 + rowHeight * 2, { align: 'right' });

      yPos = tableStartY + rowHeight * 3 + 15;

      // === ESTADÍSTICAS POR PERÍODO ===
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('Estadisticas por Periodo', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Esta Semana: ' + estadisticas.citasEstaSemana, margin + 5, yPos);
      yPos += 8;
      doc.text('Este Mes: ' + estadisticas.citasEsteMes, margin + 5, yPos);
      yPos += 8;
      doc.text('Total General: ' + estadisticas.totalCitas, margin + 5, yPos);
      yPos += 12;

      // === ESTADOS DE CITAS ===
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(245, 158, 11);
      doc.text('Estados de Citas', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Completadas: ' + estadisticas.citasCompletadas, margin + 5, yPos);
      yPos += 8;
      doc.text('Canceladas: ' + estadisticas.citasCanceladas, margin + 5, yPos);
      yPos += 8;
      doc.text('No Asistio: ' + estadisticas.citasNoShow, margin + 5, yPos);
      yPos += 12;

      // === NOTA FINAL ===
      if (yPos + 30 > doc.internal.pageSize.height - margin) {
        doc.addPage();
        yPos = margin;
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Este reporte fue generado automaticamente por el Sistema de Gestion Psyche.', margin, yPos);
      yPos += 5;
      doc.text('Copyright Centro Terapeutico Dentro de Psyche - Todos los derechos reservados', margin, yPos);

      // Guardar PDF
      const nombreArchivo = filtroFechaInicio && filtroFechaFin
        ? `dashboard_${format(new Date(filtroFechaInicio), 'yyyyMMdd')}_${format(new Date(filtroFechaFin), 'yyyyMMdd')}.pdf`
        : `dashboard_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;

      doc.save(nombreArchivo);
      setGenerando(false);
      setMostrarFiltros(false);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setGenerando(false);
      alert('Error al generar el PDF');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Exportar Dashboard</h3>
          <p className="text-sm text-gray-600">Genera un reporte PDF con tus estadísticas</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
          
          <button
            onClick={generarPDF}
            disabled={generando}
            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </>
            ) : (
              <>
                📄 Generar PDF
              </>
            )}
          </button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Filtrar por Período (Opcional)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportarDashboardPDF;

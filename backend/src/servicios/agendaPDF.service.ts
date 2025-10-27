import PDFDocument from 'pdfkit';
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import path from 'path';
import fs from 'fs';

export interface AgendaPDFData {
  psicologoId: string;
  periodo: 'diario' | 'semanal' | 'mensual';
  fechaInicio: string;
  fechaFin: string;
}

export class AgendaPDFService {
  
  static async generarAgendaPDF(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;
      const { periodo, fechaInicio, fechaFin } = req.body;

      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AGENDA_PDF_001'
        );
      }

      if (!periodo || !fechaInicio || !fechaFin) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'Periodo, fecha de inicio y fecha de fin son requeridos',
          'AGENDA_PDF_002'
        );
      }

      // Validar que el período sea válido
      if (!['diario', 'semanal', 'mensual'].includes(periodo)) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'Período debe ser: diario, semanal o mensual',
          'AGENDA_PDF_003'
        );
      }

      console.log('🔍 Generando PDF de agenda:', { psicologoId, periodo, fechaInicio, fechaFin });

      // Obtener datos del psicólogo
      const psicologos = await sequelize.query(`
        SELECT nombres, apellidos, especialidad, codigo_sbs
        FROM usuarios 
        WHERE id = :psicologoId AND rol_id = 2
      `, {
        replacements: { psicologoId },
        type: QueryTypes.SELECT
      }) as any[];

      if (!psicologos || psicologos.length === 0) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Psicólogo no encontrado',
          'AGENDA_PDF_004'
        );
      }

      const psicologo = psicologos[0];

      // Obtener sesiones del período
      const sesiones = await sequelize.query(`
        SELECT 
          s.id,
          s.fecha_programada,
          s.fecha_inicio,
          s.fecha_fin,
          s.estado,
          s.observaciones,
          s.tipo_sesion,
          u.nombres as paciente_nombres,
          u.apellidos as paciente_apellidos,
          u.telefono as paciente_telefono
        FROM sesiones s
        INNER JOIN pacientes p ON s.paciente_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE s.psicologo_id = :psicologoId
          AND DATE(s.fecha_programada) BETWEEN :fechaInicio AND :fechaFin
          AND s.deleted_at IS NULL
        ORDER BY s.fecha_programada, s.fecha_inicio
      `, {
        replacements: { psicologoId, fechaInicio, fechaFin },
        type: QueryTypes.SELECT
      }) as any[];

      console.log(`📋 Se encontraron ${sesiones.length} sesiones para el período`);

      // Generar PDF
      const pdfBuffer = await this.crearPDFAgenda({
        psicologo: psicologo,
        sesiones,
        periodo,
        fechaInicio,
        fechaFin
      });

      // Configurar headers para descarga
      const nombreArchivo = `agenda_${periodo}_${fechaInicio}_${fechaFin}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);

    } catch (error) {
      console.error('❌ Error al generar PDF de agenda:', error);
      return ManejadorRespuestas.errorInterno(
        res,
        'No se pudo generar el PDF, intente nuevamente más tarde',
        'AGENDA_PDF_005'
      );
    }
  }

  private static async crearPDFAgenda(data: {
    psicologo: any;
    sesiones: any[];
    periodo: string;
    fechaInicio: string;
    fechaFin: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Título principal
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text('AGENDA TERAPÉUTICA', 50, 50, { align: 'center' });

        // Subtítulo formal
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text('Informe de Sesiones Programadas', 50, 80, { align: 'center' });

        // Información del psicólogo - Sección formal
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text('INFORMACIÓN DEL PROFESIONAL', 50, 100);

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text(`Psicólogo: ${data.psicologo.nombres} ${data.psicologo.apellidos}`, 50, 120);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text(`Especialidad: ${data.psicologo.especialidad || 'Psicología Clínica'}`, 50, 135);

        if (data.psicologo.codigo_sbs) {
          doc.text(`Código SBS: ${data.psicologo.codigo_sbs}`, 50, 150);
        }

        // Información del período - Sección formal
        const periodoTexto = this.obtenerTextoPeriodo(data.periodo, data.fechaInicio, data.fechaFin);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text('PERÍODO DE REPORTE', 50, 170);

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text(`Tipo de Agenda: ${periodoTexto}`, 50, 190);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text(`Período: Del ${this.formatearFecha(data.fechaInicio)} al ${this.formatearFecha(data.fechaFin)}`, 50, 205);

        // Línea separadora
        doc.moveTo(50, 225)
           .lineTo(545, 225)
           .stroke('#e5e7eb');

        // Tabla de sesiones
        let yPosition = 245;

        if (data.sesiones.length === 0) {
          // Mensaje cuando no hay sesiones
          doc.fontSize(14)
             .font('Helvetica')
             .fillColor('#6b7280')
             .text('No hay sesiones programadas para este período', 50, yPosition, { align: 'center' });
        } else {
          // Encabezado de la tabla
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .fillColor('#1f2937')
             .text('SESIONES PROGRAMADAS', 50, yPosition);
          
          yPosition += 25;

          // Encabezados de la tabla
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .fillColor('#1f2937');

          doc.text('Fecha', 50, yPosition);
          doc.text('Hora', 180, yPosition);
          doc.text('Paciente', 280, yPosition);
          doc.text('Estado', 400, yPosition);
          doc.text('Tipo', 480, yPosition);

          // Línea debajo de encabezados
          doc.moveTo(50, yPosition + 20)
             .lineTo(545, yPosition + 20)
             .stroke('#374151');

          yPosition += 30;

          // Datos de las sesiones
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#374151');

          data.sesiones.forEach((sesion, index) => {
            // Verificar si necesitamos una nueva página
            if (yPosition > 750) {
              doc.addPage();
              yPosition = 50;
            }

            const fecha = new Date(sesion.fecha_programada);
            const horaInicio = new Date(sesion.fecha_inicio);
            const horaFin = new Date(sesion.fecha_fin);

            doc.text(this.formatearFecha(sesion.fecha_programada), 50, yPosition, { width: 120 });
            doc.text(`${horaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${horaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 180, yPosition, { width: 90 });
            doc.text(`${sesion.paciente_nombres} ${sesion.paciente_apellidos}`, 280, yPosition, { width: 110 });
            doc.text(this.formatearEstado(sesion.estado), 400, yPosition, { width: 70 });
            doc.text(this.formatearTipoSesion(sesion.tipo_sesion), 480, yPosition, { width: 65 });

            // Observaciones si existen
            if (sesion.observaciones && sesion.observaciones.trim()) {
              yPosition += 15;
              doc.fontSize(9)
                 .fillColor('#6b7280')
                 .text(`Obs: ${sesion.observaciones}`, 280, yPosition, { width: 180 });
            }

            yPosition += 20;

            // Línea separadora entre sesiones
            if (index < data.sesiones.length - 1) {
              doc.moveTo(50, yPosition - 5)
                 .lineTo(545, yPosition - 5)
                 .stroke('#f3f4f6');
            }
          });

          // Resumen al final
            yPosition += 15;
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .fillColor('#1f2937')
             .text(`Total de sesiones: ${data.sesiones.length}`, 50, yPosition);

          // Contar por estado
          const estados = data.sesiones.reduce((acc: any, sesion) => {
            acc[sesion.estado] = (acc[sesion.estado] || 0) + 1;
            return acc;
          }, {});

          yPosition += 25;
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#374151');

          Object.entries(estados).forEach(([estado, count]) => {
            doc.text(`${this.formatearEstado(estado)}: ${count}`, 50, yPosition);
            yPosition += 15;
          });
        }

        // Logo de Psyche al final del documento
        const logoY = yPosition + 40;
        doc.fontSize(22)
           .font('Times-BoldItalic')
           .fillColor('#000000')
           .text('dentro de psyche', 50, logoY, { align: 'center' });
        
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text('Centro Terapéutico', 50, logoY + 25, { align: 'center' });

        // Pie de página formal
        const fechaGeneracion = new Date().toLocaleString('es-ES');
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text('Centro Terapéutico Psyche', 50, logoY + 60, { align: 'center' });
        
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#9ca3af')
           .text(`Documento generado el ${fechaGeneracion}`, 50, logoY + 75, { align: 'center' });
        
        doc.text('Este documento es confidencial y está destinado únicamente al uso profesional', 50, logoY + 90, { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  private static obtenerTextoPeriodo(periodo: string, fechaInicio: string, fechaFin: string): string {
    switch (periodo) {
      case 'diario':
        return 'Agenda Diaria';
      case 'semanal':
        return 'Agenda Semanal';
      case 'mensual':
        return 'Agenda Mensual';
      default:
        return 'Agenda';
    }
  }

  private static formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  private static formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return estados[estado] || estado;
  }

  private static formatearTipoSesion(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'presencial': 'Presencial',
      'virtual': 'Virtual',
      'telefonica': 'Telefónica'
    };
    return tipos[tipo] || tipo;
  }
}

import { Request, Response } from 'express';
import { DisponibilidadMensual } from '../modelos';
import { Op } from 'sequelize';

console.log('🔍 Debug - Archivo disponibilidadMensual.controlador.ts cargado');

// Obtener disponibilidad mensual de un psicólogo
export const obtenerDisponibilidadMensual = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { mes, año, incluirEliminados } = req.query;

    let whereClause: any = {
      psicologo_id: psicologoId
    };

    // Solo incluir activos si no se solicitan eliminados
    if (!incluirEliminados) {
      whereClause.activo = true;
    }

    // Si se especifica mes y año, filtrar por ese período
    if (mes && año) {
      const fechaInicio = `${año}-${String(mes).padStart(2, '0')}-01`;
      // Calcular el último día del mes correctamente
      const ultimoDia = new Date(Number(año), Number(mes), 0).getDate();
      const fechaFin = `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
      
      whereClause.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    const disponibilidad = await DisponibilidadMensual.findAll({
      where: whereClause,
      order: [['fecha', 'ASC']],
      paranoid: incluirEliminados ? false : true
    });

    return res.json({
      success: true,
      message: 'Disponibilidad mensual obtenida exitosamente',
      data: disponibilidad
    });

  } catch (error: any) {
    console.error('Error al obtener disponibilidad mensual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear disponibilidad mensual
export const crearDisponibilidadMensual = async (req: Request, res: Response) => {
  try {
    const { psicologo_id, fecha, hora_inicio, hora_fin, activo, tipo_disponibilidad } = req.body;

    // Verificar si ya existe disponibilidad para esa fecha
    const existente = await DisponibilidadMensual.findOne({
      where: {
        psicologo_id,
        fecha
      },
      paranoid: false
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe disponibilidad para esta fecha'
      });
    }

    const nuevaDisponibilidad = await DisponibilidadMensual.create({
      psicologo_id,
      fecha,
      hora_inicio,
      hora_fin,
      activo: activo ?? true,
      tipo_disponibilidad: tipo_disponibilidad ?? 'individual'
    });

    return res.status(201).json({
      success: true,
      message: 'Disponibilidad mensual creada exitosamente',
      data: nuevaDisponibilidad
    });

  } catch (error: any) {
    console.error('Error al crear disponibilidad mensual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar disponibilidad mensual
export const actualizarDisponibilidadMensual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hora_inicio, hora_fin, activo, tipo_disponibilidad } = req.body;

    const disponibilidad = await DisponibilidadMensual.findByPk(id);

    if (!disponibilidad) {
      return res.status(404).json({
        success: false,
        message: 'Disponibilidad no encontrada'
      });
    }

    await disponibilidad.update({
      hora_inicio,
      hora_fin,
      activo,
      tipo_disponibilidad
    });

    return res.json({
      success: true,
      message: 'Disponibilidad mensual actualizada exitosamente',
      data: disponibilidad
    });

  } catch (error: any) {
    console.error('Error al actualizar disponibilidad mensual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar múltiples disponibilidades mensuales
export const actualizarDisponibilidadMensualMultiple = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { disponibilidades } = req.body;

    if (!Array.isArray(disponibilidades)) {
      return res.status(400).json({
        success: false,
        message: 'disponibilidades debe ser un array'
      });
    }

    const resultados = [];

    for (const disp of disponibilidades) {
      const { fecha, hora_inicio, hora_fin, activo, tipo_disponibilidad } = disp;

      // Buscar disponibilidad existente para esta fecha
      let disponibilidad = await DisponibilidadMensual.findOne({
        where: {
          psicologo_id: psicologoId,
          fecha
        },
        paranoid: false
      });

      if (disponibilidad) {
        // Actualizar existente
        await disponibilidad.update({
          hora_inicio,
          hora_fin,
          activo,
          tipo_disponibilidad
        });
        resultados.push(disponibilidad);
      } else {
        // Crear nueva
        const nueva = await DisponibilidadMensual.create({
          psicologo_id: psicologoId!,
          fecha,
          hora_inicio,
          hora_fin,
          activo,
          tipo_disponibilidad
        });
        resultados.push(nueva);
      }
    }

    return res.json({
      success: true,
      message: 'Disponibilidad mensual actualizada exitosamente',
      data: resultados
    });

  } catch (error: any) {
    console.error('Error al actualizar disponibilidad mensual múltiple:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar disponibilidad mensual
export const eliminarDisponibilidadMensual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    const disponibilidad = await DisponibilidadMensual.findByPk(id, {
      paranoid: false
    });

    if (!disponibilidad) {
      return res.status(404).json({
        success: false,
        message: 'Disponibilidad no encontrada'
      });
    }

    if (hardDelete === 'true') {
      // Hard delete
      await disponibilidad.destroy({ force: true });
    } else {
      // Soft delete
      await disponibilidad.destroy();
    }

    return res.json({
      success: true,
      message: 'Disponibilidad mensual eliminada exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar disponibilidad mensual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar disponibilidad para una fecha específica
export const verificarDisponibilidadFecha = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida'
      });
    }

    const disponibilidad = await DisponibilidadMensual.findOne({
      where: {
        psicologo_id: psicologoId,
        fecha: fecha as string,
        activo: true
      },
      paranoid: false
    });

    return res.json({
      success: true,
      message: 'Verificación completada',
      data: {
        disponible: !!disponibilidad,
        horarios: disponibilidad ? {
          inicio: disponibilidad.hora_inicio,
          fin: disponibilidad.hora_fin
        } : null
      }
    });

  } catch (error: any) {
    console.error('Error al verificar disponibilidad:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Generar disponibilidad recurrente (semanal)
export const generarDisponibilidadRecurrente = async (req: Request, res: Response) => {
  console.log('🚀 generarDisponibilidadRecurrente - INICIANDO');
  console.log('   - Params:', req.params);
  console.log('   - Body:', req.body);
  
  try {
    const { psicologoId } = req.params;
    const { fechaInicio, fechaFin, horarios } = req.body;

    console.log('🔍 Debug - Validando parámetros...');
    console.log('🔍 Debug - fechaInicio:', fechaInicio);
    console.log('🔍 Debug - fechaFin:', fechaFin);
    console.log('🔍 Debug - horarios:', horarios);
    
    if (!fechaInicio || !fechaFin || !horarios) {
      console.log('🔍 Debug - Parámetros faltantes, retornando error 400');
      return res.status(400).json({
        success: false,
        message: 'fechaInicio, fechaFin y horarios son requeridos'
      });
    }
    
    console.log('🔍 Debug - Parámetros válidos, continuando...');

    const fechas = [];
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);

    // Generar todas las fechas entre fechaInicio y fechaFin
    for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
      fechas.push(new Date(fecha).toISOString().split('T')[0]);
    }
    
    console.log('🔍 Debug - Fechas generadas:', fechas.length);
    console.log('🔍 Debug - Primera fecha:', fechas[0]);
    console.log('🔍 Debug - Última fecha:', fechas[fechas.length - 1]);

    const resultados = [];

    console.log('🔍 Debug - Generando disponibilidad recurrente:');
    console.log('   - Fechas a procesar:', fechas.length);
    console.log('   - Horarios recibidos:', horarios);
    console.log('   - Primera fecha:', fechas[0]);
    console.log('   - Última fecha:', fechas[fechas.length - 1]);
    console.log('🔍 Debug - Horarios configurados:');
    console.log('   - Domingo (0):', horarios[0]);
    console.log('   - Lunes (1):', horarios[1]);
    console.log('   - Martes (2):', horarios[2]);
    console.log('   - Miércoles (3):', horarios[3]);
    console.log('   - Jueves (4):', horarios[4]);
    console.log('   - Viernes (5):', horarios[5]);
    console.log('   - Sábado (6):', horarios[6]);
    
    for (const fecha of fechas) {
      // CORREGIR: Usar formato de fecha que funcione correctamente
      const diaSemana = new Date(fecha + 'T00:00:00').getDay(); // 0=Domingo, 1=Lunes, etc.
      const nombreDia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana];
      
      console.log(`   - Procesando ${fecha} (${nombreDia}, día ${diaSemana})`);
      
      // Crear disponibilidad para TODOS los días (incluyendo domingos como no laborables)
      const horario = horarios[diaSemana];
      
      console.log(`     - Procesando día ${diaSemana} (${nombreDia}), horario:`, horario);
      
      if (!horario) {
        console.warn(`     - ⚠️ No se encontró horario para el día ${nombreDia} (día ${diaSemana}). Saltando.`);
        continue;
      }
      
      try {
        // Intentar crear registro
        const nueva = await DisponibilidadMensual.create({
          psicologo_id: psicologoId!,
          fecha: fecha!,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          activo: horario.activo,
          tipo_disponibilidad: 'recurrente'
        });
        resultados.push(nueva);
        console.log(`     - ✅ Registro creado:`, nueva.id, `(activo: ${horario.activo})`);
      } catch (error: any) {
        // Si ya existe, actualizar el existente
        if (error.name === 'SequelizeUniqueConstraintError') {
          const existente = await DisponibilidadMensual.findOne({
            where: {
              psicologo_id: psicologoId,
              fecha
            }
          });
          
          if (existente) {
            await existente.update({
              hora_inicio: horario.hora_inicio,
              hora_fin: horario.hora_fin,
              activo: horario.activo,
              tipo_disponibilidad: 'recurrente'
            });
            console.log(`     - 🔄 Registro actualizado:`, existente.id, `(activo: ${horario.activo})`);
          }
        } else {
          throw error;
        }
      }
    }

    console.log('🔍 Debug - Función completada. Resultados:', resultados.length);
    console.log('🔍 Debug - Resultados:', resultados);
    
    return res.json({
      success: true,
      message: 'Disponibilidad recurrente generada exitosamente',
      data: resultados
    });

  } catch (error: any) {
    console.error('Error al generar disponibilidad recurrente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

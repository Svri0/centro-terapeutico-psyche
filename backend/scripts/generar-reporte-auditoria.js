const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Función para obtener token de admin
async function obtenerTokenAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@psyche.com',
      password: 'admin123'
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Error al obtener token de admin:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener logs de auditoría desde la base de datos
async function obtenerLogsAuditoria() {
  try {
    // Esta función simula la obtención de logs desde la base de datos
    // En un entorno real, tendrías un endpoint específico para esto
    console.log('📊 Obteniendo logs de auditoría...');
    
    // Simulación de logs de auditoría (en producción esto vendría de la BD)
    const logs = [
      {
        id: '1',
        accion: 'DESACTIVACION_PSICOLOGO',
        tabla_afectada: 'usuarios',
        registro_id: 'psicologo-123',
        valores_anteriores: { activo: true },
        valores_nuevos: { activo: false },
        metadatos: {
          tipo: 'desactivacion',
          psicologo_nombre: 'Dr. Juan Pérez',
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        accion: 'ELIMINACION_CITA',
        tabla_afectada: 'citas',
        registro_id: 'cita-456',
        valores_anteriores: {
          paciente_id: 'paciente-789',
          psicologo_id: 'psicologo-123',
          fecha_cita: '2024-01-15'
        },
        metadatos: {
          tipo: 'eliminacion_cita',
          paciente_id: 'paciente-789',
          psicologo_id: 'psicologo-123',
          fecha_cita: '2024-01-15',
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        accion: 'REASIGNACION_PACIENTE',
        tabla_afectada: 'pacientes',
        registro_id: 'paciente-789',
        valores_anteriores: { psicologo_id: 'psicologo-123' },
        valores_nuevos: { psicologo_id: 'psicologo-456' },
        metadatos: {
          tipo: 'reasignacion_paciente',
          paciente_nombre: 'María González',
          psicologo_anterior_id: 'psicologo-123',
          psicologo_nuevo_id: 'psicologo-456',
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      }
    ];
    
    return logs;
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error.message);
    throw error;
  }
}

// Función para generar reporte de auditoría
async function generarReporteAuditoria() {
  console.log('📋 Generando reporte de auditoría...\n');

  try {
    // Obtener logs de auditoría
    const logs = await obtenerLogsAuditoria();
    
    console.log('='.repeat(80));
    console.log('📊 REPORTE DE AUDITORÍA - CENTRO TERAPÉUTICO PSYCHE');
    console.log('='.repeat(80));
    console.log(`📅 Fecha de generación: ${new Date().toLocaleString('es-ES')}`);
    console.log(`📈 Total de acciones registradas: ${logs.length}`);
    console.log('='.repeat(80));
    console.log();

    // Agrupar acciones por tipo
    const accionesPorTipo = logs.reduce((acc, log) => {
      const tipo = log.accion;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(log);
      return acc;
    }, {});

    // Mostrar resumen por tipo de acción
    console.log('📊 RESUMEN POR TIPO DE ACCIÓN:');
    console.log('-'.repeat(50));
    
    Object.entries(accionesPorTipo).forEach(([tipo, logsTipo]) => {
      console.log(`🔸 ${tipo}: ${logsTipo.length} acción(es)`);
    });
    
    console.log();
    console.log('='.repeat(80));
    console.log('📝 DETALLE DE ACCIONES:');
    console.log('='.repeat(80));

    // Mostrar detalle de cada acción
    logs.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.accion}`);
      console.log(`   📅 Fecha: ${new Date(log.created_at).toLocaleString('es-ES')}`);
      console.log(`   🗂️  Tabla: ${log.tabla_afectada}`);
      console.log(`   🆔 Registro: ${log.registro_id}`);
      
      // Mostrar detalles específicos según el tipo de acción
      switch (log.accion) {
        case 'DESACTIVACION_PSICOLOGO':
          console.log(`   👤 Psicólogo: ${log.metadatos.psicologo_nombre}`);
          console.log(`   📊 Estado anterior: Activo`);
          console.log(`   📊 Estado nuevo: Inactivo`);
          break;
          
        case 'REACTIVACION_PSICOLOGO':
          console.log(`   👤 Psicólogo: ${log.metadatos.psicologo_nombre}`);
          console.log(`   📊 Estado anterior: Inactivo`);
          console.log(`   📊 Estado nuevo: Activo`);
          break;
          
        case 'ELIMINACION_PSICOLOGO':
          console.log(`   👤 Psicólogo: ${log.metadatos.psicologo_nombre}`);
          console.log(`   ⚠️  Acción: Eliminación permanente`);
          break;
          
        case 'ELIMINACION_CITA':
          console.log(`   📅 Fecha cita: ${log.metadatos.fecha_cita}`);
          console.log(`   👤 Paciente ID: ${log.metadatos.paciente_id}`);
          console.log(`   👨‍⚕️ Psicólogo ID: ${log.metadatos.psicologo_id}`);
          break;
          
        case 'REASIGNACION_PACIENTE':
          console.log(`   👤 Paciente: ${log.metadatos.paciente_nombre}`);
          console.log(`   👨‍⚕️ Psicólogo anterior: ${log.metadatos.psicologo_anterior_id}`);
          console.log(`   👨‍⚕️ Psicólogo nuevo: ${log.metadatos.psicologo_nuevo_id}`);
          break;
          
        case 'INTENTO_ELIMINACION_FALLIDO':
          console.log(`   👤 Psicólogo: ${log.metadatos.psicologo_nombre}`);
          console.log(`   ❌ Motivo: ${log.metadatos.motivo}`);
          break;
          
        default:
          console.log(`   📋 Detalles: ${JSON.stringify(log.metadatos, null, 2)}`);
      }
      
      console.log(`   🔗 IP: ${log.ip_address || 'N/A'}`);
      console.log(`   🌐 User Agent: ${log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('📈 ESTADÍSTICAS ADICIONALES:');
    console.log('='.repeat(80));
    
    // Calcular estadísticas
    const accionesHoy = logs.filter(log => {
      const logDate = new Date(log.created_at);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    });
    
    const accionesEstaSemana = logs.filter(log => {
      const logDate = new Date(log.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });
    
    console.log(`📅 Acciones hoy: ${accionesHoy.length}`);
    console.log(`📅 Acciones esta semana: ${accionesEstaSemana.length}`);
    console.log(`📅 Acciones totales: ${logs.length}`);
    
    // Mostrar acciones más frecuentes
    const frecuenciaAcciones = {};
    logs.forEach(log => {
      frecuenciaAcciones[log.accion] = (frecuenciaAcciones[log.accion] || 0) + 1;
    });
    
    const accionesMasFrecuentes = Object.entries(frecuenciaAcciones)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    console.log('\n🏆 ACCIONES MÁS FRECUENTES:');
    accionesMasFrecuentes.forEach(([accion, frecuencia], index) => {
      console.log(`   ${index + 1}. ${accion}: ${frecuencia} vez(es)`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Reporte de auditoría generado exitosamente');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error al generar reporte de auditoría:', error.message);
  }
}

// Función para generar reporte específico de reasignaciones
async function generarReporteReasignaciones() {
  console.log('🔄 Generando reporte específico de reasignaciones...\n');

  try {
    const logs = await obtenerLogsAuditoria();
    const reasignaciones = logs.filter(log => log.accion === 'REASIGNACION_PACIENTE');
    
    console.log('='.repeat(60));
    console.log('🔄 REPORTE DE REASIGNACIONES DE PACIENTES');
    console.log('='.repeat(60));
    console.log(`📊 Total de reasignaciones: ${reasignaciones.length}`);
    console.log('='.repeat(60));
    
    reasignaciones.forEach((reasignacion, index) => {
      console.log(`\n${index + 1}. Reasignación de paciente`);
      console.log(`   👤 Paciente: ${reasignacion.metadatos.paciente_nombre}`);
      console.log(`   👨‍⚕️ Psicólogo anterior: ${reasignacion.metadatos.psicologo_anterior_id}`);
      console.log(`   👨‍⚕️ Psicólogo nuevo: ${reasignacion.metadatos.psicologo_nuevo_id}`);
      console.log(`   📅 Fecha: ${new Date(reasignacion.created_at).toLocaleString('es-ES')}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Reporte de reasignaciones completado');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error al generar reporte de reasignaciones:', error.message);
  }
}

// Función para generar reporte específico de eliminaciones
async function generarReporteEliminaciones() {
  console.log('🗑️ Generando reporte específico de eliminaciones...\n');

  try {
    const logs = await obtenerLogsAuditoria();
    const eliminaciones = logs.filter(log => 
      log.accion === 'ELIMINACION_PSICOLOGO' || 
      log.accion === 'ELIMINACION_CITA' ||
      log.accion === 'INTENTO_ELIMINACION_FALLIDO'
    );
    
    console.log('='.repeat(60));
    console.log('🗑️ REPORTE DE ELIMINACIONES');
    console.log('='.repeat(60));
    console.log(`📊 Total de eliminaciones: ${eliminaciones.length}`);
    console.log('='.repeat(60));
    
    eliminaciones.forEach((eliminacion, index) => {
      console.log(`\n${index + 1}. ${eliminacion.accion}`);
      
      if (eliminacion.accion === 'ELIMINACION_PSICOLOGO') {
        console.log(`   👤 Psicólogo: ${eliminacion.metadatos.psicologo_nombre}`);
        console.log(`   ⚠️  Tipo: Eliminación permanente`);
      } else if (eliminacion.accion === 'ELIMINACION_CITA') {
        console.log(`   📅 Fecha cita: ${eliminacion.metadatos.fecha_cita}`);
        console.log(`   👤 Paciente ID: ${eliminacion.metadatos.paciente_id}`);
      } else if (eliminacion.accion === 'INTENTO_ELIMINACION_FALLIDO') {
        console.log(`   👤 Psicólogo: ${eliminacion.metadatos.psicologo_nombre}`);
        console.log(`   ❌ Motivo: ${eliminacion.metadatos.motivo}`);
      }
      
      console.log(`   📅 Fecha: ${new Date(eliminacion.created_at).toLocaleString('es-ES')}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Reporte de eliminaciones completado');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error al generar reporte de eliminaciones:', error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const tipoReporte = args[0] || 'general';

  switch (tipoReporte) {
    case 'reasignaciones':
      await generarReporteReasignaciones();
      break;
    case 'eliminaciones':
      await generarReporteEliminaciones();
      break;
    case 'general':
    default:
      await generarReporteAuditoria();
      break;
  }
}

// Ejecutar el script
main(); 
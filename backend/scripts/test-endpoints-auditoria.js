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

// Función para probar endpoint de logs de auditoría
async function probarLogsAuditoria(token) {
  try {
    console.log('📊 Probando endpoint de logs de auditoría...');
    
    // Probar sin filtros
    const response1 = await axios.get(`${BASE_URL}/admin/auditoria/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Logs de auditoría obtenidos:', response1.data.data.logs.length, 'registros');
    
    // Probar con filtros
    const response2 = await axios.get(`${BASE_URL}/admin/auditoria/logs?limit=10&accion=DESACTIVACION_PSICOLOGO`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Logs filtrados obtenidos:', response2.data.data.logs.length, 'registros');
    
    return true;
  } catch (error) {
    console.error('❌ Error al probar logs de auditoría:', error.response?.data || error.message);
    return false;
  }
}

// Función para probar endpoint de estadísticas de auditoría
async function probarEstadisticasAuditoria(token) {
  try {
    console.log('📈 Probando endpoint de estadísticas de auditoría...');
    
    const response = await axios.get(`${BASE_URL}/admin/auditoria/estadisticas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = response.data.data;
    console.log('✅ Estadísticas obtenidas:');
    console.log(`   - Total de acciones: ${data.total_acciones}`);
    console.log(`   - Estadísticas por acción: ${data.estadisticas_por_accion.length} tipos`);
    console.log(`   - Estadísticas diarias: ${data.estadisticas_diarias.length} días`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al probar estadísticas de auditoría:', error.response?.data || error.message);
    return false;
  }
}

// Función para generar algunos logs de auditoría de prueba
async function generarLogsPrueba(token) {
  try {
    console.log('🔄 Generando logs de auditoría de prueba...');
    
    // Obtener psicólogos
    const psicologosResponse = await axios.get(`${BASE_URL}/admin/psicologos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const psicologos = psicologosResponse.data.data;
    if (psicologos.length === 0) {
      console.log('ℹ️ No hay psicólogos para generar logs de prueba');
      return;
    }
    
    const primerPsicologo = psicologos[0];
    
    // Generar algunos logs de prueba
    console.log('📝 Generando logs de desactivación/reactivación...');
    
    // Desactivar psicólogo
    if (primerPsicologo.activo) {
      await axios.patch(`${BASE_URL}/admin/psicologos/${primerPsicologo.id}/desactivar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Psicólogo desactivado (log generado)');
    }
    
    // Reactivar psicólogo
    await axios.patch(`${BASE_URL}/admin/psicologos/${primerPsicologo.id}/reactivar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Psicólogo reactivado (log generado)');
    
    // Obtener pacientes y citas para generar más logs
    try {
      const pacientesResponse = await axios.get(`${BASE_URL}/admin/psicologos/${primerPsicologo.id}/pacientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const citasResponse = await axios.get(`${BASE_URL}/admin/psicologos/${primerPsicologo.id}/citas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pacientes = pacientesResponse.data.data;
      const citas = citasResponse.data.data;
      
      // Eliminar una cita si existe
      if (citas.length > 0) {
        await axios.delete(`${BASE_URL}/admin/citas/${citas[0].id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Cita eliminada (log generado)');
      }
      
      // Reasignar un paciente si existe y hay otros psicólogos
      if (pacientes.length > 0 && psicologos.length > 1) {
        const segundoPsicologo = psicologos[1];
        await axios.post(`${BASE_URL}/admin/pacientes/reasignar`, {
          pacienteId: pacientes[0].id,
          nuevoPsicologoId: segundoPsicologo.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Paciente reasignado (log generado)');
      }
      
    } catch (error) {
      console.log('ℹ️ No se pudieron generar logs adicionales:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error al generar logs de prueba:', error.response?.data || error.message);
  }
}

// Función principal
async function testEndpointsAuditoria() {
  console.log('🧪 Iniciando pruebas de endpoints de auditoría...\n');

  try {
    // 1. Obtener token de admin
    console.log('1️⃣ Obteniendo token de admin...');
    const token = await obtenerTokenAdmin();
    console.log('✅ Token obtenido exitosamente\n');

    // 2. Generar logs de prueba
    console.log('2️⃣ Generando logs de auditoría de prueba...');
    await generarLogsPrueba(token);
    console.log('✅ Logs de prueba generados\n');

    // 3. Probar endpoint de logs
    console.log('3️⃣ Probando endpoint de logs de auditoría...');
    const logsExitoso = await probarLogsAuditoria(token);
    console.log(logsExitoso ? '✅ Endpoint de logs funcionando correctamente\n' : '❌ Endpoint de logs con errores\n');

    // 4. Probar endpoint de estadísticas
    console.log('4️⃣ Probando endpoint de estadísticas de auditoría...');
    const statsExitoso = await probarEstadisticasAuditoria(token);
    console.log(statsExitoso ? '✅ Endpoint de estadísticas funcionando correctamente\n' : '❌ Endpoint de estadísticas con errores\n');

    // 5. Resumen
    console.log('='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS DE AUDITORÍA');
    console.log('='.repeat(60));
    console.log(`🔸 Endpoint de logs: ${logsExitoso ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log(`🔸 Endpoint de estadísticas: ${statsExitoso ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log('='.repeat(60));

    if (logsExitoso && statsExitoso) {
      console.log('🎉 ¡Todos los endpoints de auditoría funcionan correctamente!');
    } else {
      console.log('⚠️ Algunos endpoints de auditoría tienen problemas');
    }

  } catch (error) {
    console.error('❌ Error durante las pruebas de auditoría:', error.message);
  }
}

// Ejecutar las pruebas
testEndpointsAuditoria(); 
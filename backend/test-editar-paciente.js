const axios = require('axios');

async function testEditarPaciente() {
  try {
    console.log('🔍 Probando endpoint de edición de paciente...');
    
    // Primero hacer login con la Dra. Laura Fernández (psicóloga)
    console.log('🔐 Haciendo login con Dra. Laura Fernández...');
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');
    console.log('👤 Usuario logueado:', loginResponse.data.data.usuario.nombres, loginResponse.data.data.usuario.apellidos);
    
    // Obtener la lista de pacientes para ver qué IDs están disponibles
    console.log('\n📋 Obteniendo lista de pacientes...');
    const pacientesResponse = await axios.get('http://localhost:3002/api/v1/pacientes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Pacientes obtenidos:', pacientesResponse.data.data.pacientes.length);
    
    if (pacientesResponse.data.data.pacientes.length > 0) {
      const primerPaciente = pacientesResponse.data.data.pacientes[0];
      console.log('👤 Primer paciente:', primerPaciente.nombres, primerPaciente.apellidos, 'ID:', primerPaciente.id);
      
      // Datos de prueba para actualizar
      const datosActualizacion = {
        nombres: primerPaciente.nombres,
        apellidos: primerPaciente.apellidos,
        email: primerPaciente.email,
        telefono: '+56987654321', // Cambiar teléfono
        fecha_nacimiento: '1990-01-01',
        genero: 'femenino',
        rut: '99999999-9', // RUT único para evitar conflictos
        direccion: 'Nueva dirección de prueba',
        contacto_emergencia_nombre: 'Nuevo contacto',
        contacto_emergencia_telefono: '+56911111111',
        contacto_emergencia_relacion: 'Familiar',
        observaciones: 'Observaciones actualizadas de prueba',
        estado: 'activo'
      };
      
      // Ahora probar el endpoint de actualización del paciente
      console.log('\n🔍 Actualizando paciente...');
      const actualizacionResponse = await axios.put(`http://localhost:3002/api/v1/pacientes/${primerPaciente.id}`, datosActualizacion, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Paciente actualizado exitosamente:');
      console.log('📄 Datos del paciente actualizado:', JSON.stringify(actualizacionResponse.data.data, null, 2));
      
    } else {
      console.log('❌ No hay pacientes disponibles para probar');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEditarPaciente();

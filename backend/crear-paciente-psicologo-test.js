const axios = require('axios');

async function crearPacientePsicologoTest() {
  try {
    console.log('🔧 Creando psicólogo y paciente de prueba...');
    
    // 1. Crear psicólogo
    console.log('👨‍⚕️ Creando psicólogo...');
    const psicologoData = {
      nombres: 'Dr. Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@psyche.cl',
      password: 'password123',
      telefono: '+56912345678',
      especialidad: 'Psicología Clínica',
      descripcion: 'Especialista en terapia cognitivo-conductual',
      genero: 'masculino'
    };
    
    const psicologoResponse = await axios.post('http://localhost:3002/api/v1/usuarios', psicologoData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // Esto necesitaría un token de admin real
      }
    });
    
    console.log('✅ Psicólogo creado:', psicologoResponse.data.data.id);
    
    // 2. Crear paciente
    console.log('👤 Creando paciente...');
    const pacienteData = {
      nombres: 'María',
      apellidos: 'González',
      email: 'maria.gonzalez@psyche.cl',
      password: 'password123',
      telefono: '+56987654321',
      fecha_nacimiento: '1990-05-15',
      genero: 'femenino',
      rut: '12345678-9',
      direccion: 'Av. Providencia 123, Santiago',
      contacto_emergencia_nombre: 'Carlos González',
      contacto_emergencia_telefono: '+56911111111',
      contacto_emergencia_relacion: 'Padre',
      observaciones: 'Paciente de prueba'
    };
    
    const pacienteResponse = await axios.post('http://localhost:3002/api/v1/pacientes', pacienteData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // Esto necesitaría un token de admin real
      }
    });
    
    console.log('✅ Paciente creado:', pacienteResponse.data.data.id);
    
    // 3. Asignar psicólogo al paciente
    console.log('🔗 Asignando psicólogo al paciente...');
    const asignacionResponse = await axios.put(`http://localhost:3002/api/v1/pacientes/${pacienteResponse.data.data.id}/asignar-psicologo`, {
      psicologoId: psicologoResponse.data.data.id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token' // Esto necesitaría un token de admin real
      }
    });
    
    console.log('✅ Psicólogo asignado correctamente');
    console.log('📋 Resumen:');
    console.log('- Psicólogo:', psicologoData.email, '(ID:', psicologoResponse.data.data.id, ')');
    console.log('- Paciente:', pacienteData.email, '(ID:', pacienteResponse.data.data.id, ')');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

crearPacientePsicologoTest();

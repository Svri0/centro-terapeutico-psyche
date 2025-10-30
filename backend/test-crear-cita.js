const axios = require('axios');

async function testCrearCita() {
  try {
    console.log('🧪 Probando endpoint de crear cita...');
    
    // Primero necesitamos obtener un token de autenticación
    // Vamos a intentar hacer login como Laura Fernández
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123' // Nueva contraseña
    });
    
    console.log('✅ Login exitoso:', loginResponse.data);
    const token = loginResponse.data.data.token;
    
    // Ahora intentar crear una cita
    const citaData = {
      paciente_id: 'eb645828-696b-43a9-b82b-2ac06b5785ee', // ID real del paciente Test Laura
      fecha: '2025-10-23',
      hora_inicio: '10:00:00',
      hora_fin: '11:00:00',
      duracion_minutos: 60,
      tipo_sesion: 'individual',
      modalidad: 'presencial',
      notas_paciente: 'Cita de prueba desde script'
    };
    
    console.log('📝 Datos de la cita:', citaData);
    
    const citaResponse = await axios.post('http://localhost:3002/api/v1/citas', citaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cita creada exitosamente:', citaResponse.data);
    
  } catch (error) {
    console.error('❌ Error al crear cita:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testCrearCita();

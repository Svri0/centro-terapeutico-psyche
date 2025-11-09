const axios = require('axios');

async function testPsicologoAsignado() {
  try {
    console.log('🔍 Probando endpoint de psicólogo asignado...');
    
    // Token de María (paciente)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1OWE5NzEwLTdhNWItNDhhNS1iZDdhLTA1NWVjOWMxMTQ0NiIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAcHN5Y2hlLmNsIiwicm9sX2lkIjozLCJpYXQiOjE3MzU5NzI5NzQsImV4cCI6MTczNTk3NjU3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
    
    const response = await axios.get('http://localhost:3001/api/v1/pacientes/mi-psicologo/psicologo-asignado', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Respuesta exitosa:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Verificar que la imagen del psicólogo esté presente
    if (response.data.data && response.data.data.avatar_url) {
      console.log('✅ El psicólogo tiene imagen:', response.data.data.avatar_url);
    } else {
      console.log('⚠️ El psicólogo no tiene imagen asignada');
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPsicologoAsignado();
















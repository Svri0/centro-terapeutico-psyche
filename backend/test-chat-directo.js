const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3002/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ODMwNmNlLTA3ZWQtNDFmNy1iZmUzLTA2YmE1YzhmZjc0NzUiLCJlbWFpbCI6ImNoYXJsZXNAZXhhbXBsZS5jb20iLCJyb2xfaWQiOjQsIm5vbWJyZXMiOiJDaGFybGVzIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.placeholder'; // Token de ejemplo

async function testChatDirecto() {
  try {
    console.log('🔍 Probando endpoint de chat directamente...');
    
    // Configurar headers
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    console.log('🔍 Headers configurados:', headers);
    
    // Datos del mensaje
    const mensajeData = {
      contenido: 'Mensaje de prueba directo',
      receptor_id: 'e57db227-a6b7-4e1a-ae8d-08a7cf4d5b7b'
    };
    
    console.log('🔍 Datos del mensaje:', mensajeData);
    
    // Hacer la petición
    console.log('🔍 Enviando petición POST a /chat/mensajes...');
    const response = await axios.post(`${API_URL}/chat/mensajes`, mensajeData, { headers });
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📨 Datos:', response.data);
    
  } catch (error) {
    console.error('❌ Error en la petición:');
    console.error('  - Status:', error.response?.status);
    console.error('  - Mensaje:', error.response?.data?.message || error.message);
    console.error('  - Detalles:', error.response?.data);
    
    if (error.response?.status === 500) {
      console.error('🚨 ERROR 500 - Revisar logs del backend');
    }
  }
}

// Ejecutar prueba
testChatDirecto();

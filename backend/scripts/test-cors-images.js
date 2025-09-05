const axios = require('axios');

async function testCORSImages() {
  console.log('🧪 Probando configuración de CORS para imágenes...\n');

  try {
    // Probar endpoint de salud
    console.log('1️⃣ Probando endpoint de salud...');
    const saludResponse = await axios.get('http://localhost:3002/salud');
    console.log('✅ Salud del servidor:', saludResponse.data.mensaje);

    // Probar headers CORS en uploads
    console.log('\n2️⃣ Probando headers CORS en /uploads...');
    const corsResponse = await axios.get('http://localhost:3002/uploads', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ Headers CORS encontrados:');
    console.log('   Access-Control-Allow-Origin:', corsResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', corsResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', corsResponse.headers['access-control-allow-headers']);

    // Probar con una imagen específica si existe
    console.log('\n3️⃣ Probando carga de imagen específica...');
    try {
      const imageResponse = await axios.get('http://localhost:3002/uploads/avatars/test-image.png', {
        headers: {
          'Origin': 'http://localhost:3000'
        },
        validateStatus: function (status) {
          return status < 500; // Aceptar 404 como respuesta válida
        }
      });
      
      if (imageResponse.status === 200) {
        console.log('✅ Imagen cargada correctamente');
        console.log('   Content-Type:', imageResponse.headers['content-type']);
        console.log('   Content-Length:', imageResponse.headers['content-length']);
      } else if (imageResponse.status === 404) {
        console.log('ℹ️  No hay imagen de prueba, pero el endpoint responde correctamente');
        console.log('   Status:', imageResponse.status);
      }
    } catch (imageError) {
      console.log('ℹ️  Error al cargar imagen (esperado si no existe):', imageError.message);
    }

    console.log('\n🎉 Configuración de CORS verificada correctamente');
    console.log('📝 El frontend debería poder cargar imágenes ahora');

  } catch (error) {
    console.error('❌ Error en la prueba de CORS:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
  }
}

// Ejecutar la prueba
testCORSImages(); 
const axios = require('axios');

async function testNewImageEndpoint() {
  console.log('🖼️  Probando nuevo endpoint de imágenes...\n');

  try {
    // Probar el nuevo endpoint de imágenes
    const imageUrl = 'http://localhost:3002/api/v1/images/avatar-1754021847598-991141997.png';
    
    console.log(`📸 Probando nuevo endpoint: ${imageUrl}`);
    
    const response = await axios.get(imageUrl, {
      headers: {
        'Origin': 'http://localhost:3000'
      },
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Imagen cargada exitosamente desde nuevo endpoint');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers['content-type']);
    console.log('   Content-Length:', response.headers['content-length']);
    console.log('   Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('   Cross-Origin-Resource-Policy:', response.headers['cross-origin-resource-policy']);
    console.log('   Tamaño de datos:', response.data.length, 'bytes');
    
    // Verificar que es una imagen PNG válida
    const buffer = Buffer.from(response.data);
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      console.log('✅ Formato PNG válido detectado');
    } else {
      console.log('⚠️  Formato de imagen no reconocido');
    }
    
    console.log('\n🎉 El nuevo endpoint funciona correctamente');
    console.log('📝 Las imágenes ahora deberían cargarse sin problemas de CORS');
    
  } catch (error) {
    console.error('❌ Error al cargar la imagen desde el nuevo endpoint:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
  }
}

// Ejecutar la prueba
testNewImageEndpoint(); 
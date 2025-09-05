const axios = require('axios');

async function testImageLoading() {
  console.log('🖼️  Probando carga de imágenes...\n');

  try {
    // Probar una imagen específica que sabemos que existe
    const imageUrl = 'http://localhost:3002/uploads/avatars/avatar-1754021847598-991141997.png';
    
    console.log(`📸 Probando imagen: ${imageUrl}`);
    
    const response = await axios.get(imageUrl, {
      headers: {
        'Origin': 'http://localhost:3000'
      },
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Imagen cargada exitosamente');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers['content-type']);
    console.log('   Content-Length:', response.headers['content-length']);
    console.log('   Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('   Tamaño de datos:', response.data.length, 'bytes');
    
    // Verificar que es una imagen PNG válida
    const buffer = Buffer.from(response.data);
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      console.log('✅ Formato PNG válido detectado');
    } else {
      console.log('⚠️  Formato de imagen no reconocido');
    }
    
    console.log('\n🎉 La imagen se puede cargar correctamente desde el frontend');
    
  } catch (error) {
    console.error('❌ Error al cargar la imagen:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
  }
}

// Ejecutar la prueba
testImageLoading(); 
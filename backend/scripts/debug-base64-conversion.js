require('dotenv').config({ path: '../.env' });
const fetch = require('node-fetch');

async function debugBase64Conversion() {
  console.log('🔍 DEPURACIÓN DE CONVERSIÓN A BASE64\n');
  
  const dicebearUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=4ade80';
  const pngUrl = dicebearUrl.replace('/svg?', '/png?') + '&size=200';
  
  console.log('📋 URLs:');
  console.log(`   Original: ${dicebearUrl}`);
  console.log(`   PNG: ${pngUrl}\n`);
  
  try {
    console.log('🔄 Descargando imagen PNG...');
    const response = await fetch(pngUrl);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Content-Length: ${response.headers.get('content-length')} bytes\n`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('🔄 Convirtiendo a buffer...');
    const buffer = await response.buffer();
    console.log(`   Buffer size: ${buffer.length} bytes\n`);
    
    console.log('🔄 Convirtiendo a base64...');
    const base64 = buffer.toString('base64');
    console.log(`   Base64 length: ${base64.length} caracteres`);
    console.log(`   Base64 preview: ${base64.substring(0, 50)}...\n`);
    
    const dataUrl = `data:image/png;base64,${base64}`;
    console.log('✅ Conversión exitosa!');
    console.log(`   Data URL length: ${dataUrl.length} caracteres`);
    console.log(`   Data URL preview: ${dataUrl.substring(0, 100)}...\n`);
    
    console.log('🎯 Esta URL debería funcionar en Gmail');
    
  } catch (error) {
    console.error('❌ Error en la conversión:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

debugBase64Conversion(); 
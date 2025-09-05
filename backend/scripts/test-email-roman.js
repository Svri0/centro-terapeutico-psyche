require('dotenv').config();
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function testEmail() {
  console.log('=== ENVIANDO EMAIL DE PRUEBA A ROMAN ===');
  
  const emailPsicologo = 'romandiazmiguelignacio@gmail.com';
  const nombrePsicologo = 'Roman Diaz';
  const passwordTemporal = 'TestPassword123!';
  const especialidad = 'Psicología Clínica';
  
  // Probar con diferentes tipos de imágenes usando URLs más confiables
  const testUrls = [
    null, // Sin imagen (placeholder)
    'https://via.placeholder.com/200x200/f59e0b/ffffff?text=CUADRADA', // Cuadrada
    'https://via.placeholder.com/400x200/2563eb/ffffff?text=HORIZONTAL', // Horizontal
    'https://via.placeholder.com/200x400/10b981/ffffff?text=VERTICAL', // Vertical
    'https://via.placeholder.com/300x100/dc2626/ffffff?text=MUY+HORIZONTAL', // Muy horizontal
    'https://via.placeholder.com/100x300/7c3aed/ffffff?text=MUY+VERTICAL', // Muy vertical
    'https://via.placeholder.com/250x250/ea580c/ffffff?text=GRANDE', // Grande
    'https://via.placeholder.com/150x150/059669/ffffff?text=PEQUEÑA', // Pequeña
    'https://via.placeholder.com/200x200/be185d/ffffff?text=COLOR+ROSA' // Color rosa
  ];

  for (let i = 0; i < testUrls.length; i++) {
    const avatarUrl = testUrls[i];
    console.log(`\n--- PRUEBA ${i + 1}: ${avatarUrl || 'SIN IMAGEN'} ---`);
    
    try {
      const resultado = await enviarEmailBienvenidaPsicologo(
        emailPsicologo,
        nombrePsicologo,
        passwordTemporal,
        especialidad,
        avatarUrl
      );
      
      console.log(`Email enviado: ${resultado ? '✅ ÉXITO' : '❌ FALLO'}`);
      
      if (resultado) {
        console.log('✅ Email enviado correctamente');
        console.log(`📸 Tipo de imagen: ${avatarUrl ? 'Con imagen' : 'Placeholder'}`);
        if (avatarUrl) {
          console.log(`🔗 URL: ${avatarUrl}`);
        }
      } else {
        console.log('❌ Error al enviar email');
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    // Esperar 3 segundos entre emails para no saturar
    if (i < testUrls.length - 1) {
      console.log('Esperando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n=== FIN DE PRUEBAS ===');
  console.log('📧 Revisa tu email para verificar que todas las imágenes se recorten correctamente a forma circular');
  console.log('💡 Si alguna imagen no se ve, debería mostrar el placeholder 👤 automáticamente');
}

testEmail().catch(console.error); 
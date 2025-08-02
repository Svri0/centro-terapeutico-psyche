require('dotenv').config({ path: '../.env' });

// Función para convertir URL de DiceBear a formato compatible con Gmail
const convertirAvatarDiceBearParaEmail = (avatarUrl) => {
  // Si es una URL de DiceBear, convertirla a formato compatible
  if (avatarUrl && avatarUrl.includes('dicebear.com')) {
    // Usar la URL directa de DiceBear con parámetros para PNG
    return avatarUrl.replace('/svg?', '/png?') + '&size=200';
  }
  return avatarUrl;
};

console.log('🔍 DEPURACIÓN DE CONVERSIÓN DE AVATARES DICEBEAR\n');

// URLs de ejemplo del sistema
const avataresEjemplo = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf&scale=80&mouth=smile&eyes=happy',
  'https://api.dicebear.com/7.x/bottts/svg?seed=dolphin&backgroundColor=bfdfff&scale=80&mouth=smile&eyes=happy',
  'https://api.dicebear.com/7.x/bottts/svg?seed=owl&backgroundColor=8b4513&scale=80&mouth=smile&eyes=happy',
  'https://api.dicebear.com/7.x/bottts/svg?seed=butterfly&backgroundColor=ffb6c1&scale=80&mouth=smile&eyes=happy'
];

console.log('📋 URLs originales (SVG):');
avataresEjemplo.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`);
});

console.log('\n🔄 URLs convertidas (PNG):');
avataresEjemplo.forEach((url, index) => {
  const urlConvertida = convertirAvatarDiceBearParaEmail(url);
  console.log(`   ${index + 1}. ${urlConvertida}`);
});

console.log('\n✅ Verificación:');
console.log('   - Las URLs convertidas deberían terminar en /png? en lugar de /svg?');
console.log('   - Deberían incluir &size=200 al final');
console.log('   - Gmail debería poder mostrar estas imágenes PNG');

// Probar con una URL que no sea de DiceBear
const urlNoDiceBear = 'https://ejemplo.com/avatar.jpg';
console.log(`\n🧪 Prueba con URL no-DiceBear: ${urlNoDiceBear}`);
console.log(`   Resultado: ${convertirAvatarDiceBearParaEmail(urlNoDiceBear)}`); 
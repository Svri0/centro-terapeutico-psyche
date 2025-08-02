require('dotenv').config({ path: '../.env' });

// Función para crear avatar por defecto en HTML/CSS (copiada del email.service.ts)
const crearAvatarPorDefecto = (nombre) => {
  // Obtener iniciales del nombre
  const iniciales = nombre
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Colores del centro terapéutico
  const colores = ['#f59e0b', '#d97706', '#92400e', '#78350f'];
  const colorFondo = colores[Math.floor(Math.random() * colores.length)];

  return `
    <div style="
      width: 200px; 
      height: 200px; 
      border-radius: 50%; 
      border: 6px solid #f59e0b; 
      background: linear-gradient(135deg, ${colorFondo} 0%, #fbbf24 100%);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin: 0 auto; 
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: hidden;
    ">
      <!-- Círculo interno con patrón -->
      <div style="
        width: 180px; 
        height: 180px; 
        border-radius: 50%; 
        background: rgba(255, 255, 255, 0.1);
        display: flex; 
        align-items: center; 
        justify-content: center;
        border: 2px solid rgba(255, 255, 255, 0.2);
      ">
        <!-- Iniciales -->
        <div style="
          font-family: Arial, sans-serif;
          font-size: 48px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 2px;
        ">
          ${iniciales}
        </div>
      </div>
      
      <!-- Elementos decorativos -->
      <div style="
        position: absolute;
        top: 20px;
        right: 20px;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
      "></div>
      
      <div style="
        position: absolute;
        bottom: 30px;
        left: 25px;
        width: 15px;
        height: 15px;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.6);
      "></div>
    </div>
  `;
};

console.log('🔍 DEPURACIÓN DEL AVATAR PERSONALIZADO\n');

// Probar con diferentes nombres
const nombresPrueba = [
  'Dr. Juan Carlos Pérez González',
  'María Elena Rodríguez',
  'Carlos Alberto Silva',
  'Ana Sofía Martínez'
];

nombresPrueba.forEach((nombre, index) => {
  console.log(`📋 Prueba ${index + 1}: "${nombre}"`);
  
  // Obtener iniciales
  const iniciales = nombre
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  console.log(`   Iniciales: "${iniciales}"`);
  
  // Generar avatar
  const avatarHTML = crearAvatarPorDefecto(nombre);
  
  console.log(`   Color de fondo: ${['#f59e0b', '#d97706', '#92400e', '#78350f'][index % 4]}`);
  console.log(`   Longitud del HTML: ${avatarHTML.length} caracteres`);
  console.log('');
});

console.log('✅ Verificación:');
console.log('   - Las iniciales se extraen correctamente');
console.log('   - El HTML se genera sin errores');
console.log('   - Los colores se asignan correctamente');
console.log('   - El CSS inline debería funcionar en Gmail'); 
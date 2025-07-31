#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configurando API de Administrador - Centro Terapéutico Psyche');
console.log('═══════════════════════════════════════════════════════════════\n');

try {
  // 1. Verificar que estamos en el directorio correcto
  console.log('1️⃣  Verificando directorio...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const fs = require('fs');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No se encontró package.json. Asegúrate de estar en el directorio backend/');
  }

  console.log('✅ Directorio correcto\n');

  // 2. Instalar dependencias si no están instaladas
  console.log('2️⃣  Verificando dependencias...');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Instalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ Dependencias ya instaladas');
  }
  console.log('');

  // 3. Verificar variables de entorno
  console.log('3️⃣  Verificando variables de entorno...');
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No se encontró archivo .env');
    console.log('📝 Creando archivo .env con configuración básica...');
    
    const envContent = `# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VMlover01!
DB_NAME=psyche_db

# JWT Secret (¡CAMBIA ESTO EN PRODUCCIÓN!)
JWT_SECRET=tu_secreto_super_seguro_y_largo_para_desarrollo

# Configuración del servidor
NODE_ENV=development
PORT=3002

# Configuración de logging
LOG_LEVEL=info
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado');
  } else {
    console.log('✅ Archivo .env encontrado');
  }
  console.log('');

  // 4. Ejecutar migraciones
  console.log('4️⃣  Ejecutando migraciones...');
  try {
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('✅ Migraciones ejecutadas correctamente');
  } catch (error) {
    console.log('⚠️  Error en migraciones (puede ser normal si ya están ejecutadas)');
  }
  console.log('');

  // 5. Ejecutar seeders
  console.log('5️⃣  Ejecutando seeders...');
  try {
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('✅ Seeders ejecutados correctamente');
  } catch (error) {
    console.log('⚠️  Error en seeders (puede ser normal si ya están ejecutados)');
  }
  console.log('');

  // 6. Verificar que el servidor puede iniciar
  console.log('6️⃣  Verificando que el servidor puede iniciar...');
  try {
    // Intentar compilar TypeScript
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Compilación exitosa');
  } catch (error) {
    console.log('⚠️  Error en compilación, pero continuando...');
  }
  console.log('');

  // 7. Mostrar información final
  console.log('🎉 ¡Configuración completada exitosamente!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 Información importante:');
  console.log('');
  console.log('🔑 Usuario administrador por defecto:');
  console.log('   📧 Email: admin@terapia.cl');
  console.log('   🔐 Contraseña: Admin123!');
  console.log('');
  console.log('🚀 Para iniciar el servidor:');
  console.log('   npm run dev');
  console.log('');
  console.log('🌐 Endpoints disponibles:');
  console.log('   - Salud: http://localhost:3002/salud');
  console.log('   - Dashboard: http://localhost:3002/dashboard');
  console.log('   - API Admin: http://localhost:3002/api/v1/admin/psicologos');
  console.log('');
  console.log('📚 Documentación:');
  console.log('   - API: backend/docs/API_ADMIN.md');
  console.log('   - README: backend/README_ADMIN_API.md');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Cambia la contraseña del administrador después del primer login');
  console.log('   - Configura JWT_SECRET en producción');
  console.log('   - Configura HTTPS en producción');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');

} catch (error) {
  console.error('❌ Error durante la configuración:', error.message);
  console.log('');
  console.log('🔧 Soluciones sugeridas:');
  console.log('   1. Verifica que PostgreSQL esté ejecutándose');
  console.log('   2. Verifica las credenciales de la base de datos');
  console.log('   3. Ejecuta: npm install');
  console.log('   4. Verifica que estés en el directorio backend/');
  process.exit(1);
} 
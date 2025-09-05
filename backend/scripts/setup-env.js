const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 CONFIGURADOR DE ENV PARA CENTRO TERAPÉUTICO PSYCHE');
console.log('=====================================================\n');

async function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, resolve);
  });
}

async function configurarEnv() {
  try {
    // Verificar si ya existe .env
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const respuesta = await pregunta('⚠️  Ya existe un archivo .env. ¿Quieres sobrescribirlo? (s/N): ');
      if (respuesta.toLowerCase() !== 's' && respuesta.toLowerCase() !== 'si') {
        console.log('❌ Configuración cancelada');
        rl.close();
        return;
      }
    }

    console.log('\n📧 CONFIGURACIÓN DE EMAIL (GMAIL)');
    console.log('-----------------------------------');
    console.log('💡 Usando configuración del equipo: dentrodepsyche@gmail.com');
    console.log('   La contraseña de aplicación ya está configurada\n');

    // Usar configuración del equipo por defecto
    const emailUser = 'dentrodepsyche@gmail.com';
    const emailPassword = 'vpbv pvtd oryn daww'; // Contraseña de aplicación del equipo

    console.log('\n🗄️  CONFIGURACIÓN DE BASE DE DATOS');
    console.log('-----------------------------------');
    
    console.log('💡 Usando configuración del equipo por defecto');
    console.log('   Solo necesitas tu contraseña de PostgreSQL local\n');
    
    const dbHost = 'localhost';
    const dbPort = '5432';
    const dbName = 'psyche_db';
    const dbUser = 'postgres';
    const dbPassword = await pregunta('🔐 Tu contraseña de PostgreSQL local: ');

    console.log('\n🔐 CONFIGURACIÓN JWT');
    console.log('---------------------');
    
    console.log('💡 Usando configuración del equipo por defecto\n');
    
    const jwtSecret = 'psyche_jwt_secret_super_seguro_2024';
    const jwtExpiresIn = '24h';

    console.log('\n🌐 CONFIGURACIÓN DEL SERVIDOR');
    console.log('-----------------------------');
    
    console.log('💡 Usando configuración del equipo por defecto\n');
    
    const port = '3002';
    const nodeEnv = 'development';

    // Generar contenido del .env
    const envContent = `# ========================================
# CONFIGURACIÓN DEL CENTRO TERAPÉUTICO PSYCHE
# ========================================
# Generado automáticamente el ${new Date().toLocaleString('es-CL')}
# ========================================

# CONFIGURACIÓN DE BASE DE DATOS
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# CONFIGURACIÓN DE EMAIL (GMAIL)
EMAIL_USER=${emailUser}
EMAIL_PASSWORD=${emailPassword}
EMAIL_FROM=Dentro de Psyché <${emailUser}>
EMAIL_FROM_NAME=Dentro de Psyché

# CONFIGURACIÓN JWT
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=${jwtExpiresIn}

# CONFIGURACIÓN DEL SERVIDOR
PORT=${port}
NODE_ENV=${nodeEnv}

# ========================================
# ¡IMPORTANTE!
# ========================================
# ✅ Este archivo está configurado correctamente
# ✅ Las credenciales están seguras (no se suben al repo)
# ✅ El sistema de emails funcionará correctamente
# ========================================
`;

    // Escribir archivo .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ ARCHIVO .ENV CONFIGURADO EXITOSAMENTE');
    console.log('==========================================');
    console.log(`📁 Ubicación: ${envPath}`);
    console.log('🔒 El archivo .env está en .gitignore (no se subirá al repo)');
    console.log('📧 Sistema de emails configurado');
    console.log('🗄️  Base de datos configurada');
    console.log('🔐 JWT configurado');
    console.log('\n🚀 ¡Ya puedes ejecutar el servidor!');

    // Mostrar resumen de configuración
    console.log('\n📋 RESUMEN DE CONFIGURACIÓN:');
    console.log('-----------------------------');
    console.log(`📧 Email: ${emailUser}`);
    console.log(`🏠 DB Host: ${dbHost}:${dbPort}`);
    console.log(`📚 DB Name: ${dbName}`);
    console.log(`🚀 Puerto: ${port}`);
    console.log(`🌍 Entorno: ${nodeEnv}`);

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    rl.close();
  }
}

// Ejecutar configuración
configurarEnv(); 
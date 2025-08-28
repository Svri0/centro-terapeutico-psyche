const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, resolve);
  });
}

async function configuracionAutomaticaRoman() {
  try {
    console.log('🚀 CONFIGURACIÓN AUTOMÁTICA PARA ROMÁN');
    console.log('=======================================\n');

    // Detectar sistema operativo
    const platform = os.platform();
    const isWindows = platform === 'win32';
    const isLinux = platform === 'linux';
    
    console.log(`💻 Sistema operativo detectado: ${isWindows ? '🪟 Windows' : isLinux ? '🐧 Linux' : '❓ Desconocido'}`);
    
    if (!isWindows && !isLinux) {
      console.log('⚠️  Sistema operativo no reconocido. Usando configuración por defecto.');
    }

    // Configurar usuario de PostgreSQL según el OS
    let dbUser;
    if (isWindows) {
      dbUser = 'postgres';
      console.log('✅ Usando usuario PostgreSQL: postgres (Windows)');
    } else if (isLinux) {
      dbUser = 'psyche_user';
      console.log('✅ Usando usuario PostgreSQL: psyche_user (Linux)');
    } else {
      dbUser = 'postgres'; // Por defecto
      console.log('⚠️  Usando usuario PostgreSQL por defecto: postgres');
    }

    console.log('\n💡 Usando configuración del equipo por defecto');
    console.log('   Solo necesitas tu contraseña de PostgreSQL\n');

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

    // Solo pedir contraseña de PostgreSQL
    const dbPassword = await pregunta('🔐 Tu contraseña de PostgreSQL local: ');

    if (!dbPassword) {
      console.log('❌ La contraseña de PostgreSQL es obligatoria');
      rl.close();
      return;
    }

    // Configuración del equipo (ya definida)
    const configuracion = {
      emailUser: 'dentrodepsyche@gmail.com',
      emailPassword: 'vpbv pvtd oryn daww',
      jwtSecret: 'psyche_jwt_secret_super_seguro_2024',
      port: '3002',
      nodeEnv: 'development'
    };

    // Generar contenido del .env
    const envContent = `# ========================================
# CONFIGURACIÓN DEL CENTRO TERAPÉUTICO PSYCHE
# ========================================
# Configuración automática para ROMÁN
# Sistema: ${isWindows ? 'Windows' : isLinux ? 'Linux' : 'Desconocido'}
# Fecha: ${new Date().toLocaleString('es-CL')}
# ========================================

# CONFIGURACIÓN DE BASE DE DATOS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=psyche_db
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# CONFIGURACIÓN DE EMAIL (GMAIL) - EQUIPO
EMAIL_USER=${configuracion.emailUser}
EMAIL_PASSWORD=${configuracion.emailPassword}
EMAIL_FROM=Dentro de Psyché <${configuracion.emailUser}>
EMAIL_FROM_NAME=Dentro de Psyché

# CONFIGURACIÓN JWT - EQUIPO
JWT_SECRET=${configuracion.jwtSecret}
JWT_EXPIRES_IN=24h

# CONFIGURACIÓN DEL SERVIDOR - EQUIPO
PORT=${configuracion.port}
NODE_ENV=${configuracion.nodeEnv}

# ========================================
# ✅ CONFIGURACIÓN COMPLETA PARA ROMÁN
# ========================================
# 💻 Sistema: ${isWindows ? 'Windows' : isLinux ? 'Linux' : 'Desconocido'}
# 📧 Email: ${configuracion.emailUser}
# 🔑 Contraseña de aplicación: ya configurada
# 🔐 JWT Secret: ya configurado
# 🚀 Puerto: ${configuracion.port}
# 🗄️  Usuario PostgreSQL: ${dbUser}
# 🗄️  Base de datos: configurada con tu contraseña
# ========================================
`;

    // Escribir archivo .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ ARCHIVO .ENV CONFIGURADO EXITOSAMENTE');
    console.log('==========================================');
    console.log(`📁 Ubicación: ${envPath}`);
    console.log('🔒 El archivo .env está en .gitignore (no se subirá al repo)');
    console.log('\n🎯 CONFIGURACIÓN PERSONALIZADA PARA ROMÁN:');
    console.log('-------------------------------------------');
    console.log(`💻 Sistema: ${isWindows ? '🪟 Windows' : isLinux ? '🐧 Linux' : '❓ Desconocido'}`);
    console.log(`📧 Email: ${configuracion.emailUser}`);
    console.log(`🔑 Contraseña de aplicación: ya configurada`);
    console.log(`🔐 JWT Secret: ya configurado`);
    console.log(`🚀 Puerto: ${configuracion.port}`);
    console.log(`🗄️  Usuario PostgreSQL: ${dbUser}`);
    console.log(`🗄️  Base de datos: configurada con tu contraseña`);
    console.log('\n🚀 ¡Ya puedes ejecutar el servidor!');

    // Mostrar próximos pasos
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('-------------------');
    console.log('1. ✅ .env configurado automáticamente');
    console.log('2. 🔄 Ejecutar: npm run db:migrate');
    console.log('3. 🌱 Ejecutar: npm run db:seed');
    console.log('4. 👑 Ejecutar: node scripts/crear-admin.js');
    console.log('5. 🚀 Ejecutar: npm run dev');

    // Mostrar información específica del sistema
    console.log('\n💡 INFORMACIÓN DEL SISTEMA:');
    console.log('----------------------------');
    if (isWindows) {
      console.log('🪟 Windows detectado:');
      console.log('   • Usuario PostgreSQL: postgres');
      console.log('   • Servicio: Verificar en Servicios > PostgreSQL');
      console.log('   • Puerto: 5432 (por defecto)');
    } else if (isLinux) {
      console.log('🐧 Linux detectado:');
      console.log('   • Usuario PostgreSQL: psyche_user');
      console.log('   • Servicio: sudo systemctl status postgresql');
      console.log('   • Puerto: 5432 (por defecto)');
    }

    console.log('\n🔄 Cuando cambies de sistema:');
    console.log('   Solo ejecuta: node scripts/setup-roman.js');
    console.log('   Se detectará automáticamente tu nuevo OS');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    rl.close();
  }
}

// Ejecutar configuración automática
configuracionAutomaticaRoman();

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, resolve);
  });
}

async function configuracionRapida() {
  try {
    console.log('🚀 CONFIGURACIÓN RÁPIDA PARA EL EQUIPO PSYCHE');
    console.log('=============================================\n');
    console.log('💡 Usando configuración del equipo por defecto');
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
# Configuración del equipo - Generada automáticamente
# Fecha: ${new Date().toLocaleString('es-CL')}
# ========================================

# CONFIGURACIÓN DE BASE DE DATOS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=psyche_db
DB_USER=postgres
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
# ✅ CONFIGURACIÓN COMPLETA DEL EQUIPO
# ========================================
# 📧 Email: ${configuracion.emailUser}
# 🔑 Contraseña de aplicación: ya configurada
# 🔐 JWT Secret: ya configurado
# 🚀 Puerto: ${configuracion.port}
# 🗄️  Base de datos: configurada con tu contraseña
# ========================================
`;

    // Escribir archivo .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ ARCHIVO .ENV CONFIGURADO EXITOSAMENTE');
    console.log('==========================================');
    console.log(`📁 Ubicación: ${envPath}`);
    console.log('🔒 El archivo .env está en .gitignore (no se subirá al repo)');
    console.log('\n🎯 CONFIGURACIÓN DEL EQUIPO:');
    console.log('-----------------------------');
    console.log(`📧 Email: ${configuracion.emailUser}`);
    console.log(`🔑 Contraseña de aplicación: ya configurada`);
    console.log(`🔐 JWT Secret: ya configurado`);
    console.log(`🚀 Puerto: ${configuracion.port}`);
    console.log(`🗄️  Base de datos: configurada con tu contraseña`);
    console.log('\n🚀 ¡Ya puedes ejecutar el servidor!');

    // Mostrar próximos pasos
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('-------------------');
    console.log('1. ✅ .env configurado');
    console.log('2. 🔄 Ejecutar: npm run db:migrate');
    console.log('3. 🌱 Ejecutar: npm run db:seed');
    console.log('4. 👑 Ejecutar: npm run crear-admin');
    console.log('5. 🚀 Ejecutar: npm run dev');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    rl.close();
  }
}

// Ejecutar configuración rápida
configuracionRapida();

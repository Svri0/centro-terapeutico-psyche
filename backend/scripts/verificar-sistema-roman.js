const os = require('os');
const fs = require('fs');
const path = require('path');

function verificarSistemaRoman() {
  try {
    console.log('🔍 VERIFICACIÓN DEL SISTEMA DE ROMÁN');
    console.log('=====================================\n');

    // Detectar sistema operativo
    const platform = os.platform();
    const isWindows = platform === 'win32';
    const isLinux = platform === 'linux';
    const arch = os.arch();
    const hostname = os.hostname();
    const userInfo = os.userInfo();

    console.log('💻 INFORMACIÓN DEL SISTEMA:');
    console.log('----------------------------');
    console.log(`🖥️  Sistema: ${isWindows ? '🪟 Windows' : isLinux ? '🐧 Linux' : '❓ Desconocido'}`);
    console.log(`🏗️  Arquitectura: ${arch}`);
    console.log(`🏠 Hostname: ${hostname}`);
    console.log(`👤 Usuario: ${userInfo.username}`);
    console.log(`📁 Directorio home: ${userInfo.homedir}`);

    // Verificar archivo .env
    const envPath = path.join(__dirname, '..', '.env');
    const envExists = fs.existsSync(envPath);
    
    console.log('\n📁 ARCHIVO .ENV:');
    console.log('-----------------');
    if (envExists) {
      console.log('✅ Archivo .env encontrado');
      
      // Leer y analizar .env
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      console.log('\n🔍 CONFIGURACIÓN ACTUAL:');
      console.log('-------------------------');
      
      const config = {};
      lines.forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            config[key.trim()] = value.trim();
          }
        }
      });

      // Mostrar configuración relevante
      if (config.DB_USER) {
        console.log(`🗄️  Usuario PostgreSQL: ${config.DB_USER}`);
        const expectedUser = isWindows ? 'postgres' : 'psyche_user';
        if (config.DB_USER === expectedUser) {
          console.log(`   ✅ Correcto para ${isWindows ? 'Windows' : 'Linux'}`);
        } else {
          console.log(`   ⚠️  Esperado: ${expectedUser} para ${isWindows ? 'Windows' : 'Linux'}`);
        }
      }
      
      if (config.DB_NAME) console.log(`📚 Base de datos: ${config.DB_NAME}`);
      if (config.EMAIL_USER) console.log(`📧 Email: ${config.EMAIL_USER}`);
      if (config.PORT) console.log(`🚀 Puerto: ${config.PORT}`);
      if (config.JWT_SECRET) console.log(`🔐 JWT Secret: ${config.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
      
    } else {
      console.log('❌ Archivo .env NO encontrado');
      console.log('💡 Ejecuta: node scripts/setup-roman.js');
    }

    // Verificar directorio del proyecto
    console.log('\n📂 DIRECTORIO DEL PROYECTO:');
    console.log('-----------------------------');
    const projectPath = path.join(__dirname, '..');
    console.log(`🏠 Ruta: ${projectPath}`);
    
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      console.log('✅ package.json encontrado');
    } else {
      console.log('❌ package.json NO encontrado');
    }

    // Recomendaciones según el sistema
    console.log('\n💡 RECOMENDACIONES:');
    console.log('-------------------');
    
    if (isWindows) {
      console.log('🪟 Windows detectado:');
      console.log('   • Usuario PostgreSQL esperado: postgres');
      console.log('   • Verificar servicio PostgreSQL en Servicios');
      console.log('   • Puerto por defecto: 5432');
    } else if (isLinux) {
      console.log('🐧 Linux detectado:');
      console.log('   • Usuario PostgreSQL esperado: psyche_user');
      console.log('   • Verificar servicio: sudo systemctl status postgresql');
      console.log('   • Puerto por defecto: 5432');
    }

    if (!envExists) {
      console.log('\n🚀 ACCIÓN REQUERIDA:');
      console.log('---------------------');
      console.log('Ejecuta: node scripts/setup-roman.js');
      console.log('Este script configurará automáticamente todo para tu sistema');
    } else {
      console.log('\n✅ SISTEMA VERIFICADO');
      console.log('---------------------');
      console.log('Tu configuración parece estar correcta');
      console.log('Puedes proceder con: npm run dev');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar verificación
verificarSistemaRoman();

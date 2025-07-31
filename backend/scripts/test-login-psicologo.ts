import axios from 'axios';

const BASE_URL = 'http://localhost:3002/api/v1';

const psicologosEjemplo = [
  {
    email: 'maria.gonzalez@psyche.cl',
    password: 'psicologo123'
  },
  {
    email: 'juan.perez@psyche.cl',
    password: 'psicologo123'
  },
  {
    email: 'ana.martinez@psyche.cl',
    password: 'psicologo123'
  },
  {
    email: 'carlos.rodriguez@psyche.cl',
    password: 'psicologo123'
  },
  {
    email: 'laura.fernandez@psyche.cl',
    password: 'psicologo123'
  }
];

async function testLoginPsicologos(): Promise<void> {
  try {
    console.log('🔐 Probando login con psicólogos...\n');

    for (const psicologo of psicologosEjemplo) {
      try {
        console.log(`📧 Probando: ${psicologo.email}`);
        
        const response = await axios.post(`${BASE_URL}/autenticacion/login`, psicologo, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          console.log('✅ Login exitoso!');
          console.log(`   👤 Nombre: ${response.data.data.usuario.nombres} ${response.data.data.usuario.apellidos}`);
          console.log(`   📧 Email: ${response.data.data.usuario.email}`);
          console.log(`   🏷️  Rol: ${response.data.data.usuario.rol}`);
          console.log(`   🔑 Token: ${response.data.data.token.substring(0, 50)}...`);
          console.log('');
        } else {
          console.log('❌ Error en el login:');
          console.log(response.data);
        }

      } catch (error: any) {
        if (error.response) {
          console.log(`❌ Error ${error.response.status}: ${error.response.data.mensaje || 'Error desconocido'}`);
        } else {
          console.log('❌ Error de conexión');
        }
      }
      
      // Pausa entre intentos
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🎉 ¡Pruebas de login completadas!');

  } catch (error: any) {
    console.log('❌ Error general:', error.message);
  }
}

// Función para probar un psicólogo específico
async function testLoginPsicologoEspecifico(email: string, password: string = 'psicologo123'): Promise<void> {
  try {
    console.log(`🔐 Probando login con psicólogo específico: ${email}\n`);

    const loginData = {
      email,
      password
    };

    const response = await axios.post(`${BASE_URL}/autenticacion/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Login exitoso!');
      console.log('📋 Información del psicólogo:');
      console.log('   ID:', response.data.data.usuario.id);
      console.log('   Nombre:', response.data.data.usuario.nombres, response.data.data.usuario.apellidos);
      console.log('   Email:', response.data.data.usuario.email);
      console.log('   Rol:', response.data.data.usuario.rol);
      console.log('');
      console.log('🔑 Token JWT:');
      console.log(response.data.data.token);
      console.log('');
      console.log('🎉 ¡Login de psicólogo funcionando correctamente!');
    } else {
      console.log('❌ Error en el login:');
      console.log(response.data);
    }

  } catch (error: any) {
    console.log('❌ Error al conectar con el servidor:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No se pudo conectar al servidor. Asegúrate de que esté ejecutándose:');
      console.log('   npm run dev');
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length >= 1) {
  // Probar psicólogo específico
  const email = args[0];
  const password = args[1] || 'psicologo123';
  
  if (email) {
    testLoginPsicologoEspecifico(email, password);
  } else {
    console.log('❌ Error: Email requerido');
    console.log('💡 Uso: npm run test-psicologos "email@ejemplo.com" [password]');
  }
} else {
  // Probar todos los psicólogos
  testLoginPsicologos();
} 
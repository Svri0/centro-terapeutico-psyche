import axios from 'axios';

const BASE_URL = 'http://localhost:3002/api/v1';

async function testLogin(): Promise<void> {
  try {
    console.log('🔐 Probando login con usuario administrador...\n');

    const loginData = {
      email: 'admin@admin.com',
      password: 'admin123'
    };

    console.log('📧 Email:', loginData.email);
    console.log('🔑 Contraseña:', loginData.password);
    console.log('🌐 URL:', `${BASE_URL}/autenticacion/login`);
    console.log('');

    const response = await axios.post(`${BASE_URL}/autenticacion/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Login exitoso!');
      console.log('📋 Información del usuario:');
      console.log('   ID:', response.data.data.usuario.id);
      console.log('   Nombre:', response.data.data.usuario.nombres, response.data.data.usuario.apellidos);
      console.log('   Email:', response.data.data.usuario.email);
      console.log('   Rol:', response.data.data.usuario.rol);
      console.log('');
      console.log('🔑 Token JWT:');
      console.log(response.data.data.token);
      console.log('');
      console.log('🎉 ¡Credenciales funcionando correctamente!');
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

// Ejecutar el test
testLogin(); 
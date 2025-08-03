import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

interface RecepcionistaData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
}

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const crearRecepcionista = async (data: RecepcionistaData) => {
  try {
    console.log('\n🔍 Intentando crear recepcionista...');
    console.log('📧 Email:', data.email);
    console.log('👤 Nombre:', `${data.nombres} ${data.apellidos}`);

    const response = await axios.post(`${API_BASE_URL}/api/admin/recepcionistas`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || ''}`
      }
    });

    if (response.status === 201) {
      console.log('✅ Recepcionista creado exitosamente!');
      console.log('📋 Datos del recepcionista:');
      console.log('   ID:', response.data.data.usuario.id);
      console.log('   Nombre:', response.data.data.usuario.nombres, response.data.data.usuario.apellidos);
      console.log('   Email:', response.data.data.usuario.email);
      console.log('   Fecha de creación:', new Date(response.data.data.usuario.created_at).toLocaleString('es-CL'));
      
      if (response.data.data.token_activacion) {
        console.log('🔑 Token de activación:', response.data.data.token_activacion);
      }
      
      return response.data;
    }
  } catch (error: any) {
    console.error('❌ Error al crear recepcionista:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Mensaje:', error.response.data?.mensaje || 'Error desconocido');
      
      if (error.response.data?.errores) {
        console.error('   Errores de validación:');
        Object.entries(error.response.data.errores).forEach(([campo, mensaje]) => {
          console.error(`     ${campo}: ${mensaje}`);
        });
      }
    } else if (error.request) {
      console.error('   Error de conexión: No se pudo conectar al servidor');
      console.error('   Verifica que el servidor esté ejecutándose en:', API_BASE_URL);
    } else {
      console.error('   Error:', error.message);
    }
    
    throw error;
  }
};

const main = async () => {
  console.log('🎯 Script para crear recepcionista');
  console.log('=====================================\n');

  try {
    // Verificar token de administrador
    if (!process.env.ADMIN_TOKEN) {
      console.log('⚠️  ADVERTENCIA: No se encontró ADMIN_TOKEN en las variables de entorno');
      console.log('   El script intentará crear el recepcionista sin autenticación');
      console.log('   Para usar autenticación, configura ADMIN_TOKEN en tu archivo .env\n');
    }

    // Solicitar datos del recepcionista
    const nombres = await question('📝 Nombres del recepcionista: ');
    const apellidos = await question('📝 Apellidos del recepcionista: ');
    const email = await question('📧 Email del recepcionista: ');
    const password = await question('🔒 Contraseña del recepcionista: ');
    const telefono = await question('📞 Teléfono (opcional, presiona Enter para omitir): ');
    const fecha_nacimiento = await question('🎂 Fecha de nacimiento (YYYY-MM-DD, opcional, presiona Enter para omitir): ');
    const genero = await question('👤 Género (masculino/femenino/otro/prefiero_no_decir, opcional, presiona Enter para omitir): ') as any;

    // Validar campos obligatorios
    if (!nombres.trim() || !apellidos.trim() || !email.trim() || !password.trim()) {
      console.error('❌ Error: Nombres, apellidos, email y contraseña son campos obligatorios');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Formato de email inválido');
      return;
    }

    // Validar formato de fecha si se proporciona
    if (fecha_nacimiento.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
      console.error('❌ Error: Formato de fecha inválido. Use YYYY-MM-DD');
      return;
    }

    // Validar género si se proporciona
    const generosValidos = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
    if (genero.trim() && !generosValidos.includes(genero)) {
      console.error('❌ Error: Género inválido. Opciones válidas:', generosValidos.join(', '));
      return;
    }

    const recepcionistaData: RecepcionistaData = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      telefono: telefono.trim() || undefined,
      fecha_nacimiento: fecha_nacimiento.trim() || undefined,
      genero: genero.trim() || undefined
    };

    console.log('\n📋 Resumen de datos:');
    console.log('   Nombres:', recepcionistaData.nombres);
    console.log('   Apellidos:', recepcionistaData.apellidos);
    console.log('   Email:', recepcionistaData.email);
    console.log('   Teléfono:', recepcionistaData.telefono || 'No especificado');
    console.log('   Fecha de nacimiento:', recepcionistaData.fecha_nacimiento || 'No especificada');
    console.log('   Género:', recepcionistaData.genero || 'No especificado');

    const confirmacion = await question('\n¿Confirmar la creación del recepcionista? (s/N): ');
    
    if (confirmacion.toLowerCase() !== 's' && confirmacion.toLowerCase() !== 'si' && confirmacion.toLowerCase() !== 'y' && confirmacion.toLowerCase() !== 'yes') {
      console.log('❌ Creación cancelada');
      return;
    }

    await crearRecepcionista(recepcionistaData);

  } catch (error) {
    console.error('\n💥 Error fatal:', error);
  } finally {
    rl.close();
  }
};

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

export default crearRecepcionista; 
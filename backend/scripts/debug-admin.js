const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002/api/v1';

async function debugAdmin() {
  console.log('🔍 Diagnóstico del Administrador');
  console.log('================================');

  try {
    // 1. Intentar login
    console.log('\n1️⃣ Intentando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
      email: 'admin@terapia.cl',
      password: 'Admin123!'
    });

    console.log('✅ Login exitoso');
    console.log('📋 Respuesta del login:', JSON.stringify(loginResponse.data, null, 2));

    const token = loginResponse.data.data.token;
    const usuario = loginResponse.data.data.usuario;

    console.log('\n👤 Información del usuario:');
    console.log('   ID:', usuario.id);
    console.log('   Email:', usuario.email);
    console.log('   Rol:', usuario.rol);
    console.log('   Nombres:', usuario.nombres);
    console.log('   Apellidos:', usuario.apellidos);

    // 2. Decodificar el token JWT
    console.log('\n2️⃣ Decodificando token JWT...');
    const jwt = require('jsonwebtoken');
    const secret = 'tu_secreto_super_seguro_para_jwt_tokens_2024';
    const decoded = jwt.verify(token, secret);
    
    console.log('🔓 Token decodificado:', JSON.stringify(decoded, null, 2));

    // 3. Probar endpoint de admin
    console.log('\n3️⃣ Probando endpoint de administrador...');
    try {
      const adminResponse = await axios.get(`${API_BASE_URL}/admin/psicologos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Endpoint de admin funciona correctamente');
      console.log('📋 Respuesta:', JSON.stringify(adminResponse.data, null, 2));
    } catch (adminError) {
      console.log('❌ Error en endpoint de admin:');
      console.log('   Status:', adminError.response?.status);
      console.log('   Mensaje:', adminError.response?.data?.mensaje);
      console.log('   Código:', adminError.response?.data?.codigo);
    }

    // 4. Verificar en base de datos
    console.log('\n4️⃣ Verificando información en base de datos...');
    const { Pool } = require('pg');
    
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'psyche_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    });

    const dbResult = await pool.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.rol_id, u.activo, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'admin@terapia.cl'
    `);

    if (dbResult.rows.length > 0) {
      const dbUser = dbResult.rows[0];
      console.log('✅ Usuario encontrado en base de datos:');
      console.log('   ID:', dbUser.id);
      console.log('   Email:', dbUser.email);
      console.log('   Rol ID:', dbUser.rol_id);
      console.log('   Rol Nombre:', dbUser.rol_nombre);
      console.log('   Activo:', dbUser.activo);
    } else {
      console.log('❌ Usuario no encontrado en base de datos');
    }

    await pool.end();

  } catch (error) {
    console.log('❌ Error en el diagnóstico:');
    console.log('   Mensaje:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

// Ejecutar diagnóstico
debugAdmin(); 
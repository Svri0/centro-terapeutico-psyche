#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testAdminLogin() {
  try {
    console.log('🔐 Probando login del administrador...\n');
    
    const response = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ Login exitoso!');
      console.log('📊 Datos del usuario:', response.data.data.usuario);
      console.log('🔑 Token recibido:', response.data.data.token.substring(0, 50) + '...');
    } else {
      console.log('❌ Login fallido:', response.status);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data.mensaje);
    } else {
      console.log('❌ Error de conexión:', error.message);
    }
  }
}

testAdminLogin(); 
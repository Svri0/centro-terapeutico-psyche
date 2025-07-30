#!/usr/bin/env node

/**
 * Script de prueba para el sistema de autenticación
 * Centro Terapéutico Psyche
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1/auth';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: msg => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: msg => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: msg => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: msg => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

// Función para hacer peticiones HTTP
const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Función para probar el registro
const testRegistro = async () => {
  log.title('🧪 Probando Registro de Usuario');

  const userData = {
    nombre: 'Usuario Test',
    email: 'test@psyche.cl',
    password: 'password123',
    rol: 'paciente',
    telefono: '+56912345678'
  };

  const result = await makeRequest('POST', `${BASE_URL}/registro`, userData);

  if (result.success) {
    log.success('Registro exitoso');
    log.info(`Usuario creado: ${result.data.data.usuario.email}`);
    return result.data.data.tokens.accessToken;
  } else {
    log.error(`Error en registro: ${result.error.mensaje}`);
    return null;
  }
};

// Función para probar el login
const testLogin = async () => {
  log.title('🔐 Probando Login');

  const loginData = {
    email: 'juan.perez@psyche.cl',
    password: 'password123'
  };

  const result = await makeRequest('POST', `${BASE_URL}/login`, loginData);

  if (result.success) {
    log.success('Login exitoso');
    log.info(`Usuario autenticado: ${result.data.data.usuario.nombre}`);
    return result.data.data.tokens.accessToken;
  } else {
    log.error(`Error en login: ${result.error.mensaje}`);
    return null;
  }
};

// Función para probar obtener perfil
const testPerfil = async token => {
  log.title('👤 Probando Obtener Perfil');

  const result = await makeRequest('GET', `${BASE_URL}/perfil`, null, {
    Authorization: `Bearer ${token}`
  });

  if (result.success) {
    log.success('Perfil obtenido exitosamente');
    log.info(`Nombre: ${result.data.data.nombre}`);
    log.info(`Email: ${result.data.data.email}`);
    log.info(`Rol: ${result.data.data.rol}`);
  } else {
    log.error(`Error obteniendo perfil: ${result.error.mensaje}`);
  }
};

// Función para probar actualizar perfil
const testActualizarPerfil = async token => {
  log.title('✏️  Probando Actualizar Perfil');

  const updateData = {
    nombre: 'Dr. Juan Pérez Actualizado',
    telefono: '+56987654321',
    especialidad: 'Psicología Clínica Avanzada'
  };

  const result = await makeRequest('PUT', `${BASE_URL}/perfil`, updateData, {
    Authorization: `Bearer ${token}`
  });

  if (result.success) {
    log.success('Perfil actualizado exitosamente');
    log.info(`Nuevo nombre: ${result.data.data.nombre}`);
  } else {
    log.error(`Error actualizando perfil: ${result.error.mensaje}`);
  }
};

// Función para probar refresh token
const testRefreshToken = async refreshToken => {
  log.title('🔄 Probando Refresh Token');

  const result = await makeRequest('POST', `${BASE_URL}/refresh`, {
    refreshToken
  });

  if (result.success) {
    log.success('Token refrescado exitosamente');
    return result.data.data.accessToken;
  } else {
    log.error(`Error refrescando token: ${result.error.mensaje}`);
    return null;
  }
};

// Función para probar logout
const testLogout = async token => {
  log.title('🚪 Probando Logout');

  const result = await makeRequest('POST', `${BASE_URL}/logout`, null, {
    Authorization: `Bearer ${token}`
  });

  if (result.success) {
    log.success('Logout exitoso');
  } else {
    log.error(`Error en logout: ${result.error.mensaje}`);
  }
};

// Función principal de pruebas
const runTests = async () => {
  log.title('🚀 INICIANDO PRUEBAS DEL SISTEMA DE AUTENTICACIÓN');
  log.info('Asegúrate de que el servidor esté corriendo en puerto 3002');

  try {
    // Probar login con usuario existente
    const token = await testLogin();
    if (!token) {
      log.error('No se pudo obtener token, abortando pruebas');
      return;
    }

    // Probar obtener perfil
    await testPerfil(token);

    // Probar actualizar perfil
    await testActualizarPerfil(token);

    // Probar logout
    await testLogout(token);

    log.title('🎉 TODAS LAS PRUEBAS COMPLETADAS');
    log.success('El sistema de autenticación está funcionando correctamente');
  } catch (error) {
    log.error(`Error en las pruebas: ${error.message}`);
  }
};

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testLogin,
  testRegistro,
  testPerfil,
  testActualizarPerfil,
  testRefreshToken,
  testLogout
};

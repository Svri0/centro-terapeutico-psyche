const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

// Casos de prueba para validaciones de seguridad
const securityTests = [
  {
    name: 'SQL Injection en email',
    data: { email: "admin@admin.com' OR '1'='1", password: 'admin123' },
    expectedStatus: 400
  },
  {
    name: 'SQL Injection en password',
    data: { email: 'admin@admin.com', password: "admin123' OR '1'='1" },
    expectedStatus: 400
  },
  {
    name: 'XSS en email',
    data: { email: '<script>alert("xss")</script>@test.com', password: 'admin123' },
    expectedStatus: 400
  },
  {
    name: 'XSS en password',
    data: { email: 'admin@admin.com', password: '<script>alert("xss")</script>' },
    expectedStatus: 400
  },
  {
    name: 'Email muy largo',
    data: { email: 'a'.repeat(300) + '@test.com', password: 'admin123' },
    expectedStatus: 400
  },
  {
    name: 'Password muy largo',
    data: { email: 'admin@admin.com', password: 'a'.repeat(200) },
    expectedStatus: 400
  },
  {
    name: 'Email con caracteres especiales peligrosos',
    data: { email: 'admin<script>@test.com', password: 'admin123' },
    expectedStatus: 400
  },
  {
    name: 'Password con caracteres especiales peligrosos',
    data: { email: 'admin@admin.com', password: 'admin<script>123' },
    expectedStatus: 400
  },
  {
    name: 'Email vacío',
    data: { email: '', password: 'admin123' },
    expectedStatus: 400
  },
  {
    name: 'Password vacío',
    data: { email: 'admin@admin.com', password: '' },
    expectedStatus: 400
  },
  {
    name: 'Datos válidos (control)',
    data: { email: 'admin@admin.com', password: 'admin123' },
    expectedStatus: 200
  }
];

// Casos de prueba para headers maliciosos
const maliciousHeaderTests = [
  {
    name: 'User-Agent malicioso (sqlmap)',
    headers: { 'User-Agent': 'sqlmap/1.0' },
    expectedStatus: 400
  },
  {
    name: 'User-Agent malicioso (nikto)',
    headers: { 'User-Agent': 'nikto/2.1.6' },
    expectedStatus: 400
  },
  {
    name: 'Header X-Forwarded-For malicioso',
    headers: { 'X-Forwarded-For': '<script>alert("xss")</script>' },
    expectedStatus: 400
  },
  {
    name: 'Content-Type incorrecto',
    headers: { 'Content-Type': 'text/plain' },
    expectedStatus: 400
  }
];

async function testSecurityValidations() {
  console.log('🔒 Iniciando pruebas de seguridad...\n');

  let passedTests = 0;
  let totalTests = securityTests.length + maliciousHeaderTests.length;

  // Probar validaciones de datos
  console.log('📋 Probando validaciones de datos de entrada:');
  for (const test of securityTests) {
    try {
      const response = await axios.post(`${BASE_URL}/autenticacion/login`, test.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASÓ`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - FALLÓ (esperado: ${test.expectedStatus}, recibido: ${response.status})`);
      }
    } catch (error) {
      if (error.response && error.response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASÓ`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - FALLÓ (esperado: ${test.expectedStatus}, recibido: ${error.response?.status || 'error'})`);
      }
    }
  }

  console.log('\n📋 Probando validaciones de headers:');
  for (const test of maliciousHeaderTests) {
    try {
      const response = await axios.post(`${BASE_URL}/autenticacion/login`, 
        { email: 'admin@admin.com', password: 'admin123' },
        {
          headers: {
            'Content-Type': 'application/json',
            ...test.headers
          }
        }
      );

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASÓ`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - FALLÓ (esperado: ${test.expectedStatus}, recibido: ${response.status})`);
      }
    } catch (error) {
      if (error.response && error.response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASÓ`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - FALLÓ (esperado: ${test.expectedStatus}, recibido: ${error.response?.status || 'error'})`);
      }
    }
  }

  console.log('\n📊 Resumen de pruebas de seguridad:');
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas de seguridad pasaron! El sistema está protegido.');
  } else {
    console.log('\n⚠️  Algunas pruebas de seguridad fallaron. Revisar implementación.');
  }
}

// Probar rate limiting básico
async function testRateLimiting() {
  console.log('\n🚦 Probando rate limiting básico...');
  
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(
      axios.post(`${BASE_URL}/autenticacion/login`, 
        { email: 'admin@admin.com', password: 'admin123' },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      ).catch(error => error.response)
    );
  }

  const responses = await Promise.all(requests);
  const successfulRequests = responses.filter(r => r && r.status === 200).length;
  
  console.log(`📊 Requests exitosos: ${successfulRequests}/10`);
  
  if (successfulRequests <= 5) {
    console.log('✅ Rate limiting funcionando correctamente');
  } else {
    console.log('⚠️  Rate limiting puede necesitar ajustes');
  }
}

// Función principal
async function runSecurityTests() {
  try {
    await testSecurityValidations();
    await testRateLimiting();
  } catch (error) {
    console.error('❌ Error ejecutando pruebas de seguridad:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests }; 
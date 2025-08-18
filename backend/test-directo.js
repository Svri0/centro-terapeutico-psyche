const http = require('http');

const data = JSON.stringify({
  fechaInicio: '2025-09-01',
  fechaFin: '2025-09-02',
  horarios: {
    0: { hora_inicio: '00:00', hora_fin: '00:00', activo: false },
    1: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }
  }
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/v1/disponibilidad-mensual/psicologo/559a9710-7a5b-48a5-bd7a-055ec9c114d6/recurrente',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1OWE5NzEwLTdhNWItNDhhNS1iZDdhLTA1NWVjOWMxMTQ2NiIsImVtYWlsIjoibGF1cmEuZmVybmFuZGV6QHBzeWNoZS5jbCIsInJvbF9pZCI6Miwibm9tYnJlcyI6IkxhdXJhIiwiYXBlbGxpZG9zIjoiRmVybsOhbmRleiIsImlhdCI6MTczNDU0NzI1OSwiZXhwIjoxNzM0NjMzODU5fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();

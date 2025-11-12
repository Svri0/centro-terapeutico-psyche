import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const LOGIN_EMAIL = __ENV.LOGIN_EMAIL || 'admin@admin.cl';
const LOGIN_PASSWORD = __ENV.LOGIN_PASSWORD || 'admin123';

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/autenticacion/login`,
    JSON.stringify({
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login responde 200': (r) => r.status === 200,
    'token recibido': (r) => r.json('data.token') !== undefined,
  });

  const token = loginRes.json('data.token');

  if (!token) {
    throw new Error('No se pudo obtener token en setup()');
  }

  return token;
}

export default function (token) {
  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const psicologosRes = http.get(`${BASE_URL}/api/v1/admin/psicologos`, {
    headers: authHeaders,
  });

  check(psicologosRes, {
    'psicologos status 200': (r) => r.status === 200,
  });

  const pacientesRes = http.get(`${BASE_URL}/api/v1/admin/pacientes`, {
    headers: authHeaders,
  });

  check(pacientesRes, {
    'pacientes status 200': (r) => r.status === 200,
  });

  const tareasRes = http.get(`${BASE_URL}/api/v1/tareas?pagina=1`, {
    headers: authHeaders,
  });

  check(tareasRes, {
    'tareas status 200': (r) => r.status === 200,
  });

  sleep(1);
}


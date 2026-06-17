import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 min
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    // El 95% de las peticiones deben completarse en menos de 2000 ms (2 segundos)
    http_req_duration: ['p(95)<2000'],
    // Menos del 1% de errores permitidos
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3001/api/v1';
const TOKEN = 'YOUR_TEST_TOKEN_HERE';

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Simular consulta de dashboard gerencial
  let resDashboard = http.get(`${BASE_URL}/reportes/dashboard`, params);
  check(resDashboard, {
    'Dashboard returns 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Simular consulta de cierres (historico)
  let resCierres = http.get(`${BASE_URL}/cierres-contables`, params);
  check(resCierres, {
    'Cierres returns 200': (r) => r.status === 200,
  });

  sleep(1);
}

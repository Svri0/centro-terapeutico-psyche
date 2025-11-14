// Configuración global para tests
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno de test
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.test') });

// Mock de console.log para evitar ruido en los tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Silenciar logs en tests a menos que se necesiten
  if (process.env.VERBOSE_TESTS !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restaurar console original
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});


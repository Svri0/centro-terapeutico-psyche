import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService, LoginData, RegisterData } from '../../servicios/auth.service';
import api from '../../servicios/api';

// Mock de api
vi.mock('../../servicios/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente y guardar token', async () => {
      const mockResponse = {
        data: {
          data: {
            usuario: {
              id: '123',
              email: 'test@example.com',
              nombres: 'Test',
              apellidos: 'User',
              rol: 'admin',
            },
            token: 'test-token',
          },
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(api.post).toHaveBeenCalledWith('/autenticacion/login', loginData);
      expect(result.data.data.token).toBe('test-token');
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('debe manejar errores de login', async () => {
      (api.post as any).mockRejectedValue(new Error('Credenciales inválidas'));

      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'new-user-id',
          },
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const registerData: RegisterData = {
        nombres: 'Nuevo',
        apellidos: 'Usuario',
        email: 'nuevo@example.com',
        password: 'password123',
        telefono: '123456789',
      };

      const result = await authService.register(registerData);

      expect(api.post).toHaveBeenCalledWith('/autenticacion/registro', registerData);
      expect(result.data.data.id).toBe('new-user-id');
    });
  });

  describe('isAuthenticated', () => {
    it('debe retornar true si hay token en localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('debe retornar false si no hay token', () => {
      localStorage.removeItem('token');
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('debe limpiar token y redirigir a login', () => {
      localStorage.setItem('token', 'test-token');
      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('getUserRole', () => {
    it('debe retornar el rol del usuario desde localStorage', () => {
      localStorage.setItem('userRole', 'admin');
      expect(authService.getUserRole()).toBe('admin');
    });

    it('debe retornar null si no hay rol', () => {
      localStorage.removeItem('userRole');
      expect(authService.getUserRole()).toBeNull();
    });
  });
});


import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/v1';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    usuario: User;
    token: string;
    expira_en: string;
  };
  mensaje: string;
}

class AuthService {
  private token: string | null = localStorage.getItem('token');

  // Configurar axios con interceptor para token
  constructor() {
    axios.defaults.baseURL = API_BASE_URL;
    
    // Interceptor para agregar token a todas las peticiones
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de autenticación
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post('/autenticacion/login', credentials);
      const { token, usuario } = response.data.data;
      
      this.setToken(token);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error en el login');
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.rol === 'administrador';
  }
}

export const authService = new AuthService(); 
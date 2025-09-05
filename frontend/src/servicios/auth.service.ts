import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  rol: string;
  rol_id: number;
}

export interface AuthResponse {
  usuario: User;
  token: string;
  expira_en: string;
  tipo_token: string;
}

class AuthService {
  async login(credentials: LoginData): Promise<{ data: AuthResponse }> {
    try {
      const response = await api.post('/autenticacion/login', credentials);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.mensaje) {
        throw new Error(error.response.data.mensaje);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error en el login');
      }
    }
  }

  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await api.post('/autenticacion/registro', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.mensaje) {
        throw new Error(error.response.data.mensaje);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error en el registro');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/autenticacion/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar todo el localStorage
      localStorage.clear();
      // Redirigir al login
      window.location.href = '/login';
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/autenticacion/perfil');
      return response.data.data.usuario;
    } catch (error: any) {
      throw new Error('Error al obtener perfil');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/autenticacion/perfil', userData);
      return response.data.data.usuario;
    } catch (error: any) {
      throw new Error('Error al actualizar perfil');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/autenticacion/cambiar-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      if (error.response?.data?.mensaje) {
        throw new Error(error.response.data.mensaje);
      } else {
        throw new Error('Error al cambiar contraseña');
      }
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!token && !!user; // Debe tener tanto token como datos del usuario
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.getCurrentUser();
  }

  // Función de debug para ver los datos del usuario
  debugUser(): void {
    const user = this.getCurrentUser();
    console.log('🔍 Debug User Data:', user);
    console.log('🔍 User rol_id:', user?.rol_id);
    console.log('🔍 User rol:', user?.rol);
    console.log('🔍 Is Admin:', this.isAdmin());
    console.log('🔍 Is Psicologo:', this.isPsicologo());
    console.log('🔍 Is Paciente:', this.isPaciente());
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol_id === 1 || user?.rol === 'admin';
  }

  isPsicologo(): boolean {
    const user = this.getCurrentUser();
    return user?.rol_id === 2 || user?.rol === 'psicologo';
  }

  isPaciente(): boolean {
    const user = this.getCurrentUser();
    return user?.rol_id === 3 || user?.rol === 'paciente';
  }
}

export const authService = new AuthService(); 
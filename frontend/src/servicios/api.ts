// Servicio de API para comunicación con el backend

const API_BASE_URL = 'http://localhost:3003/api/v1';

// Función para obtener el token del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para hacer requests autenticados
const authenticatedRequest = async (endpoint: string, options: any = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Funciones de autenticación
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al iniciar sesión');
    }

    return data;
  },

  register: async (userData: {
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    telefono?: string;
    fechaNacimiento?: string;
    genero?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al registrar usuario');
    }

    return data;
  },

  logout: async () => {
    return authenticatedRequest('/auth/logout', {
      method: 'POST'
    });
  },

  getProfile: async () => {
    return authenticatedRequest('/auth/perfil');
  },

  updateProfile: async (profileData: any) => {
    return authenticatedRequest('/auth/perfil', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return authenticatedRequest('/auth/cambiar-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al refrescar token');
    }

    return data;
  }
};

// Funciones para otros endpoints (cuando se implementen)
export const usersAPI = {
  getUsers: async () => {
    return authenticatedRequest('/usuarios');
  },

  getUser: async (id: string) => {
    return authenticatedRequest(`/usuarios/${id}`);
  },

  createUser: async (userData: any) => {
    return authenticatedRequest('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id: string, userData: any) => {
    return authenticatedRequest(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id: string) => {
    return authenticatedRequest(`/usuarios/${id}`, {
      method: 'DELETE'
    });
  }
};

export const patientsAPI = {
  getPatients: async () => {
    return authenticatedRequest('/pacientes');
  },

  getPatient: async (id: string) => {
    return authenticatedRequest(`/pacientes/${id}`);
  },

  createPatient: async (patientData: any) => {
    return authenticatedRequest('/pacientes', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  updatePatient: async (id: string, patientData: any) => {
    return authenticatedRequest(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
  },

  deletePatient: async (id: string) => {
    return authenticatedRequest(`/pacientes/${id}`, {
      method: 'DELETE'
    });
  }
};

export const sessionsAPI = {
  getSessions: async () => {
    return authenticatedRequest('/sesiones');
  },

  getSession: async (id: string) => {
    return authenticatedRequest(`/sesiones/${id}`);
  },

  createSession: async (sessionData: any) => {
    return authenticatedRequest('/sesiones', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  updateSession: async (id: string, sessionData: any) => {
    return authenticatedRequest(`/sesiones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    });
  },

  deleteSession: async (id: string) => {
    return authenticatedRequest(`/sesiones/${id}`, {
      method: 'DELETE'
    });
  }
};

export const tasksAPI = {
  getTasks: async () => {
    return authenticatedRequest('/tareas');
  },

  getTask: async (id: string) => {
    return authenticatedRequest(`/tareas/${id}`);
  },

  createTask: async (taskData: any) => {
    return authenticatedRequest('/tareas', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  updateTask: async (id: string, taskData: any) => {
    return authenticatedRequest(`/tareas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  deleteTask: async (id: string) => {
    return authenticatedRequest(`/tareas/${id}`, {
      method: 'DELETE'
    });
  }
};

export const reportsAPI = {
  getReports: async () => {
    return authenticatedRequest('/reportes');
  },

  generateReport: async (reportData: any) => {
    return authenticatedRequest('/reportes/generar', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  downloadReport: async (id: string) => {
    return authenticatedRequest(`/reportes/${id}/descargar`);
  }
};

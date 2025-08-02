import { api } from './api';

export interface ActualizarPerfilData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad: string;
  descripcion: string;
  avatar_url: string;
}

export const actualizarPerfilPsicologo = async (id: string, data: ActualizarPerfilData) => {
  const response = await api.put(`/usuarios/perfil/${id}`, data);
  return response.data;
};

export const subirImagenReal = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.post('/usuarios/subir-imagen', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 
import api from './api';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data as { token: string; usuario: User };
  },

  register: async (payload: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
    direccion?: string;
  }) => {
    const { data } = await api.post('/auth/register', payload);
    return data as { message: string };
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data as User;
  },

  updateMe: async (payload: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    foto_url?: string | null;
  }) => {
    const { data } = await api.put<{ message: string; usuario: User }>('/auth/me', payload);
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignoramos error de logout en red
    }
  },
};

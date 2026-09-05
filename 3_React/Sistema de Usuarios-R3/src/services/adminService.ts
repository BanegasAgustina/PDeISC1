import api from './api';
import type { AdminAppointment, AdminAppointmentDetail, AdminPet, AdminUser, DashboardStats } from '../types';

export const adminService = {
  getResumen: async () => {
    const { data } = await api.get<DashboardStats>('/admin/resumen');
    return data;
  },

  getUsuarios: async (filters?: { q?: string; rol?: string; estado?: string; mascotas?: string }) => {
    const { data } = await api.get<AdminUser[]>('/admin/usuarios', { params: filters });
    return data;
  },

  getUsuario: async (id: number) => {
    const { data } = await api.get<AdminUser>(`/admin/usuarios/${id}`);
    return data;
  },

  updateUsuario: async (
    id: number,
    payload: Partial<Pick<AdminUser, 'nombre' | 'apellido' | 'email' | 'rolId' | 'fotoUrl'>>
  ) => {
    const { data } = await api.put(`/admin/usuarios/${id}`, {
      nombre: payload.nombre,
      apellido: payload.apellido,
      email: payload.email,
      rol_id: payload.rolId,
      foto_url: payload.fotoUrl,
    });
    return data as { message: string };
  },

  setUsuarioEstado: async (id: number, estado_id: number) => {
    const { data } = await api.patch(`/admin/usuarios/${id}/estado`, { estado_id });
    return data as { message: string };
  },

  deleteUsuario: async (id: number) => {
    const { data } = await api.delete(`/admin/usuarios/${id}`);
    return data as { message: string };
  },

  getMascotas: async (filters?: { q?: string; especie?: string }) => {
    const { data } = await api.get<AdminPet[]>('/admin/mascotas', { params: filters });
    return data;
  },

  getTurnos: async (filters?: { estado?: string; fecha?: string; veterinario?: string }) => {
    const { data } = await api.get<AdminAppointment[]>('/admin/turnos', { params: filters });
    return data;
  },

  getTurnoDetail: async (id: number) => {
    const { data } = await api.get<AdminAppointmentDetail>(`/admin/turnos/${id}`);
    return data;
  },
};

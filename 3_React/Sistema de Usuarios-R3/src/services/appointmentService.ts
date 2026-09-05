import api from './api';
import type { Appointment, Consulta, DashboardStats } from '../types';

export type CreateAppointmentData = {
  mascota_id: string | number;
  veterinario_id: string | number;
  fecha: string;
  hora: string;
  motivo: string;
};

export type VetOption = {
  id: number;
  nombre: string;
  apellido: string;
  matricula?: string;
  especialidad?: string;
};

export const appointmentService = {
  getAppointments: async (fecha?: string) => {
    const { data } = await api.get<Appointment[]>('/turnos', {
      params: fecha ? { fecha } : undefined,
    });
    return data;
  },

  getTodayAppointments: async () => {
    const { data } = await api.get<Appointment[]>('/turnos/hoy');
    return data;
  },

  getVeterinarians: async () => {
    const { data } = await api.get<VetOption[]>('/veterinarios');
    return data;
  },

  getConsultas: async () => {
    const { data } = await api.get<Consulta[]>('/consultas');
    return data;
  },

  getDashboardStats: async () => {
    const { data } = await api.get<DashboardStats>('/dashboard');
    return data;
  },

  createAppointment: async (payload: CreateAppointmentData) => {
    const { data } = await api.post('/turnos', payload);
    return data as { id: number; message: string };
  },

  updateAppointmentState: async (id: number, accion: 'confirmar' | 'completar' | 'cancelar') => {
    const { data } = await api.patch(`/turnos/${id}/estado`, { accion });
    return data as { message: string };
  },

  cancelAppointment: async (id: number) => {
    const { data } = await api.patch(`/turnos/${id}/cancelar`);
    return data as { message: string };
  },
};

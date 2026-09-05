import api from './api';
import type { Pet } from '../types';

export type CreatePetData = {
  nombre: string;
  especie_id: string | number;
  raza_id?: string | number;
  sexo: string;
  peso?: number | string;
  fecha_nacimiento?: string;
  foto_url?: string | null;
};

export type Especie = {
  id: number;
  nombre: string;
};

export const petService = {
  getPets: async () => {
    const { data } = await api.get<Pet[]>('/mascotas');
    return data;
  },

  getSpecies: async () => {
    const { data } = await api.get<Especie[]>('/especies');
    return data;
  },

  getPatients: async () => {
    const { data } = await api.get<Pet[]>('/pacientes');
    return data;
  },

  createPet: async (petData: CreatePetData) => {
    const { data } = await api.post('/mascotas', petData);
    return data as { id: number; message: string };
  },

  deletePet: async (id: number) => {
    await api.delete(`/mascotas/${id}`);
  },
};

export type User = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  rolId: number;
  fotoUrl?: string | null;
  telefono?: string | null;
  estado?: string;
  estadoId?: number;
  fechaCreacion?: string;
};

export type Pet = {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo: string;
  peso?: number;
  foto_url?: string | null;
  fecha_nacimiento?: string;
  propietario?: string;
  estado?: string;
};

export type Appointment = {
  id: number;
  mascota: string;
  veterinario: string;
  cliente?: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
};

export type Consulta = {
  id: number;
  mascota: string;
  veterinario?: string;
  fecha?: string;
  hora?: string;
  fecha_consulta?: string;
  diagnostico?: string;
  tratamiento?: string;
  estado?: string;
};

export type DashboardStats = {
  mascotas?: number;
  turnosPendientes?: number;
  consultas?: number;
  pacientes?: number;
  usuarios?: number;
  veterinarios?: number;
};

export type AdminUser = User & {
  mascotas?: string[];
  totalMascotas?: number;
};

export type AdminPet = Pet & { propietario: string };

export type AdminAppointment = Appointment & { propietario: string };

export type AdminAppointmentDetail = AdminAppointment & {
  especie?: string;
  raza?: string;
  email_propietario?: string;
  telefono_propietario?: string;
  matricula?: string;
  observaciones?: string;
};

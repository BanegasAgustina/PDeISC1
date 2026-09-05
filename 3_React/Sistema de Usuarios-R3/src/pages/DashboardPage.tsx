import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  HeartPulse,
  Stethoscope,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { getErrorMessage } from '../services/api';
import type { Appointment, DashboardStats } from '../types';
import { formatFechaHora, formatHora } from '../utils/fechas';
import PageState from '../components/PageState';
import StatusBadge from '../components/StatusBadge';

type StatCard = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
};

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [turnos, setTurnos] = useState<Appointment[]>([]);
  const [agendaHoy, setAgendaHoy] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const rol = usuario?.rol;

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        if (rol === 'Administrador') return;

        const requests: Promise<unknown>[] = [
          appointmentService.getDashboardStats().then((data) => setStats(data)),
          appointmentService.getAppointments().then((data) => setTurnos(data)),
        ];

        if (rol === 'Veterinario') {
          requests.push(appointmentService.getTodayAppointments().then((data) => setAgendaHoy(data)));
        }

        await Promise.all(requests);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rol]);

  const turnoAction = async (id: number, accion: 'confirmar' | 'completar' | 'cancelar') => {
    try {
      setActionLoading(id);
      setFeedback('');
      const data = await appointmentService.updateAppointmentState(id, accion);
      setFeedback(data.message);
      const [turnosRes, hoyRes, dash] = await Promise.all([
        appointmentService.getAppointments(),
        appointmentService.getTodayAppointments(),
        appointmentService.getDashboardStats(),
      ]);
      setTurnos(turnosRes);
      setAgendaHoy(hoyRes);
      setStats(dash);
    } catch (err) {
      setFeedback(getErrorMessage(err, 'No se pudo actualizar el turno.'));
    } finally {
      setActionLoading(null);
    }
  };

  if (rol === 'Administrador') {
    return <Navigate to="/admin" replace />;
  }

  if (loading) return <PageState type="loading" />;
  if (error) return <PageState type="error" message={error} />;

  const cards: StatCard[] =
    rol === 'Veterinario'
      ? [
          { label: 'Pacientes', value: stats?.pacientes ?? 0, icon: <HeartPulse /> },
          { label: 'Turnos pendientes', value: stats?.turnosPendientes ?? 0, icon: <CalendarDays /> },
          { label: 'Consultas recientes', value: stats?.consultas ?? 0, icon: <Stethoscope /> },
        ]
      : [
          { label: 'Mis mascotas', value: stats?.mascotas ?? 0, icon: <HeartPulse /> },
          { label: 'Próximos turnos', value: stats?.turnosPendientes ?? 0, icon: <CalendarDays /> },
          { label: 'Consultas recientes', value: stats?.consultas ?? 0, icon: <Stethoscope /> },
        ];

  const proximos = turnos
    .filter((t) => !['Cancelado', 'Completado'].includes(t.estado))
    .slice(0, 6);

  const accionesTurno = (t: Appointment) => {
    if (rol !== 'Veterinario') return null;
    return (
      <div className="row-actions">
        {t.estado === 'Pendiente' && (
          <button
            type="button"
            className="ghost sm"
            disabled={actionLoading === t.id}
            onClick={() => turnoAction(t.id, 'confirmar')}
          >
            <Check size={14} /> Confirmar
          </button>
        )}
        {['Pendiente', 'Confirmado'].includes(t.estado) && (
          <>
            <button
              type="button"
              className="ghost sm"
              disabled={actionLoading === t.id}
              onClick={() => turnoAction(t.id, 'completar')}
            >
              Completar
            </button>
            <button
              type="button"
              className="ghost sm danger-text"
              disabled={actionLoading === t.id}
              onClick={() => turnoAction(t.id, 'cancelar')}
            >
              <X size={14} /> Cancelar
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <section className="page">
      <span className="eyebrow">PANEL PRINCIPAL</span>
      <h1>Hola, {usuario?.nombre}</h1>
      <p className="muted">
        {rol === 'Veterinario'
          ? 'Estos son tus pacientes y la agenda del día.'
          : 'Todo lo importante de PetCare, en un solo lugar.'}
      </p>

      <div className="stats">
        {cards.map((card) => (
          <article className="stat" key={card.label}>
            <span>{card.icon}</span>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      {feedback && <div className="success" role="status">{feedback}</div>}

      {rol === 'Veterinario' && (
        <>
          <div className="section-head">
            <h2>Agenda de hoy</h2>
            <p className="muted">Turnos programados para hoy.</p>
          </div>
          {agendaHoy.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Mascota</th>
                    <th>Cliente</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {agendaHoy.map((t) => (
                    <tr key={t.id}>
                      <td>{formatHora(t.hora)}</td>
                      <td>{t.mascota}</td>
                      <td>{t.cliente}</td>
                      <td>{t.motivo}</td>
                      <td><StatusBadge estado={t.estado} /></td>
                      <td>{accionesTurno(t)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <PageState type="empty" message="No hay turnos programados para hoy." />
          )}
        </>
      )}

      <div className="section-head">
        <h2>{rol === 'Veterinario' ? 'Próximos turnos' : 'Próximos turnos'}</h2>
        <p className="muted">Mantenete al día con la atención.</p>
      </div>

      {proximos.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mascota</th>
                <th>{rol === 'Veterinario' ? 'Cliente' : 'Profesional'}</th>
                <th>Fecha</th>
                <th>Estado</th>
                {rol === 'Veterinario' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {proximos.map((t) => (
                <tr key={t.id}>
                  <td>{t.mascota}</td>
                  <td>{rol === 'Veterinario' ? t.cliente : t.veterinario}</td>
                  <td>{formatFechaHora(t.fecha, t.hora)}</td>
                  <td><StatusBadge estado={t.estado} /></td>
                  {rol === 'Veterinario' && <td>{accionesTurno(t)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PageState type="empty" message="No hay turnos pendientes." />
      )}
    </section>
  );
}

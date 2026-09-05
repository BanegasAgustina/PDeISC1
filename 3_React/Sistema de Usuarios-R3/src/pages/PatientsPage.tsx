import { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { petService } from '../services/petService';
import { getErrorMessage } from '../services/api';
import type { Pet } from '../types';
import PageState from '../components/PageState';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    petService
      .getPatients()
      .then((data) => setPatients(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page">
      <span className="eyebrow">PACIENTES</span>
      <h1>Mis pacientes</h1>
      <p className="muted">Mascotas que has atendido o tenés programadas.</p>

      {loading ? (
        <PageState type="loading" />
      ) : error ? (
        <PageState type="error" message={error} />
      ) : patients.length ? (
        <div className="pet-grid">
          {patients.map((p) => (
            <article className="pet-card" key={p.id}>
              <div className="pet-icon"><HeartPulse aria-hidden="true" /></div>
              <div>
                <h2>{p.nombre}</h2>
                <p>{p.especie}{p.raza ? ` · ${p.raza}` : ''}</p>
                <small>{p.sexo} · Propietario: {p.propietario}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <PageState type="empty" message="Todavía no tenés pacientes registrados." />
      )}
    </section>
  );
}

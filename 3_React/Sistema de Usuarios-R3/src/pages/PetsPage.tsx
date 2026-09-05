import { useEffect, useState } from 'react';
import { HeartPulse, Plus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { petService, type Especie, type CreatePetData } from '../services/petService';
import { uploadService } from '../services/uploadService';
import { getErrorMessage } from '../services/api';
import type { Pet } from '../types';
import PageState from '../components/PageState';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageUpload from '../components/ImageUpload';
import { validatePetName } from '../utils/validators';
import { getAssetUrl } from '../utils/assets';

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [species, setSpecies] = useState<Especie[]>([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePetData>({ mode: 'onTouched' });

  const load = async () => {
    try {
      const data = await petService.getPets();
      setPets(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    petService.getSpecies().then(setSpecies).catch(() => {});
  }, []);

  const closeModal = () => {
    setModal(false);
    setImageFile(null);
    reset();
  };

  const add = async (d: CreatePetData) => {
    try {
      setSubmitting(true);
      setMessage('');

      let fotoUrl: string | null = null;
      if (imageFile) {
        fotoUrl = await uploadService.uploadImage(imageFile, 'mascota');
      }

      await petService.createPet({
        ...d,
        nombre: d.nombre.trim(),
        foto_url: fotoUrl,
      });

      closeModal();
      setMessage('Mascota registrada correctamente.');
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err, 'No se pudo registrar la mascota. Intentá nuevamente.'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await petService.deletePet(deleteTarget.id);
      setMessage('Mascota eliminada correctamente.');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err, 'No se pudo eliminar la mascota.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="page">
      <div className="title-row">
        <div>
          <span className="eyebrow">MIS COMPAÑEROS</span>
          <h1>Mascotas</h1>
          <p className="muted">Administrá la información y fotografías de tus mascotas.</p>
        </div>
        <button type="button" className="primary" onClick={() => setModal(true)}>
          <Plus size={18} /> Registrar mascota
        </button>
      </div>

      {message && (
        <div className={message.includes('correctamente') ? 'success' : 'alert'} role="status">
          {message}
        </div>
      )}

      {loading ? (
        <PageState type="loading" message="Cargando mascotas…" />
      ) : error ? (
        <PageState type="error" message={error} />
      ) : pets.length ? (
        <div className="pet-grid">
          {pets.map((p) => (
            <article className="pet-card" key={p.id}>
              {p.foto_url ? (
                <div className="pet-photo-wrap">
                  <img
                    src={getAssetUrl(p.foto_url)}
                    alt={`Foto de ${p.nombre}`}
                    className="pet-card-photo"
                  />
                </div>
              ) : (
                <div className="pet-icon" aria-hidden="true">
                  <HeartPulse />
                </div>
              )}
              <div className="pet-details">
                <h2>{p.nombre}</h2>
                <p>{p.especie}{p.raza ? ` · ${p.raza}` : ''}</p>
                <small>{p.sexo}{p.peso ? ` · ${p.peso} kg` : ''}</small>
              </div>
              <button
                type="button"
                className="icon-danger"
                onClick={() => setDeleteTarget(p)}
                aria-label={`Eliminar a ${p.nombre}`}
                title={`Eliminar a ${p.nombre}`}
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <PageState type="empty" message="Todavía no tenés mascotas registradas.">
          <button type="button" className="primary" onClick={() => setModal(true)}>
            Registrar mascota
          </button>
        </PageState>
      )}

      {modal && (
        <div className="modal-bg" role="dialog" aria-modal="true" aria-labelledby="modal-pet-title">
          <form className="modal" onSubmit={handleSubmit(add)}>
            <button type="button" className="close" onClick={closeModal} aria-label="Cerrar modal">
              <X />
            </button>
            <h2 id="modal-pet-title">Registrar mascota</h2>

            <ImageUpload
              label="Foto de la mascota"
              onFileSelect={(f) => setImageFile(f)}
              helperText="Formatos: JPG, PNG o WEBP (máx. 5 MB)"
            />

            <label htmlFor="pet-nombre">
              Nombre de la mascota
              <input
                id="pet-nombre"
                placeholder="Ej: Milo"
                {...register('nombre', {
                  validate: (v) => validatePetName(v) || true,
                })}
                aria-invalid={!!errors.nombre}
              />
              {errors.nombre && <small className="field-error">{errors.nombre.message}</small>}
            </label>

            <label htmlFor="pet-especie">
              Especie
              <select
                id="pet-especie"
                {...register('especie_id', { required: 'Seleccioná una especie' })}
                aria-invalid={!!errors.especie_id}
              >
                <option value="">Seleccionar especie</option>
                {species.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              {errors.especie_id && (
                <small className="field-error">{errors.especie_id.message}</small>
              )}
            </label>

            <label htmlFor="pet-sexo">
              Sexo
              <select
                id="pet-sexo"
                {...register('sexo', { required: 'Seleccioná el sexo' })}
                aria-invalid={!!errors.sexo}
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
              {errors.sexo && <small className="field-error">{errors.sexo.message}</small>}
            </label>

            <label htmlFor="pet-peso">
              Peso (kg) <span className="optional">(opcional)</span>
              <input
                id="pet-peso"
                type="number"
                step="0.1"
                min="0.1"
                max="300"
                placeholder="Ej: 12.5"
                {...register('peso')}
              />
            </label>

            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Guardando mascota…' : 'Guardar mascota'}
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar mascota"
        message={`¿Confirmás que querés eliminar a ${deleteTarget?.nombre}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar mascota"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

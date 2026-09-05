import { useState } from 'react';
import { Mail, Shield, Calendar, Activity, Phone, Camera, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { uploadService } from '../services/uploadService';
import { getErrorMessage } from '../services/api';
import { formatFecha } from '../utils/fechas';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ImageUpload from '../components/ImageUpload';

export default function ProfilePage() {
  const { usuario, setUsuario } = useAuth();
  const [modalFoto, setModalFoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savingFoto, setSavingFoto] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'alert'; msg: string } | null>(null);

  if (!usuario) return null;

  const handleSaveFoto = async () => {
    try {
      setSavingFoto(true);
      setFeedback(null);

      let newFotoUrl: string | null = null;
      if (selectedFile) {
        newFotoUrl = await uploadService.uploadImage(selectedFile, 'usuario');
      }

      const res = await authService.updateMe({
        foto_url: newFotoUrl,
      });

      setUsuario(res.usuario);
      setFeedback({ type: 'success', msg: 'Foto de perfil actualizada correctamente.' });
      setModalFoto(false);
    } catch (err) {
      setFeedback({
        type: 'alert',
        msg: getErrorMessage(err, 'No se pudo actualizar la foto de perfil.'),
      });
    } finally {
      setSavingFoto(false);
    }
  };

  const handleRemoveFoto = async () => {
    try {
      setSavingFoto(true);
      setFeedback(null);

      const res = await authService.updateMe({
        foto_url: null,
      });

      setUsuario(res.usuario);
      setFeedback({ type: 'success', msg: 'Foto de perfil eliminada correctamente.' });
      setModalFoto(false);
    } catch (err) {
      setFeedback({
        type: 'alert',
        msg: getErrorMessage(err, 'No se pudo eliminar la foto de perfil.'),
      });
    } finally {
      setSavingFoto(false);
    }
  };

  return (
    <section className="page profile-page">
      <span className="eyebrow">MI CUENTA</span>
      <h1>Perfil de usuario</h1>
      <p className="muted">Información personal y detalles de tu cuenta.</p>

      {feedback && (
        <div className={feedback.type === 'success' ? 'success' : 'alert'} role="status">
          {feedback.msg}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <Avatar
              src={usuario.fotoUrl}
              name={`${usuario.nombre} ${usuario.apellido}`}
              size={84}
              className="profile-avatar-large"
            />
            <button
              type="button"
              className="avatar-change-btn"
              onClick={() => setModalFoto(true)}
              title="Cambiar foto de perfil"
              aria-label="Cambiar foto de perfil"
            >
              <Camera size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="profile-title">
            <h2>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <div className="profile-badges">
              <span className="badge badge-confirmed">{usuario.rol}</span>
              <StatusBadge estado={usuario.estado || 'Activo'} />
            </div>
            <div className="profile-actions-row">
              <button
                type="button"
                className="ghost sm"
                onClick={() => setModalFoto(true)}
                aria-label="Administrar foto de perfil"
              >
                <Camera size={14} aria-hidden="true" /> Cambiar foto
              </button>
            </div>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-item">
            <div className="profile-item-icon" aria-hidden="true">
              <Mail size={18} />
            </div>
            <div>
              <small className="muted">Correo electrónico</small>
              <p>
                <strong>{usuario.email}</strong>
              </p>
            </div>
          </div>

          <div className="profile-item">
            <div className="profile-item-icon" aria-hidden="true">
              <Shield size={18} />
            </div>
            <div>
              <small className="muted">Rol en el sistema</small>
              <p>
                <strong>{usuario.rol}</strong>
              </p>
            </div>
          </div>

          <div className="profile-item">
            <div className="profile-item-icon" aria-hidden="true">
              <Activity size={18} />
            </div>
            <div>
              <small className="muted">Estado de la cuenta</small>
              <p>
                <strong>{usuario.estado || 'Activo'}</strong>
              </p>
            </div>
          </div>

          {usuario.telefono && (
            <div className="profile-item">
              <div className="profile-item-icon" aria-hidden="true">
                <Phone size={18} />
              </div>
              <div>
                <small className="muted">Teléfono de contacto</small>
                <p>
                  <strong>{usuario.telefono}</strong>
                </p>
              </div>
            </div>
          )}

          {usuario.fechaCreacion && (
            <div className="profile-item">
              <div className="profile-item-icon" aria-hidden="true">
                <Calendar size={18} />
              </div>
              <div>
                <small className="muted">Miembro desde</small>
                <p>
                  <strong>{formatFecha(usuario.fechaCreacion)}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL GESTIONAR FOTO DE PERFIL */}
      {modalFoto && (
        <div
          className="modal-bg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-foto-title"
        >
          <div className="modal">
            <button
              type="button"
              className="close"
              onClick={() => setModalFoto(false)}
              aria-label="Cerrar modal"
            >
              <X />
            </button>
            <h2 id="modal-foto-title">Foto de perfil</h2>
            <p className="muted" style={{ margin: 0 }}>
              Podés subir una foto de perfil en formato JPG, PNG o WEBP. Si no tenés foto, el sistema mostrará tus iniciales automáticamente.
            </p>

            <ImageUpload
              label="Seleccionar imagen de perfil"
              initialUrl={usuario.fotoUrl}
              onFileSelect={(file) => setSelectedFile(file)}
              helperText="Formatos: JPG, PNG o WEBP (máx. 5 MB)"
            />

            <div className="confirm-actions">
              {usuario.fotoUrl && (
                <button
                  type="button"
                  className="ghost danger-text"
                  onClick={handleRemoveFoto}
                  disabled={savingFoto}
                  aria-label="Eliminar foto de perfil actual"
                >
                  Eliminar foto actual
                </button>
              )}
              <button
                type="button"
                className="ghost"
                onClick={() => setModalFoto(false)}
                disabled={savingFoto}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleSaveFoto}
                disabled={savingFoto || !selectedFile}
              >
                {savingFoto ? 'Guardando…' : 'Guardar foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { AlertTriangle, X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Diálogo de confirmación dentro de la interfaz (reemplaza confirm()).
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="modal-bg" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal confirm-modal">
        <div className="confirm-icon" aria-hidden="true">
          <AlertTriangle />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'danger-btn' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
        <button type="button" className="close" onClick={onCancel} aria-label="Cerrar">
          <X />
        </button>
      </div>
    </div>
  );
}

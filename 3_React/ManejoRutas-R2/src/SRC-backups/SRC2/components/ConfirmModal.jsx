import { AlertTriangle, X } from 'lucide-react'

// Modal reutilizable para confirmaciones: reemplaza los alerts/confirm nativos del navegador.
export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
  // No renderiza nada hasta que una acción solicite confirmación.
  if (!open) return null

  return <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
    {/* Detiene el clic interno para que solo el fondo cierre el modal. */}
    <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" type="button" onClick={onCancel} aria-label="Cerrar confirmación"><X size={18}/></button>
      <span className="modal-icon"><AlertTriangle size={20}/></span>
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="modal-actions"><button className="button button-ghost" type="button" onClick={onCancel}>Cancelar</button><button className="button button-danger" type="button" onClick={onConfirm}>{confirmLabel}</button></div>
    </section>
  </div>
}

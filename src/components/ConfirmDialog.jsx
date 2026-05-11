import AlertMessage from './AlertMessage';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', onConfirm, onCancel, isLoading = false }) {
  return (
    <div className="modal-backdrop">
      <div className="confirm-dialog card animate-fade-in">
        <AlertMessage type="warning" title={title}>
          {message}
        </AlertMessage>
        <div className="confirm-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Traitement...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

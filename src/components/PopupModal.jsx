import './PopupModal.css'

export default function PopupModal({ isOpen, title, message, onConfirm, onCancel, type = 'alert' }) {
  if (!isOpen) return null

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <div className="popup-actions">
          {type === 'confirm' ? (
            <>
              <button className="btn btn-secondary" onClick={onCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button className="btn btn-primary" onClick={onConfirm} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <i className="fas fa-check"></i> Confirmar
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onConfirm} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <i className="fas fa-check"></i> OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

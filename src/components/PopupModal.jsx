import './PopupModal.css'

export default function PopupModal({ isOpen, title, message, onConfirm, onCancel, type = 'alert' }) {
  if (!isOpen) return null

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <div className="popup-actions">
          {type === 'confirm' && (
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button className="btn btn-primary" onClick={onConfirm}>
            OK!
          </button>
        </div>
      </div>
    </div>
  )
}

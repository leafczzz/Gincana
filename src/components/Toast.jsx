export default function Toast({ message, type }) {
  const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle')
  
  return (
    <div className={`toast toast-${type}`}>
      <i className={`fas ${icon}`}></i>
      <span>{message}</span>
    </div>
  )
}
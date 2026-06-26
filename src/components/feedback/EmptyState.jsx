import './feedback.css';

export function EmptyState({ icon, message, sub, actions, className = '', ...rest }) {
  return (
    <div className={['ds-empty', className].filter(Boolean).join(' ')} {...rest}>
      {icon && (
        <div className="ds-empty__icon">
          {typeof icon === 'string' ? <i className={`fa-solid fa-${icon}`} /> : icon}
        </div>
      )}
      {message && <p className="ds-empty__msg">{message}</p>}
      {sub && <p className="ds-empty__sub">{sub}</p>}
      {actions && <div className="ds-empty__actions">{actions}</div>}
    </div>
  );
}

import './layout.css';

export function Card({ title, headerRight, footer, bodyClassName = '', noBody = false, className = '', children, ...rest }) {
  return (
    <div className={['ds-card', className].filter(Boolean).join(' ')} {...rest}>
      {(title || headerRight) && (
        <div className="ds-card__header">
          <div className="ds-card__header-row">
            {typeof title === 'string' ? <h4 className="ds-card__title">{title}</h4> : title}
            {headerRight && <div className="ds-card__header-actions">{headerRight}</div>}
          </div>
        </div>
      )}
      {noBody ? children : <div className={['ds-card__body', bodyClassName].filter(Boolean).join(' ')}>{children}</div>}
      {footer && <div className="ds-card__footer">{footer}</div>}
    </div>
  );
}

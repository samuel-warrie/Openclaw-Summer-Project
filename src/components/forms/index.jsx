import './forms.css';

export function Checkbox({ label, type = 'checkbox', checked, defaultChecked, onChange, disabled = false, name, value, className = '', ...rest }) {
  const isRadio = type === 'radio';
  const cls = ['ds-check', isRadio ? 'ds-check--radio' : '', disabled ? 'ds-check--disabled' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input type={type} checked={checked} defaultChecked={defaultChecked} onChange={onChange} disabled={disabled} name={name} value={value} {...rest} />
      <span className="ds-check__box">
        {isRadio ? <span className="ds-check__dot" /> : (
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M1.5 6.5L4.5 9.5L10.5 2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label != null && <span className="ds-check__label">{label}</span>}
    </label>
  );
}

export function Input({ label, icon, help, error = false, rounded = false, id, className = '', ...rest }) {
  const fid = id;
  return (
    <div className={['ds-field', error ? 'ds-field--error' : '', className].filter(Boolean).join(' ')}>
      {label && <label className="ds-field__label" htmlFor={fid}>{label}</label>}
      <div className="ds-input-wrap">
        {icon && <span className="ds-input-wrap__icon">{icon}</span>}
        <input id={fid} className={['ds-input', icon ? 'ds-input--has-icon' : '', rounded ? 'ds-input--rounded' : ''].filter(Boolean).join(' ')} {...rest} />
      </div>
      {help && <div className="ds-field__help">{help}</div>}
    </div>
  );
}

export function Select({ options = [], value, defaultValue, onChange, variant = 'default', className = '', ...rest }) {
  const wrapCls = ['ds-select-wrap', variant === 'filter' ? 'ds-select--filter' : '', className].filter(Boolean).join(' ');
  return (
    <span className={wrapCls}>
      <select className="ds-select" value={value} defaultValue={defaultValue} onChange={onChange} {...rest}>
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </span>
  );
}

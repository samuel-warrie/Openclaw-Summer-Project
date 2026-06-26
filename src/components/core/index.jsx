import './ds.css';

const PALETTE = ['#0f6cbf','#6b3fa0','#138a72','#d6107a','#1f6fd0','#d98b1e','#2a3f6b','#ca3120'];
function hueFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export function Avatar({ name = '', src, size = 'md', className = '', ...rest }) {
  const cls = ['ds-avatar', `ds-avatar--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} style={!src ? { background: hueFor(name) } : undefined} title={name || undefined} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}

export function Badge({ variant = 'secondary', pill = false, count = false, className = '', children, ...rest }) {
  const cls = ['ds-badge', `ds-badge--${variant}`, pill ? 'ds-badge--pill' : '', count ? 'ds-badge--count' : '', className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{children}</span>;
}

export function Button({ variant = 'primary', size = 'md', block = false, href, type = 'button', className = '', children, ...rest }) {
  const cls = ['ds-btn', `ds-btn--${variant}`, size === 'sm' ? 'ds-btn--sm' : size === 'lg' ? 'ds-btn--lg' : '', block ? 'ds-btn--block' : '', className].filter(Boolean).join(' ');
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button type={type} className={cls} {...rest}>{children}</button>;
}

export function ProgressBar({ value = 0, label, showValue = true, variant = 'primary', size = 'md', className = '', ...rest }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const cls = ['ds-progress', variant === 'success' || pct >= 100 ? 'ds-progress--success' : '', size === 'lg' ? 'ds-progress--lg' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {(label || showValue) && (
        <div className="ds-progress__meta">
          {label && <span className="ds-progress__label">{label}</span>}
          {showValue && <span className="ds-progress__value">{pct}%</span>}
        </div>
      )}
      <div className="ds-progress__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="ds-progress__bar" style={{ width: pct + '%' }} />
      </div>
    </div>
  );
}

export function Switch({ checked, defaultChecked, onChange, label, disabled = false, className = '', ...rest }) {
  const cls = ['ds-switch', disabled ? 'ds-switch--disabled' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input type="checkbox" checked={checked} defaultChecked={defaultChecked} onChange={onChange} disabled={disabled} {...rest} />
      <span className="ds-switch__track"><span className="ds-switch__thumb" /></span>
      {label != null && <span className="ds-switch__label">{label}</span>}
    </label>
  );
}

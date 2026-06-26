import './navbar.css';
import { Avatar } from '../core/index.jsx';
import { Switch } from '../core/index.jsx';

function Wordmark() {
  return (
    <svg width="104" height="26" viewBox="0 0 118 30" aria-label="moodle" role="img">
      <text x="0" y="23" fontFamily="-apple-system,'Segoe UI',Roboto,Arial,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5" fill="#f98012">moodle</text>
      <g transform="translate(20.5,3.2)" fill="#f98012">
        <path d="M0 3.2 L6 0 L12 3.2 L6 6.4 Z" />
        <rect x="5.4" y="5.2" width="1.2" height="3.4" rx="0.6" />
        <circle cx="6" cy="9" r="1.1" />
      </g>
    </svg>
  );
}

export function Navbar({ links = [], user = { name: '' }, messageCount = 0, notificationCount = 0, editMode = false, onToggleEditMode, onSearch, logo, className = '', ...rest }) {
  return (
    <nav className={['ds-nav', className].filter(Boolean).join(' ')} {...rest}>
      <a className="ds-nav__brand" href="#">{logo || <Wordmark />}</a>
      <div className="ds-nav__links">
        {links.map(l => (
          <a key={l.label} href={l.href || '#'} className={['ds-nav__link', l.active ? 'ds-nav__link--active' : ''].filter(Boolean).join(' ')}>
            {l.label}
          </a>
        ))}
      </div>
      <div className="ds-nav__spacer" />
      <div className="ds-nav__actions">
        <button className="ds-nav__icon" aria-label="Search" onClick={onSearch}>
          <i className="fa-solid fa-magnifying-glass" />
        </button>
        <a className="ds-nav__icon" href="#" aria-label="Notifications">
          <i className="fa-regular fa-bell" />
          {notificationCount > 0 && <span className="ds-nav__count">{notificationCount}</span>}
        </a>
        <a className="ds-nav__icon" href="#" aria-label="Messages">
          <i className="fa-regular fa-comment" />
          {messageCount > 0 && <span className="ds-nav__count">{messageCount}</span>}
        </a>
        <button className="ds-nav__user" aria-label="User menu">
          <Avatar name={user.name} src={user.avatar} size="sm" />
          <span className="ds-nav__caret" />
        </button>
      </div>
      <label className="ds-nav__editmode">
        Edit mode
        <Switch checked={editMode} onChange={onToggleEditMode} />
      </label>
    </nav>
  );
}

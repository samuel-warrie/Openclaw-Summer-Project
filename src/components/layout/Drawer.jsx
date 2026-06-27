import './drawer.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'fa-gauge' },
  { key: 'courses',   label: 'My courses', icon: 'fa-graduation-cap' },
  { key: 'calendar',  label: 'Calendar',   icon: 'fa-calendar-days' },
  { key: 'messages',  label: 'Messages',   icon: 'fa-comment-dots' },
  { key: 'profile',   label: 'Profile',    icon: 'fa-user' },
];

export function Drawer({ open, screen, go, onLogout }) {
  const isCoursesActive = (key) => key === 'courses' && ['courses', 'course', 'browse'].includes(screen);

  const secondaryLinks = [
    { label: 'Site home',     icon: 'fa-house',      key: 'dashboard' },
    { label: 'Private files', icon: 'fa-folder',     key: 'files' },
    { label: 'Grades',        icon: 'fa-table-list', key: 'grades' },
  ];

  return (
    <aside className={`drawer ${open ? 'drawer--open' : ''}`}>
      <nav className="drawer__nav">
        {NAV_ITEMS.map((d) => {
          const active = screen === d.key || isCoursesActive(d.key);
          return (
            <button key={d.key} onClick={() => go(d.key)} className={`drawer__item ${active ? 'drawer__item--active' : ''}`}>
              <i className={`fa-solid ${d.icon}`} style={{ width: 18, textAlign: 'center' }} />
              {d.label}
            </button>
          );
        })}

        <div className="drawer__divider" />

        {secondaryLinks.map((l) => (
          <button key={l.key} onClick={() => go(l.key)} className={`drawer__item ${screen === l.key ? 'drawer__item--active' : ''}`}>
            <i className={`fa-solid ${l.icon}`} style={{ width: 18, textAlign: 'center', color: screen === l.key ? undefined : 'var(--gray-500)' }} />
            {l.label}
          </button>
        ))}

        <div className="drawer__divider" />

        <button onClick={onLogout} className="drawer__item drawer__item--danger">
          <i className="fa-solid fa-right-from-bracket" style={{ width: 18, textAlign: 'center' }} />
          Log out
        </button>
      </nav>
    </aside>
  );
}

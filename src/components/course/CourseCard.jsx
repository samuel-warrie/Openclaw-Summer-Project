import './course.css';
import { ProgressBar } from '../core/index.jsx';

const HUES = {
  blue: 'var(--course-blue)', navy: 'var(--course-navy)', cyan: 'var(--course-cyan)',
  tan: 'var(--course-tan)', magenta: 'var(--course-magenta)', purple: 'var(--course-purple)',
  teal: 'var(--course-teal)', amber: 'var(--course-amber)',
};

export function CourseCard({ code, name, color = 'blue', image, progress, href, layout = 'card', className = '', ...rest }) {
  const Tag = href ? 'a' : 'div';
  const bg = HUES[color] || color;
  const cls = ['ds-course', layout === 'row' ? 'ds-course--row' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} href={href} {...rest}>
      <div className="ds-course__media" style={image ? { backgroundImage: `url(${image})` } : { background: bg }}>
        {!image && <span className="ds-course__pattern" />}
      </div>
      <div className="ds-course__body">
        {code && <div className="ds-course__code">{code}</div>}
        <div className="ds-course__name">{name}</div>
        {typeof progress === 'number' && (
          <div className="ds-course__progress">
            <MiniProgress value={progress} />
          </div>
        )}
      </div>
    </Tag>
  );
}

function MiniProgress({ value }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
        <span>Progress</span>
        <span style={{ fontWeight: 700, color: 'var(--text-body)' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: '50rem', background: 'var(--gray-200)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: pct >= 100 ? 'var(--success)' : 'var(--brand-primary)' }} />
      </div>
    </div>
  );
}

import { Card } from '../components/layout/Card.jsx';
import { Button, Badge } from '../components/core/index.jsx';
import { Select } from '../components/forms/index.jsx';

export function CalendarScreen({ courses, calendarByDay }) {
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = []; for (let d = 1; d <= 30; d++) days.push(d);
  const colorVar = (c) => (['danger', 'warning', 'success', 'info'].includes(c) ? `var(--${c})` : `var(--course-${c})`);

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Calendar</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Select variant="filter" options={['All courses', ...(courses || []).map(c => c.code)]} />
          <Button variant="secondary"><i className="fa-solid fa-plus" /> New event</Button>
        </div>
      </div>

      <Card noBody>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <Button variant="outline" size="sm">&#9664; May</Button>
          <strong style={{ fontSize: 18 }}>June 2026</strong>
          <Button variant="outline" size="sm">July &#9654;</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {dow.map((d) => (
            <div key={d} style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--gray-200)' }}>{d}</div>
          ))}
          {days.map((d) => {
            const ev = calendarByDay?.[String(d)] || [];
            const today = d === 21;
            return (
              <div key={d} style={{ minHeight: 116, padding: 8, borderBottom: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)', background: today ? 'var(--brand-primary-soft)' : '#fff' }}>
                <div style={{ textAlign: 'right', marginBottom: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 13, fontWeight: 600, background: today ? 'var(--brand-primary)' : 'transparent', color: today ? '#fff' : 'var(--text-body)' }}>{d}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {ev.map((e, i) => (
                    <a key={i} href="#" title={e.course} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '3px 6px', borderRadius: 3, background: 'var(--gray-100)', color: 'var(--text-body)', borderLeft: `3px solid ${colorVar(e.color)}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.title}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ marginTop: 18, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger)' }} />Exams</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--course-magenta)' }} />Assignments</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--course-navy)' }} />Course events</span>
      </div>
    </div>
  );
}

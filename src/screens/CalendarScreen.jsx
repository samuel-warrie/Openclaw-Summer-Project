import { useState } from 'react';
import { Card } from '../components/layout/Card.jsx';
import { Button } from '../components/core/index.jsx';
import { Select } from '../components/forms/index.jsx';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Returns 0=Mon … 6=Sun for the first day of the month
function firstDayOffset(year, month) {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun
  return (jsDay + 6) % 7;
}

function colorVar(c) {
  return ['danger','warning','success','info'].includes(c)
    ? `var(--${c})`
    : `var(--course-${c})`;
}

export function CalendarScreen({ courses, calendarByDay }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const totalDays = daysInMonth(year, month);
  const offset = firstDayOffset(year, month);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayDate = today.getDate();

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
          <Button variant="outline" size="sm" onClick={prevMonth}>
            &#9664; {MONTH_NAMES[(month + 11) % 12]}
          </Button>
          <strong style={{ fontSize: 18 }}>{MONTH_NAMES[month]} {year}</strong>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            {MONTH_NAMES[(month + 1) % 12]} &#9654;
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {DOW.map((d) => (
            <div key={d} style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--gray-200)' }}>{d}</div>
          ))}

          {Array.from({ length: offset }).map((_, i) => (
            <div key={`blank-${i}`} style={{ minHeight: 96, borderBottom: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)', background: 'var(--gray-100)' }} />
          ))}

          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
            const ev = calendarByDay?.[String(d)] || [];
            const isToday = isCurrentMonth && d === todayDate;
            return (
              <div key={d} style={{ minHeight: 96, padding: 8, borderBottom: '1px solid var(--gray-200)', borderRight: '1px solid var(--gray-200)', background: isToday ? 'var(--brand-primary-soft)' : '#fff' }}>
                <div style={{ textAlign: 'right', marginBottom: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 13, fontWeight: 600, background: isToday ? 'var(--brand-primary)' : 'transparent', color: isToday ? '#fff' : 'var(--text-body)' }}>{d}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {ev.map((e, i) => (
                    <a key={i} href="#" onClick={(ev) => ev.preventDefault()} title={e.course}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '2px 5px', borderRadius: 3, background: 'var(--gray-100)', color: 'var(--text-body)', borderLeft: `3px solid ${colorVar(e.color)}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none' }}>
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

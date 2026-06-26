import { useState, useRef } from 'react';
import { Card } from '../components/layout/Card.jsx';
import { EmptyState } from '../components/feedback/EmptyState.jsx';
import { CourseCard } from '../components/course/CourseCard.jsx';
import { Select } from '../components/forms/index.jsx';
import { Input } from '../components/forms/index.jsx';
import { Button } from '../components/core/index.jsx';
import { Badge } from '../components/core/index.jsx';

function TimelineCard({ assignments }) {
  const [filter, setFilter] = useState('Next 7 days');
  const items = filter === 'Overdue' ? [] : assignments;

  return (
    <Card title="Timeline" headerRight={
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Select variant="filter" options={['Overdue', 'Next 7 days', 'Next 30 days', 'All']} value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Select variant="filter" options={['Sort by dates', 'Sort by courses']} defaultValue="Sort by dates" />
      </div>
    }>
      <div style={{ marginBottom: 14 }}>
        <Input icon={<i className="fa-solid fa-magnifying-glass" />} placeholder="Search by activity type or name" rounded />
      </div>
      {items.length === 0 ? (
        <EmptyState icon="list-check" message="No activities require action" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 4px', borderTop: i ? '1px solid var(--gray-200)' : '0' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: `var(--course-${it.color})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <i className={`fa-solid ${it.type === 'quiz' ? 'fa-circle-question' : 'fa-file-arrow-up'}`} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{it.due} &middot; {it.courseName}</div>
                <div style={{ fontWeight: 500 }}><a href="#">{it.title}</a></div>
              </div>
              {it.status === 'due' && <Badge variant="soft-danger">Due</Badge>}
              <Button variant="outline" size="sm">Add submission</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RecentCourses({ courses, onOpen }) {
  const scroller = useRef(null);
  const scrollBy = (dx) => scroller.current?.scrollBy({ left: dx, behavior: 'smooth' });
  return (
    <Card title="Recently accessed courses" headerRight={
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="ds-btn ds-btn--outline ds-btn--sm" onClick={() => scrollBy(-260)} aria-label="Previous"><i className="fa-solid fa-chevron-left" /></button>
        <button className="ds-btn ds-btn--outline ds-btn--sm" onClick={() => scrollBy(260)} aria-label="Next"><i className="fa-solid fa-chevron-right" /></button>
      </div>
    }>
      <div ref={scroller} style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '190px', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
        {courses.map((c) => (
          <CourseCard key={c.code} code={c.code} name={c.short_name} color={c.color} href="#"
            onClick={(e) => { e.preventDefault(); onOpen?.(c); }} />
        ))}
      </div>
    </Card>
  );
}

function MiniCalendar({ calendarByDay, onOpen }) {
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = [];
  for (let d = 1; d <= 30; d++) days.push(d);
  return (
    <Card title="Calendar" headerRight={<Button variant="secondary" size="sm">New event</Button>}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <a href="#" style={{ fontSize: 13 }}>&#9664; May</a>
        <strong style={{ fontSize: 15 }}>June 2026</strong>
        <a href="#" style={{ fontSize: 13 }}>July &#9654;</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, background: 'var(--gray-200)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {dow.map((d) => (
          <div key={d} style={{ background: 'var(--gray-100)', padding: '6px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{d}</div>
        ))}
        {days.map((d) => {
          const ev = calendarByDay[String(d)];
          const today = d === 21;
          return (
            <div key={d} onClick={() => onOpen?.()} style={{ background: '#fff', minHeight: 56, padding: '4px 5px', cursor: 'pointer', fontSize: 12 }}>
              <div style={{ color: today ? '#fff' : 'var(--text-body)', fontWeight: 600, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: today ? 'var(--brand-primary)' : 'transparent' }}>{d}</div>
              {ev?.map((e, i) => (
                <div key={i} style={{ marginTop: 3, fontSize: 11, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: `var(--course-${e.color}, var(--${e.color}))`, flex: 'none' }} />{e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function DashboardScreen({ user, courses, assignments, calendarByDay, onOpenCourse, onOpenCalendar }) {
  return (
    <div style={{ maxWidth: 830, margin: '0 auto', padding: '28px 20px 60px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ margin: '0 0 2px' }}>Dashboard</h1>
        <h2 style={{ margin: 0 }}>Hi, {user.firstName}! <span style={{ fontWeight: 400 }}>&#128075;</span></h2>
      </div>
      <TimelineCard assignments={assignments} />
      <RecentCourses courses={courses} onOpen={onOpenCourse} />
      <MiniCalendar calendarByDay={calendarByDay} onOpen={onOpenCalendar} />
    </div>
  );
}

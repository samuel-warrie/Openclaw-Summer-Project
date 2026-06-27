import { useState } from 'react';
import { Card } from '../components/layout/Card.jsx';
import { CourseCard } from '../components/course/CourseCard.jsx';
import { Button, Badge, ProgressBar } from '../components/core/index.jsx';
import { Select, Checkbox } from '../components/forms/index.jsx';
import { supabase } from '../lib/supabaseClient.js';

export function MyCoursesScreen({ courses, onOpenCourse, onBrowse }) {
  const [view, setView] = useState('card');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Sort by course name');

  const filtered = courses.filter(c => {
    if (filter === 'All') return true;
    const p = c.progress ?? 0;
    if (filter === 'In progress') return p > 0 && p < 100;
    if (filter === 'Future') return p === 0;
    if (filter === 'Past') return p >= 100;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Sort by course name') return (a.name || '').localeCompare(b.name || '');
    if (sort === 'Sort by last accessed') return (b.last_accessed || '').localeCompare(a.last_accessed || '');
    return 0;
  });

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>My courses</h1>
        <Button variant="primary" onClick={onBrowse}><i className="fa-solid fa-plus" /> Enrol in a course</Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <Select variant="filter" options={['All', 'In progress', 'Future', 'Past']} value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Select variant="filter" options={['Sort by course name', 'Sort by last accessed']} value={sort} onChange={(e) => setSort(e.target.value)} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', border: '1px solid var(--border-color-strong)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <button className="ds-btn ds-btn--sm" onClick={() => setView('card')} style={{ borderRadius: 0, background: view === 'card' ? 'var(--brand-primary)' : '#fff', color: view === 'card' ? '#fff' : 'var(--gray-700)' }}><i className="fa-solid fa-table-cells-large" /></button>
          <button className="ds-btn ds-btn--sm" onClick={() => setView('list')} style={{ borderRadius: 0, background: view === 'list' ? 'var(--brand-primary)' : '#fff', color: view === 'list' ? '#fff' : 'var(--gray-700)' }}><i className="fa-solid fa-list" /></button>
        </div>
      </div>
      {view === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
          {sorted.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No courses match the selected filter.</p>
          ) : sorted.map((c) => (
            <CourseCard key={c.id} code={c.code} name={c.short_name} color={c.color} progress={c.progress} href="#"
              onClick={(e) => { e.preventDefault(); onOpenCourse(c); }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No courses match the selected filter.</p>
          ) : sorted.map((c) => (
            <CourseCard key={c.id} layout="row" code={c.code} name={c.name} color={c.color} progress={c.progress} href="#"
              onClick={(e) => { e.preventDefault(); onOpenCourse(c); }} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BrowseScreen({ allCourses, enrolledIds, onEnrol, onBack }) {
  const [enrolling, setEnrolling] = useState(null);
  const catalog = allCourses.filter(c => !enrolledIds.includes(c.id));
  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 20px 60px' }}>
      <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ fontSize: 13 }}>&#8592; Back to my courses</a>
      <h1 style={{ margin: '8px 0 4px' }}>Course catalogue</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>Self-enrol in available courses for Autumn 2026.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18, marginTop: 20 }}>
        {catalog.map((c) => (
          <Card key={c.id} noBody>
            <div style={{ height: 88, background: `var(--course-${c.color})`, position: 'relative', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
              <span style={{ position: 'absolute', inset: 0, opacity: .9, backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,.16) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.16) 50%, rgba(255,255,255,.16) 75%, transparent 75%)', backgroundSize: '20px 20px', borderRadius: 'var(--radius) var(--radius) 0 0' }} />
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{c.code}</div>
              <div style={{ fontWeight: 600, margin: '3px 0 8px', lineHeight: 1.35 }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <Badge variant="primary" pill>{c.ects} ects</Badge>
                <Badge variant="light">{c.term}</Badge>
                {c.is_open ? <Badge variant="soft-success">Open</Badge> : <Badge variant="soft-warning">By request</Badge>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                <i className="fa-solid fa-user" style={{ marginRight: 6 }} />{c.teacher_name}
              </div>
              <Button variant={c.is_open ? 'primary' : 'outline'} block onClick={() => setEnrolling(c)}>
                {c.is_open ? 'Enrol me' : 'Request access'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {enrolling && (
        <EnrolModal course={enrolling} onClose={() => setEnrolling(null)} onConfirm={() => { setEnrolling(null); onEnrol(enrolling); }} />
      )}
    </div>
  );
}

function EnrolModal({ course, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-h4)' }}>Enrolment options</h3>
          <button className="ds-nav__icon" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{course.code}</div>
          <div style={{ fontWeight: 600, fontSize: 17, margin: '2px 0 4px' }}>{course.name}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Self enrolment ({course.term}). You will be added immediately and can unenrol at any time.</p>
          <div style={{ background: 'var(--gray-100)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>Teacher</span><strong>{course.teacher_name}</strong>
          </div>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--gray-100)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Enrol me</Button>
        </div>
      </div>
    </div>
  );
}

export function CourseScreen({ course, onBack }) {
  const [tab, setTab] = useState('course');

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 0 60px' }}>
      <div style={{ height: 150, background: `var(--course-${course.color})`, position: 'relative' }}>
        <span style={{ position: 'absolute', inset: 0, opacity: .9, backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%)', backgroundSize: '26px 26px' }} />
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginTop: -2, paddingTop: 18 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ fontSize: 13 }}>&#8592; My courses</a>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 8 }}>{course.code}</div>
          <h1 style={{ margin: '2px 0 6px' }}>{course.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge variant="primary" pill>{course.ects} ects</Badge>
            <Badge variant="light">{course.term}</Badge>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><i className="fa-solid fa-user" style={{ marginRight: 6 }} />{course.teacher_name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-color)', marginTop: 18 }}>
          {[['course', 'Course'], ['grades', 'Grades']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{ background: 'none', border: '0', borderBottom: tab === k ? '3px solid var(--brand-primary)' : '3px solid transparent', color: tab === k ? 'var(--gray-900)' : 'var(--gray-600)', fontWeight: tab === k ? 600 : 400, padding: '10px 14px', cursor: 'pointer', fontSize: 15 }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginTop: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {tab === 'course' && (
              <>
                <Card title="General">
                  <p style={{ margin: 0 }}>Welcome to <strong>{course.short_name}</strong>. Announcements, the course outline and the latest materials are posted here weekly. Submit assignments before the deadlines shown in your timeline.</p>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Announcements', 'Course outline.pdf', 'Week 1 — Introduction'].map((t, i) => (
                      <a key={i} href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', color: 'var(--text-body)' }}>
                        <i className={`fa-solid ${['fa-bullhorn', 'fa-file-pdf', 'fa-book-open'][i]}`} style={{ color: 'var(--brand-primary)' }} />{t}
                      </a>
                    ))}
                  </div>
                </Card>
                <Card title="Assignment — submit your work">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Test plan v2</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Due today, 23:59 &middot; No submission yet</div>
                    </div>
                    <Button variant="primary">Add submission</Button>
                  </div>
                </Card>
              </>
            )}
            {tab === 'grades' && (
              <Card title="Grades" noBody>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead><tr style={{ background: 'var(--gray-100)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 16px' }}>Item</th>
                    <th style={{ padding: '10px 16px' }}>Status</th>
                    <th style={{ padding: '10px 16px' }}>Grade</th>
                  </tr></thead>
                  <tbody>
                    {[['Quiz 1', 'Graded', '18 / 20'], ['Assignment 1', 'Graded', 'Pass'], ['Quiz 2', 'Graded', '15 / 20'], ['Test plan v2', 'Not submitted', '—']].map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--gray-200)' }}>
                        <td style={{ padding: '10px 16px' }}>{r[0]}</td>
                        <td style={{ padding: '10px 16px' }}>{r[1] === 'Not submitted' ? <Badge variant="soft-danger">{r[1]}</Badge> : <Badge variant="soft-success">{r[1]}</Badge>}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 600 }}>{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
          <Card title="Course progress">
            <ProgressBar value={course.progress || 0} label="Completed" />
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Teacher</span><strong>{course.teacher_name}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Credits</span><strong>{course.ects} ects</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Term</span><strong>{course.term}</strong></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

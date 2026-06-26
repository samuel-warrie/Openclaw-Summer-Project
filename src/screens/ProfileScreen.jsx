import { Avatar, Button, Badge, ProgressBar } from '../components/core/index.jsx';
import { Card } from '../components/layout/Card.jsx';
import { CourseCard } from '../components/course/CourseCard.jsx';

export function ProfileScreen({ user, courses, onOpenCourse }) {
  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1 style={{ margin: '0 0 18px' }}>Profile</h1>

      <Card noBody>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: 24, flexWrap: 'wrap' }}>
          <Avatar name={user.name} size="xl" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: '0 0 4px' }}>{user.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user.role || 'Student'} &middot; {user.city || 'Oulu'}, {user.country || 'Finland'}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <Badge variant="soft-success">Active</Badge>
              {user.studentId && <Badge variant="light">ID {user.studentId}</Badge>}
              <Badge variant="light">{courses.length} courses</Badge>
            </div>
          </div>
          <Button variant="outline"><i className="fa-solid fa-pen" /> Edit profile</Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
        <Card title="User details">
          {[['Email address', user.email], ['Username', user.email?.split('@')[0] || '—'], ['City/town', user.city || 'Oulu'], ['Country', user.country || 'Finland']].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i ? '1px solid var(--gray-200)' : 0, fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{r[0]}</span>
              <strong style={{ textAlign: 'right' }}>{r[1]}</strong>
            </div>
          ))}
        </Card>

        <Card title="Course details">
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Course profiles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {courses.slice(0, 4).map((c) => (
              <a key={c.id} href="#" onClick={(e) => { e.preventDefault(); onOpenCourse(c); }}>{c.name}</a>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Course progress" style={{ marginTop: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
          {courses.map((c) => (
            <CourseCard key={c.id} code={c.code} name={c.short_name} color={c.color} progress={c.progress} href="#"
              onClick={(e) => { e.preventDefault(); onOpenCourse(c); }} />
          ))}
        </div>
      </Card>
    </div>
  );
}

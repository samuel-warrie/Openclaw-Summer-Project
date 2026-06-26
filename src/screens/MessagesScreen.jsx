import { useState, useRef } from 'react';
import { Avatar, Button, Badge } from '../components/core/index.jsx';
import { Input } from '../components/forms/index.jsx';

const SEED_MESSAGES = [
  {
    id: '1', name: 'Dr. Aila Mäkelä', role: 'Teacher · AI course', online: true, time: '10:42', last: 'Please submit by Friday.',
    unread: 2,
    thread: [
      { from: 'them', text: 'Hello! Just a reminder about the Quiz 4 deadline.', time: '10:30' },
      { from: 'me', text: 'Thanks, I will check it now.', time: '10:38' },
      { from: 'them', text: 'Please submit by Friday.', time: '10:42' },
    ],
  },
  {
    id: '2', name: 'Riikka Niemi', role: 'Teacher · Software testing', online: false, time: 'Yesterday', last: 'Great work on the test plan!',
    unread: 0,
    thread: [
      { from: 'me', text: 'Hi, I submitted my test plan v2. Could you review it?', time: 'Mon 14:10' },
      { from: 'them', text: 'Great work on the test plan!', time: 'Mon 16:05' },
    ],
  },
  {
    id: '3', name: 'Markus Salo', role: 'Teacher · Summer project', online: false, time: 'Mon', last: 'Kickoff meeting is confirmed for the 26th.',
    unread: 0,
    thread: [
      { from: 'them', text: 'Kickoff meeting is confirmed for the 26th.', time: 'Mon 09:00' },
    ],
  },
];

export function MessagesScreen() {
  const [active, setActive] = useState(SEED_MESSAGES[0].id);
  const [threads, setThreads] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState('');
  const current = threads.find(t => t.id === active);
  const endRef = useRef(null);

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setThreads(ts => ts.map(t => t.id === active
      ? { ...t, thread: [...t.thread, { from: 'me', text: draft, time: 'Now' }], last: draft }
      : t));
    setDraft('');
    setTimeout(() => endRef.current?.scrollTo(0, 1e6), 50);
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 20px 40px' }}>
      <h1 style={{ margin: '0 0 18px' }}>Messages</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', overflow: 'hidden', height: 560, background: '#fff' }}>
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border-color)' }}>
            <Input icon={<i className="fa-solid fa-magnifying-glass" />} placeholder="Search messages" rounded />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {threads.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 12, padding: '12px 14px', border: 0, borderBottom: '1px solid var(--gray-200)', background: t.id === active ? 'var(--brand-primary-soft)' : '#fff', cursor: 'pointer' }}>
                <div style={{ position: 'relative', flex: 'none' }}>
                  <Avatar name={t.name} size="md" />
                  {t.online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', border: '2px solid #fff' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 'none' }}>{t.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.last}</div>
                </div>
                {t.unread > 0 && <Badge variant="primary" pill>{t.unread}</Badge>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border-color)' }}>
            <Avatar name={current.name} size="md" />
            <div>
              <div style={{ fontWeight: 600 }}>{current.name}</div>
              <div style={{ fontSize: 12, color: current.online ? 'var(--success)' : 'var(--text-muted)' }}>{current.online ? 'Online' : 'Offline'} &middot; {current.role}</div>
            </div>
          </div>

          <div ref={endRef} style={{ flex: 1, overflowY: 'auto', padding: 18, background: 'var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {current.thread.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ padding: '9px 13px', borderRadius: 14, fontSize: 14, lineHeight: 1.4, background: m.from === 'me' ? 'var(--brand-primary)' : '#fff', color: m.from === 'me' ? '#fff' : 'var(--text-body)', border: m.from === 'me' ? '0' : '1px solid var(--border-color)', borderBottomRightRadius: m.from === 'me' ? 4 : 14, borderBottomLeftRadius: m.from === 'me' ? 14 : 4 }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, textAlign: m.from === 'me' ? 'right' : 'left' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} style={{ display: 'flex', gap: 10, padding: 14, borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${current.name.split(' ')[0]}…`} className="ds-input" style={{ flex: 1 }} />
            <Button variant="primary" type="submit"><i className="fa-solid fa-paper-plane" /> Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

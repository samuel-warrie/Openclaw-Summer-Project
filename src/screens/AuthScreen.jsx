import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { Button } from '../components/core/index.jsx';
import { Input, Checkbox } from '../components/forms/index.jsx';
import './auth.css';

function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <svg className="auth-wordmark" viewBox="0 0 118 30" aria-label="moodle" role="img">
        <text x="0" y="23" fontFamily="-apple-system,'Segoe UI',Roboto,Arial,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5" fill="#f98012">moodle</text>
        <g transform="translate(20.5,3.2)" fill="#f98012">
          <path d="M0 3.2 L6 0 L12 3.2 L6 6.4 Z" />
          <rect x="5.4" y="5.2" width="1.2" height="3.4" rx="0.6" />
          <circle cx="6" cy="9" r="1.1" />
        </g>
      </svg>
      <div className="auth-card">{children}</div>
      <p className="auth-footer">moodle.oulu.fi &middot; Oulu University of Applied Sciences</p>
    </div>
  );
}

export function LoginScreen({ onLogin, onGoSignup }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !pw) { setErr('Please enter email and password.'); return; }
    setLoading(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) { setErr(error.message); setLoading(false); }
    else { onLogin(); }
  };

  return (
    <AuthShell>
      <div className="auth-body">
        <h1 style={{ fontSize: 'var(--font-size-h3)', margin: '0 0 4px' }}>Log in</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>Use your university account to continue.</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            icon={<i className="fa-solid fa-envelope" />} placeholder="you@student.oulu.fi" />
          <Input label="Password" type="password" value={pw} error={!!err}
            help={err || undefined}
            onChange={(e) => { setPw(e.target.value); setErr(''); }}
            icon={<i className="fa-solid fa-lock" />} placeholder="••••••••" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Checkbox label="Remember me" defaultChecked />
            <a href="#" style={{ fontSize: 13 }}>Forgotten password?</a>
          </div>
          <Button variant="primary" type="submit" block disabled={loading}>
            {loading ? 'Signing in...' : 'Log in'}
          </Button>
        </form>
      </div>
      <div className="auth-bottom">
        New here? <a href="#" onClick={(e) => { e.preventDefault(); onGoSignup(); }}>Create a new account</a>
      </div>
    </AuthShell>
  );
}

export function SignupScreen({ onSignup, onGoLogin }) {
  const [f, setF] = useState({ first: '', last: '', email: '', studentId: '', pw: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.email || !f.pw || !f.first || !f.last) { setErr('Please fill all required fields.'); return; }
    setLoading(true);
    setErr('');
    const { error } = await supabase.auth.signUp({
      email: f.email, password: f.pw,
      options: { data: { first_name: f.first, last_name: f.last, student_id: f.studentId } },
    });
    if (error) { setErr(error.message); setLoading(false); }
    else { onSignup(); }
  };

  return (
    <AuthShell>
      <div className="auth-body">
        <h1 style={{ fontSize: 'var(--font-size-h3)', margin: '0 0 4px' }}>New account</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>Create your Moodle account to enrol in courses.</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="First name" value={f.first} onChange={set('first')} placeholder="Samuel" />
            <Input label="Surname" value={f.last} onChange={set('last')} placeholder="Niva" />
          </div>
          <Input label="Email address" type="email" value={f.email} onChange={set('email')} placeholder="you@student.oulu.fi" />
          <Input label="Student ID (optional)" value={f.studentId} onChange={set('studentId')} placeholder="AB1234" />
          <Input label="Password" type="password" value={f.pw} onChange={set('pw')} help={err || 'At least 8 characters.'} error={!!err} placeholder="••••••••" />
          <Checkbox label="I agree to the site policy and terms of use." defaultChecked />
          <Button variant="primary" type="submit" block disabled={loading}>
            {loading ? 'Creating account...' : 'Create my new account'}
          </Button>
        </form>
      </div>
      <div className="auth-bottom">
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>Log in</a>
      </div>
    </AuthShell>
  );
}

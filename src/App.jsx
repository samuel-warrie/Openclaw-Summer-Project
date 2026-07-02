import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient.js';
import { Navbar } from './components/navigation/Navbar.jsx';
import { Drawer } from './components/layout/Drawer.jsx';
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from './screens/AuthScreen.jsx';
import { DashboardScreen } from './screens/DashboardScreen.jsx';
import { MyCoursesScreen, BrowseScreen, CourseScreen } from './screens/CoursesScreen.jsx';
import { CalendarScreen } from './screens/CalendarScreen.jsx';
import { MessagesScreen } from './screens/MessagesScreen.jsx';
import { ProfileScreen } from './screens/ProfileScreen.jsx';

function PlaceholderScreen({ icon, title, sub }) {
  return (
    <div style={{ maxWidth: 830, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 'var(--radius)', background: 'var(--gray-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: 26, color: 'var(--gray-500)' }} />
      </div>
      <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState('login');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [screen, setScreen] = useState('dashboard');
  const [activeCourse, setActiveCourse] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setAllCourses([]);
        setEnrolledCourses([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(prof);

      const { data: courses } = await supabase.from('courses').select('*');
      setAllCourses(courses || []);

      const { data: enrolls } = await supabase.from('enrollments').select('*, courses(*)').eq('user_id', userId);
      const enrolled = (enrolls || []).map(e => ({ ...e.courses, progress: e.progress, enrollmentId: e.id })).filter(e => e.id);
      setEnrolledCourses(enrolled);

      const enrolledIds = (enrolls || []).map(e => e.course_id).filter(Boolean);
      if (enrolledIds.length > 0) {
        const { data: assigns } = await supabase.from('assignments').select('*, courses(code, short_name, color)').in('course_id', enrolledIds);
        setAssignments(assigns || []);
      }

      const { data: events } = await supabase.from('calendar_events').select('*, courses(code, short_name, color)');
      setCalendarEvents(events || []);
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
    setLoading(false);
  };

  const go = (s) => { setScreen(s); window.scrollTo(0, 0); };
  const openCourse = (c) => { setActiveCourse(c); setScreen('course'); window.scrollTo(0, 0); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-100)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: 'var(--brand-primary)' }} />
          <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'login') {
      return (
        <LoginScreen
          onLogin={() => {}}
          onGoSignup={() => { setAuthScreen('signup'); setSignupSuccess(false); }}
          onGoForgot={() => { setAuthScreen('forgot'); setSignupSuccess(false); }}
          successMsg={signupSuccess ? 'Account created — please log in.' : ''}
          registeredEmail={registeredEmail}
        />
      );
    }
    if (authScreen === 'signup') {
      return (
        <SignupScreen
          onSignup={(email) => { setRegisteredEmail(email); setSignupSuccess(true); setAuthScreen('login'); }}
          onGoLogin={() => setAuthScreen('login')}
        />
      );
    }
    if (authScreen === 'forgot') {
      return <ForgotPasswordScreen onGoLogin={() => setAuthScreen('login')} />;
    }
  }

  const navLinks = [
    { label: 'Dashboard', href: '#', active: screen === 'dashboard', onClick: () => go('dashboard') },
    { label: 'My courses', href: '#', active: ['courses', 'course', 'browse'].includes(screen), onClick: () => go('courses') },
  ];

  const userName = profile ? `${profile.first_name} ${profile.last_name}` : (user.email || '');
  const userObj = {
    name: userName,
    firstName: profile?.first_name || '',
    email: profile?.email || user.email,
    role: profile?.role,
    city: profile?.city,
    country: profile?.country,
    studentId: profile?.student_id,
  };

  const timelineItems = assignments.map(a => ({
    courseName: a.courses?.short_name || a.courses?.name,
    title: a.title,
    type: a.type,
    due: a.due_at ? new Date(a.due_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
    status: a.due_at && new Date(a.due_at) > new Date() ? 'due' : 'overdue',
    color: a.courses?.color || 'blue',
  }));

  const calendarByDay = {};
  calendarEvents.forEach(ev => {
    const day = ev.event_date ? new Date(ev.event_date).getUTCDate() : null;
    if (!day) return;
    if (!calendarByDay[day]) calendarByDay[day] = [];
    calendarByDay[day].push({ title: ev.title, color: ev.courses?.color || 'info', course: ev.courses?.short_name || '' });
  });

  const enrolledIds = enrolledCourses.map(c => c.id);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={() => setDrawerOpen(o => !o)} className="ds-nav__icon" style={{ margin: '0 2px 0 10px', flex: 'none', position: 'relative', zIndex: 31 }} aria-label="Toggle navigation">
          <i className="fa-solid fa-bars" />
        </button>
        <div style={{ flex: 1 }}>
          <Navbar links={navLinks} user={{ name: userName }} editMode={editMode} onToggleEditMode={setEditMode} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - var(--navbar-height))' }}>
        <Drawer open={drawerOpen} screen={screen} go={go} onLogout={handleLogout} />
        <main style={{ flex: 1, minWidth: 0, background: '#fff' }}>
          {screen === 'dashboard' && (
            <DashboardScreen user={userObj} courses={enrolledCourses} assignments={timelineItems} calendarByDay={calendarByDay} onOpenCourse={openCourse} onOpenCalendar={() => go('calendar')} />
          )}
          {screen === 'courses' && (
            <MyCoursesScreen courses={enrolledCourses} onOpenCourse={openCourse} onBrowse={() => go('browse')} />
          )}
          {screen === 'browse' && (
            <BrowseScreen allCourses={allCourses} enrolledIds={enrolledIds} onBack={() => go('courses')} onEnrol={async (c) => {
              const { data: existing } = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', c.id).maybeSingle();
              if (!existing) {
                await supabase.from('enrollments').insert({ user_id: user.id, course_id: c.id, progress: 0 });
                await fetchUserData(user.id);
              }
              go('courses');
              showToast(`Enrolled in ${c.code}`);
            }} />
          )}
          {screen === 'course' && activeCourse && (
            <CourseScreen course={activeCourse} onBack={() => go('courses')} />
          )}
          {screen === 'calendar' && (
            <CalendarScreen courses={enrolledCourses} calendarByDay={calendarByDay} />
          )}
          {screen === 'messages' && <MessagesScreen />}
          {screen === 'profile' && (
            <ProfileScreen user={userObj} courses={enrolledCourses} onOpenCourse={openCourse} />
          )}
          {screen === 'files' && (
            <PlaceholderScreen icon="fa-folder" title="Private files" sub="Your uploaded personal files will appear here." />
          )}
          {screen === 'grades' && (
            <PlaceholderScreen icon="fa-table-list" title="Grades" sub="An overview of your grades across all enrolled courses." />
          )}
        </main>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: '#fff', padding: '11px 18px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, zIndex: 200 }}>
          <i className="fa-solid fa-circle-check" />{toast}
        </div>
      )}
    </div>
  );
}

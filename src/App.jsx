import { useState, useEffect } from 'react';
import { CURRICULUM, TOPICS } from './data/curriculum.js';
import { useProgress } from './hooks/useProgress.js';
import DayView from './components/DayView.jsx';
import Certificate from './components/Certificate.jsx';
import JSSimulator from './simulator/JSSimulator.jsx';
import APITester from './simulator/APITester.jsx';
import SQLPlayground from './simulator/SQLPlayground.jsx';
import RQVisualizer from './simulator/RQVisualizer.jsx';

// Group days by topic for sidebar
const TOPIC_GROUPS = [
  { topic: 'express',       label: 'Express.js', days: [1, 2] },
  { topic: 'axios',         label: 'Axios',      days: [3, 4] },
  { topic: 'react-query',   label: 'React Query', days: [5, 6, 7] },
  { topic: 'integration',   label: 'Integration', days: [8, 9, 10] },
];

const SIM_TABS = [
  { id: 'js',    label: '⚡ JS Run',   component: JSSimulator },
  { id: 'api',   label: '🌐 API Test', component: APITester },
  { id: 'sql',   label: '🗄️ SQL',      component: SQLPlayground },
  { id: 'rq',    label: '🔄 RQ Cache', component: RQVisualizer },
];

export default function App() {
  const [currentDay, setCurrentDay]   = useState(1);
  const [mainTab, setMainTab]         = useState('learn'); // 'learn' | 'simulator' | 'certificate'
  const [simTab, setSimTab]           = useState('js');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled]     = useState(false);

  const {
    progress,
    markDayComplete,
    saveQuizScore,
    markChallengeComplete,
    getDayStatus,
    totalXP,
    level,
    xpToNext,
    progressPct,
    certified,
  } = useProgress();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // PWA install prompt
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const dayData = CURRICULUM.find(d => d.day === currentDay);
  const dayStatus = getDayStatus(currentDay);

  const handleQuizComplete = (score, total) => {
    saveQuizScore(currentDay, score, total);
    if (score >= Math.ceil(total * 0.75)) {
      markDayComplete(currentDay);
    }
  };

  const handleChallengeComplete = () => {
    markChallengeComplete(currentDay);
  };

  const SimComponent = SIM_TABS.find(t => t.id === simTab)?.component || JSSimulator;

  return (
    <div className="app-shell">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="header">
        <button
          className="mobile-nav-btn"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className="header-logo">
          <span>⚡</span>
          <span>FullStack Academy</span>
          <span style={{ opacity: 0.4, fontWeight: 400 }}>/ 10-Day</span>
        </div>

        {/* Main tab switcher */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '24px' }}>
          {[
            { id: 'learn',       label: '📖 Learn' },
            { id: 'simulator',   label: '⚡ Simulator' },
            { id: 'certificate', label: '🏆 Certificate' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: mainTab === t.id ? 'var(--accent)' : 'transparent',
                color: mainTab === t.id ? 'white' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* XP & Streak */}
        <div className="header-xp">
          {progress.streak > 0 && (
            <div className="streak-badge">
              🔥 {progress.streak}d
            </div>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
            Lv{level}
          </span>
          <div className="xp-bar-wrap" title={`${totalXP} XP · ${xpToNext} to next level`}>
            <div className="xp-bar-fill" style={{ width: `${((500 - xpToNext) / 500) * 100}%` }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
            {totalXP} XP
          </span>

          {/* PWA Install button */}
          {installPrompt && !installed && (
            <button
              onClick={handleInstall}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
              title="Install as app"
            >
              📥 Install
            </button>
          )}
        </div>
      </header>

      {/* ── OFFLINE BANNER ──────────────────────────────────── */}
      {!isOnline && (
        <div style={{
          gridColumn: '1 / -1',
          background: '#854d0e',
          color: '#fef9c3',
          padding: '6px 20px',
          fontSize: '0.78rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 60,
        }}>
          <span>📵</span>
          <span>You're offline — all lessons, quizzes, simulators (JS, SQL, RQ) work fine. The API Tester needs a connection.</span>
        </div>
      )}

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Overall progress */}
        <div className="progress-overview">
          <p>Overall Progress</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>
              {progress.completedDays.length}/10 days
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{progressPct}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Day navigation */}
        {TOPIC_GROUPS.map(group => {
          const topic = TOPICS[group.topic];
          return (
            <div key={group.topic}>
              <div
                className="topic-group-label"
                style={{ color: topic.color }}
              >
                {group.label}
              </div>
              {group.days.map(dayNum => {
                const d = CURRICULUM.find(c => c.day === dayNum);
                const status = getDayStatus(dayNum);
                return (
                  <button
                    key={dayNum}
                    className={`day-btn ${currentDay === dayNum ? 'active' : ''} ${status.completed ? 'completed' : ''}`}
                    onClick={() => {
                      setCurrentDay(dayNum);
                      setMainTab('learn');
                      setSidebarOpen(false);
                    }}
                    style={{ borderLeft: `2px solid ${currentDay === dayNum ? topic.color : 'transparent'}` }}
                  >
                    <span className="day-num">{dayNum}</span>
                    <span className="day-title">{d?.title?.split('—')[1]?.trim() || d?.title}</span>
                    <div className="day-icons">
                      {status.completed  && <span className="day-icon" title="Complete">✓</span>}
                      {status.challenged && <span className="day-icon" title="Challenge done">🏋️</span>}
                      {status.quizScore !== undefined && <span className="day-icon" title="Quiz done">✏️</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Bottom links */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 8px', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
            <div style={{ marginBottom: '4px' }}>
              🏋️ Challenges: {progress.challengesDone.length}/10
            </div>
            <div>
              ✏️ Quizzes: {Object.keys(progress.quizScores).length}/10
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── MAIN ───────────────────────────────────────────── */}
      <main className="main-area">
        {mainTab === 'learn' && dayData && (
          <DayView
            key={currentDay}
            day={dayData}
            dayStatus={dayStatus}
            onQuizComplete={handleQuizComplete}
            onChallengeComplete={handleChallengeComplete}
          />
        )}

        {mainTab === 'simulator' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Sim tab bar */}
            <div className="tab-bar">
              {SIM_TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${simTab === t.id ? 'active' : ''}`}
                  onClick={() => setSimTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <SimComponent key={simTab} />
            </div>
          </div>
        )}

        {mainTab === 'certificate' && (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <Certificate progress={{ ...progress, certified, totalXP }} />
          </div>
        )}
      </main>
    </div>
  );
}

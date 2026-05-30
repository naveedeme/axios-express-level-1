import { useRef } from 'react';

export default function Certificate({ progress }) {
  const certRef = useRef();
  const date    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  if (!progress.certified) {
    const remaining = 10 - progress.completedDays.length;
    const challenges = 8 - Math.min(progress.challengesDone.length, 8);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ marginBottom: '8px' }}>Certificate Locked</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
          Complete all 10 days and at least 8 challenges to unlock your certificate.
        </p>
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px 24px',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem' }}>
            <span>{progress.completedDays.length === 10 ? '✅' : '⬜'}</span>
            <span>{progress.completedDays.length}/10 days completed</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem' }}>
            <span>{progress.challengesDone.length >= 8 ? '✅' : '⬜'}</span>
            <span>{progress.challengesDone.length}/8 challenges completed</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div ref={certRef} className="certificate">
        {/* Corner decorations */}
        {['top:0,left:0', 'top:0,right:0', 'bottom:0,left:0', 'bottom:0,right:0'].map((pos, i) => {
          const [v, h] = pos.split(',');
          const [vk, vv] = v.split(':');
          const [hk, hv] = h.split(':');
          return (
            <div key={i} style={{
              position: 'absolute',
              [vk]: vv,
              [hk]: hv,
              width: 60,
              height: 60,
              background: `radial-gradient(circle, rgba(99,102,241,0.15), transparent)`,
              borderRadius: '50%',
            }} />
          );
        })}

        <div className="cert-badge">🏆</div>
        <div className="cert-title">Certificate of Completion</div>
        <div className="cert-name">FullStack Academy</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '16px' }}>
          10-Day Mastery Program
        </div>
        <div className="cert-body">
          This certifies the successful completion of the full 10-day curriculum covering
          server-side development with Express.js, HTTP client patterns with Axios,
          and advanced server-state management with React Query — including both
          PostgreSQL and SQL Server integration.
        </div>

        <div className="cert-skills">
          {[
            { label: 'Express.js', color: '#22d3ee' },
            { label: 'Axios', color: '#a78bfa' },
            { label: 'React Query', color: '#f59e0b' },
            { label: 'PostgreSQL', color: '#34d399' },
            { label: 'SQL Server', color: '#34d399' },
            { label: 'Vite + React', color: '#818cf8' },
          ].map(s => (
            <span key={s.label} className="cert-skill" style={{
              color: s.color,
              borderColor: s.color + '44',
              background: s.color + '11',
            }}>
              {s.label}
            </span>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.2rem' }}>
              {progress.totalXP}
            </div>
            <div>XP Earned</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.2rem' }}>
              {progress.challengesDone.length}
            </div>
            <div>Challenges Done</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '1.2rem' }}>
              {progress.streak}🔥
            </div>
            <div>Day Streak</div>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          fontSize: '0.72rem',
          color: 'var(--text-faint)',
          fontFamily: 'var(--font-mono)',
        }}>
          Issued on {date} · FullStack Academy · fullstack-academy.dev
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ Print / Save as PDF
        </button>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '8px' }}>
          Tip: Use "Save as PDF" in your print dialog
        </p>
      </div>
    </div>
  );
}

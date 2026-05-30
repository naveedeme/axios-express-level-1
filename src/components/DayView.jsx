import { useState } from 'react';
import SectionCard from '../components/SectionCard.jsx';
import Quiz from '../components/Quiz.jsx';
import { TOPICS } from '../data/curriculum.js';

export default function DayView({ day, onQuizComplete, onChallengeComplete, dayStatus }) {
  const [activeTab, setActiveTab] = useState('learn');
  const topic = TOPICS[day.topic];

  const tabs = [
    { id: 'learn',     label: '📖 Learn',     count: day.sections.length },
    { id: 'quiz',      label: '✏️ Quiz',       count: day.quiz.length },
    { id: 'challenge', label: '🏋️ Challenge',  count: null },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.count !== null && (
              <span style={{
                background: activeTab === t.id ? 'var(--accent)' : 'var(--border)',
                color: activeTab === t.id ? 'white' : 'var(--text-faint)',
                borderRadius: '99px',
                padding: '1px 6px',
                fontSize: '0.65rem',
                fontWeight: 700,
              }}>
                {t.id === 'quiz' && dayStatus.quizScore !== undefined
                  ? `${dayStatus.quizScore}/${t.count}`
                  : t.count}
              </span>
            )}
            {t.id === 'challenge' && dayStatus.challenged && (
              <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* ── LEARN TAB ─────────────────────────────────── */}
        {activeTab === 'learn' && (
          <div className="day-content fade-in">
            {/* Day header */}
            <div className="day-header">
              <div className="day-number">Day {day.day} of 10</div>
              <div
                className="topic-pill"
                style={{
                  background: topic.bg,
                  color: topic.color,
                  border: `1px solid ${topic.color}44`,
                }}
              >
                <span>{day.icon}</span>
                <span>{topic.label}</span>
              </div>
              <h1 className="day-title-large">{day.title}</h1>
              <p className="day-subtitle">{day.subtitle}</p>

              {/* Progress chips */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <ProgressChip
                  label={dayStatus.completed ? 'Day Complete ✓' : 'In Progress'}
                  color={dayStatus.completed ? 'var(--success)' : 'var(--text-faint)'}
                  bg={dayStatus.completed ? 'rgba(52,211,153,0.1)' : 'var(--border)'}
                />
                {dayStatus.quizScore !== undefined && (
                  <ProgressChip
                    label={`Quiz: ${dayStatus.quizScore}/${day.quiz.length}`}
                    color="var(--rq)"
                    bg="rgba(245,158,11,0.1)"
                  />
                )}
                {dayStatus.challenged && (
                  <ProgressChip
                    label="Challenge Done ✓"
                    color="var(--axios)"
                    bg="rgba(167,139,250,0.1)"
                  />
                )}
              </div>
            </div>

            {/* Sections */}
            <div className="stagger">
              {day.sections.map((section, i) => (
                <div key={section.id} className="fade-in">
                  <SectionCard section={section} defaultOpen={i === 0} />
                </div>
              ))}
            </div>

            {/* Mark day complete */}
            {!dayStatus.completed && (
              <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ marginBottom: '12px', fontSize: '0.875rem' }}>
                  Finished reading all sections? Mark this day complete and move to the quiz!
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onQuizComplete?.(0, 0);
                    setActiveTab('quiz');
                  }}
                >
                  Take the Quiz →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── QUIZ TAB ──────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <div className="day-content fade-in">
            <div className="day-header" style={{ marginBottom: '24px' }}>
              <h2>Day {day.day} Quiz</h2>
              <p className="day-subtitle">Test your understanding of today's material</p>
            </div>
            <div className="section-card">
              <Quiz
                questions={day.quiz}
                day={day.day}
                onComplete={(score, total) => onQuizComplete?.(score, total)}
              />
            </div>
          </div>
        )}

        {/* ── CHALLENGE TAB ─────────────────────────────── */}
        {activeTab === 'challenge' && (
          <div className="day-content fade-in">
            <div className="day-header" style={{ marginBottom: '24px' }}>
              <h2>Day {day.day} Challenge</h2>
              <p className="day-subtitle">Apply what you learned — build something real</p>
            </div>
            <ChallengeCard
              challenge={day.challenge}
              day={day.day}
              done={dayStatus.challenged}
              onComplete={() => onChallengeComplete?.()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressChip({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '99px',
      fontSize: '0.72rem',
      fontWeight: 600,
      color,
      background: bg,
      border: `1px solid ${color}33`,
    }}>
      {label}
    </span>
  );
}

function ChallengeCard({ challenge, day, done, onComplete }) {
  const [showHints, setShowHints] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="challenge-card">
      <div className="challenge-badge">
        🏋️ DAY {day} CHALLENGE
      </div>

      <h3 className="challenge-title">{challenge.title}</h3>
      <p className="challenge-description">{challenge.description}</p>

      {/* Hints */}
      <div className="challenge-hints">
        <button
          onClick={() => setShowHints(h => !h)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-body)',
          }}
        >
          {showHints ? '▼' : '▶'} {showHints ? 'Hide' : 'Show'} Hints ({challenge.hints.length})
        </button>

        {showHints && (
          <div style={{ marginTop: '10px' }} className="fade-in">
            {challenge.hints.map((hint, i) => (
              <div key={i} className="hint-item">
                <span className="hint-bullet">→</span>
                <span>{hint}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
        {done ? (
          <button className="challenge-done-btn done" disabled>
            ✓ Challenge Completed · +200 XP
          </button>
        ) : (
          <div>
            {!confirmed ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Built it and it works?
                </div>
                <button
                  className="challenge-done-btn"
                  onClick={() => setConfirmed(true)}
                >
                  ✓ Mark as Complete
                </button>
              </div>
            ) : (
              <div className="fade-in" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Did you actually build it and test it?
                </span>
                <button
                  className="challenge-done-btn"
                  style={{ background: 'var(--success)' }}
                  onClick={onComplete}
                >
                  Yes, it works! +200 XP
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setConfirmed(false)}
                >
                  Not yet
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
        💡 Use the Simulator tab to test your API requests and SQL queries as you build.
      </div>
    </div>
  );
}

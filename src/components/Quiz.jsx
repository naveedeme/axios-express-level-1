import { useState } from 'react';

export default function Quiz({ questions, day, onComplete }) {
  const [answers, setAnswers]   = useState({});   // { qIdx: optionIdx }
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.answer).length
    : 0;

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitted(true);
    setShowResult(true);
    onComplete?.(score, questions.length);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setShowResult(false);
  };

  const passed = score >= Math.ceil(questions.length * 0.75);

  if (showResult) {
    return (
      <div className="quiz-result fade-in">
        <div className={`quiz-score-big ${passed ? 'quiz-pass' : 'quiz-fail'}`}>
          {score}/{questions.length}
        </div>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          {passed ? '🎉 Excellent! Day complete!' : '📚 Keep studying!'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {passed
            ? `You scored ${Math.round((score / questions.length) * 100)}% — quiz unlocked next day!`
            : `You need ${Math.ceil(questions.length * 0.75)} correct to pass. Review the material and try again.`}
        </p>
        {passed && (
          <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '8px', fontWeight: 600 }}>
            +{score * 25} XP earned!
          </div>
        )}
        <div className="quiz-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleRetry}>
            ↺ Retry
          </button>
          {passed && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowResult(false)}
            >
              Review Answers
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-section">
      <div className="quiz-header">
        <h3 style={{ color: 'var(--text)', marginBottom: 4 }}>Day {day} Quiz</h3>
        <p className="quiz-progress">
          Answered {Object.keys(answers).length}/{questions.length} questions
          {' '}· Pass mark: {Math.ceil(questions.length * 0.75)}/{questions.length}
        </p>
      </div>

      <div className="stagger">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = submitted && selected === q.answer;
          const isWrong   = submitted && selected !== undefined && selected !== q.answer;

          return (
            <div key={qi} className="quiz-question fade-in">
              <p className="quiz-q">
                <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginRight: '8px' }}>
                  Q{qi + 1}.
                </span>
                {q.q}
              </p>
              <div className="quiz-options">
                {q.options.map((opt, oi) => {
                  let cls = 'quiz-option';
                  if (submitted) {
                    if (oi === q.answer) cls += ' revealed';
                    if (oi === selected && isCorrect) cls += ' correct';
                    if (oi === selected && isWrong)   cls += ' wrong';
                  } else if (selected === oi) {
                    cls += ' correct'; // highlight selected before submit
                  }
                  return (
                    <button
                      key={oi}
                      className={cls}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={submitted}
                    >
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        opacity: 0.5,
                        marginRight: '8px'
                      }}>
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                      {submitted && oi === q.answer && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓</span>
                      )}
                      {submitted && oi === selected && isWrong && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  color: isCorrect ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 500
                }}>
                  {isCorrect ? '✓ Correct' : `✗ The answer was: ${q.options[q.answer]}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
        style={{ marginTop: '16px' }}
      >
        Submit Answers
      </button>
    </div>
  );
}

import { useState } from 'react';
import CodeBlock from './CodeBlock.jsx';
import MarkdownRenderer from './MarkdownRenderer.jsx';

const TYPE_LABELS = {
  concept: 'Concept',
  code:    'Code',
  install: 'Setup',
};

export default function SectionCard({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="section-card">
      <div
        className={`section-header ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`section-type-badge ${section.type}`}>
          {TYPE_LABELS[section.type] || section.type}
        </span>
        <span className="section-title">{section.title}</span>
        <span className={`section-chevron ${open ? 'open' : ''}`}>▼</span>
      </div>

      {open && (
        <div className="section-body fade-in">
          {/* CONCEPT */}
          {section.type === 'concept' && (
            <>
              <MarkdownRenderer content={section.content} />
              {section.diagram && (
                <div className="diagram-block">{section.diagram}</div>
              )}
            </>
          )}

          {/* INSTALL */}
          {section.type === 'install' && (
            <div className="install-steps">
              {section.steps.map((step, i) => (
                <InstallStep key={i} num={i + 1} step={step} />
              ))}
            </div>
          )}

          {/* CODE */}
          {section.type === 'code' && (
            <>
              <CodeBlock
                code={section.code}
                filename={section.filename}
                language={section.language}
              />
              {section.explanation && (
                <div className="explanation">
                  <MarkdownRenderer content={section.explanation} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InstallStep({ num, step }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(step.cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="install-step">
      <div className="step-num">{num}</div>
      <div className="step-content">
        <div className="step-label">{step.label}</div>
        <div className="step-cmd" onClick={handleCopy} title="Click to copy">
          <span>{step.cmd}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', flexShrink: 0 }}>
            {copied ? '✓ copied' : '⎘'}
          </span>
        </div>
      </div>
    </div>
  );
}

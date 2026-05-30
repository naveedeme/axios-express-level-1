import { useState } from 'react';

export default function CodeBlock({ code, filename, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block-wrap">
      {filename && (
        <div className="code-filename">
          <span style={{ marginLeft: '32px' }}>{filename}</span>
          {language && (
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.68rem' }}>
              {language}
            </span>
          )}
        </div>
      )}
      <div className="code-block" style={{ borderRadius: filename ? '0 0 var(--radius) var(--radius)' : 'var(--radius)' }}>
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

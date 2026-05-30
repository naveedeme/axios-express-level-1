// Simple markdown renderer — no external deps
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (line.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(
        <table key={`table-${i}`}>
          <thead>
            <tr>
              {tableLines[0].split('|').filter(Boolean).map((h, j) => (
                <th key={j}>{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableLines.slice(2).map((row, ri) => (
              <tr key={ri}>
                {row.split('|').filter(Boolean).map((cell, j) => (
                  <td key={j}>{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={`code-${i}`} style={{
          background: 'var(--bg-code)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          overflowX: 'auto',
          color: '#e6edf3',
          margin: '12px 0'
        }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} style={{ marginTop: '20px', marginBottom: '8px' }}>{inline(line.slice(3))}</h3>);
      i++; continue;
    }
    // Heading 3
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} style={{ marginTop: '16px', marginBottom: '6px' }}>{inline(line.slice(4))}</h4>);
      i++; continue;
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ marginBottom: '12px' }}>
          {items.map((item, j) => <li key={j}>{inline(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Empty line → spacing
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '8px' }} />);
      i++; continue;
    }

    // Paragraph
    elements.push(<p key={i}>{inline(line)}</p>);
    i++;
  }

  return <div className="md-content">{elements}</div>;
}

// Inline formatting: **bold**, *italic*, `code`
function inline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **...**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      const idx = remaining.indexOf(boldMatch[0]);
      if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(idx + boldMatch[0].length);
      continue;
    }

    // Inline code `...`
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch) {
      const idx = remaining.indexOf(codeMatch[0]);
      if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      parts.push(<code key={key++}>{codeMatch[1]}</code>);
      remaining = remaining.slice(idx + codeMatch[0].length);
      continue;
    }

    // Italic *...*
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch) {
      const idx = remaining.indexOf(italicMatch[0]);
      if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(idx + italicMatch[0].length);
      continue;
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
}

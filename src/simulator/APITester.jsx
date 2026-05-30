import { useState } from 'react';

const PRESET_APIS = [
  { label: 'GET Users',    method: 'GET',  url: 'https://jsonplaceholder.typicode.com/users', body: '' },
  { label: 'GET Post 1',   method: 'GET',  url: 'https://jsonplaceholder.typicode.com/posts/1', body: '' },
  { label: 'GET Comments', method: 'GET',  url: 'https://jsonplaceholder.typicode.com/comments?postId=1', body: '' },
  { label: 'GET Todos',    method: 'GET',  url: 'https://jsonplaceholder.typicode.com/todos?_limit=5', body: '' },
  { label: 'POST Create',  method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts',
    body: JSON.stringify({ title: 'My Post', body: 'Content here', userId: 1 }, null, 2) },
  { label: 'PUT Update',   method: 'PUT',  url: 'https://jsonplaceholder.typicode.com/posts/1',
    body: JSON.stringify({ title: 'Updated', body: 'New content', userId: 1 }, null, 2) },
  { label: 'PATCH',        method: 'PATCH',url: 'https://jsonplaceholder.typicode.com/posts/1',
    body: JSON.stringify({ title: 'Patched Title' }, null, 2) },
  { label: 'DELETE',       method: 'DELETE',url: 'https://jsonplaceholder.typicode.com/posts/1', body: '' },
];

const METHOD_COLORS = {
  GET:    '#3fb950',
  POST:   '#818cf8',
  PUT:    '#d29922',
  PATCH:  '#39c5cf',
  DELETE: '#f85149',
};

export default function APITester() {
  const [method, setMethod]     = useState('GET');
  const [url, setUrl]           = useState('https://jsonplaceholder.typicode.com/users');
  const [body, setBody]         = useState('');
  const [headers, setHeaders]   = useState('{\n  "Content-Type": "application/json"\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState(null);
  const [elapsed, setElapsed]   = useState(null);
  const [tab, setTab]           = useState('body'); // body | headers

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setElapsed(null);

    const start = Date.now();

    try {
      let parsedHeaders = {};
      try { parsedHeaders = JSON.parse(headers); } catch {}

      const opts = {
        method,
        headers: parsedHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        opts.body = body;
      }

      const res = await fetch(url, opts);
      const ms  = Date.now() - start;

      let data;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setStatus({ code: res.status, text: res.statusText, ok: res.ok });
      setElapsed(ms);
      setResponse(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } catch (err) {
      setStatus({ code: 0, text: 'Network Error', ok: false });
      setElapsed(Date.now() - start);
      setResponse(`Error: ${err.message}\n\nNote: Some APIs block CORS requests from browser. Try jsonplaceholder.typicode.com which allows all origins.`);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setBody(preset.body);
    setResponse(null);
    setStatus(null);
  };

  return (
    <div className="api-tester">
      {/* Presets */}
      <div style={{
        padding: '8px 12px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap'
      }}>
        {PRESET_APIS.map((p, i) => (
          <button
            key={i}
            onClick={() => loadPreset(p)}
            style={{
              padding: '3px 8px',
              fontSize: '0.68rem',
              fontWeight: 700,
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: METHOD_COLORS[p.method] || 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* URL bar */}
      <div className="api-url-bar">
        <select
          className="method-select"
          value={method}
          onChange={e => setMethod(e.target.value)}
          style={{ color: METHOD_COLORS[method] }}
        >
          {Object.keys(METHOD_COLORS).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          className="url-input"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          onKeyDown={e => e.key === 'Enter' && sendRequest()}
        />
        <button
          className="send-btn"
          onClick={sendRequest}
          disabled={loading}
        >
          {loading ? <span className="animate-spin">⟳</span> : '▶ Send'}
        </button>
      </div>

      {/* Request tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 12px',
      }}>
        {['body', 'headers'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 14px',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              background: 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body / Headers input */}
      {tab === 'body' ? (
        <textarea
          className="api-body-input"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={['POST', 'PUT', 'PATCH'].includes(method)
            ? '{\n  "key": "value"\n}'
            : '// Body not used for ' + method + ' requests'}
          style={{ height: '120px', resize: 'vertical' }}
          disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
        />
      ) : (
        <textarea
          className="api-body-input"
          value={headers}
          onChange={e => setHeaders(e.target.value)}
          placeholder='{\n  "Authorization": "Bearer token"\n}'
          style={{ height: '120px', resize: 'vertical' }}
        />
      )}

      {/* Response */}
      <pre className="api-response">
        {loading
          ? 'Sending request...'
          : response
            ? response
            : '// Response will appear here\n// Click ▶ Send or press Enter in URL bar'}
      </pre>

      {/* Status bar */}
      <div className="api-status">
        {status && (
          <>
            <span className={status.ok ? 'status-ok' : 'status-err'}>
              {status.ok ? '●' : '●'} {status.code} {status.text}
            </span>
            <span>{elapsed}ms</span>
          </>
        )}
        {!status && !loading && (
          <span>Ready · Using JSONPlaceholder as test API (CORS-enabled)</span>
        )}
        {loading && <span className="animate-pulse">Waiting for response...</span>}
      </div>
    </div>
  );
}

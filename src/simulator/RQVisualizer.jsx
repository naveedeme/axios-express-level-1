import { useState, useEffect, useRef } from 'react';

const INITIAL_QUERIES = [
  { key: "['users']", status: 'loading', stale: false, data: null, fetchCount: 0 },
  { key: "['posts', 1]", status: 'idle', stale: false, data: null, fetchCount: 0 },
  { key: "['auth', 'me']", status: 'idle', stale: false, data: null, fetchCount: 0 },
];

const STATUS_COLORS = {
  loading:  'loading',
  success:  'fresh',
  stale:    'stale',
  error:    'error',
  idle:     'idle',
  fetching: 'loading',
};

const ACTIONS = [
  { label: 'Mount Users', action: 'mount_users', desc: 'Component mounts → useQuery fires' },
  { label: 'Cache Hit', action: 'cache_hit', desc: 'Second component uses same key → no fetch' },
  { label: 'Stale Data', action: 'go_stale', desc: 'staleTime exceeded → marked stale' },
  { label: 'Tab Focus', action: 'tab_focus', desc: 'User returns → stale data refetches' },
  { label: 'Mutation', action: 'mutation', desc: 'POST success → invalidateQueries fires' },
  { label: 'Load Post', action: 'load_post', desc: 'useQuery with different key → new fetch' },
  { label: 'Auth Query', action: 'load_auth', desc: 'Load auth user (retry: false)' },
  { label: 'Error State', action: 'error', desc: 'Network fail → error state' },
  { label: 'Retry', action: 'retry', desc: 'React Query retries automatically' },
  { label: 'Reset All', action: 'reset', desc: 'Clear all cache' },
];

export default function RQVisualizer() {
  const [queries, setQueries]   = useState(INITIAL_QUERIES);
  const [log, setLog]           = useState([]);
  const [obsCount, setObsCount] = useState({ "['users']": 0, "['posts', 1]": 0, "['auth', 'me']": 0 });
  const logRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    const entry = { msg, type, time: new Date().toLocaleTimeString('en', { hour12: false }) };
    setLog(prev => [...prev.slice(-50), entry]);
    setTimeout(() => logRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50);
  };

  const updateQuery = (key, patch) => {
    setQueries(prev => prev.map(q => q.key === key ? { ...q, ...patch } : q));
  };

  const simulate = async (action) => {
    switch (action) {
      case 'mount_users':
        updateQuery("['users']", { status: 'loading', stale: false });
        addLog("Component mounted → useQuery(['users']) triggered", 'action');
        await delay(800);
        updateQuery("['users']", { status: 'success', data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }], fetchCount: 1 });
        setObsCount(o => ({ ...o, "['users']": 1 }));
        addLog("✓ Fetched & cached ['users'] → 2 users", 'success');
        addLog("→ observers: 1", 'info');
        break;

      case 'cache_hit':
        addLog("2nd component uses useQuery(['users'])…", 'action');
        await delay(200);
        setObsCount(o => ({ ...o, "['users']": 2 }));
        addLog("✓ CACHE HIT — no fetch! Shared from cache", 'success');
        addLog("→ observers: 2 · fetchCount still: 1", 'info');
        break;

      case 'go_stale':
        addLog("⏱ staleTime (5min default) exceeded...", 'action');
        await delay(500);
        updateQuery("['users']", { status: 'stale', stale: true });
        addLog("→ ['users'] marked STALE — will refetch on next access", 'warning');
        break;

      case 'tab_focus':
        addLog("👀 User returns to tab (refetchOnWindowFocus: true)…", 'action');
        updateQuery("['users']", { status: 'loading' });
        await delay(600);
        updateQuery("['users']", { status: 'success', stale: false, fetchCount: 2 });
        addLog("✓ Background refetch complete → fresh data · observers still see old data until done", 'success');
        break;

      case 'mutation':
        addLog("✏ useMutation POST /users fired…", 'action');
        await delay(400);
        addLog("✓ Mutation success → queryClient.invalidateQueries(['users'])", 'success');
        updateQuery("['users']", { status: 'loading', stale: true });
        await delay(700);
        updateQuery("['users']", { status: 'success', stale: false, fetchCount: (queries.find(q=>q.key==="['users']")?.fetchCount||1)+1 });
        addLog("✓ ['users'] refetched after invalidation", 'success');
        break;

      case 'load_post':
        updateQuery("['posts', 1]", { status: 'loading' });
        addLog("useQuery(['posts', 1]) — key not in cache, fetching…", 'action');
        setObsCount(o => ({ ...o, "['posts', 1]": 1 }));
        await delay(900);
        updateQuery("['posts', 1]", { status: 'success', data: { id: 1, title: 'Hello World' }, fetchCount: 1 });
        addLog("✓ Cached ['posts', 1]", 'success');
        break;

      case 'load_auth':
        updateQuery("['auth', 'me']", { status: 'loading' });
        addLog("useQuery(['auth', 'me'], { retry: false })…", 'action');
        setObsCount(o => ({ ...o, "['auth', 'me']": 1 }));
        await delay(500);
        updateQuery("['auth', 'me']", { status: 'success', data: { id: 1, name: 'Alice', role: 'admin' }, stale: false, fetchCount: 1 });
        addLog("✓ Auth user loaded · staleTime: Infinity (never refetches)", 'success');
        break;

      case 'error':
        addLog("💥 Network error for ['posts', 1]…", 'action');
        updateQuery("['posts', 1]", { status: 'loading' });
        await delay(600);
        updateQuery("['posts', 1]", { status: 'error', data: null });
        addLog("✗ Request failed → retry: 2 scheduled", 'error');
        break;

      case 'retry':
        addLog("↺ React Query retry 1/2…", 'action');
        updateQuery("['posts', 1]", { status: 'loading' });
        await delay(1000);
        updateQuery("['posts', 1]", { status: 'success', data: { id: 1, title: 'Hello World' }, fetchCount: 2 });
        addLog("✓ Retry succeeded!", 'success');
        break;

      case 'reset':
        setQueries(INITIAL_QUERIES);
        setObsCount({ "['users']": 0, "['posts', 1]": 0, "['auth', 'me']": 0 });
        setLog([]);
        break;
    }
  };

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const logColors = { info: 'var(--text-muted)', success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', action: 'var(--accent)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-code)' }}>
      {/* Header */}
      <div className="sim-panel-header">
        <span className="sim-panel-title">🔄 React Query Cache Visualizer</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
          Click actions to simulate cache behaviour
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Actions panel */}
        <div style={{
          borderRight: '1px solid var(--border)',
          padding: '12px 8px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', padding: '0 6px' }}>
            Actions
          </p>
          {ACTIONS.map(a => (
            <button
              key={a.action}
              onClick={() => simulate(a.action)}
              title={a.desc}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: a.action === 'reset' ? 'rgba(248,81,73,0.08)' : 'transparent',
                color: a.action === 'reset' ? 'var(--danger)' : 'var(--text)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 500,
                textAlign: 'left',
                transition: 'all 0.15s',
                lineHeight: 1.3,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = a.action === 'reset' ? 'rgba(248,81,73,0.08)' : 'transparent'}
            >
              {a.label}
              <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                {a.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Cache state */}
        <div style={{ borderRight: '1px solid var(--border)', padding: '12px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Cache State
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {queries.map(q => (
              <div key={q.key} className="rq-query">
                <div className="rq-key">{q.key}</div>
                <div className="rq-state">
                  <span className={`rq-badge ${STATUS_COLORS[q.status] || 'idle'}`}>
                    {q.status}
                  </span>
                  {q.stale && <span className="rq-badge stale">stale</span>}
                  {obsCount[q.key] > 0 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', padding: '2px 6px' }}>
                      {obsCount[q.key]} observer{obsCount[q.key] !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {q.fetchCount > 0 && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                    fetched: {q.fetchCount}×
                  </div>
                )}
                {q.data && (
                  <pre style={{
                    marginTop: '6px',
                    padding: '6px 8px',
                    background: 'var(--bg-code)',
                    borderRadius: '4px',
                    fontSize: '0.67rem',
                    color: '#e6edf3',
                    overflow: 'auto',
                    maxHeight: '80px',
                  }}>
                    {JSON.stringify(q.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event log */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Event Log
            </p>
            <button onClick={() => setLog([])} style={{ fontSize: '0.65rem', background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
              Clear
            </button>
          </div>
          <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {log.length === 0 && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                // Click an action to start simulation
              </p>
            )}
            {log.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-faint)', flexShrink: 0 }}>{entry.time}</span>
                <span style={{ color: logColors[entry.type] }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

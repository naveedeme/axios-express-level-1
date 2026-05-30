import { useState, useRef, useCallback } from 'react';

const EXAMPLES = {
  'Promise.all': `// Parallel requests with Promise.all
const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));

async function fetchDashboard() {
  console.log('Starting parallel fetches...');
  const start = Date.now();
  
  const [users, posts, todos] = await Promise.all([
    delay(300, [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]),
    delay(400, [{ id: 1, title: 'Hello World' }]),
    delay(200, [{ id: 1, task: 'Learn React Query', done: false }]),
  ]);
  
  console.log(\`Done in \${Date.now() - start}ms (vs ~900ms sequential)\`);
  console.log('Users:', users);
  console.log('Posts:', posts);
  console.log('Todos:', todos);
}

fetchDashboard();`,

  'Async/Await': `// Async/await error handling patterns
async function getUser(id) {
  if (id <= 0) throw new Error('Invalid ID');
  await new Promise(r => setTimeout(r, 100));
  return { id, name: \`User \${id}\`, role: id === 1 ? 'admin' : 'user' };
}

async function main() {
  // Pattern 1: try/catch
  try {
    const user = await getUser(1);
    console.log('Got user:', user);
    
    const bad = await getUser(-1);
  } catch (err) {
    console.error('Caught error:', err.message);
  }
  
  // Pattern 2: .catch()
  const user2 = await getUser(2).catch(e => ({ error: e.message }));
  console.log('User2:', user2);
  
  // Pattern 3: Promise.allSettled for partial failures
  const results = await Promise.allSettled([
    getUser(1),
    getUser(-99),
    getUser(3),
  ]);
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') console.log(\`Query \${i}: OK\`, r.value);
    else console.warn(\`Query \${i}: FAILED\`, r.reason.message);
  });
}

main();`,

  'Middleware': `// Simulating Express middleware chain
function createApp() {
  const middlewares = [];
  
  const use = (fn) => middlewares.push(fn);
  
  const handle = async (req) => {
    let idx = 0;
    const next = async () => {
      if (idx < middlewares.length) {
        await middlewares[idx++](req, next);
      }
    };
    await next();
    return req;
  };
  
  return { use, handle };
}

const app = createApp();

// Logger middleware
app.use(async (req, next) => {
  console.log(\`[LOG] \${req.method} \${req.url}\`);
  req.startTime = Date.now();
  await next();
  console.log(\`[LOG] Completed in \${Date.now() - req.startTime}ms\`);
});

// Auth middleware
app.use(async (req, next) => {
  if (!req.token) {
    req.error = 'Unauthorized';
    return;
  }
  req.user = { id: 1, role: 'admin' };
  console.log('[AUTH] User attached:', req.user);
  await next();
});

// Route handler
app.use(async (req) => {
  console.log('[ROUTE] Handling request for user:', req.user);
  req.response = { data: 'Hello, ' + req.user.role };
});

// Test with auth
const req1 = { method: 'GET', url: '/api/users', token: 'secret123' };
app.handle(req1).then(r => console.log('Response:', r.response));

// Test without auth  
const req2 = { method: 'GET', url: '/api/admin', token: null };
app.handle(req2).then(r => console.log('Error:', r.error));`,

  'React Query Cache': `// Simulating React Query cache behavior
class QueryCache {
  constructor() {
    this.cache = new Map();
    this.staleTime = 5000;
  }
  
  isStale(key) {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.fetchedAt > this.staleTime;
  }
  
  async fetch(key, queryFn) {
    const cached = this.cache.get(key);
    
    if (cached && !this.isStale(key)) {
      console.log(\`[CACHE HIT] "\${key}" - returning cached data\`);
      return cached.data;
    }
    
    if (cached) {
      console.log(\`[STALE] "\${key}" - showing stale, fetching fresh...\`);
    } else {
      console.log(\`[MISS] "\${key}" - fetching...\`);
    }
    
    const data = await queryFn();
    this.cache.set(key, { data, fetchedAt: Date.now() });
    console.log(\`[STORED] "\${key}"\`);
    return data;
  }
  
  invalidate(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      entry.fetchedAt = 0; // mark stale
      console.log(\`[INVALIDATED] "\${key}"\`);
    }
  }
}

const cache = new QueryCache();
const fakeApi = () => new Promise(r => setTimeout(() => r({ users: ['Alice', 'Bob'] }), 200));

async function simulate() {
  // First fetch — miss
  await cache.fetch('users', fakeApi);
  
  // Second fetch — cache hit (within staleTime)
  await cache.fetch('users', fakeApi);
  
  // After mutation — invalidate
  cache.invalidate('users');
  
  // Fetch again — stale, refetches
  await cache.fetch('users', fakeApi);
  
  console.log('\\nCache state:', 
    [...cache.cache.entries()].map(([k,v]) => ({
      key: k, stale: cache.isStale(k)
    }))
  );
}

simulate();`,
};

export default function JSSimulator() {
  const [code, setCode]     = useState(EXAMPLES['Promise.all']);
  const [output, setOutput] = useState('// Output will appear here\n// Click ▶ Run to execute');
  const [running, setRunning] = useState(false);
  const [example, setExample] = useState('Promise.all');

  const runCode = useCallback(async () => {
    setRunning(true);
    setOutput('');

    const logs = [];
    const origLog   = console.log;
    const origWarn  = console.warn;
    const origError = console.error;

    const capture = (prefix) => (...args) => {
      const line = args.map(a => {
        if (typeof a === 'object') {
          try { return JSON.stringify(a, null, 2); } catch { return String(a); }
        }
        return String(a);
      }).join(' ');
      logs.push(`${prefix}${line}`);
      setOutput(logs.join('\n'));
    };

    console.log   = capture('');
    console.warn  = capture('[warn] ');
    console.error = capture('[error] ');

    try {
      const fn = new Function('console', `
        return (async () => {
          ${code}
        })();
      `);
      await fn({ log: capture(''), warn: capture('[warn] '), error: capture('[error] ') });
      await new Promise(r => setTimeout(r, 100)); // flush async
    } catch (err) {
      logs.push(`\n[RUNTIME ERROR] ${err.message}`);
      setOutput(logs.join('\n'));
    } finally {
      console.log   = origLog;
      console.warn  = origWarn;
      console.error = origError;
      setRunning(false);
    }
  }, [code]);

  const selectExample = (key) => {
    setExample(key);
    setCode(EXAMPLES[key]);
    setOutput('// Output will appear here\n// Click ▶ Run to execute');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="sim-panel-header">
        <span className="sim-panel-title">⚡ JS / Node.js Sandbox</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.keys(EXAMPLES).map(k => (
            <button
              key={k}
              className={`sim-tab ${example === k ? 'active' : ''}`}
              onClick={() => selectExample(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Editor + Output split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          <div className="sim-panel-header" style={{ padding: '8px 14px' }}>
            <span className="sim-panel-title" style={{ fontSize: '0.68rem' }}>📝 EDITOR</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="sim-clear-btn"
                onClick={() => { setCode(''); setOutput(''); }}
              >
                Clear
              </button>
              <button
                className="sim-run-btn"
                onClick={runCode}
                disabled={running}
              >
                {running
                  ? <><span className="animate-spin">⟳</span> Running</>
                  : <>▶ Run</>}
              </button>
            </div>
          </div>
          <textarea
            className="sim-textarea"
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            onKeyDown={e => {
              // Tab inserts spaces
              if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                const val = e.target.value;
                setCode(val.slice(0, s) + '  ' + val.slice(e.target.selectionEnd));
                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
              }
              // Ctrl+Enter runs
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runCode();
            }}
            placeholder="// Write JavaScript here...\n// Ctrl+Enter to run"
          />
        </div>

        {/* Output */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="sim-panel-header" style={{ padding: '8px 14px' }}>
            <span className="sim-panel-title" style={{ fontSize: '0.68rem' }}>📤 OUTPUT</span>
            <button
              className="sim-clear-btn"
              onClick={() => setOutput('')}
            >
              Clear
            </button>
          </div>
          <pre className="sim-output">{output}</pre>
        </div>
      </div>

      <div style={{
        padding: '6px 16px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        fontSize: '0.7rem',
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-mono)'
      }}>
        Ctrl+Enter to run · Tab for indent · console.log() outputs here · async/await supported
      </div>
    </div>
  );
}

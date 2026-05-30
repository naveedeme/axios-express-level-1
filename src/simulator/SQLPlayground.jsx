import { useState } from 'react';

// In-memory SQLite-like engine (subset of SQL)
// We simulate a small database with fake tables

const FAKE_DB = {
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', created_at: '2024-01-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', created_at: '2024-02-20' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user', created_at: '2024-03-10' },
    { id: 4, name: 'David Lee', email: 'david@example.com', role: 'editor', created_at: '2024-04-05' },
    { id: 5, name: 'Eva Martinez', email: 'eva@example.com', role: 'user', created_at: '2024-05-01' },
  ],
  products: [
    { id: 1, name: 'Laptop Pro', price: 1299.99, category: 'Electronics', stock: 50 },
    { id: 2, name: 'Wireless Mouse', price: 49.99, category: 'Electronics', stock: 200 },
    { id: 3, name: 'Standing Desk', price: 499.99, category: 'Furniture', stock: 30 },
    { id: 4, name: 'Monitor 4K', price: 799.99, category: 'Electronics', stock: 80 },
    { id: 5, name: 'Office Chair', price: 349.99, category: 'Furniture', stock: 45 },
    { id: 6, name: 'Headphones', price: 199.99, category: 'Electronics', stock: 120 },
  ],
  orders: [
    { id: 1, user_id: 1, product_id: 1, quantity: 1, total: 1299.99, status: 'delivered', created_at: '2024-05-01' },
    { id: 2, user_id: 2, product_id: 3, quantity: 1, total: 499.99, status: 'shipped', created_at: '2024-05-10' },
    { id: 3, user_id: 1, product_id: 2, quantity: 2, total: 99.98, status: 'delivered', created_at: '2024-05-15' },
    { id: 4, user_id: 3, product_id: 4, quantity: 1, total: 799.99, status: 'pending', created_at: '2024-05-20' },
    { id: 5, user_id: 4, product_id: 6, quantity: 1, total: 199.99, status: 'delivered', created_at: '2024-05-22' },
  ],
};

const PG_EXAMPLES = [
  { label: 'SELECT all users', sql: 'SELECT * FROM users;' },
  { label: 'Filter by role', sql: "SELECT id, name, email FROM users\nWHERE role = 'admin';"},
  { label: 'COUNT & GROUP', sql: 'SELECT role, COUNT(*) AS count\nFROM users\nGROUP BY role\nORDER BY count DESC;' },
  { label: 'JOIN orders', sql: 'SELECT u.name, o.total, o.status\nFROM orders o\nJOIN users u ON o.user_id = u.id\nORDER BY o.created_at DESC;' },
  { label: 'Aggregate products', sql: 'SELECT category,\n  COUNT(*) AS items,\n  AVG(price) AS avg_price,\n  SUM(stock) AS total_stock\nFROM products\nGROUP BY category;' },
  { label: 'Parameterized ($1)', sql: '-- Parameterized query (PostgreSQL)\n-- $1 = \'Electronics\'\nSELECT * FROM products\nWHERE category = $1\nORDER BY price DESC;' },
];

const SQL_EXAMPLES = [
  { label: 'SELECT users', sql: 'SELECT * FROM users;' },
  { label: 'With TOP', sql: 'SELECT TOP 3 * FROM products\nORDER BY price DESC;' },
  { label: 'Named param', sql: '-- SQL Server parameterized\n-- @category = \'Electronics\'\nSELECT * FROM products\nWHERE category = @category;' },
  { label: 'JOIN', sql: 'SELECT u.name, p.name AS product, o.total\nFROM orders o\nINNER JOIN users u ON o.user_id = u.id\nINNER JOIN products p ON o.product_id = p.id;' },
];

function executeSimulatedSQL(sql) {
  const clean = sql.replace(/--[^\n]*/g, '').replace(/\n/g, ' ').trim();

  // Skip if parameterized placeholder query
  if (clean.includes('$1') || clean.includes('@category') || clean.includes('@')) {
    return {
      note: '📝 Parameterized query shown for reference only. In real code:\n  pg:   pool.query(sql, [value])\n  mssql: request.input(\'name\', type, value).query(sql)',
      rows: [],
      columns: [],
    };
  }

  const selectMatch = clean.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(.*)/i);
  if (!selectMatch) return { error: 'Only SELECT queries supported in playground' };

  const [, cols, tableName, rest] = selectMatch;
  const table = FAKE_DB[tableName.toLowerCase()];
  if (!table) return { error: `Table "${tableName}" not found. Available: ${Object.keys(FAKE_DB).join(', ')}` };

  let rows = [...table];

  // JOIN
  const joinMatch = rest.match(/JOIN\s+(\w+)\s+\w+\s+ON\s+([\w.]+)\s*=\s*([\w.]+)/i);
  if (joinMatch) {
    const [, joinTable, leftKey, rightKey] = joinMatch;
    const jTable = FAKE_DB[joinTable.toLowerCase()];
    if (!jTable) return { error: `Join table "${joinTable}" not found` };
    const lField = leftKey.split('.')[1];
    const rField = rightKey.split('.')[1];
    rows = rows.map(row => {
      const match = jTable.find(jr => jr[rField] === row[lField] || jr[lField] === row[rField]);
      return match ? { ...row, ...Object.fromEntries(Object.entries(match).map(([k,v]) => [`${joinTable[0]}.${k}`, v])) } : row;
    }).filter(Boolean);
  }

  // WHERE
  const whereMatch = rest.match(/WHERE\s+([\w.]+)\s*=\s*['"]?([^'"]+)['"]?/i);
  if (whereMatch) {
    const [, field, value] = whereMatch;
    const f = field.includes('.') ? field.split('.')[1] : field;
    rows = rows.filter(r => String(r[f]).toLowerCase() === value.trim().toLowerCase());
  }

  // GROUP BY + COUNT/AVG/SUM
  const groupMatch = rest.match(/GROUP\s+BY\s+(\w+)/i);
  if (groupMatch) {
    const groupField = groupMatch[1];
    const groups = {};
    rows.forEach(r => {
      const key = r[groupField];
      if (!groups[key]) groups[key] = { [groupField]: key, count: 0, items: [] };
      groups[key].count++;
      groups[key].items.push(r);
    });
    rows = Object.values(groups).map(g => {
      const res = { [groupField]: g[groupField] };
      if (/COUNT/i.test(cols)) res.count = g.count;
      if (/AVG\(price\)/i.test(cols)) res.avg_price = (g.items.reduce((s,i) => s+i.price,0)/g.count).toFixed(2);
      if (/SUM\(stock\)/i.test(cols)) res.total_stock = g.items.reduce((s,i) => s+(i.stock||0),0);
      if (/SUM\(total\)/i.test(cols)) res.total_revenue = g.items.reduce((s,i) => s+(i.total||0),0).toFixed(2);
      return res;
    });
  }

  // ORDER BY
  const orderMatch = rest.match(/ORDER\s+BY\s+(\w+)(?:\s+(DESC|ASC))?/i);
  if (orderMatch) {
    const [, field, dir] = orderMatch;
    rows.sort((a, b) => {
      const av = a[field], bv = b[field];
      if (typeof av === 'number') return dir?.toUpperCase() === 'DESC' ? bv - av : av - bv;
      return dir?.toUpperCase() === 'DESC'
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }

  // TOP N (SQL Server)
  const topMatch = clean.match(/SELECT TOP (\d+)/i);
  if (topMatch) rows = rows.slice(0, parseInt(topMatch[1]));

  // LIMIT
  const limitMatch = rest.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) rows = rows.slice(0, parseInt(limitMatch[1]));

  // SELECT columns
  let columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  if (cols.trim() !== '*') {
    const requested = cols.split(',').map(c => c.trim().replace(/.*\s+AS\s+(\w+)/i, '$1').replace(/\w+\.\w+/, m => m.split('.')[1]));
    // allow partial match
    columns = columns.filter(c => requested.some(r => c.toLowerCase().includes(r.toLowerCase())));
    if (columns.length === 0) columns = Object.keys(rows[0] || {});
  }

  return { rows, columns };
}

export default function SQLPlayground() {
  const [db, setDb]           = useState('postgresql');
  const [sql, setSql]         = useState(PG_EXAMPLES[0].sql);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [elapsed, setElapsed] = useState(null);

  const examples = db === 'postgresql' ? PG_EXAMPLES : SQL_EXAMPLES;

  const runSQL = () => {
    const start = Date.now();
    setError('');
    setResult(null);
    try {
      const res = executeSimulatedSQL(sql);
      setElapsed(Date.now() - start);
      if (res.error) { setError(res.error); return; }
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
  };

  const loadExample = (ex) => {
    setSql(ex.sql);
    setResult(null);
    setError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* DB selector */}
      <div className="sql-selector">
        <button
          className={`db-badge ${db === 'postgresql' ? 'active-pg' : ''}`}
          onClick={() => { setDb('postgresql'); setSql(PG_EXAMPLES[0].sql); setResult(null); }}
        >
          🐘 PostgreSQL
        </button>
        <button
          className={`db-badge ${db === 'sqlserver' ? 'active-sql' : ''}`}
          onClick={() => { setDb('sqlserver'); setSql(SQL_EXAMPLES[0].sql); setResult(null); }}
        >
          🗄️ SQL Server
        </button>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginLeft: 'auto' }}>
          Tables: users, products, orders
        </span>
      </div>

      {/* Examples */}
      <div style={{
        padding: '6px 12px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
      }}>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(ex)}
            style={{
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              border: '1px solid var(--border)',
              borderRadius: '4px',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Editor + Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
        {/* SQL Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          <div className="sim-panel-header" style={{ padding: '8px 14px' }}>
            <span className="sim-panel-title" style={{ fontSize: '0.68rem' }}>
              {db === 'postgresql' ? '🐘 POSTGRESQL' : '🗄️ SQL SERVER'} QUERY
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="sim-clear-btn"
                onClick={() => { setSql(''); setResult(null); setError(''); }}
              >Clear</button>
              <button className="sim-run-btn" onClick={runSQL}>
                ▶ Run
              </button>
            </div>
          </div>
          <textarea
            className="sim-textarea"
            value={sql}
            onChange={e => setSql(e.target.value)}
            spellCheck={false}
            placeholder="SELECT * FROM users;"
            onKeyDown={e => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runSQL();
              if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                setSql(v => v.slice(0, s) + '  ' + v.slice(e.target.selectionEnd));
                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
              }
            }}
          />
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="sim-panel-header" style={{ padding: '8px 14px' }}>
            <span className="sim-panel-title" style={{ fontSize: '0.68rem' }}>📊 RESULTS</span>
            {result && <span style={{ fontSize: '0.68rem', color: 'var(--success)' }}>
              {result.note ? '1 note' : `${result.rows.length} row${result.rows.length !== 1 ? 's' : ''}`}
              {elapsed !== null ? ` · ${elapsed}ms` : ''}
            </span>}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
            {error && (
              <div style={{ padding: '16px', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                ❌ {error}
              </div>
            )}
            {result?.note && (
              <pre style={{ padding: '16px', color: 'var(--warning)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', whiteSpace: 'pre-wrap' }}>
                {result.note}
              </pre>
            )}
            {result && !result.note && result.rows.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr>
                    {result.columns.map(c => (
                      <th key={c} style={{
                        background: 'var(--bg-sidebar)',
                        padding: '8px 12px',
                        textAlign: 'left',
                        border: '1px solid var(--border)',
                        color: 'var(--rq)',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--bg-code)' : 'var(--bg-sidebar)' }}>
                      {result.columns.map(c => (
                        <td key={c} style={{
                          padding: '7px 12px',
                          border: '1px solid var(--border)',
                          color: typeof row[c] === 'number' ? 'var(--express)' : 'var(--text)',
                          whiteSpace: 'nowrap',
                        }}>
                          {row[c] === null ? <em style={{ color: 'var(--text-faint)' }}>NULL</em> : String(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {result && !result.note && result.rows.length === 0 && (
              <div style={{ padding: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                ✓ Query ran successfully · 0 rows returned
              </div>
            )}
            {!result && !error && (
              <div style={{ padding: '16px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                // Results will appear here{'\n'}// Ctrl+Enter to run query
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        padding: '6px 16px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        fontSize: '0.68rem',
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-mono)',
      }}>
        Ctrl+Enter to run · SELECT, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT supported · In-memory simulation
      </div>
    </div>
  );
}

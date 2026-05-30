// ============================================================
// FULLSTACK ACADEMY — 10-Day Curriculum Data
// ============================================================

export const CURRICULUM = [
  // ──────────────────────────────────────────────────────────
  // DAY 1: Express — Foundations
  // ──────────────────────────────────────────────────────────
  {
    day: 1,
    title: "Express — Server Foundations",
    subtitle: "Build your first HTTP server with routing and middleware",
    topic: "express",
    color: "#22d3ee",
    icon: "⚡",
    sections: [
      {
        id: "what-is-express",
        title: "What is Express?",
        type: "concept",
        content: `Express is a **minimal, unopinionated web framework** for Node.js. It wraps Node's built-in \`http\` module and gives you a clean API for routing, middleware, and HTTP utilities.

**What Express IS for:**
- Building REST APIs consumed by frontend apps (React, Vue, etc.)
- Serving JSON responses to clients
- Handling middleware chains (auth, logging, parsing)
- Lightweight microservices
- Prototyping backends quickly

**What Express is NOT for:**
- Full-stack SSR (use Next.js, Remix)
- Real-time apps alone (pair with Socket.io)
- Replacing databases — it has no ORM built-in
- Production auth from scratch (use Passport.js or similar)

Express sits between your database and your React frontend — it's the **bridge**.`,
        diagram: `Client (React) ──► Express Server ──► Database (PostgreSQL / SQL Server)
                          ▲
                    Middleware Stack
                 (auth, logging, parsing)`
      },
      {
        id: "installation",
        title: "Installation & Setup",
        type: "install",
        steps: [
          { label: "Create project folder", cmd: "mkdir my-api && cd my-api" },
          { label: "Initialize npm", cmd: "npm init -y" },
          { label: "Install Express", cmd: "npm install express" },
          { label: "Install dev tools", cmd: "npm install -D nodemon" },
          { label: "Add start script in package.json", cmd: `"scripts": { "dev": "nodemon index.js", "start": "node index.js" }` },
          { label: "Create your entry file", cmd: "touch index.js" }
        ]
      },
      {
        id: "first-server",
        title: "Your First Express Server",
        type: "code",
        language: "javascript",
        filename: "index.js",
        code: `const express = require('express');
const app = express();
const PORT = 3000;

// Built-in middleware to parse JSON request bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express! 🚀' });
});

// Start listening
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
        explanation: `- \`express()\` creates the app instance
- \`app.use(express.json())\` enables JSON body parsing globally
- \`app.get(path, handler)\` registers a GET route
- \`res.json()\` sends a JSON response with correct Content-Type
- \`app.listen()\` starts the HTTP server on a port`
      },
      {
        id: "routing",
        title: "Routing — GET, POST, PUT, DELETE",
        type: "code",
        language: "javascript",
        filename: "routes/users.js",
        code: `const express = require('express');
const router = express.Router();

// In-memory store (replace with DB later)
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob',   email: 'bob@example.com'   },
];

// GET all users
router.get('/', (req, res) => {
  res.json({ success: true, data: users });
});

// GET single user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, data: user });
});

// POST create user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT update user
router.put('/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx] = { ...users[idx], ...req.body };
  res.json({ success: true, data: users[idx] });
});

// DELETE user
router.delete('/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.status(204).send();
});

module.exports = router;

// In index.js, mount with:
// app.use('/api/users', require('./routes/users'));`,
        explanation: `- \`router.get('/:id')\` — dynamic segment captured via \`req.params.id\`
- Always validate input before DB operations
- Use correct HTTP status codes: 201 Created, 400 Bad Request, 404 Not Found, 204 No Content
- Separate routes into files for clean code`
      },
      {
        id: "middleware",
        title: "Middleware — The Heart of Express",
        type: "code",
        language: "javascript",
        filename: "middleware/logger.js",
        code: `// Middleware is just a function: (req, res, next) => {}
// It runs BEFORE your route handler

// ─── Custom Logger Middleware ───────────────────────────────
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(\`[\${timestamp}] \${req.method} \${req.url}\`);
  next(); // CRITICAL: call next() or the request hangs!
};

// ─── Auth Middleware ────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer secret123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { id: 1, role: 'admin' }; // attach to request
  next();
};

// ─── Error Handling Middleware (4 params!) ──────────────────
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
};

module.exports = { logger, requireAuth, errorHandler };

// ─── Usage in index.js ──────────────────────────────────────
// app.use(logger);                          // global
// app.get('/admin', requireAuth, handler);  // route-level
// app.use(errorHandler);                    // LAST — error handler`,
        explanation: `Middleware executes in order — think of it as a pipeline:

Request → logger → requireAuth → route handler → response

Key rules:
- Always call \`next()\` unless you send a response
- Error handlers need exactly 4 params \`(err, req, res, next)\`
- Place error handler LAST in \`index.js\`
- \`app.use()\` applies middleware globally; route-level scopes it`
      }
    ],
    quiz: [
      { q: "What does `next()` do in middleware?", options: ["Sends a response", "Passes control to next middleware/handler", "Skips the current route", "Restarts the server"], answer: 1 },
      { q: "Which HTTP status code means 'resource created successfully'?", options: ["200", "204", "201", "400"], answer: 2 },
      { q: "Where does `req.params.id` come from?", options: ["Query string", "Request body", "URL dynamic segment like /:id", "Headers"], answer: 2 },
      { q: "How many arguments does an Express error handler take?", options: ["2", "3", "4", "1"], answer: 2 }
    ],
    challenge: {
      title: "Build a Products API",
      description: "Create an Express server with a `/api/products` route that supports full CRUD. Each product has: id, name, price, category. Add a middleware that logs the response time for every request.",
      hints: ["Use an array as your in-memory store", "Calculate time with Date.now() in middleware", "Test with the API Tester tab in the simulator"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 2: Express — Advanced Patterns
  // ──────────────────────────────────────────────────────────
  {
    day: 2,
    title: "Express — Database & Advanced Patterns",
    subtitle: "Connect PostgreSQL & SQL Server, query data, handle errors properly",
    topic: "express",
    color: "#22d3ee",
    icon: "🗄️",
    sections: [
      {
        id: "postgresql-setup",
        title: "Connecting PostgreSQL",
        type: "install",
        steps: [
          { label: "Install pg driver", cmd: "npm install pg" },
          { label: "Install dotenv for env vars", cmd: "npm install dotenv" },
          { label: "Create .env file", cmd: `DATABASE_URL=postgresql://user:password@localhost:5432/mydb` },
          { label: "Add .env to .gitignore", cmd: "echo '.env' >> .gitignore" }
        ]
      },
      {
        id: "pg-connection",
        title: "PostgreSQL — Pool & Queries",
        type: "code",
        language: "javascript",
        filename: "db/postgres.js",
        code: `require('dotenv').config();
const { Pool } = require('pg');

// Connection pool — reuses connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // OR use individual fields:
  // host: process.env.DB_HOST,
  // port: 5432,
  // database: process.env.DB_NAME,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASS,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,           // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) return console.error('DB connection failed:', err.message);
  console.log('✅ PostgreSQL connected');
  release();
});

// ─── Helper query function ───────────────────────────────────
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };

// ─── Usage in a route ────────────────────────────────────────
// const { query } = require('../db/postgres');
//
// router.get('/users', async (req, res, next) => {
//   try {
//     const { rows } = await query('SELECT * FROM users ORDER BY id');
//     res.json({ data: rows });
//   } catch (err) {
//     next(err); // passes to error handler middleware
//   }
// });`,
        explanation: `**Pool vs Client:**
- Use \`Pool\` — it manages multiple connections automatically
- Never use a single \`Client\` in production (one connection blocks!)

**Parameterized queries** prevent SQL injection:
\`query('SELECT * FROM users WHERE id = $1', [userId])\`

Always \`$1, $2\` placeholders — never string interpolation.`
      },
      {
        id: "sqlserver-setup",
        title: "Connecting SQL Server (mssql)",
        type: "install",
        steps: [
          { label: "Install mssql driver", cmd: "npm install mssql" },
          { label: "Set env vars in .env", cmd: `DB_SERVER=localhost\nDB_PORT=1433\nDB_NAME=mydb\nDB_USER=sa\nDB_PASS=YourPassword` }
        ]
      },
      {
        id: "sqlserver-connection",
        title: "SQL Server — Connection & Queries",
        type: "code",
        language: "javascript",
        filename: "db/sqlserver.js",
        code: `require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  options: {
    encrypt: true,           // Azure requires true
    trustServerCertificate:  // dev: true, prod: false
      process.env.NODE_ENV !== 'production',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        console.log('✅ SQL Server connected');
        return pool;
      })
      .catch(err => {
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

// ─── Usage in a route ────────────────────────────────────────
// const { getPool, sql } = require('../db/sqlserver');
//
// router.get('/products', async (req, res, next) => {
//   try {
//     const pool = await getPool();
//     const result = await pool.request()
//       .input('category', sql.NVarChar, req.query.category)
//       .query('SELECT * FROM products WHERE category = @category');
//     res.json({ data: result.recordset });
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = { getPool, sql };`,
        explanation: `**Key differences from PostgreSQL:**
- Parameters use \`@name\` syntax instead of \`$1\`
- Always call \`.input('name', sql.DataType, value)\` before query
- \`result.recordset\` contains the rows (not \`rows\`)
- Use \`sql.NVarChar\`, \`sql.Int\`, \`sql.DateTime\` for type safety`
      },
      {
        id: "error-handling",
        title: "Production Error Handling",
        type: "code",
        language: "javascript",
        filename: "middleware/errorHandler.js",
        code: `// ─── Custom Error Class ──────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from bugs
  }
}

// ─── Async wrapper — eliminates try/catch in every route ─────
const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── Global Error Handler ────────────────────────────────────
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Something went wrong'; // hide internal errors from client

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      error: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ error: message });
};

module.exports = { AppError, catchAsync, globalErrorHandler };

// ─── Clean route with catchAsync ─────────────────────────────
// const { catchAsync, AppError } = require('../middleware/errorHandler');
//
// router.get('/:id', catchAsync(async (req, res) => {
//   const { rows } = await query(
//     'SELECT * FROM users WHERE id = $1',
//     [req.params.id]
//   );
//   if (!rows.length) throw new AppError('User not found', 404);
//   res.json({ data: rows[0] });
// }));`,
        explanation: `The \`catchAsync\` wrapper eliminates repetitive try/catch blocks. Any thrown error automatically flows to the global error handler via \`next(err)\`.

This is a real production pattern used at scale.`
      },
      {
        id: "cors-security",
        title: "CORS & Security Headers",
        type: "code",
        language: "javascript",
        filename: "index.js (security section)",
        code: `const cors = require('cors');
const helmet = require('helmet');

// npm install cors helmet

// ─── CORS: allow your React dev server ───────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourapp.com'
    : 'http://localhost:5173', // Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Helmet: sets secure HTTP headers ────────────────────────
app.use(helmet());

// ─── Rate limiting ───────────────────────────────────────────
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests
  message: { error: 'Too many requests, please try again later.' }
}));`,
        explanation: `**CORS** — Cross-Origin Resource Sharing — must be configured when your React app (port 5173) calls your Express API (port 3000). Without it, browsers block the requests.

**Helmet** sets ~14 security headers automatically (X-Frame-Options, Content-Security-Policy, etc.).`
      }
    ],
    quiz: [
      { q: "Which PostgreSQL placeholder syntax prevents SQL injection?", options: ["?", "${id}", "$1, $2", "@id"], answer: 2 },
      { q: "In mssql (SQL Server), rows are in:", options: ["result.rows", "result.data", "result.recordset", "result.records"], answer: 2 },
      { q: "What does `catchAsync` do?", options: ["Catches sync errors", "Wraps async routes to auto-pass errors to next()", "Retries failed queries", "Logs errors"], answer: 1 },
      { q: "CORS is needed when:", options: ["Frontend and backend are same origin", "They run on different ports/domains", "Using HTTPS", "Using PostgreSQL"], answer: 1 }
    ],
    challenge: {
      title: "Full CRUD API with PostgreSQL",
      description: "Build a `/api/posts` endpoint that reads from a posts table in PostgreSQL (or mock it). Support filtering by `?category=tech`. Add CORS for localhost:5173 and a rate limiter of 50 requests per 15 minutes.",
      hints: ["Use query params: req.query.category", "Build the SQL dynamically: category ? 'WHERE category = $1' : ''", "Test with the API tester"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 3: Axios — HTTP Client Fundamentals
  // ──────────────────────────────────────────────────────────
  {
    day: 3,
    title: "Axios — HTTP Client Fundamentals",
    subtitle: "Make HTTP requests from React with the most popular HTTP client",
    topic: "axios",
    color: "#a78bfa",
    icon: "🌐",
    sections: [
      {
        id: "what-is-axios",
        title: "What is Axios?",
        type: "concept",
        content: `Axios is a **promise-based HTTP client** for the browser and Node.js. It wraps the browser's \`fetch\` API (and Node's \`http\`) with a friendlier interface and powerful features.

**What Axios IS for:**
- Making HTTP requests from React to your Express API
- Intercepting requests/responses globally (add auth tokens, handle errors)
- Cancelling requests (important for React useEffect cleanup)
- Automatic JSON serialization/deserialization
- Upload progress tracking

**What Axios is NOT for:**
- Replacing React Query (Axios fetches, React Query manages state)
- Real-time communication (use WebSockets/SSE)
- File system access or server-side DB queries

**Axios vs fetch:**
| Feature | Axios | fetch |
|---------|-------|-------|
| Auto JSON parse | ✅ | ❌ (need .json()) |
| Interceptors | ✅ | ❌ |
| Request cancel | ✅ | Workaround needed |
| Error on 4xx/5xx | ✅ | ❌ (need to check res.ok) |
| Upload progress | ✅ | Limited |
| Browser support | ✅ IE11+ | Modern only |`,
      },
      {
        id: "axios-install",
        title: "Installation in React/Vite Project",
        type: "install",
        steps: [
          { label: "Install Axios", cmd: "npm install axios" },
          { label: "Create API instance file", cmd: "touch src/api/axiosInstance.js" }
        ]
      },
      {
        id: "axios-instance",
        title: "Creating a Configured Axios Instance",
        type: "code",
        language: "javascript",
        filename: "src/api/axiosInstance.js",
        code: `import axios from 'axios';

// ─── Base instance ────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,          // abort if no response in 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach auth token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data, // unwrap .data automatically!
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Build a meaningful error message
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;`,
        explanation: `**Why a custom instance?**
- Set baseURL once — no repetition in every component
- Interceptors attach auth tokens globally
- The response interceptor unwraps \`.data\` so you get the actual payload directly
- Centralised 401 handling redirects to login everywhere`
      },
      {
        id: "axios-methods",
        title: "GET, POST, PUT, DELETE with Axios",
        type: "code",
        language: "javascript",
        filename: "src/api/users.js",
        code: `import api from './axiosInstance';

// ─── All API functions return promises ────────────────────────

// GET all users (with optional query params)
export const getUsers = (params = {}) =>
  api.get('/users', { params }); // ?page=1&limit=10

// GET single user
export const getUser = (id) =>
  api.get(\`/users/\${id}\`);

// POST create user
export const createUser = (data) =>
  api.post('/users', data);

// PUT replace entire user
export const updateUser = (id, data) =>
  api.put(\`/users/\${id}\`, data);

// PATCH partial update
export const patchUser = (id, changes) =>
  api.patch(\`/users/\${id}\`, changes);

// DELETE user
export const deleteUser = (id) =>
  api.delete(\`/users/\${id}\`);

// ─── File upload with progress ────────────────────────────────
export const uploadAvatar = (id, file, onProgress) => {
  const form = new FormData();
  form.append('avatar', file);
  return api.post(\`/users/\${id}/avatar\`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / e.total);
      onProgress?.(percent);
    },
  });
};`,
        explanation: `Keep API calls in separate files — never inline \`axios.get\` in components. This makes it easy to:
- Mock in tests
- Swap the HTTP library
- Reuse across components

Always pass query params via \`{ params: {} }\` — Axios serializes them correctly.`
      },
      {
        id: "axios-react",
        title: "Using Axios in React Components",
        type: "code",
        language: "jsx",
        filename: "src/components/UserList.jsx",
        code: `import { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../api/users';

export default function UserList() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false; // prevent state update after unmount

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();
    return () => { cancelled = true; }; // cleanup!
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(\`Failed: \${err.message}\`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error)   return <p style={{color:'red'}}>Error: {error}</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} — {user.email}
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}`,
        explanation: `⚠️ **This works** but has problems:
- Manual loading/error state in every component
- No caching — refetches on every mount
- Stale data after mutation
- \`cancelled\` flag is a workaround

**Day 5 solves all this with React Query.** But understanding raw Axios first helps you appreciate why React Query exists.`
      },
      {
        id: "axios-abort",
        title: "Request Cancellation with AbortController",
        type: "code",
        language: "javascript",
        filename: "src/hooks/useAxiosFetch.js",
        code: `import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

// Custom hook — cleaner than repeating fetch logic
export function useAxiosFetch(url, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.get(url, {
          signal: controller.signal // link to abort controller
        });
        setData(result);
      } catch (err) {
        if (err.name !== 'CanceledError') { // ignore intentional cancel
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => controller.abort(); // cancel on unmount / dep change
  }, deps);

  return { data, loading, error };
}

// ─── Usage ───────────────────────────────────────────────────
// const { data: users, loading, error } = useAxiosFetch('/users');`,
        explanation: `When a user navigates away or a dependency changes, the in-flight request is cancelled — preventing "setState on unmounted component" warnings and wasted bandwidth.

In React Query (Day 5), this is handled automatically.`
      }
    ],
    quiz: [
      { q: "What does `axios.interceptors.response.use` let you do?", options: ["Block all requests", "Transform responses globally before components receive them", "Add request headers", "Configure baseURL"], answer: 1 },
      { q: "Why pass query params as `{ params: {} }` instead of string concatenation?", options: ["It's faster", "Axios handles encoding correctly", "It's required syntax", "For TypeScript support"], answer: 1 },
      { q: "What does `AbortController` do in Axios?", options: ["Retries failed requests", "Cancels in-flight requests on cleanup", "Caches responses", "Adds auth headers"], answer: 1 },
      { q: "Where should Axios API functions live?", options: ["Directly in components", "In a separate api/ folder", "In Redux store", "In package.json"], answer: 1 }
    ],
    challenge: {
      title: "Build an Axios API Layer",
      description: "Create a complete Axios instance with: baseURL pointing to jsonplaceholder.typicode.com/api, a request interceptor that adds a custom header X-App-Version: 1.0, a response interceptor that logs all errors, and three functions: getPosts(), getPost(id), createPost(data). Consume them in a component that shows loading/error states.",
      hints: ["Use JSONPlaceholder as free test API: https://jsonplaceholder.typicode.com", "Check Network tab to verify custom header", "Test the error state by changing baseURL to something invalid"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 4: Axios — Advanced Patterns
  // ──────────────────────────────────────────────────────────
  {
    day: 4,
    title: "Axios — Advanced Patterns",
    subtitle: "Interceptors, retry logic, concurrent requests & TypeScript types",
    topic: "axios",
    color: "#a78bfa",
    icon: "🔧",
    sections: [
      {
        id: "retry-logic",
        title: "Retry Logic with Axios",
        type: "code",
        language: "javascript",
        filename: "src/api/axiosInstance.js (with retry)",
        code: `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// ─── Retry Interceptor ────────────────────────────────────────
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

api.interceptors.response.use(null, async (error) => {
  const config = error.config;

  // Only retry network errors and 5xx server errors
  const shouldRetry =
    !error.response || // network error
    error.response.status >= 500;

  if (!shouldRetry) return Promise.reject(error);

  config._retryCount = (config._retryCount || 0) + 1;

  if (config._retryCount > MAX_RETRIES) {
    return Promise.reject(error);
  }

  // Exponential backoff: 1s, 2s, 4s
  const delay = RETRY_DELAY * 2 ** (config._retryCount - 1);
  await new Promise(resolve => setTimeout(resolve, delay));

  console.log(\`Retry \${config._retryCount}/\${MAX_RETRIES} for \${config.url}\`);
  return api(config); // retry the request
});

export default api;`,
        explanation: `Retry logic is essential for resilient apps. This pattern:
- Retries up to 3 times on network errors or server failures
- Uses **exponential backoff** (waits longer each retry)
- Does NOT retry 4xx errors (those are client mistakes)
- Tracks retry count in the config object`
      },
      {
        id: "concurrent-requests",
        title: "Concurrent & Parallel Requests",
        type: "code",
        language: "javascript",
        filename: "src/api/dashboard.js",
        code: `import api from './axiosInstance';

// ─── Sequential (slow — each waits for previous) ─────────────
async function slowDashboard() {
  const users    = await api.get('/users');    // 300ms
  const posts    = await api.get('/posts');    // 400ms
  const comments = await api.get('/comments');// 200ms
  // Total: ~900ms
  return { users, posts, comments };
}

// ─── Parallel with axios.all / Promise.all (fast!) ───────────
async function fastDashboard() {
  const [users, posts, comments] = await Promise.all([
    api.get('/users'),
    api.get('/posts'),
    api.get('/comments'),
  ]);
  // Total: ~400ms (slowest request)
  return { users, posts, comments };
}

// ─── Parallel with individual error handling ─────────────────
async function resilientDashboard() {
  const results = await Promise.allSettled([
    api.get('/users'),
    api.get('/posts'),
    api.get('/comments'),
  ]);

  return results.map((result, i) => {
    const keys = ['users', 'posts', 'comments'];
    if (result.status === 'fulfilled') {
      return { key: keys[i], data: result.value, error: null };
    }
    return { key: keys[i], data: null, error: result.reason.message };
  });
  // Individual failures don't break the whole dashboard
}`,
        explanation: `**Promise.all** — all or nothing. If one fails, all fail.
**Promise.allSettled** — each resolves independently. Use for dashboards where partial data is better than nothing.

Always prefer parallel requests when data is independent!`
      },
      {
        id: "axios-env",
        title: "Environment Configuration with Vite",
        type: "code",
        language: "javascript",
        filename: ".env files",
        code: `# ─── .env.development ───────────────────────────────────────
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MyApp Dev

# ─── .env.production ─────────────────────────────────────────
VITE_API_URL=https://api.myapp.com/api
VITE_APP_NAME=MyApp

# ─── Usage in code ───────────────────────────────────────────
# import.meta.env.VITE_API_URL
# import.meta.env.VITE_APP_NAME
# import.meta.env.MODE         // 'development' | 'production'
# import.meta.env.DEV          // true in dev
# import.meta.env.PROD         // true in production

# ─── Rules ───────────────────────────────────────────────────
# ✅ Must start with VITE_ to be exposed to browser code
# ❌ NEVER put secrets/API keys in VITE_ vars (they're public!)
# ✅ Real secrets go in .env on the SERVER (Express), not React`,
        explanation: `Vite uses \`import.meta.env\` (not \`process.env\`). Only variables prefixed with \`VITE_\` are exposed to the browser bundle.

⚠️ Everything in your React bundle is visible to users — never put database passwords or secret keys there. Those live in the Express server's \`.env\`.`
      },
      {
        id: "typescript-axios",
        title: "Typing Axios Responses",
        type: "code",
        language: "typescript",
        filename: "src/api/users.ts",
        code: `import api from './axiosInstance';

// ─── Define your data shapes ──────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number };
}

// ─── Typed API functions ──────────────────────────────────────
export const getUsers = () =>
  api.get<ApiResponse<User[]>>('/users');

export const getUser = (id: number) =>
  api.get<ApiResponse<User>>(\`/users/\${id}\`);

export const createUser = (data: Omit<User, 'id' | 'createdAt'>) =>
  api.post<ApiResponse<User>>('/users', data);

// ─── Axios generic type parameter ────────────────────────────
// axios.get<T>(url) means response.data will be type T
// The response interceptor in axiosInstance.ts should also be typed:
//
// api.interceptors.response.use(
//   (response: AxiosResponse) => response.data,
//   ...
// );`,
        explanation: `TypeScript generics on Axios calls give you full autocomplete and type safety. \`api.get<ApiResponse<User[]>>\` tells TS what shape the response has.

Combine with \`Omit<User, 'id'>\` to create clean input types that exclude server-generated fields.`
      }
    ],
    quiz: [
      { q: "When should you NOT retry an Axios request?", options: ["On 500 errors", "On network timeouts", "On 404 or 400 errors", "When server is down"], answer: 2 },
      { q: "What's the difference between Promise.all and Promise.allSettled?", options: ["No difference", "allSettled waits longer", "all fails if any rejects; allSettled captures each result", "all is newer"], answer: 2 },
      { q: "In Vite, how do you access environment variables?", options: ["process.env.VAR", "env.VAR", "import.meta.env.VITE_VAR", "window.env.VAR"], answer: 2 },
      { q: "Why should secrets never go in VITE_ env vars?", options: ["Vite doesn't support them", "They're bundled into public JS", "They break builds", "Performance reasons"], answer: 1 }
    ],
    challenge: {
      title: "Resilient Dashboard Fetcher",
      description: "Build a `useDashboard` hook that fetches users, posts, and todos from JSONPlaceholder in parallel using Promise.allSettled. If any request fails, show a partial dashboard with an error indicator for the failed section. Add retry logic (max 2 retries) to your Axios instance.",
      hints: ["https://jsonplaceholder.typicode.com/users", "https://jsonplaceholder.typicode.com/posts", "Track per-section error state separately"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 5: React Query — Foundations
  // ──────────────────────────────────────────────────────────
  {
    day: 5,
    title: "React Query — Data Fetching Reimagined",
    subtitle: "Why React Query exists and how useQuery transforms your components",
    topic: "react-query",
    color: "#f59e0b",
    icon: "🔄",
    sections: [
      {
        id: "why-react-query",
        title: "Why React Query Exists",
        type: "concept",
        content: `React Query solves the **server state problem**. There are two kinds of state in React apps:

**Client State** (what useState handles):
- UI state: modals open/closed, form inputs, selected tab

**Server State** (what React Query handles):
- Data that lives on the server
- Needs to be fetched asynchronously
- Can become stale (someone else changed it)
- Needs caching, refetching, synchronization

Without React Query, you write this for every piece of server data:
\`\`\`js
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
// + useEffect + cleanup + refetch logic...
\`\`\`

With React Query:
\`\`\`js
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
});
\`\`\`

**What React Query gives you for free:**
- Caching (same data, no duplicate requests)
- Background refetching (data stays fresh)
- Stale-while-revalidate (show old data, fetch new)
- Request deduplication
- Pagination & infinite scroll helpers
- Optimistic updates
- Devtools for state inspection`,
      },
      {
        id: "rq-install",
        title: "Installation",
        type: "install",
        steps: [
          { label: "Install React Query", cmd: "npm install @tanstack/react-query" },
          { label: "Install devtools (optional but great)", cmd: "npm install @tanstack/react-query-devtools" },
          { label: "Wrap your app in QueryClientProvider", cmd: "Edit src/main.jsx (see next section)" }
        ]
      },
      {
        id: "rq-setup",
        title: "Setting Up QueryClientProvider",
        type: "code",
        language: "jsx",
        filename: "src/main.jsx",
        code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

// Create the client with global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // data fresh for 5 minutes
      gcTime: 10 * 60 * 1000,    // cache kept for 10 minutes (was cacheTime in v4)
      retry: 2,                   // retry failed queries twice
      refetchOnWindowFocus: true, // refetch when tab regains focus
    },
    mutations: {
      retry: 0, // don't retry mutations by default
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);`,
        explanation: `**staleTime** — how long data is considered fresh. During this time, React Query won't refetch even if you re-mount the component.

**gcTime** — how long cached data stays in memory after all components using it unmount.

**refetchOnWindowFocus** — when users switch tabs and come back, React Query automatically refreshes stale data. This alone prevents countless "outdated data" bugs.`
      },
      {
        id: "usequery",
        title: "useQuery — Fetching Data",
        type: "code",
        language: "jsx",
        filename: "src/components/UserList.jsx",
        code: `import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/users';

export default function UserList() {
  const {
    data,          // the actual data
    isLoading,     // true only on FIRST load (no cached data)
    isFetching,    // true any time a request is in flight
    isError,       // true if the query failed
    error,         // the Error object
    refetch,       // manually trigger a refetch
    isStale,       // is data older than staleTime?
  } = useQuery({
    queryKey: ['users'],        // UNIQUE key — also used for caching
    queryFn: getUsers,          // async function that returns data
    staleTime: 2 * 60 * 1000,  // override global for this query
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
    // ↑ transform/select data without changing cache
  });

  if (isLoading) return <div className="spinner">Loading users...</div>;
  if (isError) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      {isFetching && <span className="badge">Refreshing...</span>}
      <ul>
        {data?.map(user => (
          <li key={user.id}>{user.name} — {user.email}</li>
        ))}
      </ul>
      <button onClick={() => refetch()}>Refresh Now</button>
    </div>
  );
}`,
        explanation: `**queryKey** is the most important concept. It's like a cache key:
- \`['users']\` — all users
- \`['users', userId]\` — a specific user
- \`['users', { page: 2, limit: 10 }]\` — page 2

React Query watches the key — if it changes, it fetches fresh data. Same key = cache hit.

**isLoading vs isFetching:**
- \`isLoading\` is true only on first fetch (no cached data)
- \`isFetching\` is true any time fetching (including background refreshes)
Use \`isFetching\` for a subtle "refreshing" indicator, \`isLoading\` for skeleton screens.`
      },
      {
        id: "query-keys",
        title: "Query Keys — The Core Concept",
        type: "code",
        language: "javascript",
        filename: "src/api/queryKeys.js",
        code: `// Centralize query keys to avoid typos and enable invalidation

export const queryKeys = {
  // All users
  users: () => ['users'],

  // Single user
  user: (id) => ['users', id],

  // Users with filters
  usersList: (filters) => ['users', 'list', filters],

  // Posts
  posts: () => ['posts'],
  post: (id) => ['posts', id],
  postsByUser: (userId) => ['posts', 'user', userId],

  // Comments for a specific post
  comments: (postId) => ['posts', postId, 'comments'],
};

// ─── Usage ────────────────────────────────────────────────────
// useQuery({ queryKey: queryKeys.users(), queryFn: getUsers })
// useQuery({ queryKey: queryKeys.user(123), queryFn: () => getUser(123) })

// ─── Invalidation (after mutations) ──────────────────────────
// Invalidate ALL user queries (any key starting with 'users'):
// queryClient.invalidateQueries({ queryKey: ['users'] })

// Invalidate ONLY the specific user:
// queryClient.invalidateQueries({ queryKey: queryKeys.user(123) })`,
        explanation: `Query keys are hierarchical. \`['users']\` is the parent of \`['users', 123]\`. When you invalidate \`['users']\`, React Query invalidates ALL queries whose key starts with \`['users']\`.

This is how mutations automatically refresh relevant data across the entire app.`
      }
    ],
    quiz: [
      { q: "What's the difference between `isLoading` and `isFetching`?", options: ["No difference", "isLoading is only true on first fetch; isFetching is true any time fetching", "isFetching is first fetch only", "isLoading means error"], answer: 1 },
      { q: "What does `staleTime` control?", options: ["How long cache stays in memory", "How long before cached data is considered outdated", "Request timeout", "Retry delay"], answer: 1 },
      { q: "If two components use the same queryKey, React Query:", options: ["Makes two separate requests", "Makes one request and shares the cached result", "Throws an error", "Merges the data"], answer: 1 },
      { q: "What does `queryClient.invalidateQueries` do?", options: ["Deletes the cache", "Marks matching queries as stale and triggers refetch", "Cancels in-flight requests", "Resets the QueryClient"], answer: 1 }
    ],
    challenge: {
      title: "React Query User Dashboard",
      description: "Replace a raw Axios/useEffect implementation with React Query. Build a UserDashboard that shows a user list (useQuery with queryKey ['users']) and a user detail panel (separate useQuery with ['users', selectedId]). Show a background refresh indicator. Click a user to load their details without a full page refresh.",
      hints: ["queryKey changes when selectedId changes — automatic refetch!", "Use 'enabled: !!selectedId' to skip the detail query until a user is selected", "Add ReactQueryDevtools to see cache in action"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 6: React Query — Mutations & Advanced Queries
  // ──────────────────────────────────────────────────────────
  {
    day: 6,
    title: "React Query — Mutations & Advanced Queries",
    subtitle: "useMutation, optimistic updates, pagination, and infinite scroll",
    topic: "react-query",
    color: "#f59e0b",
    icon: "✏️",
    sections: [
      {
        id: "usemutation",
        title: "useMutation — Writing Data",
        type: "code",
        language: "jsx",
        filename: "src/components/CreateUser.jsx",
        code: `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../api/users';
import { queryKeys } from '../api/queryKeys';
import { useState } from 'react';

export default function CreateUser() {
  const [form, setForm] = useState({ name: '', email: '' });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,         // the async function to call

    onSuccess: (newUser) => {
      // ── Option 1: Invalidate and refetch ─────────────────
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });

      // ── Option 2: Update cache directly (faster, no refetch)
      queryClient.setQueryData(queryKeys.users(), (old) => [
        ...(old || []),
        newUser
      ]);

      setForm({ name: '', email: '' }); // reset form
      alert(\`User \${newUser.name} created! ✅\`);
    },

    onError: (error) => {
      alert(\`Failed: \${error.message}\`);
    },

    onSettled: () => {
      // Runs after success OR error
      console.log('Mutation finished');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form); // trigger the mutation
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.name}
        onChange={e => setForm(p => ({...p, name: e.target.value}))}
        placeholder="Name"
        required
      />
      <input
        value={form.email}
        onChange={e => setForm(p => ({...p, email: e.target.value}))}
        placeholder="Email"
        type="email"
        required
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && <p style={{color:'red'}}>{mutation.error.message}</p>}
    </form>
  );
}`,
        explanation: `**Two cache update strategies:**

1. **Invalidate** — mark cache as stale, trigger background refetch. Safe and simple. Use when you're not sure what the server returns.

2. **setQueryData** — update cache directly. Instant UI update, no refetch needed. Use when the server returns the created/updated item.

\`mutation.isPending\` replaces the old \`mutation.isLoading\` in React Query v5.`
      },
      {
        id: "optimistic-updates",
        title: "Optimistic Updates",
        type: "code",
        language: "jsx",
        filename: "src/components/TodoItem.jsx",
        code: `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo } from '../api/todos';

export default function TodoItem({ todo }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: toggleTodo,

    // STEP 1: Optimistically update UI immediately
    onMutate: async (updatedTodo) => {
      // Cancel any outgoing refetches so they don't overwrite
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueryData(['todos']);

      // Optimistically update the cache
      queryClient.setQueryData(['todos'], (old) =>
        old.map(t => t.id === updatedTodo.id
          ? { ...t, completed: !t.completed }
          : t
        )
      );

      return { previous }; // pass to onError for rollback
    },

    // STEP 2: If mutation fails, roll back
    onError: (err, variables, context) => {
      queryClient.setQueryData(['todos'], context.previous);
      alert(\`Failed to update: \${err.message}\`);
    },

    // STEP 3: Always sync with server after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  return (
    <li
      style={{ textDecoration: todo.completed ? 'line-through' : 'none',
               opacity: toggleMutation.isPending ? 0.6 : 1 }}
      onClick={() => toggleMutation.mutate(todo)}
    >
      {todo.title}
    </li>
  );
}`,
        explanation: `Optimistic updates make your app feel **instant**. The UI updates before the server responds. If the server fails, the UI rolls back.

The flow: onMutate (update UI) → server call → onError (rollback if failed) → onSettled (sync with server).

This is what great apps like Notion, Linear, and Vercel's dashboard use.`
      },
      {
        id: "pagination",
        title: "Pagination with keepPreviousData",
        type: "code",
        language: "jsx",
        filename: "src/components/PaginatedPosts.jsx",
        code: `import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/posts';

export default function PaginatedPosts() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['posts', 'paginated', page],
    queryFn: () => getPosts({ page, limit: 10 }),
    placeholderData: (prevData) => prevData, // keep showing old page while loading new
    staleTime: 30 * 1000,
  });

  return (
    <div>
      <h2>Posts — Page {page}</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data?.posts.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >Previous</button>

        <span>Page {page} of {data?.totalPages}</span>

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || page === data?.totalPages}
        >
          {isFetching ? 'Loading...' : 'Next'}
        </button>
      </div>
    </div>
  );
}`,
        explanation: `**placeholderData: (prevData) => prevData** — when moving to the next page, show the previous page's data while the new page loads. No jarring blank screen between pages.

**isPlaceholderData** — true when showing placeholder (previous) data. Disable "Next" button while data is loading to prevent double-clicking.`
      },
      {
        id: "infinite-scroll",
        title: "Infinite Scroll with useInfiniteQuery",
        type: "code",
        language: "jsx",
        filename: "src/components/InfinitePostFeed.jsx",
        code: `import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useCallback, useEffect } from 'react';
import { getPosts } from '../api/posts';

export default function InfinitePostFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => getPosts({ cursor: pageParam, limit: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // ↑ return undefined to signal no more pages
  });

  // Intersection Observer for automatic load-on-scroll
  const observerRef = useRef();
  const sentinelRef = useCallback((node) => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (isLoading) return <p>Loading...</p>;

  // data.pages is an array of page results
  const allPosts = data.pages.flatMap(page => page.posts);

  return (
    <div>
      {allPosts.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </article>
      ))}

      {/* Sentinel element — triggers load when visible */}
      <div ref={sentinelRef} style={{ height: '20px' }} />

      {isFetchingNextPage && <p>Loading more...</p>}
      {!hasNextPage && <p>You've reached the end!</p>}
    </div>
  );
}`,
        explanation: `**useInfiniteQuery** manages cursor/page-based loading. Data accumulates in \`data.pages\` — an array of page results.

The **IntersectionObserver** sentinel pattern auto-fetches when the user scrolls to the bottom — no "Load More" button needed (though you can add one as a fallback).`
      }
    ],
    quiz: [
      { q: "In useMutation onMutate, why do we return `{ previous }`?", options: ["For logging", "To pass previous data to onError for rollback", "Required syntax", "To update the UI"], answer: 1 },
      { q: "What does `queryClient.cancelQueries` do in optimistic updates?", options: ["Cancels the mutation", "Stops any in-flight fetches that could overwrite optimistic changes", "Clears the cache", "Pauses React Query"], answer: 1 },
      { q: "In useInfiniteQuery, what does `getNextPageParam` return to stop fetching?", options: ["null", "false", "0", "undefined"], answer: 3 },
      { q: "What is `isPlaceholderData` useful for?", options: ["Error states", "Disabling UI while loading replacement data", "Showing cached data", "Loading skeletons"], answer: 1 }
    ],
    challenge: {
      title: "Todo App with Optimistic Updates",
      description: "Build a full Todo app using React Query: load todos with useQuery, add with useMutation (optimistic insert), toggle complete with useMutation (optimistic toggle), delete with useMutation. All mutations should update the cache optimistically and roll back on error. Use JSONPlaceholder as your fake backend.",
      hints: ["queryClient.setQueryData(['todos'], updater) for optimistic changes", "Return previous data from onMutate for rollback", "cancelQueries before setQueryData in onMutate"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 7: React Query — Real-world Patterns
  // ──────────────────────────────────────────────────────────
  {
    day: 7,
    title: "React Query — Real-World Patterns",
    subtitle: "Dependent queries, prefetching, suspense mode, and devtools mastery",
    topic: "react-query",
    color: "#f59e0b",
    icon: "🏗️",
    sections: [
      {
        id: "dependent-queries",
        title: "Dependent Queries",
        type: "code",
        language: "jsx",
        filename: "src/components/UserPosts.jsx",
        code: `import { useQuery } from '@tanstack/react-query';
import { getUser, getPostsByUser } from '../api';

export default function UserPosts({ userId }) {
  // FIRST: fetch the user
  const userQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,    // don't run if userId is falsy
  });

  // SECOND: fetch posts only after user is loaded
  const postsQuery = useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => getPostsByUser(userId),
    enabled: !!userQuery.data, // 👈 depends on user query
    // Don't fetch posts until we have the user
  });

  // ─── Dependent on multiple queries ───────────────────────
  // enabled: !!userQuery.data && !!anotherQuery.data

  return (
    <div>
      {userQuery.isLoading && <p>Loading user...</p>}
      {userQuery.data && <h2>{userQuery.data.name}'s Posts</h2>}

      {postsQuery.isLoading && <p>Loading posts...</p>}
      {postsQuery.data?.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
        </article>
      ))}
    </div>
  );
}`,
        explanation: `The \`enabled\` option is the key to dependent queries. When \`enabled: false\`, the query is "disabled" — it won't run.

Chain queries by setting \`enabled\` to a condition based on the previous query's data. React Query handles the timing automatically.`
      },
      {
        id: "prefetching",
        title: "Prefetching — Instant Navigation",
        type: "code",
        language: "jsx",
        filename: "src/components/UserCard.jsx",
        code: `import { useQueryClient } from '@tanstack/react-query';
import { getUser } from '../api/users';
import { queryKeys } from '../api/queryKeys';

export default function UserCard({ user, onClick }) {
  const queryClient = useQueryClient();

  // Prefetch on hover — data is ready before click!
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.user(user.id),
      queryFn: () => getUser(user.id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}  // prefetch on hover
      onClick={() => onClick(user.id)}
      className="user-card"
    >
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// ─── Prefetch on route change (React Router) ──────────────────
// const queryClient = useQueryClient();
// const navigate = useNavigate();
//
// const handleNavigate = async (userId) => {
//   await queryClient.prefetchQuery({
//     queryKey: queryKeys.user(userId),
//     queryFn: () => getUser(userId),
//   });
//   navigate(\`/users/\${userId}\`);
// };
// Navigates only after data is ready = zero loading flicker`,
        explanation: `Prefetching pre-loads data into the React Query cache before the user needs it. When they navigate, the data is already there — instant rendering.

**Hover prefetch** is a great UX trick: by the time the user's finger moves from card to click, the data has already started loading.`
      },
      {
        id: "suspense-mode",
        title: "React Query with Suspense",
        type: "code",
        language: "jsx",
        filename: "src/components/SuspenseUserList.jsx",
        code: `import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUsers } from '../api/users';

// Component that uses suspense — NO isLoading check needed!
function UserList() {
  const { data: users } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  // data is ALWAYS defined here — suspense handles the loading state

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

// Parent — declarative loading and error states
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserList />
      </Suspense>
    </ErrorBoundary>
  );
}`,
        explanation: `**Suspense mode** lets you move loading state out of components and into layout. Components become synchronous-looking — no isLoading/isError checks.

Use \`useSuspenseQuery\` (React Query v5) for this. Combined with Error Boundaries, this is the modern React data fetching pattern.`
      },
      {
        id: "query-invalidation",
        title: "Strategic Cache Invalidation",
        type: "code",
        language: "javascript",
        filename: "src/hooks/usePostMutations.js",
        code: `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, updatePost, deletePost } from '../api/posts';

export function usePostMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate ALL post queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Or: seed the new post's individual cache
      queryClient.setQueryData(['posts', newPost.id], newPost);
    }
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updatePost(id, data),
    onSuccess: (updated) => {
      // Update this specific post in cache
      queryClient.setQueryData(['posts', updated.id], updated);
      // Invalidate list queries so they show updated data
      queryClient.invalidateQueries({
        queryKey: ['posts'],
        exact: false,    // invalidate all starting with ['posts']
        refetchType: 'active', // only refetch queries currently rendered
      });
    }
  });

  const remove = useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['posts', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  return { create, update, remove };
}`,
        explanation: `**invalidateQueries** triggers background refetches. **setQueryData** updates cache immediately.

Use \`refetchType: 'active'\` to only refetch queries that have mounted components — don't waste bandwidth refetching data nobody is looking at.

\`removeQueries\` cleans up deleted items from cache entirely.`
      }
    ],
    quiz: [
      { q: "How do you prevent a useQuery from running until a condition is met?", options: ["Don't call it", "Use the `enabled` option", "Use `skipQuery: true`", "Put it in an if statement (error!)"], answer: 1 },
      { q: "What does prefetchQuery store results in?", options: ["localStorage", "Component state", "React Query cache", "sessionStorage"], answer: 2 },
      { q: "In Suspense mode with useSuspenseQuery, when is data guaranteed to be defined?", options: ["After checking isLoading", "Always — suspense handles the loading state", "After checking !isError", "Only in production"], answer: 1 },
      { q: "`refetchType: 'active'` in invalidateQueries means:", options: ["Force refetch immediately", "Only refetch currently rendered queries", "Skip inactive queries", "Both B and C"], answer: 3 }
    ],
    challenge: {
      title: "Master Cache Invalidation",
      description: "Build a Post Manager with: a PostList (useQuery), a UserSelector (clicking user filters posts — dependent query), hover-to-prefetch on each post card, and mutations that use strategic invalidation. When a post is created, update the list cache directly without a refetch. When deleted, remove from cache and invalidate.",
      hints: ["queryClient.setQueryData with updater function for optimistic list update", "prefetchQuery on PostCard mouseEnter", "enabled: !!selectedUserId for the post query"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 8: Integration — Full Stack with Express + React
  // ──────────────────────────────────────────────────────────
  {
    day: 8,
    title: "Integration — Express + Axios + React Query",
    subtitle: "Wire everything together: a real full-stack feature from DB to UI",
    topic: "integration",
    color: "#34d399",
    icon: "🔗",
    sections: [
      {
        id: "fullstack-architecture",
        title: "Full-Stack Architecture Overview",
        type: "concept",
        content: `Here's how the full stack connects:

\`\`\`
Browser (React + Vite)
    │
    ├── React Query  ← manages server state, cache, background sync
    │       │
    │       └── Axios API Layer ← configured instance, interceptors, typed functions
    │               │
    │               │  HTTP (JSON)
    │               ▼
    │      Express Server (Node.js)
    │           │
    │           ├── Middleware: CORS, auth, rate limiting, logging
    │           ├── Routes: /api/users, /api/posts, /api/products
    │           └── DB Layer
    │               ├── pg  → PostgreSQL
    │               └── mssql → SQL Server
    │
    └── Vite Build Tool (dev server, bundler, env vars)
\`\`\`

**Request lifecycle:**
1. User interaction triggers React event
2. useMutation/useQuery calls Axios function
3. Axios interceptor adds auth token, sets base URL
4. Express receives request, passes through middleware
5. Route handler queries database
6. Response flows back through Axios response interceptor
7. React Query caches result, updates components
`,
      },
      {
        id: "full-feature",
        title: "A Complete Feature: Product Catalog",
        type: "code",
        language: "javascript",
        filename: "FULL STACK WALKTHROUGH",
        code: `// ══════════════════════════════════════════════════════════
// BACKEND: Express + PostgreSQL
// File: server/routes/products.js
// ══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { query } = require('../db/postgres');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// Create table (run once):
// CREATE TABLE products (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   price NUMERIC(10,2) NOT NULL,
//   category VARCHAR(100),
//   stock INTEGER DEFAULT 0,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

router.get('/', catchAsync(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let baseQuery = 'SELECT * FROM products';
  const params = [];

  if (category) {
    params.push(category);
    baseQuery += \` WHERE category = $\${params.length}\`;
  }

  const countQuery = baseQuery.replace('SELECT *', 'SELECT COUNT(*)');
  const [{ rows }, { rows: countRows }] = await Promise.all([
    query(baseQuery + \` ORDER BY created_at DESC LIMIT $\${params.length+1} OFFSET $\${params.length+2}\`, [...params, limit, offset]),
    query(countQuery, params)
  ]);

  res.json({
    data: rows,
    meta: { total: parseInt(countRows[0].count), page: +page, limit: +limit }
  });
}));

router.get('/:id', catchAsync(async (req, res) => {
  const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!rows.length) throw new AppError('Product not found', 404);
  res.json({ data: rows[0] });
}));

router.post('/', catchAsync(async (req, res) => {
  const { name, price, category, stock } = req.body;
  if (!name || !price) throw new AppError('name and price required', 400);
  const { rows } = await query(
    'INSERT INTO products (name, price, category, stock) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, price, category, stock ?? 0]
  );
  res.status(201).json({ data: rows[0] });
}));

module.exports = router;

// ══════════════════════════════════════════════════════════
// FRONTEND: Axios + React Query
// File: src/api/products.js
// ══════════════════════════════════════════════════════════

import api from './axiosInstance';

export const productKeys = {
  all: () => ['products'],
  list: (filters) => ['products', 'list', filters],
  detail: (id) => ['products', id],
};

export const getProducts = (params) => api.get('/products', { params });
export const getProduct  = (id) => api.get(\`/products/\${id}\`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(\`/products/\${id}\`, data);
export const deleteProduct = (id) => api.delete(\`/products/\${id}\`);`,
        explanation: `Notice how the backend and frontend mirror each other:
- Backend route: \`GET /api/products?category=tech&page=2\`
- Frontend call: \`getProducts({ category: 'tech', page: 2 })\`
- Axios automatically serializes the object to query string

The backend uses \`Promise.all\` to fetch count and data in parallel — same pattern we learned in the Axios section.`
      },
      {
        id: "react-component",
        title: "React Component — Complete Integration",
        type: "code",
        language: "jsx",
        filename: "src/pages/ProductsPage.jsx",
        code: `import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, deleteProduct, productKeys } from '../api/products';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name:'', price:'', category:'' });

  // ─── Query ────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: productKeys.list({ category, page }),
    queryFn: () => getProducts({ category: category || undefined, page, limit: 10 }),
    placeholderData: prev => prev,
    staleTime: 60_000,
  });

  // ─── Create Mutation ──────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all() });
      queryClient.setQueryData(productKeys.detail(created.id), created);
      setForm({ name:'', price:'', category:'' });
    }
  });

  // ─── Delete Mutation ──────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.list({ category, page }) });
      const prev = queryClient.getQueryData(productKeys.list({ category, page }));
      queryClient.setQueryData(productKeys.list({ category, page }), old => ({
        ...old,
        data: old.data.filter(p => p.id !== id)
      }));
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(productKeys.list({ category, page }), ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all() });
    }
  });

  return (
    <div>
      {/* Filter */}
      <input value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
             placeholder="Filter by category..." />

      {/* Status */}
      {isFetching && <span>Refreshing...</span>}

      {/* Products list */}
      {isLoading ? <p>Loading...</p> : (
        <ul>
          {data?.data.map(product => (
            <li key={product.id}>
              <strong>{product.name}</strong> — \${product.price} ({product.category})
              <button onClick={() => deleteMutation.mutate(product.id)}
                      disabled={deleteMutation.isPending}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div>
        <button onClick={() => setPage(p => p-1)} disabled={page===1}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p+1)}>Next</button>
      </div>

      {/* Create form */}
      <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }}>
        <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Name" required />
        <input value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} placeholder="Price" type="number" required />
        <input value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} placeholder="Category" />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}`,
        explanation: `This single component demonstrates the complete stack:
- **Filter** changes the queryKey → automatic refetch
- **Page** changes queryKey → placeholderData keeps old page visible  
- **Delete** is optimistic → instant UI, rollback on error
- **Create** invalidates all product queries → fresh data everywhere

This is production-grade React Query + Axios integration.`
      }
    ],
    quiz: [
      { q: "When a filter changes (like category), how does React Query know to refetch?", options: ["You call refetch() manually", "The queryKey changes, triggering automatic refetch", "A timer fires", "You set enabled: true"], answer: 1 },
      { q: "In the delete mutation's onMutate, why do we call cancelQueries first?", options: ["To save bandwidth", "To prevent in-flight refetches from overwriting our optimistic change", "Required syntax", "To update the cache"], answer: 1 },
      { q: "Why use Promise.all in the Express route for count + data?", options: ["Required by PostgreSQL", "Parallel execution is faster than sequential", "Better error handling", "Syntax requirement"], answer: 1 },
      { q: "What does `placeholderData: prev => prev` do in pagination?", options: ["Shows an error state", "Shows previous page data while next page loads", "Caches all pages", "Disables refetching"], answer: 1 }
    ],
    challenge: {
      title: "Build a Comment System",
      description: "Full stack: Express route GET/POST /api/posts/:id/comments with PostgreSQL. React page: show post (useQuery), show comments (dependent useQuery enabled when post is loaded), add comment form (useMutation with optimistic update that instantly shows the comment, rolls back on error). Wire it all through a typed Axios layer.",
      hints: ["Comments queryKey: ['posts', postId, 'comments']", "Optimistic: add comment with temp id (Date.now()), replace on success", "Dependent: enabled: !!postId && !!postQuery.data"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 9: Integration — Auth, Real Patterns, Testing
  // ──────────────────────────────────────────────────────────
  {
    day: 9,
    title: "Integration — Auth, Search & Real Patterns",
    subtitle: "JWT authentication, debounced search, and production patterns",
    topic: "integration",
    color: "#34d399",
    icon: "🔐",
    sections: [
      {
        id: "jwt-auth",
        title: "JWT Authentication — Full Stack",
        type: "code",
        language: "javascript",
        filename: "Full Auth Flow",
        code: `// ══════════════════════════════════════════════════════════
// BACKEND: JWT Auth Middleware
// npm install jsonwebtoken bcryptjs
// ══════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// POST /api/auth/login
router.post('/login', catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query(
    'SELECT * FROM users WHERE email = $1', [email]
  );
  const user = rows[0];

  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // HttpOnly cookie (more secure than localStorage)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ user: { id: user.id, name: user.name, role: user.role } });
}));

// Protect routes middleware
const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new AppError('Not authenticated', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
  if (!rows[0]) throw new AppError('User no longer exists', 401);

  req.user = rows[0]; // attach to request
  next();
});

// ══════════════════════════════════════════════════════════
// FRONTEND: Auth with React Query
// ══════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axiosInstance';

// Fetch current user (validates session)
export const useMe = () => useQuery({
  queryKey: ['auth', 'me'],
  queryFn: () => api.get('/auth/me'),
  retry: false,             // don't retry auth failures
  staleTime: Infinity,      // user data rarely changes
});

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      queryClient.invalidateQueries(); // refresh all protected queries
    }
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      queryClient.clear(); // wipe all cache on logout
      window.location.href = '/login';
    }
  });
};`,
        explanation: `**HttpOnly cookies** are more secure than localStorage for tokens — JavaScript can't access them, preventing XSS attacks.

The \`useMe\` query acts as your auth state. If it succeeds, user is logged in. If it fails with 401, user is not. This is much cleaner than managing auth state in useState/Redux.

\`queryClient.clear()\` on logout wipes all cached data — critical for multi-user devices.`
      },
      {
        id: "debounced-search",
        title: "Debounced Search",
        type: "code",
        language: "jsx",
        filename: "src/components/SearchBar.jsx",
        code: `import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../api/products';

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const [input, setInput] = useState('');
  const query = useDebounce(input, 400); // wait 400ms after typing stops

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length >= 2, // don't search for 0-1 chars
    staleTime: 30_000,          // cache search results 30s
    placeholderData: prev => prev, // keep old results visible while typing
  });

  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Search products... (min 2 chars)"
      />
      {isLoading && query.length >= 2 && <span>Searching...</span>}
      {data?.map(product => (
        <div key={product.id}>{product.name} — \${product.price}</div>
      ))}
    </div>
  );
}

// ─── Backend: Full-text search in PostgreSQL ──────────────────
// SELECT * FROM products
// WHERE to_tsvector('english', name || ' ' || category)
//       @@ plainto_tsquery('english', $1)
// LIMIT 20;

// ─── SQL Server full-text search ─────────────────────────────
// SELECT * FROM products
// WHERE CONTAINS((name, category), @searchTerm);`,
        explanation: `The debounce hook delays the query until typing stops — so "react" triggers one request, not 5 (one per keypress).

**enabled: query.length >= 2** prevents empty or single-character searches.

React Query's caching means typing "reac" then backspacing to "rea" then retyping "reac" uses the cached result — no duplicate requests!`
      },
      {
        id: "error-boundaries",
        title: "Error Boundaries with React Query",
        type: "code",
        language: "jsx",
        filename: "src/components/QueryErrorBoundary.jsx",
        code: `import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-state">
      <h2>Something went wrong</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

// Wrap sections that can fail
export function QueryErrorBoundary({ children }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={reset} // resets React Query so it retries on "Try Again"
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

// ─── Usage ────────────────────────────────────────────────────
// <QueryErrorBoundary>
//   <Suspense fallback={<Skeleton />}>
//     <ProductList /> // uses useSuspenseQuery
//   </Suspense>
// </QueryErrorBoundary>`,
        explanation: `\`QueryErrorResetBoundary\` connects React's ErrorBoundary with React Query's error state. When the user clicks "Try Again," it resets both the boundary and the failed query — React Query will retry the fetch.

This is the pattern for production-grade error handling with Suspense + React Query.`
      }
    ],
    quiz: [
      { q: "Why are HttpOnly cookies more secure than localStorage for JWT tokens?", options: ["They expire faster", "JavaScript can't access them, preventing XSS theft", "They're encrypted", "Servers can't read them"], answer: 1 },
      { q: "What does `queryClient.clear()` do on logout?", options: ["Removes one query", "Wipes ALL cached data", "Logs errors", "Resets mutations only"], answer: 1 },
      { q: "Why use `enabled: query.length >= 2` in search?", options: ["API limit", "Prevent empty/trivial search requests", "Required syntax", "Performance optimization only"], answer: 1 },
      { q: "What does `QueryErrorResetBoundary` add to a regular ErrorBoundary?", options: ["Better UI", "Resets React Query state so failed queries retry after reset", "Auto-logging", "Suspense support"], answer: 1 }
    ],
    challenge: {
      title: "Auth + Protected Routes",
      description: "Build a full auth flow: login form (useMutation POST /auth/login), persisted session via useMe query, protected route wrapper that redirects to /login if not authenticated. The protected page shows a product list that only loads after auth succeeds. Add a logout button that clears cache and redirects.",
      hints: ["useMe query with retry: false — 401 means not logged in", "ProtectedRoute: if useMe isError → redirect to /login", "queryClient.clear() + navigate('/login') on logout"]
    }
  },

  // ──────────────────────────────────────────────────────────
  // DAY 10: Capstone — Full-Stack App from Scratch
  // ──────────────────────────────────────────────────────────
  {
    day: 10,
    title: "Capstone — Build a Full-Stack App",
    subtitle: "Bring together Express, Axios, React Query and both databases",
    topic: "integration",
    color: "#34d399",
    icon: "🏆",
    sections: [
      {
        id: "capstone-overview",
        title: "Project: Task Management App",
        type: "concept",
        content: `You'll build **TaskFlow** — a full-stack task management app:

**Backend (Express + PostgreSQL/SQL Server):**
- \`GET /api/projects\` — list all projects
- \`POST /api/projects\` — create project
- \`GET /api/projects/:id/tasks\` — tasks for a project
- \`POST /api/tasks\` — create task
- \`PATCH /api/tasks/:id\` — update task (status, assignee)
- \`DELETE /api/tasks/:id\` — delete task
- \`GET /api/users\` — list users (for assignee dropdown)

**Frontend (React + Vite + React Query + Axios):**
- Project sidebar (prefetch on hover)
- Task board with columns (Todo, In Progress, Done)
- Drag to reorder (optimistic update)
- Create task form (useMutation with optimistic insert)
- Assign user (useMutation with cache update)
- Real-time feel (polling every 30s)
- Search tasks (debounced)

**Skills demonstrated:**
- Every Express pattern from Days 1-2
- Axios instance + interceptors + typed functions (Days 3-4)
- useQuery, useMutation, optimistic updates, pagination (Days 5-7)
- Auth middleware, error handling, database queries (Days 8-9)`,
      },
      {
        id: "database-schema",
        title: "Database Schema",
        type: "code",
        language: "sql",
        filename: "schema.sql (PostgreSQL)",
        code: `-- Projects
CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  color       VARCHAR(7) DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50) DEFAULT 'todo'
              CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    VARCHAR(20) DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high')),
  due_date    DATE,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

-- ─── SQL Server equivalent ──────────────────────────────────
-- Use IDENTITY(1,1) instead of SERIAL
-- Use NVARCHAR instead of VARCHAR
-- Use DATETIME2 instead of TIMESTAMPTZ
-- Use a trigger with GETUTCDATE() for updated_at`,
        explanation: `**ON DELETE CASCADE** — when a project is deleted, all its tasks are automatically deleted too.

**ON DELETE SET NULL** — when a user is deleted, tasks assigned to them become unassigned (not deleted).

**Partial indexes** on status make filtering by "todo" or "in_progress" extremely fast.`
      },
      {
        id: "final-architecture",
        title: "Frontend Architecture — Final Pattern",
        type: "code",
        language: "javascript",
        filename: "Complete src/ structure",
        code: `src/
├── main.jsx               ← QueryClient + providers setup
├── App.jsx                ← Router + layout
│
├── api/
│   ├── axiosInstance.js   ← Base instance, interceptors
│   ├── queryKeys.js       ← All query key factories
│   ├── projects.js        ← getProjects, createProject, etc.
│   ├── tasks.js           ← getTasks, createTask, patchTask, etc.
│   └── users.js           ← getUsers
│
├── hooks/
│   ├── useProjects.js     ← useQuery wrappers for projects
│   ├── useTasks.js        ← useQuery + useMutation for tasks
│   ├── useAuth.js         ← useMe, useLogin, useLogout
│   └── useDebounce.js     ← Debounce utility hook
│
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   └── ProjectPage.jsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   ├── projects/
│   │   ├── ProjectCard.jsx  ← prefetchQuery on hover
│   │   └── ProjectForm.jsx
│   ├── tasks/
│   │   ├── TaskBoard.jsx    ← 3-column Kanban
│   │   ├── TaskCard.jsx     ← optimistic delete/update
│   │   └── TaskForm.jsx     ← useMutation create
│   └── shared/
│       ├── ErrorBoundary.jsx
│       ├── Skeleton.jsx
│       └── Spinner.jsx
│
└── utils/
    ├── cn.js              ← className utility
    └── formatDate.js`,
        explanation: `**Key architectural decisions:**
- API functions in \`api/\` — pure functions, no React
- Query logic in \`hooks/\` — reusable across components
- Components just consume hooks — thin and focused
- Shared query keys via \`queryKeys.js\` — no string typos

This structure scales to large teams. Any developer can find anything in 5 seconds.`
      },
      {
        id: "polling",
        title: "Real-Time Feel with Polling",
        type: "code",
        language: "javascript",
        filename: "src/hooks/useTasks.js",
        code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, patchTask, deleteTask } from '../api/tasks';
import { queryKeys } from '../api/queryKeys';

export function useTasks(projectId) {
  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () => getTasks(projectId),
    enabled: !!projectId,
    staleTime: 10_000,
    refetchInterval: 30_000,          // poll every 30s
    refetchIntervalInBackground: false,// pause polling when tab hidden
  });
}

export function useCreateTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(projectId) });
      const prev = queryClient.getQueryData(queryKeys.tasks(projectId));
      const optimisticTask = { ...newTask, id: -Date.now(), status: 'todo' };
      queryClient.setQueryData(queryKeys.tasks(projectId), old => [...(old||[]), optimisticTask]);
      return { prev };
    },
    onError: (_, __, ctx) =>
      queryClient.setQueryData(queryKeys.tasks(projectId), ctx.prev),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) }),
  });
}

export function useMoveTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => patchTask(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(projectId) });
      const prev = queryClient.getQueryData(queryKeys.tasks(projectId));
      queryClient.setQueryData(queryKeys.tasks(projectId), old =>
        old.map(t => t.id === id ? { ...t, status } : t)
      );
      return { prev };
    },
    onError: (_, __, ctx) =>
      queryClient.setQueryData(queryKeys.tasks(projectId), ctx.prev),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) }),
  });
}`,
        explanation: `**refetchInterval: 30_000** makes the app poll every 30 seconds — giving real-time feel without WebSockets. When a colleague adds a task, your view updates within 30 seconds automatically.

**refetchIntervalInBackground: false** pauses polling when the tab is hidden — saving bandwidth when users switch tabs.

The custom hooks keep components clean — they just call \`const { data: tasks } = useTasks(projectId)\`.`
      }
    ],
    quiz: [
      { q: "What does `ON DELETE CASCADE` mean in a PostgreSQL foreign key?", options: ["Prevents deletion", "Auto-deletes related rows when parent is deleted", "Sets to NULL", "Throws an error"], answer: 1 },
      { q: "How does `refetchInterval` give a real-time feel?", options: ["Uses WebSockets", "Auto-polls the server every N milliseconds", "Listens for push notifications", "Uses browser events"], answer: 1 },
      { q: "Why use `-Date.now()` as the optimistic task's temporary ID?", options: ["Required by React", "Guaranteed unique negative ID that won't conflict with real server IDs", "For sorting", "Random number generation"], answer: 1 },
      { q: "In the final architecture, where does query logic live?", options: ["Directly in components", "In api/ folder", "In hooks/ folder", "In pages/ folder"], answer: 2 }
    ],
    challenge: {
      title: "🏆 Capstone: Build TaskFlow",
      description: "Build the complete TaskFlow app: Express backend with all task/project routes + PostgreSQL schema. React frontend with: project sidebar (prefetch hover), 3-column task board, drag-to-move columns (optimistic status update), create task form (optimistic insert), search tasks (debounced, enabled >= 2 chars), 30s polling. Deploy backend to Railway/Render, frontend to Vercel/GitHub Pages.",
      hints: ["Start with the backend routes and test in the API Tester", "Build hooks/ before components — test with React Query Devtools", "Optimistic updates first, then add the real API calls", "GitHub Actions workflow is already in the repo — just push!"]
    }
  }
];

export const TOPICS = {
  express: { label: 'Express', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  axios: { label: 'Axios', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  'react-query': { label: 'React Query', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  integration: { label: 'Integration', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
};

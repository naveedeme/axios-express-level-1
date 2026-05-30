# ⚡ FullStack Academy — 10-Day Mastery

> Master **Express.js**, **Axios**, and **React Query** with a fully interactive PWA learning app.  
> Includes live simulators, quizzes, challenges, XP system, and a completion certificate.

---

## 📚 Curriculum Overview

| Days | Topic | Focus |
|------|-------|-------|
| 1–2 | **Express.js** | Server setup, routing, middleware, PostgreSQL + SQL Server |
| 3–4 | **Axios** | HTTP client, interceptors, retry, env vars, TypeScript |
| 5–7 | **React Query** | useQuery, useMutation, optimistic updates, pagination, infinite scroll |
| 8–10 | **Integration** | Full-stack features, auth, search, capstone project |

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/fullstack-academy.git
cd fullstack-academy

# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens at http://localhost:5173
```

---

## 🌐 Deploy to GitHub Pages (PWA)

### Step 1 — Create the repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fullstack-academy.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

### Step 3 — Push to trigger deploy

```bash
git push origin main
# The workflow in .github/workflows/deploy.yml runs automatically
# Your app will be live at:
# https://YOUR_USERNAME.github.io/fullstack-academy/
```

### Step 4 — Install as PWA

Once deployed, visit the URL in Chrome or Edge and click the **Install** button in the address bar (or the 📥 button in the app header).

---

## 🛠️ Simulators

| Simulator | What it does |
|-----------|-------------|
| ⚡ **JS Sandbox** | Run JavaScript/async code with console output |
| 🌐 **API Tester** | Postman-like HTTP client (uses JSONPlaceholder) |
| 🗄️ **SQL Playground** | Run SELECT queries against in-memory tables |
| 🔄 **RQ Visualizer** | Watch React Query cache state change in real time |

---

## 🏆 Gamification

- **XP**: Earn points for quiz answers (+25 XP each) and challenges (+200 XP)
- **Levels**: Every 500 XP = level up
- **Streaks**: Study daily to keep your streak 🔥
- **Certificate**: Complete all 10 days + 8 challenges to unlock

---

## 📁 Project Structure

```
src/
├── App.jsx                 ← Main shell, sidebar, routing
├── main.jsx                ← Entry point, PWA service worker
├── index.css               ← Full design system (auto dark/light)
│
├── data/
│   └── curriculum.js       ← All 10 days of content
│
├── hooks/
│   └── useProgress.js      ← Progress persistence (localStorage)
│
├── components/
│   ├── DayView.jsx         ← Learn/Quiz/Challenge tab layout
│   ├── SectionCard.jsx     ← Expandable content card
│   ├── CodeBlock.jsx       ← Syntax-highlighted code with copy
│   ├── Quiz.jsx            ← Interactive quiz with scoring
│   ├── Certificate.jsx     ← Printable completion cert
│   └── MarkdownRenderer.jsx ← Lightweight MD parser
│
└── simulator/
    ├── JSSimulator.jsx     ← Live JS/Node.js sandbox
    ├── APITester.jsx       ← HTTP request tester
    ├── SQLPlayground.jsx   ← SQL query simulator
    └── RQVisualizer.jsx    ← React Query cache visualizer
```

---

## 🗄️ Database Notes

This app teaches both **PostgreSQL** (`pg` driver) and **SQL Server** (`mssql` driver).

**PostgreSQL** — Parameterized queries:
```js
pool.query('SELECT * FROM users WHERE id = $1', [id])
```

**SQL Server** — Named parameters:
```js
pool.request().input('id', sql.Int, id).query('SELECT * FROM users WHERE id = @id')
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| State | localStorage (progress) |
| PWA | Service Worker + Web App Manifest |
| CI/CD | GitHub Actions → GitHub Pages |
| Design | Custom CSS (auto dark/light) |
| Fonts | Outfit + JetBrains Mono |

---

## 📄 License

MIT — use freely for personal learning or teaching.

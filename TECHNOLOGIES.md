# 🛠️ Technologies Used — DevNexus Command Center

> A complete, categorized list of every technology, library, and service powering the DevNexus stack.

---

## 🗂️ Monorepo Architecture

| Tool | Version | Role |
|------|---------|------|
| **Turborepo** | `^2.0.0` | Monorepo build orchestration, task caching, and pipeline management |
| **npm Workspaces** | Native | Package dependency sharing between `apps/web` and `apps/api` |

---

## 🖥️ Frontend — `apps/web`

### Core Framework

| Technology | Version | Role |
|------------|---------|------|
| **Next.js** | `14.2.3` | React framework — App Router, SSR, static generation, API routes |
| **React** | `^18.3.1` | UI rendering, state management, component system |
| **TypeScript** | `^5.4.5` | Static typing, compile-time safety across entire frontend |

### Authentication

| Technology | Version | Role |
|------------|---------|------|
| **NextAuth.js** | `^4.24.7` | GitHub OAuth integration, JWT session management, server-side auth |

### Database / Backend Integration

| Technology | Version | Role |
|------------|---------|------|
| **@supabase/supabase-js** | `^2.43.4` | Supabase client for reading/writing database from the frontend |
| **@supabase/ssr** | `^0.4.0` | Server-side Supabase helpers for Next.js App Router |
| **Axios** | `^1.7.2` | HTTP client for external API calls |

### AI Integration

| Technology | Version | Role |
|------------|---------|------|
| **@google/generative-ai** | `^0.12.0` | Google Gemini SDK for frontend-side AI interactions |

### State Management

| Technology | Version | Role |
|------------|---------|------|
| **Zustand** | `^4.5.2` | Lightweight global state (theme persistence, vibe mode state) |
| **Immer** | `^10.1.1` | Immutable state updates inside Zustand stores |

### UI & Animation

| Technology | Version | Role |
|------------|---------|------|
| **Framer Motion** | `^11.2.10` | Page transitions, sidebar animations, micro-interactions, waveform bars |
| **Tailwind CSS** | `^3.4.4` | Utility-first CSS — all layout, spacing, and responsive design |
| **Lucide React** | `^0.390.0` | 400+ clean SVG icons used throughout the interface |
| **class-variance-authority** | `^0.7.0` | Component variant management for complex UI states |
| **clsx** | `^2.1.1` | Conditional className composition |
| **tailwind-merge** | `^2.3.0` | Merging Tailwind classes without conflicts |
| **next-themes** | `^0.3.0` | Multi-theme system (Midnight, Cyberpunk, Forest, Arctic, Solarized) |

### Radix UI Primitives

| Component | Role |
|-----------|------|
| `@radix-ui/react-dialog` | Hackathon entry modals |
| `@radix-ui/react-dropdown-menu` | Action menus and context menus |
| `@radix-ui/react-tooltip` | Icon tooltips throughout dashboard |
| `@radix-ui/react-progress` | Health score progress bars |
| `@radix-ui/react-tabs` | Tab switchers in GitHub Center |
| `@radix-ui/react-switch` | Toggle controls |
| `@radix-ui/react-select` | Priority and status selectors in TODOs |
| `@radix-ui/react-slider` | Vibe Mode volume control |
| `@radix-ui/react-avatar` | User profile picture with fallback |
| `@radix-ui/react-popover` | Theme Selector popover |

### Drag & Drop

| Technology | Version | Role |
|------------|---------|------|
| **@hello-pangea/dnd** | `^16.6.0` | Full Kanban drag-and-drop board with real-time status persistence |

### Data Visualization

| Technology | Version | Role |
|------------|---------|------|
| **Recharts** | `^2.12.7` | Commit Forecast bar chart, Contribution Heatmap, Repo Health visualizations |

### Markdown

| Technology | Version | Role |
|------------|---------|------|
| **react-markdown** | `^9.0.1` | Rendering markdown content in Project Notebook editor |
| **remark-gfm** | `^4.0.0` | GitHub Flavored Markdown (tables, task lists, strikethrough) |
| **rehype-highlight** | `^7.0.0` | Syntax highlighting inside markdown code blocks |

### GraphQL

| Technology | Version | Role |
|------------|---------|------|
| **graphql** | `^16.8.1` | GraphQL client core |
| **graphql-request** | `^6.1.0` | Lightweight GraphQL queries to GitHub's GraphQL API for contribution data |

### Utilities

| Technology | Version | Role |
|------------|---------|------|
| **date-fns** | `^3.6.0` | Date formatting, relative timestamps, deadline countdowns |
| **react-hot-toast** | `^2.4.1` | Non-intrusive success/error toast notifications |
| **cmdk** | `^1.0.0` | Command palette primitive (used as base for CommandPalette component) |

---

## ⚙️ Backend — `apps/api`

### Core Framework

| Technology | Version | Role |
|------------|---------|------|
| **FastAPI** | `0.110.0` | High-performance async Python API framework — all REST endpoints |
| **Uvicorn** | `0.29.0` | ASGI server running FastAPI in production and development |
| **Pydantic** | `2.7.0` | Request/response validation and serialization schemas |
| **pydantic-settings** | `2.2.1` | Environment variable configuration management |

### AI / Machine Learning

| Technology | Version | Role |
|------------|---------|------|
| **google-generativeai** | `0.5.4` | Google Gemini 1.5 Flash Python SDK |
| **Gemini 1.5 Flash** | — | Powers: Daily Chronicle generation, Weekly Arc generation, Todo auto-scoring, Subtask generation, Pitch generation, Judge simulation, Idea expansion, NEXUS AI chat |

### Database

| Technology | Version | Role |
|------------|---------|------|
| **Supabase** | `2.4.0` | Python Supabase client for all database operations |
| **Supabase (PostgreSQL)** | — | Primary database — stores users, todos, subtasks, notes, note versions, hackathons, checklist items, chronicles |

### Scheduling

| Technology | Version | Role |
|------------|---------|------|
| **APScheduler** | `3.10.4` | Background job scheduler — daily chronicle generation at midnight, weekly arc generation on Sundays |

### HTTP Client

| Technology | Version | Role |
|------------|---------|------|
| **httpx** | `>=0.24,<0.26` | Async HTTP client for all GitHub API calls from the backend |

### Configuration

| Technology | Version | Role |
|------------|---------|------|
| **python-dotenv** | `1.0.1` | Loads `.env` variables into the FastAPI application config |

---

## ☁️ Services & Platforms

| Service | Role |
|---------|------|
| **Supabase** | Managed PostgreSQL database + Row Level Security |
| **GitHub OAuth** | Authentication provider — users sign in with their GitHub account |
| **GitHub REST API v3** | Repository data, user stats, PR counts, repo health |
| **GitHub GraphQL API v4** | Contribution calendar (heatmap data) |
| **Google Gemini 1.5 Flash** | All AI generation features |
| **YouTube Embed API** | Background lo-fi/synthwave music streams in Vibe Mode |

---

## 🔐 Security & Auth

| Feature | Implementation |
|---------|---------------|
| **OAuth 2.0** | GitHub OAuth via NextAuth.js with `read:user`, `user:email`, `repo` scopes |
| **JWT Sessions** | Server-side JWT tokens storing `accessToken`, `username`, `githubId` |
| **Bearer Token Auth** | FastAPI validates every request via `Authorization: Bearer <github_token>` header, calls `/user` on GitHub API to authenticate |
| **CORS** | FastAPI CORS middleware configured for frontend origin |

---

## 🧰 Developer Tooling

| Tool | Role |
|------|------|
| **TypeScript** | Type safety across entire Next.js frontend |
| **ESLint** | Code linting with Next.js recommended rules |
| **PostCSS + Autoprefixer** | CSS processing pipeline |
| **Turborepo** | Monorepo task orchestration with intelligent caching |

---

## 📁 Project Structure Summary

```
devnexus/
├── apps/
│   ├── web/          # Next.js 14 frontend (TypeScript)
│   │   ├── app/      # App Router pages
│   │   ├── components/  # Feature components
│   │   ├── lib/      # API client, utilities
│   │   └── stores/   # Zustand global state
│   └── api/          # FastAPI backend (Python)
│       ├── routers/  # REST endpoints (ai, todos, notes, hackathons, github)
│       ├── services/ # Gemini, GitHub, Narrator, Scheduler
│       ├── models/   # Pydantic schemas
│       └── middleware/ # Auth middleware
├── packages/         # Shared packages (tsconfig, eslint)
├── turbo.json        # Turborepo pipeline config
└── package.json      # Monorepo root
```

---

## 🤖 AI Features Powered by Gemini 1.5 Flash

| Feature | Prompt Type | Output |
|---------|-------------|--------|
| Daily Chronicle | Context injection (commits + todos + notes) | JSON: headline, narrative, mood |
| Weekly Arc | Week-long activity summary | JSON: title, chapters, epilogue, XP, badges |
| Todo Auto-Score | Task title + description | Integer 1–100 |
| Subtask Generator | Task title | JSON array of 3–5 subtasks |
| Hackathon Pitch | Project name + description + stack | Markdown pitch (5 sections) |
| Judge Simulator | Project idea | JSON: scores per dimension, grade |
| Idea Expander | One-liner idea | Structured markdown feature spec |
| NEXUS AI Chat | Full developer context injection | Conversational markdown response |

# DevNexus

> **The developer command center for turning GitHub activity into focused momentum.**

DevNexus is a full-stack developer workspace that brings repository context, AI-assisted progress narratives, notes, smart TODOs, hackathon planning, and live activity into one dashboard. It is designed for developers who want their tools to reflect the work they are actually shipping.

<p align="center">
  <a href="https://github.com/vincenzo-afk/DEVNEXUS/actions/workflows/ci.yml"><img src="https://github.com/vincenzo-afk/DEVNEXUS/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="https://github.com/vincenzo-afk/DEVNEXUS/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6.svg" alt="MIT license"></a>
  <a href="https://img.shields.io/github/stars/vincenzo-afk/DEVNEXUS"><img src="https://img.shields.io/github/stars/vincenzo-afk/DEVNEXUS?style=flat&color=22d3ee" alt="GitHub stars"></a>
</p>

## Product walkthrough

The walkthrough below is stored in this repository and is embedded directly in this README as a native HTML5 video. Use the controls to play, pause, or replay it.

<p align="center">
  <video controls playsinline preload="metadata" poster="https://raw.githubusercontent.com/vincenzo-afk/DEVNEXUS/main/docs/devnexus-demo-poster.jpg" width="100%">
    <source src="https://raw.githubusercontent.com/vincenzo-afk/DEVNEXUS/main/docs/devnexus-demo.mp4" type="video/mp4">
    Your browser does not support embedded video. <a href="https://raw.githubusercontent.com/vincenzo-afk/DEVNEXUS/main/docs/devnexus-demo.mp4">Play or download the DevNexus walkthrough</a>.
  </video>
</p>

A standalone version of the same player is available at [`docs/devnexus-demo.html`](./docs/devnexus-demo.html).

## What DevNexus brings together

| Workspace | Purpose |
| --- | --- |
| **GitHub Command Center** | Review repository statistics, contribution activity, repository health signals, and GitHub events from one view. |
| **AI Progress Narrator** | Turn recent developer activity into a daily chronicle, weekly arc, and shareable progress narrative. |
| **Smart TODO Engine** | Capture tasks with voice input, prioritize them with AI, generate subtasks, and move work through a Kanban or list view. |
| **Project Notebook** | Keep repository-linked Markdown notes with previews, version history, diffs, and AI-assisted idea expansion. |
| **Hackathon Mission Control** | Track phases, deadlines, checklists, pitch preparation, and judge-style feedback for hackathon projects. |
| **NEXUS AI Assistant** | Ask questions against the context of your repositories, notes, TODOs, activity, and hackathon work. |
| **Live Activity Feed** | Follow pushes, pull requests, issues, stars, and forks with filtering and notification state. |
| **Themes and PWA support** | Personalize the workspace and use the responsive application on desktop or mobile. |

## Architecture

DevNexus is organized as a Turborepo monorepo with a Next.js frontend and FastAPI backend.

```text
DEVNEXUS/
├── apps/
│   ├── web/                  # Next.js 14 + TypeScript application
│   │   ├── app/              # App Router pages and route handlers
│   │   ├── components/       # Dashboard, GitHub, notes, TODO, and hackathon UI
│   │   ├── lib/              # API, GitHub, Supabase, and utility clients
│   │   └── stores/           # Zustand state stores
│   └── api/                  # FastAPI application
│       ├── routers/          # AI, GitHub, notes, TODOs, hackathons, and utilities
│       ├── services/         # AI, GitHub, narrator, and scheduler services
│       ├── models/            # Pydantic schemas
│       └── middleware/        # Authentication middleware
├── packages/
│   ├── database/             # SQL schema and migrations
│   └── shared-types/         # Shared TypeScript types
├── docs/
│   ├── devnexus-demo.html    # Standalone HTML5 video player
│   ├── devnexus-demo.mp4     # README product walkthrough
│   └── devnexus-demo-poster.jpg
├── .github/workflows/        # CI and deployment workflows
├── docker-compose.yml
├── package.json
└── turbo.json
```

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Zustand, Framer Motion, Recharts |
| Backend | FastAPI, Python, Pydantic, HTTPX, Uvicorn |
| Data and realtime | Supabase and PostgreSQL |
| AI | Google Gemini through the backend AI service |
| Developer platform | GitHub OAuth, GitHub REST API, GitHub GraphQL API |
| Tooling | Turborepo, npm workspaces, ESLint, Prettier, Docker Compose |

## Quick start

### Prerequisites

Install Node.js 18.17 or newer, npm 9 or newer, Python 3.11 or newer, and Git. A working local setup also needs GitHub OAuth credentials, a Supabase project, and a Google AI Studio API key for the connected features.

### 1. Clone and install

```bash
git clone https://github.com/vincenzo-afk/DEVNEXUS.git
cd DEVNEXUS
npm install
```

### 2. Configure the frontend

```bash
cp apps/web/.env.example apps/web/.env.local
```

Set the values required by the frontend, including the application URL, NextAuth secret, GitHub OAuth credentials, Supabase public credentials, and API URL.

### 3. Configure the backend

Create the backend environment file expected by the API and provide the Supabase, Gemini, GitHub, Redis, JWT, environment, and CORS values used by the service.

```bash
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..
```

### 4. Start the development services

Run the frontend and API in separate terminals:

```bash
# Terminal 1
cd apps/web
npm run dev
```

```bash
# Terminal 2
cd apps/api
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

The frontend is available at `http://localhost:3000`. The FastAPI documentation is available at `http://localhost:8000/docs`.

## Environment variables

Do not commit secrets. The repository includes the frontend template at [`apps/web/.env.example`](./apps/web/.env.example). The backend reads its configuration through the settings used in [`apps/api/config.py`](./apps/api/config.py).

| Area | Values used by the project |
| --- | --- |
| Frontend | NextAuth URL and secret, GitHub OAuth client values, Supabase URL and anonymous key, frontend API URL |
| Backend | Supabase URL and service key, Gemini API key, GitHub token, Redis URL, secret key, environment, CORS origins |

## Quality checks

The repository CI workflow runs frontend linting and type checks together with backend dependency installation, linting, and tests.

```bash
npm run lint
npm run type-check
npm run test
```

For the API-specific checks:

```bash
cd apps/api
ruff check .
pytest --tb=short -q
```

## Contributing

Contributions are welcome. Please open an issue for a focused bug report or feature proposal, then create a branch from `main` using a descriptive prefix such as `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, or `chore/`. Keep changes small enough to review, update the relevant documentation, and run the applicable checks before opening a pull request.

## License

DevNexus is released under the [MIT License](./LICENSE).

## Links

- [Live demo](https://devnexus-web.vercel.app/)
- [Challenges and project notes](./CHALLENGES.md)
- [Technology reference](./TECHNOLOGIES.md)
- [Issue tracker](https://github.com/vincenzo-afk/DEVNEXUS/issues)
- [Pull requests](https://github.com/vincenzo-afk/DEVNEXUS/pulls)

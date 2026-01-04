# CoParent UI

React + Vite frontend scaffold aligned to `docs/standards/frontend`.

## Stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- React Router v6
- TanStack Query + Zustand
- Auth0 via @auth0/auth0-react
- PWA via vite-plugin-pwa + Workbox
- Testing via Vitest + Testing Library + MSW

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in values before running.

Optional UI environment variables:
- `VITE_IDLE_TIMEOUT_MINUTES` (default: 3 in dev, 10 in prod)
- `VITE_IDLE_TIMEOUT_SHOW_COUNTDOWN` (set `true` to display the on-screen countdown)

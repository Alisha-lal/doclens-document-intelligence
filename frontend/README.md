# DocLens Frontend

React + Vite single-page app. See the [root README](../README.md) for full
project documentation, architecture, and setup instructions.

## Quick start

```bash
npm install
cp ../.env.example .env    # or set VITE_API_URL manually
npm run dev
```

Runs at `http://localhost:5173` by default, expecting the backend at
`http://localhost:8000` (configurable via `VITE_API_URL`).

## Build

```bash
npm run build
```

Outputs to `dist/`, ready to deploy to Vercel or any static host.

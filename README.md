# trading-journal

A premium, light-themed Trading Journal Dashboard built with React, Tailwind CSS, and modern frontend tooling.

## Features

- **Dashboard** — Welcome stats, performance charts, quick navigation, analytics
- **Entry Trade** — Full trade form with strategy selection, dynamic criteria checkboxes, image upload, live summary
- **Daily Trade** — Timeline, filters, calendar date filtering
- **Weekly / Monthly Reports** — Performance metrics and charts
- **Full Strategy** — Liquidity Sweep & Liquidity Run playbook cards
- **Settings** — Profile and preferences

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router, Framer Motion, React Hook Form, Zod
- Recharts, React Dropzone, date-fns, Lucide Icons
- shadcn/ui-style component library

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Backend Ready

Trade data is structured via `TradeEntry` types and `TradeContext` for easy PostgreSQL/API integration.

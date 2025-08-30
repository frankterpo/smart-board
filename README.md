# Kanban Clone Starter (Brand-Neutral)

A minimal, brand-agnostic Kanban board scaffold.

- Next.js (App Router) + React + TypeScript
- TailwindCSS
- Zustand for state
- @tanstack/react-query for data
- @dnd-kit planned for drag-and-drop (hook points ready)

## Getting Started

```bash
npm install   # or pnpm/yarn
npm run dev   # open http://localhost:3000
```

## Features in this starter
- Multi-list board with inline card add
- Local, persisted store with mock REST API
- Event bus (`lib/events.ts`) for instrumentation
- Neutral design tokens in `styles/tokens.css`

## Roadmap
- Drag-and-drop with keyboard fallback
- Card modal: description, checklist, labels, due date, comments
- Simple filter and toasts
- Optional WebSocket mock for realtime moves

## Accessibility
- Enter to add, Esc to cancel inline add
- Focus-visible outlines; add ARIA roles as modal/drag features land

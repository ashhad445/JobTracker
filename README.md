# Job Tracker 📋

A sleek, drag-and-drop Kanban board for managing your job applications — built with React, TypeScript, and Framer Motion.

![Job Tracker](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)
![dnd-kit](https://img.shields.io/badge/dnd--kit-drag%20%26%20drop-FF6B6B?style=flat-square)

---

## Features

- **Kanban Board** — Four columns: Applied → Interview → Offer → Rejected
- **Drag & Drop** — Smooth card dragging between and within columns, with full touch support for mobile
- **Add & Edit Jobs** — Form with company, role, date, salary, job link, priority, notes, and interview date
- **Delete Jobs** — With a confirm step to prevent accidents
- **Live Search** — Instantly filter cards across all columns by company or role
- **Stats Bar** — At-a-glance counts for each stage and response rate
- **CSV Export** — Download all your applications as a spreadsheet with one click
- **Dark / Light Mode** — System-aware toggle that switches the whole app smoothly
- **Persistent Storage** — Everything is saved to `localStorage` — no backend needed
- **Fully Responsive** — Modals become bottom sheets on mobile, header adapts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Custom Properties |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | `useReducer` + `localStorage` |
| Bundler | Vite |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/ashhad445/JobTracker.git
cd JobTracker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── App.tsx                          # Root component, header, layout
├── index.css                        # Design system, animations, dark mode vars
├── types/index.ts                   # TypeScript interfaces (Job, BoardAction, etc.)
├── hooks/
│   └── useJobBoard.ts               # useReducer + localStorage persistence
├── components/
│   ├── Board/
│   │   ├── Board.tsx                # DndContext, drag handlers, sensors
│   │   ├── Column.tsx               # Droppable columns with stagger animations
│   │   └── JobCard.tsx              # Draggable glass cards with per-column glow
│   ├── Modals/
│   │   ├── AddJobModal.tsx          # Controlled form modal (portal rendered)
│   │   └── JobDetailModal.tsx       # View / edit / delete modal
│   └── StatsBar/
│       └── StatsBar.tsx             # Animated stat pill cards
└── utils/
    └── exportCSV.ts                 # CSV export via Blob + URL.createObjectURL
```

---

## Key Concepts Demonstrated

- **`useReducer`** for complex, predictable state transitions (add, move, update, delete jobs)
- **Discriminated union actions** for type-safe dispatch
- **Derived state** — stats and filtered results are computed during render, never stored
- **`createPortal`** — modals render directly into `<body>` to avoid z-index and overflow issues
- **CSS Custom Properties** for theming — a single `.dark` class on `<html>` flips the entire design
- **Framer Motion** — spring animations, staggered list reveals, `AnimatePresence` for enter/exit
- **@dnd-kit** — drag events, collision detection, touch support, and sortable reordering

---

## License

MIT

# 🏆 Sybadges — Youth Achievement Portal

A gamified youth achievement tracking platform for **ناشئة الشارقة** (Sharjah Youth). Members earn digital badges, build streaks, climb leaderboards, and share success stories — all through a trophy-inspired gamification system.

## ✨ Features

- **🏅 Digital Badges** — Bronze, silver, gold, and platinum badges awarded manually or automatically via metrics, streaks, or composite prerequisites
- **📊 Metrics & Events** — Track activities (workshops, volunteering hours, books read, etc.) with a flexible event-driven metrics engine
- **🔥 Streaks** — Daily/weekly/monthly streak tracking with freeze mechanics to keep members engaged
- **🏆 Leaderboards** — Perpetual and repeating leaderboards ranked by metrics, points, or streaks
- **⭐ Points & Levels** — Configurable point systems with triggers, boosts, and tiered levels
- **📖 Success Stories** — Showcase featured member stories with bilingual (Arabic/English) support
- **🔔 Notifications** — Templated in-app and email notifications for achievements, streak reminders, recaps, and reactivation
- **🔗 Webhooks** — Subscribe external systems to platform events with signed deliveries and retries
- **🌙 Dark Mode** — Built-in theme toggle
- **🌍 RTL & Arabic-first** — Full Arabic UI with right-to-left layout

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, standalone output) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| Database | SQLite via Prisma ORM (migration-ready for PostgreSQL) |
| Auth | NextAuth.js |
| State | Zustand, TanStack Query |
| Tables & Charts | TanStack Table, Recharts |
| Forms | React Hook Form + Zod |
| i18n | Next Intl |
| Runtime | Bun |

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Push the Prisma schema to the database
bun run db:push

# Generate the Prisma client
bun run db:generate

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Other Commands

```bash
# Build for production
bun run build

# Start the production server
bun start

# Run ESLint
bun run lint

# Run database migrations
bun run db:migrate
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public landing page (success stories)
│   ├── signin/               # Sign-in page
│   ├── admin/                # Admin dashboard
│   │   ├── dashboard/        # Overview & stats
│   │   ├── members/          # Member management
│   │   ├── approvals/        # Badge approval workflow
│   │   ├── metrics/          # Metrics configuration
│   │   ├── points/           # Points & levels setup
│   │   ├── streaks/          # Streak definitions
│   │   └── leaderboards/     # Leaderboard management
│   ├── member/               # Member portal
│   │   ├── achievements/     # View earned badges
│   │   ├── badges/           # Browse available badges
│   │   ├── streaks/          # Track personal streaks
│   │   ├── leaderboards/     # View rankings
│   │   └── profile/          # Member profile
│   └── api/                  # REST API routes
│       ├── members/
│       ├── badges/
│       ├── achievements/
│       ├── metrics/
│       ├── events/
│       ├── points/
│       ├── streaks/
│       ├── leaderboards/
│       └── success-stories/
├── components/               # Reusable React components
│   └── ui/                   # shadcn/ui primitives
├── contexts/                 # React context providers (Auth, Theme)
├── hooks/                    # Custom React hooks
└── lib/                      # Utilities & configurations
```

## 📄 License

This project is private.

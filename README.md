# 🏆 Sybadges — بوابة إنجازات ناشئة الشارقة

**Achievement & Badge Management Portal** for Sharjah Youth (ناشئة الشارقة).

A digital portal for managing member achievements, issuing badges, tracking approvals, and showcasing success stories.

---

## ✅ Currently Implemented (v1)

| Module | Status |
|--------|--------|
| Admin authentication (NextAuth credentials) | ✅ |
| Member records & profiles | ✅ |
| Badge catalog (CRUD) | ✅ |
| Achievement requests & approval workflow | ✅ |
| Success stories | ✅ |
| Admin dashboard & member management | ✅ |
| Arabic-first UI with RTL layout | ✅ |
| Dark mode support | ✅ |
| Metrics engine (event-driven activity tracking) | ✅ |
| Streaks (consecutive period tracking) | ✅ |
| Points & levels (configurable) | ✅ |
| Leaderboards (metric/points/streak-based) | ✅ |
| Event/audit log | ✅ |

---

## 🔜 Planned (v2+)

- Email notifications
- Webhook integrations with external systems
- Advanced analytics & reporting
- Member self-registration portal
- Public badge verification

---

## ❌ Out of Scope for v1

- Points boosts / seasonal multipliers
- Streak freeze mechanics
- Repeating/resetting leaderboards with run history
- A/B experimentation flags
- Notification templates & email delivery
- Webhook delivery infrastructure

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js (credentials) |
| Runtime | Bun |

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Push the Prisma schema to the database
bun run db:push

# Generate the Prisma client
bun run db:generate

# Seed with demo data (creates admin@sharjah.youth / admin123)
bun run db:seed

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

> ⚠️ Change the default admin password immediately after first login.

### Other Commands

```bash
bun run build       # Build for production
bun start           # Start production server
bun run lint        # Run ESLint
bun run db:migrate  # Run database migrations
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public landing page (success stories)
│   ├── signin/               # Sign-in page (admin + member)
│   ├── admin/                # Admin dashboard
│   │   ├── dashboard/        # Overview & stats
│   │   ├── members/          # Member management
│   │   ├── approvals/        # Badge approval workflow
│   │   ├── badges/           # Badge catalog management
│   │   ├── metrics/          # Metrics configuration
│   │   ├── streaks/          # Streak definitions
│   │   ├── points/           # Points & levels setup
│   │   └── leaderboards/     # Leaderboard management
│   ├── member/               # Member portal
│   │   ├── page.tsx          # Member dashboard
│   │   ├── badges/           # Earned badges
│   │   ├── achievements/     # Achievement requests
│   │   ├── streaks/          # Personal streaks
│   │   ├── profile/          # Member profile
│   │   └── leaderboards/     # Leaderboard rankings
│   └── api/                  # REST API routes
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── seed.ts               # Database seed script
│   └── gamification/         # Points, streaks, leaderboards engine
└── contexts/
    ├── AuthContext.tsx        # NextAuth session wrapper
    └── ThemeContext.tsx       # Dark/light mode
```

---

## 👤 User Roles

| Role | Description | Access |
|------|-------------|--------|
| Admin | System administrator | Full access — member management, badge catalog, approvals |
| Approver | Program staff | Approve/reject achievement requests |
| Member | Youth participant | View own profile, request achievements, view leaderboards |
| Public | Unauthenticated visitor | View success stories on landing page |

---

## 🏅 Achievement Lifecycle

```
Member requests → Pending → Admin reviews → Approved / Rejected
```

- `pending` — submitted by member or created by admin
- `approved` — verified and badge awarded
- `rejected` — denied with reason

---

## 🗄️ Data Model Summary

**Core models:** Admin, Member, Badge, Achievement, SuccessStory, Photo

**Gamification (v1):** Metric, MetricEvent, MemberMetricTotal, Streak, MemberStreak, StreakHistory, PointsConfig, PointsTrigger, PointsLevel, MemberPoints, Leaderboard, LeaderboardEntry

**System:** EventStore (audit log), SystemLock

---

## ⚠️ Known Limitations

- No real password hashing — passwords stored as plain text (must add bcrypt before production)
- Member auth uses memberId/email lookup without a dedicated password field — needs password field added to `Member` model for production
- No rate limiting on API routes
- No file upload infrastructure for badge icons and photos (field exists, upload not wired)
- Mock data still used on the public landing page (`src/app/page.tsx`) — needs migration to DB-driven success stories

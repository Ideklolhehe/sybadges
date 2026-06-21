# Product Scope — Sybadges

## What is Sybadges?

Sybadges is an **Achievement & Badge Management Portal** for ناشئة الشارقة (Sharjah Youth). It provides a structured way to record, verify, and celebrate youth achievements through a digital badge system.

---

## The Problem It Solves

Youth program administrators currently manage achievement records manually or through generic tools. Sybadges provides:
- A single source of truth for member achievements
- A governed approval workflow for badge issuance
- A public-facing showcase of success stories
- A member-facing portal to track personal progress

---

## Who Are the Users?

| User | Description |
|------|-------------|
| **Admin / Program staff** | Issue badges, manage members, review and approve achievement requests |
| **Member (Nashia)** | Youth participants who earn badges, track streaks and points, view their progress |
| **Public visitor** | Anyone who views success stories on the landing page (no login required) |

---

## What Counts as an Achievement?

An achievement is a verified accomplishment tied to a specific badge. It can be:
- Manually submitted by a member (with evidence)
- Manually awarded by an admin
- Automatically triggered by reaching a metric threshold (e.g., 100 volunteer hours)

---

## Who Grants a Badge?

1. A **member** submits an achievement request
2. An **admin/approver** reviews the request and approves or rejects it
3. On approval, the badge is recorded on the member's profile

---

## V1 MVP Scope

**In scope:**
- Admin and member authentication (NextAuth credentials)
- Member records (create, view, update)
- Badge catalog (CRUD)
- Achievement request and approval workflow
- Success stories (create, feature, display publicly)
- Basic admin dashboard (stats overview)
- Metrics engine (track activity events)
- Streaks (consecutive period tracking, no freeze mechanics)
- Points and levels (configurable triggers)
- Leaderboards (single perpetual ranking)
- Audit/event log
- Arabic-first RTL UI
- Dark mode

**Out of scope for v1:**
- Email notifications
- Webhook integrations
- Points boosts / seasonal multipliers
- Streak freeze mechanics
- Repeating/resetting leaderboards
- A/B experimentation
- Member self-registration
- Public badge verification API

---

## Roadmap

### Phase 1 (Current) — Core Portal
Members, badges, achievements, approvals, success stories, basic gamification

### Phase 2 — Enhanced Gamification
Metric auto-awarding, streak improvements, leaderboard improvements

### Phase 3 — Notifications
In-app notifications, email digests, achievement reminders

### Phase 4 — Integrations
Webhooks for external system integrations, API keys

### Phase 5 — Analytics
Advanced reporting, achievement rarity stats, cohort analysis

---

## Badge Governance

| Question | Answer |
|----------|--------|
| Who creates a badge? | Admin only |
| Who awards a badge? | Admin approves; member can request |
| Can a badge be edited after use? | Badge metadata can be updated; existing awards are not retroactively changed |
| Can a badge be deleted? | Soft delete (isActive = false) — existing awards remain |
| What if criteria change? | Existing awards stand; future awards use new criteria |

---

## Data Definitions

| Field | Meaning |
|-------|---------|
| `Member.level` | Membership tier: bronze → silver → gold → platinum. Can be manually set or derived from points level |
| `Achievement.status` | `pending` = submitted, awaiting review; `approved` = badge granted; `rejected` = denied |
| `Streak.frequency` | How often the streak period resets: `daily`, `weekly`, `monthly` |
| `Leaderboard.rankingMethod` | How scores are calculated: `metric` (total metric value), `points` (total points), `streak` (current streak length) |

---

## Security & Privacy Assumptions

- Member data (name, photo, achievements) is visible to admins only by default
- Success stories are public only when `isFeatured = true` and explicitly approved for publication
- Member photos require consent before public display
- Password hashing (bcrypt) must be implemented before production deployment
- All admin actions should be logged in the EventStore for audit purposes

# Cal Scheduler

Cal.com-style scheduling platform built with Next.js App Router, TypeScript, Tailwind, ShadCN UI, Prisma, and PostgreSQL.

## 1) Project Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run prisma:seed
npm run dev
```

App runs on `http://localhost:3000`.

## 2) Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cal_scheduler?schema=public"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@calclone.dev"
APP_URL="http://localhost:3000"
RESCHEDULE_TOKEN_SECRET="replace-with-strong-random-secret"
```

## 3) Database Schema Explanation

`prisma/schema.prisma` includes:

- `users`: host profile (single default owner user).
- `event_types`: meeting templates with slug, duration, buffer settings.
- `availability`: weekly day/time windows with timezone.
- `date_override`: blocked date support (bonus feature).
- `bookings`: guest bookings, statuses, anti-overlap constraints.

Key integrity and performance:

- `@@unique([eventTypeId, startTime])` prevents double booking race conditions.
- Indexes on `event_types.slug`, `availability(userId, dayOfWeek)`, and booking time lookups.
- Cascade delete relations to keep data clean.

## 4) Folder Structure

```text
src/
  app/
    api/
      availability/route.ts
      bookings/route.ts
      bookings/[id]/route.ts
      event-types/route.ts
      event-types/[id]/route.ts
      public/event-types/[slug]/route.ts
      slots/route.ts
    availability/page.tsx
    book/[slug]/page.tsx
    book/[slug]/confirmation/page.tsx
    event-types/new/page.tsx
    event-types/[id]/edit/page.tsx
    page.tsx
  components/
    providers/query-provider.tsx
    availability-form.tsx
    bookings-list.tsx
    dashboard-shell.tsx
    event-type-form.tsx
    event-type-list.tsx
    public-booking-form.tsx
    ui/*
  controllers/
  lib/
  routes/
  services/
prisma/
  schema.prisma
  seed.ts
```

## 5) API Design

Implemented REST endpoints:

- `POST /api/event-types`
- `GET /api/event-types`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`
- `POST /api/availability`
- `GET /api/availability`
- `GET /api/slots?date=...&eventTypeId=...`
- `POST /api/bookings`
- `GET /api/bookings`
- `DELETE /api/bookings/:id`
- `PATCH /api/bookings/:id` (host-side reschedule)
- `GET /api/analytics`
- `GET /api/public/bookings/:id/reschedule?token=...`
- `PATCH /api/public/bookings/:id/reschedule?token=...`

## 6) Feature Coverage

- Event types management with slug generation and edit/delete.
- Weekly availability with day toggles and time windows.
- Public booking page with date picker + available slots.
- Booking confirmation page.
- Bookings dashboard for upcoming/past bookings + cancellation.
- Reschedule support for host dashboard and guest secure token link.
- Analytics overview (conversion, busiest day, top event type, funnel).
- No-show risk score on upcoming bookings.
- Buffer handling, date override model, and optional email confirmation (SMTP).

## 7) Business Logic and Edge Cases

- No overlapping booking writes through transaction + unique constraint.
- Slot generation respects:
  - availability windows
  - existing bookings
  - event duration
  - buffer before/after
- Prevents past time booking.
- Validates invalid slug and malformed input with Zod.
- Handles empty availability safely by returning no slots.

## 8) Deployment (Vercel + Railway)

### Vercel (Frontend + API routes)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variables from `.env.example`.
4. Build command: `npm run build`.
5. Output: default Next.js.

### Railway (PostgreSQL)

1. Create a new PostgreSQL service.
2. Copy Railway `DATABASE_URL`.
3. Set same `DATABASE_URL` in Vercel project env vars.
4. Run migrations:
   - locally: `DATABASE_URL=<railway-url> npm run prisma:migrate -- --name prod-init`
   - or in CI using `prisma migrate deploy`.

## 9) Local Development Workflow

```bash
npm run prisma:migrate -- --name <change_name>
npm run prisma:generate
npm run prisma:seed
npm run dev
```

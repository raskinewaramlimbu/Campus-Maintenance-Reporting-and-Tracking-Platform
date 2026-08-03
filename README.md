# FixMyCampus (Distinction build)

This is the CPS7005C reporting platform built out to the **Distinction** band: everything from
Pass and Merit, plus MongoDB persistence, staff authentication, an analytics dashboard,
notifications/reminders, CSV/PDF export, and hardened security middleware.

It's still two separate apps - an Express/MongoDB API and a React (Vite) frontend - talking over
REST, same as the Merit version. If you're coming from that version: the main structural change
is that `backend/utils/db.js` (the JSON-file store) has been replaced with Mongoose models
talking to a real MongoDB database, and there's now a staff login layer guarding the
management-side features.

## What's new since Merit

| Area | What changed |
|---|---|
| Persistence | JSON file → MongoDB via Mongoose (`models/Report.js`, `models/User.js`) |
| Auth | JWT-based staff login (`routes/auth.js`, `middleware/auth.js`). Reporting and browsing stay open to everyone - only edit/delete/status-change/analytics/export require a staff account |
| Analytics | `/api/analytics/summary` - common categories, hotspots, average resolution time, computed with MongoDB aggregation pipelines. Rendered as a bar chart + lists on the `/dashboard` page (Recharts) |
| Notifications/reminders | `/api/analytics/reminders` surfaces reports that have sat open past a threshold (`REMINDER_THRESHOLD_DAYS`, default 3 days) right in the dashboard. A daily cron job (`utils/reminders.js`, `node-cron`) also emails a digest of the same list to every staff account - or logs it to the console if no SMTP credentials are configured, so the feature is demonstrable without needing real email creds |
| Export | `/api/export/csv` and `/api/export/pdf` (PDFKit), respecting the same category/status/location filters as the reports list. Buttons on the dashboard |
| Security | Helmet (secure headers), `express-rate-limit` (general API limiter + a stricter one on login), `express-mongo-sanitize` (blocks NoSQL operator injection like `{"$gt": ""}` in query params), bcrypt password hashing, JWTs with expiry, `.env`-based config so secrets aren't hardcoded |

## Why staff accounts exist but reporting doesn't need one

Submitting and browsing reports is still open to anyone - that was a deliberate choice at Merit
level and it still holds here. Requiring a login just to report a leak would put people off using
the service. Staff accounts exist specifically to gate the *management* side: editing details,
changing status, deleting, viewing analytics, and exporting data. That split is documented in
`routes/reports.js` and repeated in the report for justification.

## Running it locally

You need Node.js 18+ and a MongoDB connection - either a local `mongod`, Docker, or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster (the brief lists Atlas explicitly, and
it's the easiest option if you don't want to install MongoDB locally).

```bash
# Backend
cd backend
npm install
cp .env.example .env
# edit .env - set MONGODB_URI to your local mongod or Atlas connection string,
# and change JWT_SECRET to something random
npm run seed     # populates sample reports + creates a demo staff login
npm start         # -> http://localhost:4000
```

```bash
# Frontend (separate terminal)
cd frontend
npm install
npm run dev        # -> http://localhost:5173
```

The seed script (`backend/utils/seed.js`) creates a demo staff account:
**staff@fixmycampus.test / password123** - use that to log in and see the dashboard, or register
your own from the `/register` page.

`npm run build` inside `frontend/` produces a static `dist/` folder for deployment.

## Project structure

```
fixmycampus-distinction/
  backend/
    server.js                 Express app entry point (helmet, rate limiting, sanitisation, routes)
    config/db.js               Mongoose connection
    models/Report.js           Report schema, indexes, resolvedAt timestamp logic
    models/User.js             Staff account schema, password hashing
    routes/reports.js          Public read/create, staff-only edit/status/delete
    routes/auth.js             Register/login, JWT issuing, login rate limiting
    routes/analytics.js        Aggregation pipelines for the dashboard + reminders
    routes/export.js           CSV and PDF export (staff-only)
    routes/guidance.js         Static guidance content (unchanged from Pass)
    routes/geocode.js          OpenStreetMap Nominatim proxy (unchanged from Merit)
    middleware/auth.js         JWT verification middleware
    utils/reminders.js         Daily cron job for the reminder email digest
    utils/reminderMailer.js    Nodemailer wrapper (falls back to console logging without SMTP creds)
    utils/seed.js               Seeds sample reports + a demo staff account
  frontend/
    src/pages/                  Home, SubmitReport, Reports, ReportDetail, Guidance, Privacy,
                                 Login, Register, Dashboard
    src/context/AuthContext.jsx JWT/user state, exposed via useAuth()
    src/components/ProtectedRoute.jsx  Redirects to /login if not authenticated
    src/api/client.js           Axios wrapper, attaches JWT automatically, handles file downloads
```

## How this maps to the Distinction criteria

- **MongoDB persistence** - `models/Report.js`, `models/User.js`, `config/db.js`
- **Analytics dashboard** (common categories, hotspots, resolution times) - `routes/analytics.js`
  aggregation pipelines, rendered on `frontend/src/pages/Dashboard.jsx`
- **Notifications/reminders** - in-app "needs attention" list plus a scheduled email digest
  (`utils/reminders.js` + `utils/reminderMailer.js`)
- **Export reports (CSV/PDF)** - `routes/export.js`, download buttons on the dashboard
- **Enhanced security and privacy** - Helmet, rate limiting, Mongo sanitisation, bcrypt, JWT
  expiry, `.env`-based secrets (see table above); privacy notice updated on the `/privacy` page
  to explain what staff accounts store
- **Authentication (optional)** - implemented as a staff-only layer rather than gating the whole
  app, with the reasoning for that split documented above

## Known limitations (worth mentioning in the report)

- Registration is currently open to anyone (no invite code or admin approval) - fine for a
  coursework demo, but flagged explicitly as something a real deployment would lock down.
- The reminder email digest sends to every staff account rather than a filtered subset (e.g. by
  category ownership) - a reasonable next step if this were extended further.
- No refresh-token flow - JWTs simply expire after `JWT_EXPIRES_IN` (8 hours by default) and the
  user has to log in again. Acceptable for this scope; a production app would add refresh tokens.
- PDF export is a plain listing rather than a styled report - deliberately kept simple so it's
  reliable rather than fragile.

## About the Git history

As with the Merit version, this zip includes a single starting commit so the repo isn't empty.
Build your real commit history - branches, meaningful messages, tags for releases - on top of
this as you work, rather than relying on this scaffold commit for that criterion.

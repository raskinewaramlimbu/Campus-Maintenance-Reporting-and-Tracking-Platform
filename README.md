# FixMyCampus

Running it locally
You need Node.js 18+ and a MongoDB connection 
- either a local mongod, Docker, or a free MongoDB Atlas cluster (the brief lists Atlas explicitly,
- and it's the easiest option if you don't want to install MongoDB locally).

## Backend
cd backend
npm install
cp .env.example .env
# edit .env - set MONGODB_URI to your local mongod or Atlas connection string,
# and change JWT_SECRET to something random
npm run seed     # populates sample reports + creates a demo staff login
npm start         # -> http://localhost:4000/api/report

## Frontend
cd frontend
npm install
npm run dev        # -> http://localhost:5173

The seed script (backend/utils/seed.js) creates a demo staff account:
- staff@fixmycampus.test / password123 
- use that to log in and see the dashboard, or register your own from the /register page.

## Project Structure

fixmycampus/
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
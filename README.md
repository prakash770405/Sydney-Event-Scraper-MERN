# Sydney Event Scraper — MERN

A full-stack application that scrapes public Sydney events (Eventbrite), stores them in MongoDB, and exposes a React frontend and admin dashboard. Key features added since initial scaffolding:

- Multi-page scraping with Puppeteer + HTML fallback parsing to reliably collect event `image` and short `description`.
- Only events that include images are saved (configurable) and duplicates are deduplicated by title.
- Admin dashboard: import single event, `Import All` (bulk import), `Delete` single, `Delete All`.
- Leads flow: OTP verification with reuse of previously verified emails (no repeated OTP) and an admin-only Leads table.
- PDF ticket utilities added (frontend helpers; requires `jspdf` + `html2canvas`).

**Note:** this README documents the current app structure, environment variables, and developer workflows.

**Quick links**
- Frontend entry: [frontend](frontend)
- Backend entry: [backend](backend)
- Scraper: [backend/scraper/scrapeSydney.js](backend/scraper/scrapeSydney.js)
- Admin routes: [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js)

**Status:** actively maintained and enhanced — see changes in `frontend/src/pages` and `backend/routes`.

---

**Tech stack**

- Frontend: React, Vite, Tailwind (utility CSS), Axios
- Backend: Node.js, Express, Mongoose, Passport (Google OAuth)
- Scraper: Puppeteer (with fetch fallback)

---

**Project structure (high-level)**

See the main folders: [backend](backend) and [frontend](frontend). Key files:

- [backend/scraper/scrapeSydney.js](backend/scraper/scrapeSydney.js): multi-page scraper, deep-scrape for `og:description`/`og:image`, filters for events with images, upserts events.
- [backend/models/Event.js](backend/models/Event.js): `title`, `image`, `description`, `status`, `importedAt`, etc.
- [backend/models/Lead.js](backend/models/Lead.js): tracks `email`, `eventId`, `verified`, and `verificationCode`.
- [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js): scraper trigger, admin bulk import, delete endpoints, and leads listing.
- [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx): public homepage — image-first sorted cards, search, responsive design.
- [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx): admin view — import/delete single, import-all, delete-all, show leads.

---

**Environment variables (backend)**

Create `backend/.env` (based on `backend/.env.example`) and provide the following values:

- `MONGO_URI` — MongoDB connection string
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — for Google OAuth (admin sign-in)
- `SESSION_SECRET` — express-session secret
- `ADMIN_EMAILS` — comma-separated emails allowed to perform admin actions (optional; if empty any authenticated user can act as admin)
- `BREVO_TEMPLATE_ID` and `BREVO_SENDER_EMAIL` — for transactional verification emails (if using Brevo/Sendinblue)

Frontend env:
- `REACT_APP_API_URL` — e.g. `http://localhost:5000/api` (set in `frontend/.env`)

---

**How to run (development)**

1. Start backend

```bash
cd backend
npm install
npm start
```

2. Start frontend

```bash
cd frontend
npm install
npm run dev
```

3. Admin: sign in via Google on the frontend, then open the Admin Dashboard to run the scraper, import events, and view leads.

---

**Important endpoints (summary)**

- `POST /api/admin/scrape-sydney` — trigger the scraper (admin-only)
- `GET  /api/events/public` — public events (only imported events shown on homepage by default)
- `GET  /api/events` — admin list of scraped events
- `POST /api/events/import/:id` — import single event (admin)
- `POST /api/admin/events/import-all` — bulk-import all `status: new` events (admin)
- `DELETE /api/admin/events/:id` — delete single event (admin)
- `DELETE /api/admin/events` — delete all events (admin)
- `POST /api/lead/submit` — create lead / request ticket (sends OTP unless email previously verified)
- `POST /api/lead/verify` — verify OTP
- `GET  /api/admin/leads` — list leads (admin)

---

**Scraper behavior & tuning**

- Scraper visits multiple listing pages (configurable `maxPages`) to collect at least 20 candidate events.
- For reliability it uses Puppeteer deep-scrape of event pages, and an HTTP `fetch` fallback to parse `og:description` and `og:image` when navigation times out.
- By default the scraper filters to only store events that have an image. You can adjust this behavior in `backend/scraper/scrapeSydney.js`.

---

**Admin workflows**

- Run the scraper from the dashboard to refresh the pool of scraped events.
- Use `Import All` to mark all `new` events as `imported` (sets `importedAt` and `importedBy`).
- Only imported events are visible on the public homepage; admin pages list all scraped events.

---

**Leads & verification**

- Leads are saved with `email + eventId`. Duplicate leads are not saved repeatedly — the backend checks for existing `email`+`eventId` records.
- If an email was previously verified for any event, subsequent lead requests will not require OTP and will be auto-marked verified for the new event.
- Admins can view all leads from the dashboard (requires admin login).

---

**Troubleshooting**

- If the scraper logs `Navigation timeout` for many pages, try increasing the Puppeteer timeout in `backend/scraper/scrapeSydney.js` or run the scraper on a machine with a stable network.
- If `MongoNotConnectedError` appears, ensure `MONGO_URI` is correct and the backend process opens the connection before running the scraper.
- If admin actions are not permitted, check `ADMIN_EMAILS` in `backend/.env` (if set, only listed emails can perform admin actions).

---


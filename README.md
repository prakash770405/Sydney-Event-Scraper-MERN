# Sydney Event Scraper – MERN Stack

A full-stack **MERN application** that automatically scrapes public events in **Sydney**, stores them in a database, and displays them on a modern React frontend.  
The system includes **Google OAuth authentication**, an **admin dashboard**, and a **data scraping pipeline** using Puppeteer.

---

## 🚀 Features

- 🔍 Automated event scraping from public event platforms (Eventbrite)
- 🗄️ MongoDB database with duplicate prevention
- ⚙️ RESTful API using Node.js & Express
- 🎨 React frontend for browsing events
- 🔐 Google OAuth 2.0 authentication for admin access
- 📊 Admin dashboard to manage imported events
- 🕒 Event lifecycle tracking (new / imported)
- 🌐 AJAX communication using Axios

---

## 🛠️ Tech Stack

### Frontend
- React
- Axios
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js (Google OAuth)

### Scraping
- Puppeteer

---

## 📂 Project Structure

```
Assignment
├─ backend
│  ├─ config
│  │  └─ passport.js
│  ├─ models
│  │  ├─ Event.js
│  │  └─ Lead.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  └─ eventRoutes.js
│  ├─ scraper
│  │  └─ scrapeSydney.js
│  └─ server.js
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api.js
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  └─ EventCard.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ pages
│  │     ├─ Dashboard.jsx
│  │     └─ Home.jsx
│  └─ vite.config.js
└─ README.md

```

---

## ⚙️ Environment Setup

Create a `.env` file inside the `backend` folder using the example below.

### `backend/.env.example`

```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret

```
Assignment
├─ backend
│  ├─ config
│  │  └─ passport.js
│  ├─ middleware
│  │  └─ auth.js
│  ├─ models
│  │  ├─ Event.js
│  │  └─ Lead.js
│  ├─ package.json
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  └─ eventRoutes.js
│  ├─ scraper
│  │  └─ scrapeSydney.js
│  └─ server.js
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ EventCard.jsx
│  │  │  └─ Navbar.jsx
│  │  ├─ context
│  │  │  └─ AuthContext.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Login.jsx
│  │  │  └─ Logout.jsx
│  │  └─ services
│  │     └─ api.js
│  └─ vite.config.js
└─ README.md

```
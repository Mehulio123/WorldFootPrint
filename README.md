# 🌍 WorldFootprint

**WorldFootprint** is a personal travel analytics platform that turns your trips into interactive maps, routes, and insights.
Instead of just logging where you’ve been, it visualizes how you travel over time.

---

## ✨ Features

* 🗺️ Interactive world map

  * Heatmap view at global zoom
  * Route intensity view at local zoom

* 📊 Travel analytics

  * Total distance traveled
  * Distance by mode (flight, train, car, etc.)
  * Countries and regions visited
  * Year / region filtering

* 🔐 User accounts

  * Private travel data
  * Shareable public views with privacy controls

* 📥 CSV import

  * Bulk upload past travel history
  * Validation and partial import reporting

* 🧪 Demo mode

  * Pre-seeded dataset for easy exploration

---

## 🏗️ Tech Stack

**Frontend**

* Next.js (React + TypeScript)
* Tailwind CSS
* Mapbox GL JS

**Backend**

* NestJS (Node.js + TypeScript)
* RESTful API architecture

**Database**

* PostgreSQL
* Prisma ORM

**Deployment**

* Frontend: Vercel
* Backend + DB: Railway

---

## 🧠 Architecture Overview

* Frontend handles map rendering, filters, and UI state.
* Backend manages authentication, analytics calculations, CSV parsing, and privacy logic.
* PostgreSQL stores relational travel data (users → trips → segments → places).
* Mapbox renders GeoJSON route layers and heatmap visualizations.

The system is designed with a clear separation between:

* Data ingestion
* Analytics computation
* Visualization

---

## 📂 Project Structure

```
/frontend   → Next.js app
/backend    → NestJS API
/prisma     → Database schema & migrations
```

---

## 🗃️ Data Model (Simplified)

* User
* Trip
* Segment (origin → destination + mode)
* Place (lat/lng + country)
* ShareLink (optional public view)

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repo

```
git clone <repo-url>
cd worldfootprint
```

### 2. Install dependencies

```
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configure environment variables

Create `.env` files for:

* Database URL
* Mapbox token
* JWT secret

### 4. Run migrations

```
npx prisma migrate dev
```

### 5. Start development servers

```
# backend
npm run start:dev

# frontend
npm run dev
```

---

## 📌 Future Improvements

* Foreground GPS trip recording
* Optional mobile companion app
* Photo-based travel memories
* PostGIS integration for advanced geospatial queries

---

## 📜 Why This Project?

WorldFootprint was built to explore how structured data, visualization, and thoughtful product design can turn personal history into meaningful insights.

It demonstrates:

* Full-stack architecture
* Relational data modeling
* Analytics-driven features
* Clean, production-ready system design

---

If you'd like, I can also:

* Make a **more “startup-style” README** (shorter, punchier)
* Make a **more technical README** (with API routes and schema examples)
* Or create a **version optimized for recruiters scanning in 20 seconds**

Just tell me which style you prefer.

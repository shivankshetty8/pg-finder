# SKOLAR — Bangalore PG & Student Housing Finder 🎓🏠

[![GitHub Repo](https://img.shields.io/badge/GitHub-shivankshetty8%2Fpg--finder-181717?logo=github&logoColor=white)](https://github.com/shivankshetty8/pg-finder)
[![Live Demo](https://img.shields.io/badge/Demo-pgfinder--seven.vercel.app-00dfa2?logo=vercel&logoColor=white)](https://pgfinder-seven.vercel.app)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**SKOLAR** helps students across Bengaluru find verified, affordable paying guest (PG) accommodations, hostels, and coliving spaces near their college campuses.

---

## ✨ Features

- 🏛️ **380+ Bangalore Colleges**: Comprehensive coverage of Engineering, Medical, Dental, Nursing, Degree, Arts, Commerce, Law, and Management institutions across Bangalore.
- 🔍 **Instant Search & Autocomplete**: Quickly search colleges with area indicators, smooth navigation, and live result counts.
- 📍 **GPS Proximity & Distances**: Shows exact distance in kilometers from your chosen college campus.
- 🏷️ **Gender & Room Filters**: Filter listings by **Ladies**, **Gents**, and **Coliving** spaces.
- ⚡ **Sorting**: Sort by **Nearest to campus**, **Rent: Low to High**, **Rent: High to Low**, or **Top Rated**.
- ➕ **List a PG Form**: Modal allowing property owners and students to submit new PGs with area coordinates, photo presets, and amenities (WiFi, Food, AC, Laundry, Security, Gym, etc.).
- 🔄 **Supabase Cloud Sync**: Live cloud database integration with built-in resilient fallback for offline/local development.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/shivankshetty8/pg-finder.git
cd pg-finder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials (if you want live database syncing):
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```
*(If left empty, the application runs automatically with 380+ colleges in local fallback mode!)*

### 4. Start the local development server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 5. Build for production
```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase)

To link with a Supabase PostgreSQL backend, run the SQL script provided in [supabase_setup.sql](./supabase_setup.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard):
- Creates `colleges` and `pg_listings` tables
- Configures Row Level Security (RLS) public read/insert policies
- Creates the `pgs` spatial distance view calculating real GPS distances (in km) between colleges and PG properties.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

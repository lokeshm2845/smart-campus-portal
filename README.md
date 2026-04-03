# NMIMS Shirpur - Smart Campus Management Portal

A full-stack, enterprise-grade university management system built for NMIMS Shirpur campus. It supports intricate role-based authentications bridging students, faculty, and executive faculty (Deans, Directors, HODs) into one fluid real-time ecosystem.

## 🚀 Features
- **Cinematic, Interactive UI:** Designed with premium glassmorphism overlays, deep-maroon NMIMS branding, fluid CSS animations, and highly responsive components using modern flexbox/grid environments.
- **Multilevel Authentication Framework:** Secure login capabilities covering up to 8 different campus roles including Students, Admin, Deans, Librarians, and Department Directors.
- **Live Student Module:** End-to-end capabilities allowing students to view real-time attendance, enroll in departmental electives, submit course assignments directly to the server, and provide 1-5 star anonymous feedback onto faculty ledgers.
- **Faculty Broadcast Commands:** Professors can dynamically spin up new homework tasks or assignments, deploy them instantly to the designated class, and automatically enter student marks into the central database.
- **Executive Operations Dashboard:** Top-level dashboard available only to Directors/Deans for cross-referencing campus-wide module statuses, tracking mass student population aggregates, and observing unresolved complaint streams.
- **Strict Database Security Models:** Fully built around BCNF Normalization tracking highly integrated relational models involving composite keys and advanced schema architectures.

## 🛠️ Technology Stack
- **Frontend Container:** AngularJS (1.8.x), Modern HTML5 semantic structuring, Custom Vanilla CSS3 (variables, animations, glassmorphism)
- **Backend Infrastructure:** Node.js, Express.js REST APIs
- **Database Architecture:** MySQL 8+ handled via Node `mysql2` driver

## ⚙️ Running Locally (Development Mode)

1. **Database Initialization**
    - Install and launch XAMPP (or equivalent database software).
    - Open Apache and MySQL.
    - Go to `http://localhost/phpmyadmin` and create a database named `smart_campus_db`.
    - Import the file located in `database/database_setup.sql`.

2. **Run Application**
    - Open your terminal and change directory mapping to `/backend`.
    - Ensure Node packages are installed: `npm install`
    - Start up the live server environment: `npm start`
    - Navigate browser to: `http://localhost:3000`

## ☁️ Deployment Notes for Vercel
The repository includes a custom `vercel.json` and a modified `server.js` ensuring compatibility with Vercel's Serverless-Function hosting environments.

**Note:** Since local XAMPP databases cannot be accessed by Vercel environments, a production cloud database (such as Aiven or Supabase Postgres migrations) **must be utilized** and credential swaps made inside `backend/db.js` before remote deployment capabilities are enabled.

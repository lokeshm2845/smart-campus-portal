# NMIMS Shirpur - Smart Campus Management Portal

A full-stack university management system built for NMIMS Shirpur campus. It supports role-based authentication bridging students, faculty, and executive faculty (Deans, Directors, HODs) into one fluid real-time ecosystem.

## 🚀 Features
- **Cinematic UI:** Premium glassmorphism, NMIMS branding, and fluid CSS animations.
- **Multilevel Auth:** Secure login for 8 different campus roles including Students, Admin, and Deans.
- **Live Modules:** Real-time attendance, elective enrollment, and faculty feedback.
- **Executive Dashboard:** High-level overview for Directors/Deans to track campus aggregates.

## 🛠️ Technology Stack
- **Frontend:** AngularJS (1.8.x), HTML5, Vanilla CSS3 (Variables, Flexbox, Grid).
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (Hosted on **Supabase**).

---

## ⚙️ Local Development Setup

1. **Clone the Project**
   ```bash
   git clone [your-repo-url]
   cd smart-campus-portal
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_supabase_connection_string
   PORT=3000
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Initialize Database**
   Run the automated setup script to create tables and sample data on your Supabase instance:
   ```bash
   node setup-db.js
   ```

5. **Run the App**
   ```bash
   npm start
   ```
   Navigate to: `http://localhost:3000`

---

## ☁️ Deployment (Vercel)

This project is optimized for Vercel Serverless Functions.

1. **Push to GitHub**: Ensure your code is in a GitHub repository.
2. **Import to Vercel**: Connect your repo to Vercel.
3. **Set Environment Variables**:
   In the Vercel dashboard (**Settings > Environment Variables**), you **MUST** add:
   - `DATABASE_URL`: Your full Supabase connection string.
4. **Deploy**: Vercel will build and host your project at a custom `.vercel.app` URL.

> [!IMPORTANT]
> Without the `DATABASE_URL` environment variable in Vercel, the app will throw an `ECONNREFUSED` error.

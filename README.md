# ADaffiliateMedia Platform

Full-stack affiliate marketing platform with Worker management, CPA Offers, Smartlinks, Postback tracking, and Withdrawal system.

## Project Structure

```
adaff/
├── backend/          ← Node.js + Express + MongoDB API
│   ├── models/       ← Worker, Lead, Withdrawal schemas
│   ├── routes/       ← auth, workers, offers, leads, withdrawals, postback
│   ├── middleware/   ← JWT auth middleware
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/         ← React + Vite SPA
    ├── src/
    │   ├── pages/    ← Auth, AdminDashboard, WorkerDashboard
    │   ├── components/
    │   └── utils/    ← api.js, invoice.js
    ├── index.html
    └── package.json
```

## Quick Start (Local)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Running on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit VITE_API_URL=http://localhost:5000
npm install
npm run dev
# Running on http://localhost:5173
```

## Postback URL

```
GET https://your-backend.railway.app/postback?worker_id=W00001&offer_id=3&payout=15&status=lead&click_id=abc123
```

## Admin Login
- Email: `admin@adaff.com`
- Password: `admin123`
(Set via ADMIN_EMAIL and ADMIN_PASSWORD in .env)

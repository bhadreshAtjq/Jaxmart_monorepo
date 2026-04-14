# B2B Platform — Full Stack Monorepo

A next-generation B2B marketplace combining product discovery, service sourcing,
escrow payments, logistics, and AI-powered matching.

## Project Structure

```
b2b-platform/
├── backend/          # Node.js + Express REST API
├── mobile/           # Flutter iOS + Android app
└── web/              # Next.js 14 web application
```

## Quick Start

### Prerequisites
- Node.js 20+
- Flutter 3.16+
- PostgreSQL 16+
- Redis 7+

### Backend
```bash
cd backend
cp .env.example .env        # Fill in your credentials
npm install
npx prisma migrate dev
npm run dev                 # Runs on http://localhost:4000
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run                 # Select device/emulator
```

### Web
```bash
cd web
npm install
cp .env.example .env.local
npm run dev                 # Runs on http://localhost:3000
```

## Environment Variables

See `backend/.env.example` and `web/.env.example` for required variables.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express 4, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (access + refresh tokens) |
| Payments | Razorpay |
| Storage | AWS S3 |
| Mobile | Flutter 3.16 (Dart) |
| Web | Next.js 14, Tailwind CSS |
| State (mobile) | Riverpod 2 |
| State (web) | Zustand + React Query |

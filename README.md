# B2B Platform — Full Stack Monorepo

A next-generation B2B marketplace combining product discovery, service sourcing,
escrow payments, logistics, and AI-powered matching.

## Project Structure

```
jaxmart-monorepo/
├── backend/          # Node.js + Express REST API (Prisma, PostgreSQL, Redis)
├── web/              # Next.js 14 Web Application (App Router, Tailwind CSS)
├── jaxmart-captain/  # React Native Expo App for Field Sales Reps (GPS, Barcode, KYC)
└── mobile/           # Flutter Mobile App for Marketplace Buyers & Sellers
```

## Key Documentation & Roadmaps

- 📘 **[Master Plain English Platform Guide](file:///home/bhadresh/Desktop/jaxmart_monorepo/doc.md)**: Deep dive into the Lead Engine, In-Chat Deals, Captain Flow, and Admin governance.
- 🚀 **[Production Readiness Audit & New Features Roadmap](file:///home/bhadresh/Desktop/jaxmart_monorepo/PRODUCTION_READINESS_AND_NEW_FEATURES_ROADMAP.md)**: Full breakdown of what is left for production launch and 10 high-value innovative features.
- 🧪 **[Complete End-to-End App Testing Flow Guide](file:///home/bhadresh/Desktop/jaxmart_monorepo/APP_TESTING_FLOW_GUIDE.md)**: Step-by-step QA testing manual for Buyers, Sellers, Field Captains, and Admins with cURL scripts.
- 📋 **[Master Functionalities & Features Matrix](file:///home/bhadresh/Desktop/jaxmart_monorepo/JAXMART_FUNCTIONALITIES_AND_FEATURES.md)**: Feature checklist and technical directory.

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

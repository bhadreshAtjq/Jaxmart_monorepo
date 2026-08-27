# JaxMart B2B Marketplace — Production Readiness Audit & New Features Roadmap

> **Document Type**: Master Production Launch Guide, Operational Gap Analysis & Future Feature Roadmap  
> **Platform Version**: Phase 1.5 Production Release Candidate  
> **Target Audience**: Founders, Engineering Leads, Product Managers, Operations Teams, DevOps & External Vendors  
> **Monorepo Structure**: `backend/` (Node.js/Express/Prisma/PostgreSQL/Redis), `web/` (Next.js 14 App Router), `jaxmart-captain/` (React Native Expo Field Sales App), `mobile/` (Flutter Marketplace App)  
> **Last Updated**: August 2026

---

## Table of Contents

1. [Executive Summary & Launch Status Dashboard](#1-executive-summary--launch-status-dashboard)
2. [What is Left for Production (Complete Technical & Operational Audit)](#2-what-is-left-for-production-complete-technical--operational-audit)
   - [2.1 External Vendor Accounts & Third-Party API Activations (Management Blockers)](#21-external-vendor-accounts--third-party-api-activations-management-blockers)
   - [2.2 Infrastructure, Cloud Hosting & DevOps](#22-infrastructure-cloud-hosting--devops)
   - [2.3 Security, Compliance & System Hardening](#23-security-compliance--system-hardening)
   - [2.4 Database, Data Integrity & Migrations](#24-database-data-integrity--migrations)
   - [2.5 Backend REST & Real-Time Engine Hardening](#25-backend-rest--real-time-engine-hardening)
   - [2.6 Web Application (Next.js 14) Production Polish & SEO](#26-web-application-nextjs-14-production-polish--seo)
   - [2.7 Field Operations App (`jaxmart-captain`) App Store Release](#27-field-operations-app-jaxmart-captain-app-store-release)
   - [2.8 Mobile App (`mobile` Flutter) Release Readiness](#28-mobile-app-mobile-flutter-release-readiness)
3. [New High-Value Features for JaxMart (Innovation & Monetization)](#3-new-high-value-features-for-jaxmart-innovation--monetization)
   - [3.1 AI-Powered RFQ Matchmaking & Quotation Auto-Generator](#31-ai-powered-rfq-matchmaking--quotation-auto-generator)
   - [3.2 B2B Trade Credit / Pay Later (NBFC Fintech Integration)](#32-b2b-trade-credit--pay-later-nbfc-fintech-integration)
   - [3.3 Paid Physical Sample Request & Lab QA Inspection Workflow](#33-paid-physical-sample-request--lab-qa-inspection-workflow)
   - [3.4 Tally Prime, Zoho Books & Busy Accounting 2-Way Sync](#34-tally-prime-zoho-books--busy-accounting-2-way-sync)
   - [3.5 WhatsApp Conversational Commerce & RFQ Bot](#35-whatsapp-conversational-commerce--rfq-bot)
   - [3.6 Reverse Auction & Live Countdown Bidding Room](#36-reverse-auction--live-countdown-bidding-room)
   - [3.7 Multi-Vendor RFQ Split Awarding](#37-multi-vendor-rfq-split-awarding)
   - [3.8 Captain Beat Route Optimizer & Geofenced Shop Visits](#38-captain-beat-route-optimizer--geofenced-shop-visits)
   - [3.9 Multilingual Indic Support (Hindi, Gujarati, Tamil, Telugu, Marathi)](#39-multilingual-indic-support-hindi-gujarati-tamil-telugu-marathi)
   - [3.10 Tiered Customer Group Pricing & Private B2B Catalogues](#310-tiered-customer-group-pricing--private-b2b-catalogues)
4. [Step-by-Step 14-Day Production Go-Live Timeline](#4-step-by-step-14-day-production-go-live-timeline)
5. [Summary Checklist](#5-summary-checklist)

---

## 1. Executive Summary & Launch Status Dashboard

JaxMart's core application code, UI pages, database schema, field operations flow, and API endpoints are **feature-complete in development mode**. The platform seamlessly handles **Lead Generation & Masking**, **Prepaid Credit Wallet Recharges**, **Subscription Quotas**, **In-Chat Deal Agreements**, **Direct Payments**, **Automated GST Tax Invoices**, and **Field Force Onboarding** via the Captain mobile app.

To transition from the current staging/sandbox environment into a **secure, scalable, and fully licensed live production deployment**, specific infrastructure, vendor credentials, security policies, and performance optimizations must be executed.

### Production Readiness Traffic Light Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION READINESS MATRIX                               │
├──────────────────────────────┬──────────────┬──────────────────────────────────────────┤
│ Module / Component           │ Status       │ Summary                                  │
├──────────────────────────────┼──────────────┼──────────────────────────────────────────┤
│ Core Marketplace Web Pages   │ 🟢 READY     │ Search, RFQ, Deals, Invoicing, Expo live │
│ Direct In-Chat Deal Signing  │ 🟢 READY     │ Digital contract signing & PDF export    │
│ Field Captain App Workflow   │ 🟢 READY     │ GPS attendance, 7-step KYC, 8-step scan  │
│ Database Schema & Models     │ 🟢 READY     │ PostgreSQL relational schema optimized   │
│ Payment Integration          │ 🟡 ACTION    │ Switch from Razorpay Test to Live Keys   │
│ SMS / OTP Gateway            │ 🔴 BLOCKED   │ Needs Live SMS/WhatsApp DLT Gateway      │
│ Government KYC API           │ 🟡 ACTION    │ Needs Live API Setu / Signzy credentials │
│ S3 / Cloud Storage           │ 🟡 ACTION    │ Switch from local/dev S3 to Prod Bucket  │
│ Transactional Email (SES)    │ 🟡 ACTION    │ Configure AWS SES / SendGrid credentials │
│ SSL, Domain & Nginx WAF      │ 🟡 ACTION    │ Configure live domain & SSL certificates │
│ Mobile App Store Release     │ 🟡 ACTION    │ Apple & Google Developer Store upload    │
└──────────────────────────────┴──────────────┴──────────────────────────────────────────┘
```

---

## 2. What is Left for Production (Complete Technical & Operational Audit)

---

### 2.1 External Vendor Accounts & Third-Party API Activations (Management Blockers)

These are the immediate external credentials and business configurations required from leadership:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL VENDOR CREDENTIALS REQUIRED                            │
├───────────────────┬─────────────────────────────────────┬──────────────────────────────┤
│ Provider          │ Purpose                             │ Required Credentials / Items │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ SMS Gateway       │ Live Mobile Phone OTP Login         │ Twilio / MSG91 / Gupshup API │
│ (e.g. MSG91)      │ and Buyer Lead SMS Alerts           │ Key, Sender ID & DLT PE ID   │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ Razorpay Live     │ Platform Revenue Only: Lead Credit  │ Live Key ID, Live Key Secret │
│                   │ Wallet Packs & Subscription Tiers   │ & Webhook Secret             │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ API Setu / Signzy │ Automated Government GSTIN, PAN,    │ Live Client ID, Client Secret│
│                   │ and Bank IFSC Penny-Drop Check      │ and Production Endpoint      │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ AWS S3 / R2       │ Encrypted KYC Docs, CAD Drawings,   │ Production IAM Access Keys,  │
│ + CloudFront      │ Catalog Photos & PDF Brochures      │ Private & Public S3 Buckets  │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ AWS SES / Resend  │ GST Invoices, Order Confirmations,  │ SMTP Host, Username, Password│
│                   │ Lead Alerts & Password Reset Emails │ Verified Domain (SPF/DKIM)   │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ Google Maps API   │ Captain Shift GPS Lock, Market Zone │ API Key with Geocoding,      │
│                   │ Geocoding & Store Address Search    │ Places & Maps SDKs enabled   │
├───────────────────┼─────────────────────────────────────┼──────────────────────────────┤
│ Apple & Google    │ Captain App & Marketplace App       │ Google Play Console ($25) &  │
│ Developer Portal  │ Distribution on Android and iOS     │ Apple Dev Program ($99/year) │
└───────────────────┴─────────────────────────────────────┴──────────────────────────────┘
```

> [!IMPORTANT]
> **Zero Goods & Services Payment Liability**: High-value wholesale goods & commercial service transactions (e.g. ₹5,00,000 for manufacturing batches) are **settled 100% directly off-platform** between Buyer and Seller (via direct NEFT/RTGS, Corporate Bank Transfer, or Commercial Invoicing). JaxMart's on-platform payment gateway is **exclusively used for Platform Monetization** (Lead Credit Wallet Packs and Seller Subscription Plans).

#### Detailed Action Items:
1. **SMS Gateway DLT Registration**: Under Telecom Regulatory Authority of India (TRAI) regulations, Indian SMS routes require DLT Entity Registration, Header/Sender ID approval (e.g., `JAXMRT`), and SMS template approvals.
2. **Payment Gateway Settlement (Platform Monetization Only)**: Activate live merchant bank account on Razorpay with automated daily $T+1$ settlement for Lead Credit Wallet packs and subscription revenue.
3. **Government KYC API Setu**: Upgrade from mock mode (`APISETU_MOCK_MODE=false`) to live MeitY API Setu gateway for instant GSTIN and PAN validation.

---

### 2.2 Infrastructure, Cloud Hosting & DevOps

```
                           ┌───────────────────────────────┐
                           │      CLOUDFLARE WAF / CDN     │
                           │  DDoS Shield & SSL Edge (443) │
                           └───────────────┬───────────────┘
                                           │
                           ┌───────────────▼───────────────┐
                           │      NGINX REVERSE PROXY      │
                           │   Rate Limiting & Compression │
                           └───────┬───────────────┬───────┘
                                   │               │
            ┌──────────────────────▼──────┐ ┌──────▼─────────────────────┐
            │   NEXT.JS WEB (Port 3000)   │ │  NODE.JS BACKEND (Port 4000)│
            │      PM2 Cluster / Docker   │ │     PM2 Cluster / Docker   │
            └─────────────────────────────┘ └──────┬──────────────┬──────┘
                                                   │              │
                                   ┌───────────────▼──────┐ ┌─────▼───────┐
                                   │   POSTGRESQL 16 DB   │ │   REDIS 7   │
                                   │  Prisma + WAL Backup │ │ PubSub/Cache│
                                   └──────────────────────┘ └─────────────┘
```

#### Production Infrastructure Tasks:
1. **Production Domain & SSL Setup**:
   - Point DNS A-records for `jaxmart.in`, `api.jaxmart.in`, and `admin.jaxmart.in` to the production server.
   - Configure Let's Encrypt SSL via Certbot or Cloudflare Edge SSL with HSTS enabled.
2. **Nginx Reverse Proxy & HTTP/2**:
   - Terminate SSL at Nginx with TLSv1.2/TLSv1.3 only.
   - Enable Gzip / Brotli compression for static assets and API payloads.
   - Configure reverse proxy buffering and WebSocket proxy headers (`Upgrade $http_upgrade`, `Connection "upgrade"`).
3. **Process Management & Clustering**:
   - Run Node.js and Next.js under `pm2` cluster mode or multi-container Docker with restart policies (`restart: always`).
   - Configure health check probes (`GET /health` on backend and `GET /` on web) to automatically restart unhealthy containers.
4. **Automated Database Backups & Disaster Recovery**:
   - Create an automated daily cron job using `pg_dump` with gzip compression uploaded to an isolated AWS S3 cold storage bucket (`s3://jaxmart-db-backups`).
   - Configure Point-in-Time Recovery (PITR) with Write-Ahead Logging (WAL) archiving.
5. **Observability & Error Monitoring**:
   - Integrate **Sentry** across `backend` and `web` for real-time error tracking and alerting.
   - Configure **Prometheus** metrics scraping and a **Grafana** dashboard monitoring CPU, memory, database connection pool, API latency, and 5xx errors.
   - Set up **Uptime Kuma** or BetterStack for 1-minute ping monitoring with WhatsApp/Telegram outage alerts.

---

### 2.3 Security, Compliance & System Hardening

1. **Environment Secrets Management**:
   - Remove all default fallback secrets (e.g. `your_super_secret_jwt_key`).
   - Generate cryptographically secure 64-character random keys for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `SESSION_SECRET`.
   - Store production secrets in AWS Secrets Manager or a restricted `.env.production` file (chmod 600).
2. **DDoS Protection & Strict Rate Limiting**:
   - Redis-backed distributed rate limiting on sensitive routes:
     - `/api/auth/send-otp`: 3 requests per 10 minutes per IP/phone.
     - `/api/auth/login`: 5 attempts per 15 minutes before temporary lockout.
     - `/api/subscriptions/leads/unlock`: 10 unlocks per minute to prevent scraping.
3. **JWT Revocation & Session Invalidation**:
   - Implement token blacklisting in Redis upon `/api/auth/logout` and password resets to immediately invalidate active JWTs.
4. **CORS & Header Hardening**:
   - Restrict `cors` to exact whitelist: `https://jaxmart.in`, `https://admin.jaxmart.in`, and mobile app origins.
   - Enforce Security Headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
5. **Secure File Upload Pipeline**:
   - Restrict uploads to permitted MIME types (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
   - Enforce maximum file size limits (5MB for photos, 20MB for CAD/PDF drawings).
   - Use Sharp on backend/lambda to strip EXIF data and convert product images to WebP before storing on S3.
   - Use **AWS S3 Presigned URLs** with 15-minute expiration for private documents (KYC PAN/GST cards, bank cheques, and confidential CAD drawings).
6. **Regulatory Legal Compliance (India)**:
   - Ensure published **Terms of Service**, **Privacy Policy**, and **Refund/Dispute Policy** comply with the **Digital Personal Data Protection (DPDP) Act 2023** and **Information Technology Act 2000**.
   - Mandatory Consent checkboxes on checkout and user registration.

---

### 2.4 Database, Data Integrity & Migrations

1. **Prisma Production Migration Deployment**:
   - Run `npx prisma migrate deploy` in the production CI/CD pipeline (never `prisma migrate dev` or `db push` in production).
   - Verify `schema.prisma` indexes:
     - Compound index on `Listing(categoryId, status, createdAt)`.
     - Trigram GIN indexes (`pg_trgm`) on `Listing(title, description, tags)` for high-speed fuzzy search.
     - Index on `LeadUnlock(sellerId, rfqId)` with unique constraint to prevent duplicate credit deductions.
     - Index on `Order(buyerId, sellerId, status)`.
2. **Lead Wallet Race Condition & Concurrency Guard**:
   - Ensure all credit balance deductions and additions use atomic database transactions (`prisma.$transaction`) with strict balance checks (`balance >= requiredCredits`) to prevent negative balances under concurrent requests.
3. **Database Connection Pooling**:
   - Tune Prisma connection pool size (`DATABASE_URL=...?connection_limit=20&pool_timeout=10`) matching PostgreSQL `max_connections` settings to prevent pool exhaustion during traffic spikes.

---

### 2.5 Backend REST & Real-Time Engine Hardening

1. **Razorpay Webhook Verification**:
   - Enforce cryptographic signature verification (`crypto.createHmac('sha256', secret).update(body).digest('hex')`) on Razorpay webhooks (`payment.captured`, `order.paid`, `refund.processed`).
   - Ensure idempotent webhook handling using event IDs to prevent double-crediting wallets on network retries.
2. **Socket.io Horizontal Scaling (Redis Adapter)**:
   - Attach `@socket.io/redis-adapter` so live chat messages and notifications broadcast across multiple Node.js backend cluster instances.
3. **Production GST Tax Invoicing Engine**:
   - Generate official GST-compliant PDF invoices (`SubscriptionInvoice` and `OrderInvoice`) with automated tax computation:
     - **Intra-State Sale (Same State)**: 50% CGST + 50% SGST.
     - **Inter-State Sale (Different State)**: 100% IGST.
     - Embedded QR Code containing Invoice Number, GSTIN, and Total Amount for tax audit readiness.
4. **Structured Logging (Winston)**:
   - Output structured JSON logs to stdout and rotate log files daily with `winston-daily-rotate-file` (error logs retained 30 days).

---

### 2.6 Web Application (Next.js 14) Production Polish & SEO

1. **Next.js Production Build Validation**:
   - Execute clean `npm run build` with zero TypeScript or ESLint errors.
   - Verify all dynamic routes (`/listings/[id]`, `/orders/[id]`, `/rfq/[id]`) have proper fallback loading skeletons (`loading.tsx`) and error boundaries (`error.tsx`).
2. **SEO Optimization & Social Sharing**:
   - **Dynamic Metadata & OpenGraph**: Auto-generate title, description, and preview image tags for every product listing, category, and flash deal.
   - **Structured Data (JSON-LD)**: Inject `Product`, `Organization`, and `BreadcrumbList` schema markup for Google Rich Snippets.
   - **Dynamic Sitemap & Robots**: Ensure `sitemap.xml` dynamically queries active listings and categories, and `robots.txt` disallows private routes (`/seller/*`, `/admin/*`, `/inbox/*`).
3. **Image Optimization (`next/image`)**:
   - Configure `next.config.mjs` with remote image patterns for the production AWS S3 / CloudFront domain.
   - Serve modern AVIF/WebP formats with responsive size slabs.
4. **Custom 404 & 500 Error Pages**:
   - Brand-styled `not-found.tsx` and `global-error.tsx` with 1-click navigation back to categories or support.

---

### 2.7 Field Operations App (`jaxmart-captain`) App Store Release

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CAPTAIN APP PRODUCTION LAUNCH CHECKLIST                         │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Configuration         │ Production Action Item                                         │
├───────────────────────┼────────────────────────────────────────────────────────────────┤
│ App Identifiers       │ Set bundle ID: `in.jaxmart.captain` (Android Package & iOS)    │
│ App Icons & Splash    │ High-res adaptive icons (1024x1024) and splash screen assets   │
│ Production EAS Build  │ Run `eas build --platform all --profile production`            │
│ Play Store Signing    │ Generate Google Play Keystore and upload `.aab` bundle         │
│ iOS TestFlight        │ Configure Apple Distribution Certificate & Provisioning Profile│
│ Device Permissions    │ Granular permission descriptions for Camera (Barcode), GPS     │
│                       │ Location (Shift Punch-in), and File Storage                    │
│ Offline SQLite Cache  │ Verify offline draft sync handles poor 2G/3G mandi connectivity│
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

### 2.8 Mobile App (`mobile` Flutter) Release Readiness

1. **Flutter Build Optimization**:
   - Run `flutter build appbundle --release` for Android and `flutter build ipa --release` for iOS.
   - Enable code shrinking and obfuscation (`--obfuscate --split-debug-info`).
2. **Firebase Push Notifications (FCM)**:
   - Upload `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) with production APNs Auth Key.
   - Register background message handlers for immediate RFQ matches, new messages, and order contract proposals.

---

## 3. New High-Value Features for JaxMart (Innovation & Monetization)

To make JaxMart an unstoppable market leader in the Indian B2B wholesale space, the following **10 high-value features** are architected and recommended for upcoming phases:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             JAXMART NEW FEATURE ROADMAP                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  1. AI RFQ Matchmaker & Auto-Quoting    6. Reverse Auction & Live Bidding Arena        │
│  2. B2B Trade Credit / Pay Later (NBFC) 7. Multi-Vendor RFQ Split Awarding             │
│  3. Paid Samples & Lab QA Inspections   8. Captain Beat Route Optimizer (TSP)          │
│  4. Tally & Zoho Books 2-Way ERP Sync   9. Multilingual Indic Voice Search             │
│  5. WhatsApp Conversational RFQ Bot    10. Custom Tiered Group Pricing & Price Lists   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1 AI-Powered RFQ Matchmaking & Quotation Auto-Generator

```
┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
│ BUYER UPLOADS CAD/PDF  │────►│ AI SPEC EXTRACTION     │────►│ SMART SUPPLIER MATCH   │
│ Unstructured Drawings, │     │ Extracts Material, HSN,│     │ Vector Search matches  │
│ Quantities & Specs     │     │ Dimensions & Tolerances│     │ Top 5 verified factories│
└────────────────────────┘     └────────────────────────┘     └────────────────────────┘
                                                                           │
                                                                           ▼
                                                              ┌────────────────────────┐
                                                              │ AI QUOTE AUTO-DRAFT    │
                                                              │ One-click itemized bid │
                                                              │ with pricing & freight │
                                                              └────────────────────────┘
```

#### How It Works:
1. **AI Spec Parser**: When a buyer uploads a rough PDF specification sheet or CAD drawing, an AI vision model automatically extracts:
   - Material Grade (e.g. *Stainless Steel 304, Virgin Kraft Paper 180 GSM*).
   - Dimensions, Tolerances & Quantity requirements.
   - Recommended Government HSN Code and GST tax rate slab.
2. **Vector Similarity Matchmaking**: Generates vector embeddings for the RFQ and uses `pgvector` / semantic search in PostgreSQL to instantly notify the top 5 most relevant suppliers with high past fulfillment scores.
3. **AI One-Click Quote Assistant for Sellers**: Sellers can click **"Generate AI Quote"** to draft a competitive, itemized quotation (unit price, packing charges, estimated lead time, and payment terms) based on their catalog price history.

---

### 3.2 B2B Trade Credit / Pay Later (NBFC Fintech Integration)

In Indian B2B wholesale commerce, **credit terms (30, 60, or 90 days)** drive over 70% of transactions. Integrating institutional digital trade credit unlocks massive order volumes.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              B2B TRADE CREDIT WORKFLOW                                 │
│                                                                                        │
│  1. BUYER APPLIES           2. INSTANT NBFC APPROVAL      3. ORDER DISPATCHED          │
│  • Enters GSTIN & PAN       • Soft credit check via       • Seller receives payment    │
│  • 2-min digital KYC        • Approved credit limit:      • Buyer pays NBFC in 30/60   │
│                             • ₹5,00,000 to ₹50,00,000     • days at 0% to 1.5%/month   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Capabilities:
- Partner with digital B2B lending NBFCs (e.g., **Rupifi**, **Progcap**, **KredX**).
- **Zero Risk for Sellers**: The seller gets paid upfront upon verified goods dispatch.
- **Buyer Flexibility**: Buyers get 30 to 90 days repayment credit directly on the JaxMart checkout screen.
- **JaxMart Monetization**: Earn 1.0% to 2.5% origination fee on all financed transaction volume.

---

### 3.3 Paid Physical Sample Request & Lab QA Inspection Workflow

Corporate buyers rarely order 5,000 units of custom packaging or garments without first approving a physical sample.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SAMPLE REQUEST & QUALITY AUDIT FLOW                             │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Stage                 │ Details                                                        │
├───────────────────────┼────────────────────────────────────────────────────────────────┤
│ 1. Request Sample     │ Buyer clicks "Order Sample" on any listing or quote (₹500-₹2k) │
│ 2. Sample Dispatch    │ Seller sends physical prototype with courier tracking link     │
│ 3. Sample Approval    │ Buyer approves sample quality or requests specific adjustments │
│ 4. Third-Party Lab QA │ Optional 1-click booking of independent quality inspection     │
│                       │ (SGS / Intertek / TUV) before final container dispatch         │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

### 3.4 Tally Prime, Zoho Books & Busy Accounting 2-Way Sync

Over 85% of Indian manufacturers and wholesale distributors run their accounting on **Tally Prime**, **Zoho Books**, or **Busy Accounting**. Providing seamless 2-way sync eliminates double data entry.

#### Features:
- **Automatic Master Sync**: Sync catalog items, inventory levels, and customer ledgers from Tally into JaxMart.
- **1-Click Sales Voucher Creation**: When an order is completed or deal signed on JaxMart, automatically push a Sales Voucher & GST E-Invoice directly into the seller's Tally Prime / Zoho Books database.
- **E-Way Bill Generation**: Auto-generate Government E-Way bills for consignments exceeding ₹50,000 via GST Suvidha Provider (GSP) APIs.

---

### 3.5 WhatsApp Conversational Commerce & RFQ Bot

Indian MSME business owners spend their entire day on WhatsApp. Bringing JaxMart's lead engine and deal signing directly into WhatsApp creates frictionless engagement.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        WHATSAPP B2B CONVERSATIONAL BOT                                 │
│                                                                                        │
│  [Buyer WhatsApp]  "Need 2,000 kg HDPE Granules delivered to Surat"                    │
│        │                                                                               │
│        ▼                                                                               │
│  [JaxMart AI Bot]  "✅ RFQ #8492 created! 3 verified suppliers notified."             │
│        │                                                                               │
│        ▼                                                                               │
│  [Seller WhatsApp] "🔔 New Lead: 2,000 kg HDPE in Surat. [Unlock Lead for ₹49] or     │
│                    [Submit Quick Price Quote]"                                         │
│        │                                                                               │
│        ▼                                                                               │
│  [Instant Deal]    Seller taps button -> submits ₹94/kg -> Buyer accepts via UPI link  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Implementation:
- Integrated via WhatsApp Cloud API / Gupshup / Interakt.
- Instant quote notifications, lead unlock UPI payment links, and PDF invoice downloads sent directly to WhatsApp chat.

---

### 3.6 Reverse Auction & Live Countdown Bidding Room

For high-volume bulk orders (e.g. corporate procurement of 50 tons of steel, 10,000 uniforms, or 50,000 corrugated boxes), the **Live Reverse Auction** drives rapid supplier competition.

#### How It Works:
1. Buyer sets parameters: Base ceiling price, specs, delivery date, and a **45-minute live auction window**.
2. Pre-qualified verified suppliers enter the interactive live bidding room.
3. Real-time WebSocket leaderboard displays the current lowest bid (supplier names masked for privacy).
4. Dynamic countdown timer with automatic 2-minute extensions if a bid is placed in the final 60 seconds (sniping protection).
5. At countdown completion, the contract is automatically awarded to the lowest qualified bidder.

---

### 3.7 Multi-Vendor RFQ Split Awarding

Large enterprise buyers frequently prefer splitting large purchase requirements across 2 or 3 factories to avoid single-supplier production bottlenecks.

#### Features:
- Buyer can award **60% of an RFQ to Supplier A** (fast delivery) and **40% to Supplier B** (competitive rate).
- Platform automatically splits the RFQ into two independent linked Order Contracts, each with separate milestone deliverables, dispatch schedules, and GST invoices.

---

### 3.8 Captain Beat Route Optimizer & Geofenced Shop Visits

Maximize field sales rep productivity across wholesale market hubs (e.g., Kalupur in Ahmedabad, Chandni Chowk in Delhi, Crawford Market in Mumbai).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     CAPTAIN BEAT ROUTE OPTIMIZATION ENGINE                             │
├───────────────────────┬────────────────────────────────────────────────────────────────┤
│ Feature               │ Operational Impact                                             │
├───────────────────────┼────────────────────────────────────────────────────────────────┤
│ TSP Route Optimizer   │ Solves Travelling Salesperson Problem to generate the optimal   │
│                       │ walking/driving route for 20 shop visits per day               │
│ Geofenced Attendance  │ Shifts can only be punched in within 50 meters of the assigned │
│                       │ wholesale market zone (prevents attendance spoofing)           │
│ Smart Shop Re-Visits  │ Auto-schedules follow-ups for pending KYC or unverified banks  │
│ Live Heatmaps         │ Admin console visualizes market density & field rep coverage   │
└───────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

### 3.9 Multilingual Indic Support (Hindi, Gujarati, Tamil, Telugu, Marathi)

To penetrate Tier-2 and Tier-3 wholesale industrial hubs across India, regional language accessibility is critical.

#### Features:
- Next-intl localization on web and mobile for **English, Hindi (हिन्दी), Gujarati (ગુજરાતી), Tamil (தமிழ்), Telugu (తెలుగు), and Marathi (मराठी)**.
- **Indic Voice Search**: Buyers can speak their requirement in Hindi/Gujarati (e.g., *"500 piece packaging box chahiye"*), converted via Web Speech API into structured catalog search queries.

---

### 3.10 Tiered Customer Group Pricing & Private B2B Catalogues

Manufacturers need to offer different price lists to different tiers of wholesale buyers without exposing distributor prices to the public.

#### Features:
- **Customer Groups**: Categorize buyers into `VIP_DISTRIBUTOR`, `AUTHORIZED_DEALER`, and `GENERAL_WHOLESALER`.
- **Custom Price Slabs**: Define specific volume price slabs or percentage discounts visible only to assigned customer groups upon login.
- **Confidential SKU Visibility**: Allow manufacturers to hide specialized OEM/ODM SKUs behind private access codes or direct inquiry requests.

---

## 4. Step-by-Step 14-Day Production Go-Live Timeline

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        14-DAY PRODUCTION GO-LIVE TIMELINE                              │
├────────────┬───────────────────────────────────┬───────────────────────────────────────┤
│ Timeline   │ Phase Focus                       │ Key Deliverables                      │
├────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Days 1–3   │ Cloud & Vendor Setup              │ AWS S3 + SES + Razorpay Live Keys +   │
│            │                                   │ DLT SMS Gateway + Live API Setu       │
├────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Days 4–6   │ Infrastructure & Security         │ Nginx SSL + Production Docker build + │
│            │                                   │ Redis rate limit + JWT revoke audit   │
├────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Days 7–9   │ Database & Backend Validation     │ Prisma migration deploy + Concurrency │
│            │                                   │ test on wallets + GST invoice audit   │
├────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Days 10–11 │ End-to-End QA & Load Testing      │ k6 load test (1,000 concurrent users) │
│            │                                   │ Simulated field onboard + deal flow   │
├────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Days 12–13 │ App Store Submissions             │ EAS build upload to Google Play &     │
│            │                                   │ Apple TestFlight for Captain app      │
├────────────┼───────────────────────────────────┼───────────────────────────────────────┤
│ Day 14     │ Official Production Launch        │ DNS switch to live domain, marketing  │
│            │                                   │ launch & 24/7 Sentry monitoring active│
└────────────┴───────────────────────────────────┴───────────────────────────────────────┘
```

---

## 5. Summary Checklist

```markdown
### Production Launch Sign-Off Checklist

#### Infrastructure & Hosting
- [ ] Production Server provisioned (Ubuntu 22.04 LTS, 4+ vCPU, 8GB+ RAM, NVMe SSD)
- [ ] PostgreSQL 16 + Redis 7 configured with persistent storage
- [ ] Domain DNS mapped with SSL/TLS (Let's Encrypt / Cloudflare)
- [ ] Nginx Reverse Proxy with HTTP/2, Brotli, and WebSocket proxy headers
- [ ] Automated daily database backup cron to S3 configured with 30-day retention
- [ ] Sentry APM error monitoring configured for backend and web

#### External Integrations
- [ ] DLT-approved SMS Gateway credentials configured (Twilio/MSG91)
- [ ] Razorpay Live Key ID, Secret, and Webhook secret configured
- [ ] API Setu / Signzy live government verification credentials active
- [ ] Production AWS S3 buckets (private KYC + public CDN) configured
- [ ] Production AWS SES / SendGrid transactional email configured with SPF/DKIM
- [ ] Google Maps API key with Geocoding and Places API billing enabled

#### Application Hardening
- [ ] Production JWT secrets generated (64-char cryptographically secure)
- [ ] CORS restricted to production web and mobile domains
- [ ] Rate limiting active on auth, OTP, and lead unlock endpoints
- [ ] Atomic database transactions guarded against wallet race conditions
- [ ] Next.js 14 production bundle verified (`npm run build`)
- [ ] Dynamic SEO meta tags, `sitemap.xml`, and `robots.txt` active
- [ ] Captain App (`jaxmart-captain`) production `.aab` built for Google Play Store
```

---
*Document prepared for JaxMart Monorepo Production Launch.*

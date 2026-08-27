# JaxMart — Master Plain English Guide to the Platform (`doc.md`)

> **Platform Version**: Phase 1 Architecture (Lead Generation, Direct Commerce & Field Digitization)  
> **Target Audience**: Business Owners, Investors, Sales Leads, Operations Teams, Field Managers & Developers  
> **Key Phase 1 Focus**: **Lead Generation & Monetization Engine**, **Direct B2B Commerce** (No Escrow, No Platform Freight), **Field Force Automation ("Captain App")**, and **Admin Governance**.  
> **Writing Style**: 100% Simplified Plain English, zero tech jargon, practical real-world business examples, and step-by-step deep-dive walkthroughs.

---

## Table of Contents

1. [Executive Summary: What is JaxMart & Phase 1 Business Model](#1-executive-summary-what-is-jaxmart--phase-1-business-model)
   - 1.1 The Core Business: B2B Lead Marketplace & Field Digitization
   - 1.2 What We Removed for Phase 1 (No Escrow & No Platform Freight)
   - 1.3 How JaxMart Makes Money in Phase 1 (Leads & Subscriptions)
2. [The Lead Generation & Monetization Engine (Deep Dive)](#2-the-lead-generation--monetization-engine-deep-dive)
   - 2.1 How High-Value B2B Buyer Leads are Generated
   - 2.2 Lead Masking & Exclusivity (Protecting Buyer Data)
   - 2.3 How Sellers Unlock Leads (Monthly Plan Quota vs. Credit Wallet)
   - 2.4 The 4 Lead Credit Packs (Pricing & Discounts)
   - 2.5 What Happens After Unlocking (Direct Call, WhatsApp, Email, Live Chat)
   - 2.6 The 4 Subscription Tiers (Free, Silver, Gold, Platinum)
3. [Direct B2B Payments, In-Chat Deals & Tax Invoicing](#3-direct-b2b-payments-in-chat-deals--tax-invoicing)
   - 3.1 Direct Online Payments (UPI, Netbanking, Corporate Cards, NEFT/RTGS)
   - 3.2 Proposing and Signing Deals Inside Live Chat (Instant Digital Contracts)
   - 3.3 Milestone Deliverables for Manufacturing & Service Jobs
   - 3.4 Automated GST-Compliant Tax Invoices (`/invoices`)
   - 3.5 Direct Logistics & Shipping (Handled Directly Between Parties in Phase 1)
   - 3.6 Platform Dispute Mediation
4. [The Buyer's Journey (Step-by-Step Walkthrough)](#4-the-buyers-journey-step-by-step-walkthrough)
   - 4.1 Mobile Phone OTP Login & Role Selection
   - 4.2 Multi-Address Management (Office, Warehouse, Branch)
   - 4.3 Typo-Tolerant Search & Granular Discovery Filters
   - 4.4 Wholesale Volume Discount Slabs & Live Savings Calculator
   - 4.5 Posting a Custom Manufacturing RFQ (Request for Quote)
   - 4.6 The Side-by-Side Quote Comparison Console
   - 4.7 Direct In-App Live Chat with Factory Owners
   - 4.8 Order Tracking & GST Tax Bill Downloads
5. [The Seller's Journey (Step-by-Step Walkthrough)](#5-the-sellers-journey-step-by-step-walkthrough)
   - 5.1 Government KYC Check (GSTIN, PAN, Bank IFSC) & "Verified Supplier" Badge
   - 5.2 6-Step Physical Product Cataloging Wizard
   - 5.3 Commercial B2B Service Builder
   - 5.4 The RFQ Opportunity Lead Inbox (`/seller/rfq-inbox`)
   - 5.5 Unlocking Contact Details & Submitting Itemized Price Quotes
   - 5.6 Managing Orders, Dispatch & Revenue Analytics
6. [Field Operations: The Captain Mobile App (`jaxmart-captain`)](#6-field-operations-the-captain-mobile-app-jaxmart-captain)
   - 6.1 Who is a Captain and Why Field Sales Drives the Whole Machine
   - 6.2 Shift Attendance: Satellite GPS Lock, Live Selfie & Street Address Lookup
   - 6.3 7-Step On-Site Shop Onboarding Wizard (Interactive Touchscreen Finger Signature)
   - 6.4 8-Step Barcode SKU Scanning & Cataloging Engine
   - 6.5 Offline Mode: Works in Market Basements, Auto-Syncs on 4G/5G
   - 6.6 Daily Target Progress Rings & Field Commission Tracking
7. [The Admin & Super Admin Command Center (`/admin`)](#7-the-admin--super-admin-command-center-admin)
   - 7.1 Super Admin vs. City Territory Admin Permissions
   - 7.2 Live Satellite GPS Map: Tracking Field Agents & Walking Breadcrumbs
   - 7.3 The Shop KYC Verification Desk (Side-by-Side Document Audit)
   - 7.4 Product Quality & Catalog Moderation
   - 7.5 Dispute Mediation Console
   - 7.6 Territory Management (States ➔ Cities ➔ Market Zones ➔ Beat Routes)
   - 7.7 Field Agent Leaderboards & Commission Oversight
   - 7.8 Subscription & Lead Credit Pack Configuration
8. [Virtual B2B Exhibition Hall (`/exhibit`)](#8-virtual-b2b-exhibition-hall-exhibit)
   - 8.1 Industry-Specific Trade Show Pavilions
   - 8.2 3D Virtual Stalls, Showroom Videos & Top Product Carousels
   - 8.3 Digital Business Card Exchange & Direct Stall Inquiries
9. [Wholesale Flash Deals & Overstock Clearance (`/deals`, `/new-products`)](#9-wholesale-flash-deals--overstock-clearance-deals-new-products)
10. [Technical Directory: Routes, APIs & Database Models](#10-technical-directory-routes-apis--database-models)
    - 10.1 Web Route Directory (Next.js Pages)
    - 10.2 Backend REST API Directory (Express.js Endpoints)
    - 10.3 Database Schema Overview (Prisma / PostgreSQL)
11. [Master Feature Checklist](#11-master-feature-checklist)

---

## 1. Executive Summary: What is JaxMart & Phase 1 Business Model

### 1.1 The Core Business: B2B Lead Marketplace & Field Digitization
**JaxMart** is a B2B wholesale commerce, inquiry matchmaking, and field force enablement platform. It bridges the gap between verified Indian manufacturers, distributors, stockists, corporate buyers, and physical wholesale markets.

```
┌───────────────────────────────┐     ┌───────────────────────────────┐     ┌───────────────────────────────┐
│     BUYERS POST INQUIRIES     │───► │  LEAD ENGINE MATCHES SELLERS  │───► │ DIRECT DEAL & INVOICING       │
│ Custom RFQs, Catalog Inquiries│     │ Unlock Phone/Email with Credit│     │ Direct Payment, Chat Contract │
└───────────────────────────────┘     └───────────────────────────────┘     └───────────────────────────────┘
```

In Phase 1, JaxMart operates as a **High-Intent B2B Lead Generation and Direct Commerce Engine**:
1. **Buyers** visit the platform to find products, view volume discount slabs, and post custom manufacturing inquiries (RFQs).
2. **Sellers** receive category-matched buyer inquiries (Leads) and unlock direct buyer contact details (phone, email, WhatsApp) using their subscription quotas or lead credits.
3. **Field Captains** physically visit wholesale markets (mandis, industrial hubs) with the `jaxmart-captain` mobile app, onboard merchants on-site with GPS verification, take storefront photos, scan product barcodes, collect digital finger signatures, and digitize inventory on the spot.

### 1.2 What We Removed for Phase 1 (No Escrow & No Platform Freight)
To maximize transaction speed, avoid cash flow lockups, and eliminate complex intermediary friction:
* ❌ **NO THIRD-PARTY ESCROW**: We removed complex third-party banking escrow accounts. Transactions are direct between buyers and sellers using direct Razorpay checkout, direct NEFT/RTGS bank transfers, or in-chat deal agreements.
* ❌ **NO PLATFORM FREIGHT SERVICES**: JaxMart does not operate or force a platform-managed courier/trucking fleet in Phase 1. Shipping and logistics are arranged directly between the buyer and seller (buyer pickup, seller's existing transport network, or local commercial logistics).

### 1.3 How JaxMart Makes Money in Phase 1 (Leads & Subscriptions)
JaxMart generates recurring revenue through a proven, high-margin B2B monetization model:
1. **Lead Unlock Credit Packs**: Sellers purchase prepaid credit packs (from ₹499 to ₹6,999) to unlock direct buyer phone numbers and emails on custom RFQs.
2. **Tiered Monthly/Annual Subscriptions**: Sellers pay monthly membership fees (Silver, Gold, Platinum) for higher search visibility, verified badges, and monthly bundles of free lead unlocks.
3. **Virtual Expo Stalls & Featured Placements**: Premium banner placements and 3D digital booths in the Virtual Trade Show (`/exhibit`).

---

## 2. The Lead Generation & Monetization Engine (Deep Dive)

The **Lead Engine** is the revenue heart of JaxMart. It converts buyer demand into paid monetization from manufacturers and suppliers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HOW THE LEAD ENGINE WORKS                              │
│                                                                                        │
│  1. BUYER POSTS RFQ        2. LEAD CREATED & MASKED     3. SELLER UNLOCKS LEAD         │
│  "Need 5,000 custom        • Product Specs: VISIBLE     • Uses Monthly Plan Quota OR   │
│   corrugated boxes"        • Target Budget: VISIBLE     • Uses Lead Credit Wallet      │
│                            • Buyer Phone/Email: MASKED  • Reveals Direct Phone & Email │
│                                                                                        │
│  4. DIRECT OUTREACH        5. IN-CHAT DEAL PROPOSAL     6. DIRECT FULFILLMENT          │
│  • Seller calls buyer      • Seller proposes Deal Card  • Direct payment & delivery    │
│  • WhatsApp / Live Chat    • Buyer signs digital contract• GST Tax Invoice generated    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 How High-Value B2B Buyer Leads are Generated
Leads are generated across 4 key channels on JaxMart:
1. **Custom Manufacturing RFQs (`/rfq`)**: When a buyer submits a custom requirement (e.g. *"Need 2,000 meters of industrial copper wiring delivered to Pune"*), it generates an exclusive category lead.
2. **Product Catalog Inquiries (`/listings/[id]`)**: When a buyer clicks **"Contact Supplier"** or **"Get Best Bulk Price"** on any product page.
3. **Virtual Exhibition Inquiries (`/exhibit`)**: When a visitor drops their digital business card or clicks **"Inquire at Stall"** during a virtual trade show.
4. **Flash Deal Inquiries (`/deals`)**: When a buyer requests to purchase an entire wholesale overstock batch.

### 2.2 Lead Masking & Exclusivity (Protecting Buyer Data)
To ensure sellers pay to access qualified buyer contact details:
* **What is VISIBLE for Free to all matching sellers**:
  * Product Title & Category (e.g. *Corrugated Packaging Boxes*)
  * Required Quantity (e.g. *5,000 pieces*)
  * Target Budget per Unit (e.g. *₹18 per piece*)
  * Delivery Pincode & Target Delivery Date (e.g. *Ahmedabad - 380001, within 15 days*)
  * Technical Drawings, CAD files, and sample photos.
* **What is MASKED (Hidden behind lock icon)**:
  * Buyer Contact Person Full Name: `Raj*** Sh***`
  * Buyer Mobile Phone Number: `+91 98765 *****`
  * Buyer Direct Email Address: `r***@company.com`
  * Company Full Legal Name and Registered Address.

### 2.3 How Sellers Unlock Leads (Monthly Plan Quota vs. Credit Wallet)
When a seller wants to contact the buyer, they click **"Unlock Buyer Contact"**:
* **Method 1: Included Subscription Quota (`PLAN_QUOTA`)**:
  * Every paid subscription plan comes with a monthly quota of free lead unlocks (e.g. 10/month on Basic, 25/month on Silver, 100/month on Gold).
  * If the seller has remaining monthly quota, 1 lead is deducted from their plan quota at **₹0 extra cost**.
* **Method 2: Lead Credit Wallet (`CREDIT_WALLET`)**:
  * If the seller has exhausted their monthly quota (or is on the Free Starter plan), the system deducts **1 credit** from their prepaid **Lead Credit Wallet**.
* **Method 3: Unlimited Plan (`UNLIMITED_TIER`)**:
  * Platinum Enterprise subscribers enjoy **Unlimited Free Lead Unlocks** across all categories with zero limits.
* **Method 4: Submitting an Official Quote (`QUOTE_SUBMITTED`)**:
  * Submitting an official competitive price bid on an RFQ automatically grants the seller unlocked access to communicate with the buyer.

### 2.4 The 4 Lead Credit Packs (Pricing & Discounts)
Sellers can recharge their Lead Credit Wallet instantly via Razorpay (`/pricing`):

| Credit Pack | Total Credits | Price (₹) | Effective Price / Lead | Savings / Discount | Best Suited For |
|---|---|---|---|---|---|
| **Starter Pack** (`pack_10`) | 10 Credits | ₹499 | ₹49.90 / lead | Base Price | New sellers testing the platform |
| **Growth Pack** (`pack_50`) | 50 Credits | ₹1,999 | ₹39.90 / lead | **20% OFF** | Growing wholesale traders |
| **Business Pack** (`pack_100`)| 100 Credits | ₹3,499 | ₹34.90 / lead | **30% OFF** | Active stockists & factories |
| **Enterprise Pack** (`pack_250`)| 250 Credits | ₹6,999 | ₹27.90 / lead | **44% OFF** | High-volume industrial suppliers |

* **Wallet Features**: Credits never expire. Sellers can check their current credit balance and recharge with 1-click UPI checkout anytime.

### 2.5 What Happens After Unlocking (Direct Call, WhatsApp, Email, Live Chat)
The moment a lead is unlocked:
1. **Unmasked Contact Card**: The buyer's full mobile phone number, WhatsApp link, direct email, and company address are instantly revealed on the screen.
2. **Direct Phone Call / WhatsApp**: The seller can click **"Call Buyer"** or **"Chat on WhatsApp"** to immediately pitch their factory prices.
3. **In-App Live Chat**: An active chat room opens in `/inbox`, allowing both parties to exchange PDF test reports, sample photos, and formal deal proposals.

### 2.6 The 4 Subscription Tiers (Free, Silver, Gold, Platinum)
In addition to individual credit packs, sellers can subscribe to monthly/annual membership plans:

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   FREE STARTER   │    │  SILVER GROWTH   │    │ GOLD ENTERPRISE  │    │PLATINUM UNLIMITED│
│ ₹0 / month       │    │ ₹1,499 / month   │    │ ₹3,999 / month   │    │ ₹8,999 / month   │
│ • 5 Listings     │    │ • 25 Listings    │    │ • 100 Listings   │    │ • UNLIMITED SKUs │
│ • 5 Leads/month  │    │ • 25 Leads/month │    │ • 100 Leads/month│    │ • UNLIMITED LEADS│
│ • Basic Search   │    │ • Verified Badge │    │ • Top Search Rank│    │ • Expo Stall     │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

| Plan Feature | Free Starter | Silver Growth | Gold Enterprise | Platinum Unlimited |
|---|---|---|---|---|
| **Monthly Price** | ₹0 | ₹1,499 / mo | ₹3,999 / mo | ₹8,999 / mo |
| **Active Catalog Listings** | 5 Products | 25 Products | 100 Products | **Unlimited Products** |
| **Included Monthly Leads** | 5 Leads / mo | 25 Leads / mo | 100 Leads / mo | **Unlimited Leads** |
| **"Verified Supplier" Shield**| ❌ No | ✅ Yes | ✅ Yes | ✅ Yes (Gold Shield) |
| **Search Ranking Boost** | Standard (0x) | Priority (1.5x) | Top Ranking (3.0x)| Featured First (5.0x) |
| **Virtual Trade Show Stall** | ❌ No | ❌ No | 1 Stall (`/exhibit`) | Featured 3D Pavilion |
| **Analytics Dashboard** | Basic | Standard | Advanced | Full Export Suite |
| **Team Logins / Seats** | 1 User | 2 Users | 5 Users | Unlimited Team |

---

## 3. Direct B2B Payments, In-Chat Deals & Tax Invoicing

### 3.1 Direct Online Payments (UPI, Netbanking, Corporate Cards, NEFT/RTGS)
* **Direct Razorpay Gateway**: Instant payment settlement for direct catalog orders and subscription upgrades.
  * **UPI**: GPay, PhonePe, Paytm, BHIM with instant confirmation.
  * **Netbanking**: Direct integration across 50+ commercial banks.
  * **Corporate Cards**: Visa, Mastercard, RuPay, Amex.
  * **NEFT / RTGS / Direct Bank Transfer**: High-value corporate transfers with transaction reference verification.
* **Instant Verification**: All payments are verified using SHA-256 HMAC cryptographic signatures.

### 3.2 Proposing and Signing Deals Inside Live Chat (Instant Digital Contracts)
When buyers and sellers negotiate custom wholesale terms:
1. In live chat (`/inbox`), either party clicks **"Propose Deal"**.
2. **Deal Proposal Settings**:
   * Total Agreed Amount (₹)
   * Goods Type (`PRODUCT` or `SERVICE`)
   * Milestone Payment & Deliverable Schedule (e.g. 50% Advance, 50% on Dispatch)
   * Delivery Notes and Terms
3. **Interactive Deal Card**: Renders directly inside the conversation thread.
4. **Digital Contract Acceptance (`POST /api/orders/:id/contract-sign`)**:
   * The recipient clicks **"Accept & Sign Contract"**.
   * The contract becomes legally binding on the platform, and the order status updates to `ACTIVE`.

### 3.3 Milestone Deliverables for Manufacturing & Service Jobs
* Large orders can be divided into deliverable stages (e.g. *Stage 1: Raw Material Sourcing*, *Stage 2: Batch Production*, *Stage 3: Dispatch*).
* Seller submits proof (lab test certificates, photos of completed goods).
* Buyer inspects proof and clicks **"Approve Milestone"**.
* Once all stages are approved, the order completes automatically.

### 3.4 Automated GST-Compliant Tax Invoices (`/invoices`)
* Every completed transaction automatically generates an official Indian GST Tax Invoice.
* **Full Tax Details**: Seller GSTIN, Buyer GSTIN, HSN/SAC codes, Taxable Value, CGST/SGST/IGST rates, and total payable amount.
* **1-Click Actions**: **"Download PDF"** (`downloadTaxInvoice`) and **"Print Invoice"** (`printTaxInvoice`) ready for input tax credit (ITC) filing.

### 3.5 Direct Logistics & Shipping (Handled Directly Between Parties in Phase 1)
* JaxMart does **not** force a platform freight service in Phase 1.
* The seller and buyer agree on transport (e.g. *Ex-Factory Pickup*, *Seller's Transporter*, *Local Lorry Transport*).
* When dispatching, the seller enters the transporter name and LR/Tracking number on the dashboard, and the buyer receives tracking alerts.

### 3.6 Platform Dispute Mediation
* If goods arrive damaged or specifications do not match:
* Buyer clicks **"Raise Dispute"** and uploads photo evidence.
* JaxMart Admin inspects evidence and chat logs to mediate fair settlements (full refund, seller release, or partial compensation).

---

## 4. The Buyer's Journey (Step-by-Step Walkthrough)

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ 1. Search Catalog   │───►│ 2. View Slab Price  │───►│ 3. Post Custom RFQ  │───►│ 4. Chat & Sign Deal │
│ Typo-Tolerant Search│    │ Real-Time Discount  │    │ Drawings & Budget   │    │ Direct Negotiation  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### 4.1 Mobile Phone OTP Login & Role Selection
* Enter 10-digit Indian mobile number at `/auth`.
* Receive instant 6-digit SMS verification code (OTP).
* Choose role: **Buyer** (or **Both** if they also sell).
* Fill in Company Legal Name, GSTIN, and Contact Email.

### 4.2 Multi-Address Management (Office, Warehouse, Branch)
Under `/profile`, buyers save multiple company locations:
* `PRIMARY` (Head Office), `SHIPPING` (Factory / Branch), `BILLING` (Finance Office), `WAREHOUSE` (Storage Depot).
* Select any saved address with 1 click during checkout or RFQ creation.

### 4.3 Typo-Tolerant Search & Granular Discovery Filters
* **PostgreSQL Trigram Search (`pg_trgm`)**: Misspellings like *"alumnium sheet"* or *"saftey shoes"* still display the right products.
* **Filters (`/search`)**: Filter by Industry Category, Price Range, MOQ (Minimum Order Quantity), City/State, and Verified Supplier Shield.

### 4.4 Wholesale Volume Discount Slabs & Live Savings Calculator
Every product page features real-time volume pricing:
* *Example*:
  * 10 to 49 units: ₹500 / unit (Base Price)
  * 50 to 199 units: ₹440 / unit (12% Discount)
  * 200 to 499 units: ₹390 / unit (22% Discount)
  * 500+ units: ₹330 / unit (34% Wholesale Discount)
* Typing `250` automatically selects the ₹390 tier, adds GST, and shows total savings.

### 4.5 Posting a Custom Manufacturing RFQ (Request for Quote)
When off-the-shelf items do not fit specifications:
1. Open `/rfq` and enter Title, Category, and Detailed Specifications.
2. Enter Required Quantity, Target Budget per Unit (₹), Delivery Pincode, and Deadline.
3. Upload CAD drawings (DWG/DXF), technical PDF specification sheets, and reference photos.
4. Click **Submit** -> Generates an exclusive B2B Lead for verified manufacturers.

### 4.6 The Side-by-Side Quote Comparison Console
Under `/rfq/[id]`, the buyer compares competing bids:
* Compares Unit Price, Packaging Charges, Freight/Shipping Charges, Tax, and Production Lead Times side-by-side.
* Clicks **"Chat"** to negotiate or **"Award Contract"** to finalize the deal.

### 4.7 Direct In-App Live Chat with Factory Owners
* Direct messaging at `/inbox` with product card previews.
* Share laboratory test certificates, sample photos, and dispatch receipts.
* Review, negotiate, and sign deal proposals directly in the conversation.

### 4.8 Order Tracking & GST Tax Bill Downloads
* Track order lifecycle: `ORDER PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `COMPLETED`.
* Download official GST tax bills anytime from `/invoices`.

---

## 5. The Seller Experience (Step-by-Step Walkthrough)

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ 1. Complete KYC     │───►│ 2. Catalog SKUs     │───►│ 3. Receive RFQ Leads│───►│ 4. Unlock & Pitch   │
│ GSTIN, PAN, Cheque  │    │ Slabs, Variants, PDF│    │ Category-Matched    │    │ Phone, WhatsApp, Chat│
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### 5.1 Government KYC Check (GSTIN, PAN, Bank IFSC) & "Verified Supplier" Badge
* **GSTIN Lookup**: Enter 15-character GSTIN -> Auto-fills legal entity name and registered office address.
* **PAN Card**: Enter PAN and upload photo of the card.
* **Bank Proof**: Enter Account Number and IFSC code (auto-detects branch). Upload photo of cancelled cheque.
* **Licenses**: Upload optional MSME/Udyam or FSSAI certificates.
* **Verified Badge**: Admin approval grants the green **"Verified Supplier" Shield** across all product listings.

### 5.2 6-Step Physical Product Cataloging Wizard
Add products at `/seller/listings`:
* **Step 1 (Basic Details)**: Title, Brand Name, Primary Category, Subcategory, Description.
* **Step 2 (HSN & Taxation)**: HSN Code search, GST Rate (0%, 5%, 12%, 18%, 28%), Tax Inclusive/Exclusive toggle.
* **Step 3 (Wholesale Pricing & Slabs)**: MRP, Base Price, MOQ, and Volume Slabs (e.g. 10-50, 51-200, 201+).
* **Step 4 (Variants & Specifications)**: Color, Size, Material, Technical Ratings.
* **Step 5 (Inventory & Dimensions)**: Available stock count, low-stock threshold, weight (kg), carton dimensions (cm).
* **Step 6 (Gallery & PDF Brochures)**: Up to 8 high-res photos, video URLs, and downloadable PDF spec sheets.

### 5.3 Commercial B2B Service Builder
For engineering, maintenance, and commercial services:
* Service Mode: On-Site, Remote, or Hybrid.
* Pricing: Fixed, Hourly/Daily Rate, Milestone-Based, or On Request.
* Package Tiers: Basic, Standard, Premium packages with deliverable checklists.

### 5.4 The RFQ Opportunity Lead Inbox (`/seller/rfq-inbox`)
* Category-matched buyer inquiries arrive in real time.
* Inspect specifications, required quantity, target budget, and delivery deadline.

### 5.5 Unlocking Contact Details & Submitting Itemized Price Quotes
* Click **"Unlock Buyer Contact"** using monthly plan quota or Lead Credit Wallet.
* Access unmasked phone number and email for direct phone pitching or WhatsApp outreach.
* Submit official price quotes with unit price, packaging fee, delivery lead time, and quote validity.

### 5.6 Managing Orders, Dispatch & Revenue Analytics
* View incoming orders on `/seller/dashboard`.
* Print packing slips, enter courier/transporter tracking numbers, and view monthly revenue settlement logs.

---

## 6. Field Operations: The Captain Mobile App (`jaxmart-captain`)

The **Captain App** is an offline-first Expo React Native mobile tool built for on-ground sales teams who walk through physical wholesale markets.

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     1. Start Shift        │ ───► │    2. Onboard Shop        │ ───► │   3. Scan Barcodes        │
│ GPS Lock + Live Selfie    │      │ Photos, GST, Finger Sign  │      │ Camera Scan & Price Slabs │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

### 6.1 Who is a Captain and Why Field Sales Drives the Whole Machine
A **Captain** is an on-ground field representative. They physically walk through industrial clusters and wholesale markets, meet merchants face-to-face, verify physical shops, and digitize inventory in 5 minutes.

### 6.2 Shift Attendance: Satellite GPS Lock, Live Selfie & Street Address Lookup
Captains must clock in on-location before taking any action:
1. **High-Accuracy GPS Satellite Lock**: Confirms agent is inside assigned market territory.
2. **Reverse Geocoding**: Automatically resolves and records the street address, area, and pincode.
3. **Live Selfie Camera Check**: Captures a live timestamped photo on-site.
4. **Punch-Out**: Records end-of-shift location, verifies all offline drafts are synced, and logs daily performance.

### 6.3 7-Step On-Site Shop Onboarding Wizard (Interactive Touchscreen Finger Signature)
* **Step 1 (Shop Profile)**: Legal Business Name, Trade Name, Constitution, Owner Name, Phone, Email.
* **Step 2 (GPS & Storefront Photos)**:
  * 1-tap GPS coordinate capture.
  * Mandatory photo: **Shop Front Board**.
  * Mandatory photo: **Inside Display / Warehouse**.
* **Step 3 (GST & PAN Details)**:
  * Enter 15-digit GSTIN -> Auto-fills official company registration details.
  * Snap photos of GST Certificate and PAN Card.
* **Step 4 (Bank Account Proof)**:
  * Account number and IFSC code (auto-fills bank name and branch).
  * Snap photo of merchant's cancelled bank cheque.
* **Step 5 (Categories & Hours)**:
  * Select primary categories sold (Hardware, Textiles, Electricals, Construction, etc.).
  * Set operating days and opening/closing hours.
* **Step 6 (Terms & Finger Signature)**:
  * Merchant reads terms on phone screen.
  * Merchant **signs with their finger directly on the interactive touchscreen signature canvas**.
  * Captain checks verification declaration checkbox.
* **Step 7 (Review & Submit)**:
  * Review summary card and tap **"Submit to Cloud"** (or automatically queued if offline).
  * Merchant instantly receives Seller ID and welcome SMS.

### 6.4 8-Step Barcode SKU Scanning & Cataloging Engine
Immediately after onboarding a shop, the Captain adds products:
1. Select shop and enter product title, brand, and category.
2. **Scan Barcode**: Point camera at product box to scan **EAN-13, UPC-A, or QR barcode** (auto-fills catalog data if SKU exists).
3. Enter Wholesale Price, MRP, GST Rate, MOQ, and Volume Discount Slabs.
4. Add sizes, colors, or technical ratings.
5. Enter shelf stock count and low-stock threshold.
6. Enter package weight (kg) and carton dimensions (cm).
7. Snap 4 photos (Front packaging, Back specs, Barcode label, Unboxed item).
8. Tap **Submit** to publish SKU to marketplace.

### 6.5 Offline Mode: Works in Market Basements, Auto-Syncs on 4G/5G
* Market basements often have zero mobile network.
* The app saves all photos, forms, and finger signatures locally in SQLite / AsyncStorage.
* When 4G/5G reconnects, an automatic background queue uploads all drafts directly to the cloud.

### 6.6 Daily Target Progress Rings & Field Commission Tracking
* Real-time circular progress rings:
  * Shops Onboarded Today (e.g. 6 / 8 shops)
  * Products Cataloged Today (e.g. 25 / 40 items)
* Automated commission payout calculations based on approved shop activations.

---

## 7. The Admin & Super Admin Command Center (`/admin`)

### 7.1 Super Admin vs. City Territory Admin Permissions

| Operational Capability | Super Admin (HQ Leadership) | City Territory Admin |
|---|---|---|
| Platform Revenue & Global GMV | Full Access | Territory Only |
| Territory & Zone Creation (State/City) | Full Control | View Only |
| Captain Account Provisioning | Full Access | Assigned City |
| Live GPS Field Map & Breadcrumbs | Global View | Assigned City |
| Merchant KYC Review & Approval Desk | All States | Assigned City |
| Product Quality Moderation Desk | Global Catalog | Territory Catalog |
| Dispute Resolution & Settlement | Full Authority | Mediation Notes Only |
| Subscription Plan & Pricing Config | Full Control | View Only |
| Captain Incentive & Commission Rules | Full Control | View Performance |

### 7.2 Live Satellite GPS Map: Tracking Field Agents & Walking Breadcrumbs
* Real-time map displaying moving pins of all on-duty Captains.
* **Walking Breadcrumbs**: View the complete chronological walking path taken by any Captain during their shift.
* **Geo-Fencing Alerts**: Flags any attempt to clock in outside designated market beats.

### 7.3 The Shop KYC Verification Desk (Side-by-Side Document Audit)
* Split-screen document inspection interface:
  * Left pane: Merchant details, GPS coordinates, and government GSTIN records.
  * Right pane: High-resolution zoomable photos of Storefront Board, Inside Warehouse, GST Certificate, PAN Card, and Cancelled Cheque.
* **Actions**: 1-click **"Approve & Activate"** or **"Reject with Reason"**.

### 7.4 Product Quality & Catalog Moderation
* Live feed of newly cataloged SKUs.
* Review photo quality, pricing realism, and HSN tax rate accuracy.

### 7.5 Dispute Mediation Console
* Review buyer complaints, photo proof of damaged goods, and delivery receipts to issue fair administrative settlements.

### 7.6 Territory Management (States ➔ Cities ➔ Market Zones ➔ Beat Routes)
* Setup geographical hierarchy: State ➔ City ➔ Market Zone (e.g. Gujarat ➔ Ahmedabad ➔ Kalupur Wholesale Market).
* Assign weekly beat routes and shop quotas to Captains.

### 7.7 Field Agent Leaderboards & Commission Oversight
* Performance rankings by shop activations, SKUs added, and first-time KYC approval rates.

### 7.8 Subscription & Lead Credit Pack Configuration
* Manage subscription tier pricing, monthly lead quotas, and Lead Credit pack discount structures.

---

## 8. Virtual B2B Exhibition Hall (`/exhibit`)

An immersive digital trade show pavilion:
* **Industry Pavilions**: Virtual expo halls (Textiles, Industrial Machinery, Electronics, Construction).
* **3D Virtual Stalls & Booths**: Company branding banners, video showroom tours, and top 10 featured product carousels with volume slab pricing.
* **Interactive Engagement**: **"Exchange Business Card"** (digital vCard swap) and **"Instant Inquiry / Chat at Stall"** (opens direct chat with stall representative).

---

## 9. Wholesale Flash Deals & Overstock Clearance (`/deals`, `/new-products`)

* **Flash Deals (`/deals`)**: Limited-time bulk lot discounts (15% to 50% off) for fast stock clearance.
* **Factory Overstock Clearance**: Liquidation channel for excess manufacturing production batches.
* **New Products Feed (`/new-products`)**: Real-time stream of the latest verified SKUs cataloged across all industries.

---

## 10. Technical Directory: Routes, APIs & Database Models

### 10.1 Web Route Directory (Next.js Pages)
* `/`: Public Homepage with categories, search, flash deals, and expo banners.
* `/auth`: Mobile Phone OTP and Email/Password login/registration portal.
* `/search`: Typo-tolerant search engine with category, MOQ, price, and verified supplier filters.
* `/categories`: Full visual hierarchy of all industry categories and subcategories.
* `/listings/[id]`: Detailed product/service page with volume slabs, specs, brochure download, and chat button.
* `/deals`: Wholesale flash deals and bulk overstock clearance lots.
* `/new-products`: Newly listed and verified B2B catalog items.
* `/exhibit`: Virtual trade show pavilion, exhibition halls, and 3D exhibitor booths.
* `/pricing`: Subscription tiers (Free, Silver, Gold, Platinum) and Lead Credit packs (`pack_10`, `pack_50`, `pack_100`, `pack_250`).
* `/rfq`: Custom manufacturing RFQ builder with CAD drawing uploads.
* `/rfq/[id]`: Side-by-side quote comparison console for competing supplier bids.
* `/orders`: Buyer order management, milestone progress, contract acceptance, and disputes.
* `/orders/[id]`: Detailed order fulfillment console, milestones, and invoice links.
* `/invoices`: GST-compliant tax invoices with 1-click PDF download & thermal print.
* `/inbox`: Real-time WebSocket chat, in-chat deal proposals, and contract signing.
* `/profile`: Account profile, business details, multi-address manager, and KYC desk.
* `/seller/dashboard`: Seller command room: active orders, pending quotes, monthly revenue.
* `/seller/listings`: 6-step product cataloging wizard, inventory stock manager, and price slab settings.
* `/seller/rfq-inbox`: Category-matched RFQ lead opportunities and itemized quote builder.
* `/admin/login`: Secure administrative access portal.
* `/admin`: Command portal: live GPS Captain map, KYC review desk, product moderation, disputes, and territory stats.
* `/terms`: Platform terms of service and commercial guidelines.
* `/support`: Customer support desk, ticket submission, and FAQ center.

### 10.2 Backend REST API Directory (Express.js Endpoints)
* **Auth & Users**: `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/login`, `GET /api/users/profile`, `POST /api/users/addresses`.
* **Government KYC**: `POST /api/kyc/gstin-lookup`, `POST /api/kyc/pan-validate`, `POST /api/kyc/bank-lookup`, `POST /api/kyc/submit`, `GET /api/kyc/status`.
* **Catalog & Categories**: `GET /api/listings`, `GET /api/listings/:id`, `POST /api/listings`, `PUT /api/listings/:id`, `GET /api/categories`.
* **RFQ & Quotes**: `POST /api/rfq`, `GET /api/rfq`, `GET /api/rfq/:id`, `GET /api/rfq/seller/inbox`, `POST /api/rfq/:id/quotes`, `POST /api/rfq/:rfqId/quotes/:quoteId/award`.
* **Direct Orders & Contracts**: `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders`, `POST /api/orders/:id/contract-sign`, `POST /api/orders/:id/contract-reject`, `POST /api/orders/:orderId/milestones/:milestoneId/submit`, `POST /api/orders/:orderId/milestones/:milestoneId/approve`, `POST /api/orders/:orderId/disputes`.
* **Direct Payments & Invoices**: `POST /api/payments/create-order`, `POST /api/payments/verify`, `GET /api/payments/invoices`, `GET /api/payments/invoices/:id`, `GET /api/payments/purchases`.
* **Subscriptions & Lead Credits**: `GET /api/subscriptions/plans`, `GET /api/subscriptions/me`, `POST /api/subscriptions/upgrade`, `POST /api/subscriptions/credits/purchase`, `POST /api/subscriptions/leads/unlock`.
* **Messaging**: `GET /api/messages/conversations`, `GET /api/messages/conversations/:id`, `POST /api/messages`, `POST /api/messages/start`.
* **Captain Field Operations**: `POST /api/captain/onboard-seller`, `POST /api/captain/listings`, `GET /api/captain/companies`.
* **Admin Governance**: `GET /api/admin/stats`, `GET /api/admin/captains/live-map`, `GET /api/admin/kyc/queue`, `POST /api/admin/kyc/:id/approve`, `POST /api/admin/kyc/:id/reject`, `GET /api/admin/disputes`, `POST /api/admin/disputes/:id/resolve`, `GET /api/admin/captains/leaderboard`.

### 10.3 Database Schema Overview (Prisma / PostgreSQL)
* **User**: Core authentication identity (`BUYER`, `SELLER`, `BOTH`, `ADMIN`, `SUPER_ADMIN`), phone, email, password hash.
* **BusinessProfile**: Legal name, trade name, constitution, GSTIN, PAN, bank account, IFSC, KYC status (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`).
* **LeadCreditWallet & LeadCreditTransaction**: Prepaid seller credit balance and deduction history for lead unlocks.
* **LeadUnlock**: Audit record linking seller ID, RFQ ID, unlock timestamp, and unlock method (`PLAN_QUOTA`, `CREDIT_WALLET`, `UNLIMITED_TIER`, `QUOTE_SUBMITTED`).
* **SubscriptionPlan & Subscription**: Membership tiers (Free, Silver, Gold, Platinum), monthly/annual pricing, and lead quotas.
* **Listing, ProductVariant & ListingMedia**: Physical products/services, volume slabs (JSONB), variants, and PDF brochures.
* **RfqRequest & RfqQuote**: Custom inquiries, CAD attachments, target budget, and multi-vendor bids.
* **Order & Milestone**: Direct orders, in-chat deal agreements, milestones, deliverables, and Razorpay payment identifiers.
* **SubscriptionInvoice**: Complete GST tax invoice records with HSN codes, CGST/SGST/IGST tax splits, and PDF generator data.
* **Conversation & Message**: Real-time messaging channels, deal proposal cards, contract links, and Socket.io stream.

---

## 11. Master Feature Checklist

| System Area | Feature Name | Plain English Summary |
|---|---|---|
| **Lead Engine** | **RFQ Lead Generation** | Buyer custom inquiries automatically generate exclusive seller leads. |
| **Lead Engine** | **Lead Masking** | Protects buyer phone/email until unlocked by verified seller. |
| **Lead Engine** | **Plan Lead Quotas** | Free monthly lead unlocks included in Silver, Gold, and Platinum plans. |
| **Lead Engine** | **Lead Credit Wallet** | Prepaid credit packs (`pack_10`, `pack_50`, `pack_100`, `pack_250`) to unlock leads. |
| **Lead Engine** | **Direct Outreach** | Instant access to unmasked phone number, WhatsApp link, and email. |
| **Direct Commerce**| **Direct Checkout** | Instant payment via UPI, Netbanking, Cards, and NEFT/RTGS. |
| **Direct Commerce**| **In-Chat Deal Signing** | Propose custom deal cards in chat and sign legally binding contracts. |
| **Direct Commerce**| **Milestone Delivery** | Stage-by-stage deliverable approvals for large manufacturing/service jobs. |
| **Direct Commerce**| **GST Tax Invoices** | Automatic tax bills with HSN codes, CGST/SGST/IGST, and PDF download. |
| **Direct Commerce**| **Direct Logistics** | Freight and transport arranged directly between buyer and seller in Phase 1. |
| **Marketplace** | **Typo-Tolerant Search** | Smart search finding products even with spelling mistakes. |
| **Marketplace** | **Volume Price Slabs** | Calculator applying bigger discounts as order quantity increases. |
| **Marketplace** | **Quote Comparison** | Side-by-side console to compare price, shipping, tax, and lead times. |
| **Marketplace** | **Virtual B2B Expo** | Digital trade show pavilions with 3D booths and business card swaps. |
| **Marketplace** | **Flash Deals** | Overstock clearance lots and wholesale flash discounts. |
| **Field Sales** | **GPS Shift Attendance** | Clock-in with mandatory satellite GPS lock, address lookup, and selfie. |
| **Field Sales** | **7-Step Shop Onboarding** | On-site registration capturing GPS, shop photos, GST, bank cheque, and finger signature. |
| **Field Sales** | **8-Step Barcode Scan** | Camera barcode scanner, volume discount slabs, and packaging dimensions. |
| **Field Sales** | **Offline Auto-Sync** | Saves field drafts locally when offline and uploads automatically when connected. |
| **Admin Panel** | **Live GPS Agent Map** | Real-time map tracking where all sales reps are walking during shifts. |
| **Admin Panel** | **Shop KYC Audit Desk** | Side-by-side document inspection tool for 1-click approvals and rejections. |
| **Admin Panel** | **Product Moderation** | Quality and price audit desk for all newly cataloged products. |
| **Admin Panel** | **Dispute Mediation** | Dispute console to inspect evidence and issue fair resolutions. |
| **Admin Panel** | **Territory Management** | Organize operations into States, Cities, and Market Zones. |
| **Admin Panel** | **Agent Leaderboards** | Target vs. achievement rankings and automated sales commissions. |

---

## Conclusion

The **JaxMart Monorepo** delivers a high-impact, revenue-generating Phase 1 B2B platform. By centering operations on a **High-Intent B2B Lead Monetization Engine**, **Direct Commerce** (with direct payments, in-chat deal contracts, and automated GST tax invoices), and **Field Force Automation ("Captain App")**, JaxMart eliminates operational bottlenecks and delivers a seamless, scalable wholesale ecosystem.

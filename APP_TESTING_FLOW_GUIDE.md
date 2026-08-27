# JaxMart B2B Marketplace — Complete End-to-End App Testing Flow Guide

> **Document Type**: Master QA Manual, End-to-End Test Scenarios & Automated Testing Guide  
> **Platform Version**: JaxMart Monorepo Phase 1.5  
> **Target Audience**: QA Engineers, Developers, Product Managers, Field Operations Leads & Testers  
> **Components Tested**: `web/` (Next.js 14), `backend/` (Node.js/Express/Prisma/Postgres/Redis), `jaxmart-captain/` (React Native Expo App), and `mobile/` (Flutter App)  
> **Last Updated**: August 2026

---

## Table of Contents

1. [Test Environment & Pre-Seeded Accounts](#1-test-environment--pre-seeded-accounts)
2. [Flow 1: Buyer Journey End-to-End Testing](#2-flow-1-buyer-journey-end-to-end-testing)
   - [1.1 OTP Login & Registration](#11-otp-login--registration)
   - [1.2 Multi-Address Management](#12-multi-address-management)
   - [1.3 Catalog Discovery, Search & Volume Slabs](#13-catalog-discovery-search--volume-slabs)
   - [1.4 Custom RFQ Creation (with Attachments)](#14-custom-rfq-creation-with-attachments)
   - [1.5 Side-by-Side Quote Comparison Console](#15-side-by-side-quote-comparison-console)
   - [1.6 In-Chat Deal Negotiation & Digital Contract Signing](#16-in-chat-deal-negotiation--digital-contract-signing)
   - [1.7 Off-Platform Payment Settlement & Milestone Deliverables](#17-off-platform-payment-settlement--milestone-deliverables)
   - [1.8 GST Tax Invoice Download & Dispute Filing](#18-gst-tax-invoice-download--dispute-filing)
3. [Flow 2: Seller Journey End-to-End Testing](#3-flow-2-seller-journey-end-to-end-testing)
   - [2.1 Seller Login & Government KYC Check](#21-seller-login--government-kyc-check)
   - [2.2 6-Step Product Cataloging Wizard](#22-6-step-product-cataloging-wizard)
   - [2.3 RFQ Opportunity Lead Inbox & Lead Masking](#23-rfq-opportunity-lead-inbox--lead-masking)
   - [2.4 Unlocking Buyer Leads (Plan Quota vs. Credit Wallet)](#24-unlocking-buyer-leads-plan-quota-vs-credit-wallet)
   - [2.5 Direct Buyer Outreach (Phone / WhatsApp / Live Chat)](#25-direct-buyer-outreach-phone--whatsapp--live-chat)
   - [2.6 Submitting Itemized Price Bids on RFQs](#26-submitting-itemized-price-bids-on-rfqs)
   - [2.7 Proposing In-Chat Deal Cards & Issuing Contracts](#27-proposing-in-chat-deal-cards--issuing-contracts)
   - [2.8 Milestone Submission & Order Fulfillment](#28-milestone-submission--order-fulfillment)
   - [2.9 Credit Wallet Recharging & Subscription Upgrades](#29-credit-wallet-recharging--subscription-upgrades)
4. [Flow 3: Field Operations Testing (`jaxmart-captain` App)](#4-flow-3-field-operations-testing-jaxmart-captain-app)
   - [3.1 Satellite GPS Shift Punch-In & Live Selfie](#31-satellite-gps-shift-punch-in--live-selfie)
   - [3.2 7-Step On-Site Merchant Onboarding Wizard](#32-7-step-on-site-merchant-onboarding-wizard)
   - [3.3 8-Step Barcode SKU Scanning & Cataloging](#33-8-step-barcode-sku-scanning--cataloging)
   - [3.4 Offline Mode & Draft Queue Auto-Sync](#34-offline-mode--draft-queue-auto-sync)
   - [3.5 Daily Target Rings & Shift Punch-Out](#35-daily-target-rings--shift-punch-out)
5. [Flow 4: Admin & Super Admin Governance Testing (`/admin`)](#5-flow-4-admin--super-admin-governance-testing-admin)
   - [4.1 Admin Authentication & Role Permissions](#41-admin-authentication--role-permissions)
   - [4.2 Live Satellite GPS Field Agent Map](#42-live-satellite-gps-field-agent-map)
   - [4.3 Shop KYC Verification Desk](#43-shop-kyc-verification-desk)
   - [4.4 Product Moderation & Quality Control](#44-product-moderation--quality-control)
   - [4.5 Dispute Mediation & Resolution Console](#45-dispute-mediation--resolution-console)
   - [4.6 Territory, City & Market Zone Management](#46-territory-city--market-zone-management)
6. [Flow 5: Real-Time WebSockets & Notifications Testing](#6-flow-5-real-time-websockets--notifications-testing)
   - [5.1 Live Chat & Instant Deal Updates](#51-live-chat--instant-deal-updates)
   - [5.2 Notification Alert Modal & Deep Linking](#52-notification-alert-modal--deep-linking)
7. [Flow 6: Automated API cURL Test Suite](#7-flow-6-automated-api-curl-test-suite)
8. [Flow 7: Critical Edge Cases & Security Vulnerability Tests](#8-flow-7-critical-edge-cases--security-vulnerability-tests)
9. [Master QA Sign-Off Checklist](#9-master-qa-sign-off-checklist)

---

## 1. Test Environment & Pre-Seeded Accounts

### Quick Start Setup

1. **Start Backend & Web Services**:
   ```bash
   ./start.sh
   # Or concurrently:
   # Backend on http://localhost:4000
   # Web Portal on http://localhost:3000
   ```
2. **Start Captain Field App** (in a separate terminal):
   ```bash
   cd jaxmart-captain
   npm run start
   ```

### Pre-Seeded Test Accounts

| Persona / Role | Phone Number | Email Address | Password / OTP | Default Status |
|---|---|---|---|---|
| **System Admin** | `+91 99988 82221` | `admin@jaxmart.com` | `123456` (Mock OTP) | Verified Super Admin |
| **Verified Seller** | `+91 99988 87776` | `sales@globalexports.com` | `123456` (Mock OTP) | KYC Verified Seller (`Global Exports`) |
| **Corporate Buyer** | `+91 99911 12223` | `procurement@techpro.com` | `123456` (Mock OTP) | KYC Verified Buyer (`TechPro Industries`) |
| **Field Captain** | `+91 98765 43210` | `captain.rajesh@jaxmart.com` | `123456` (Mock OTP) | Field Sales Rep (Ahmedabad Zone) |
| **New Test User** | Any 10-digit number | `test@example.com` | `123456` (Mock OTP) | Fresh Unverified Account |

> **Development Mode Note**: The universal mock OTP is **`123456`** for all phone numbers.

---

## 2. Flow 1: Buyer Journey End-to-End Testing

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. OTP LOGIN    │───►│ 2. SEARCH & SLAB│───►│ 3. POST RFQ     │───►│ 4. COMPARE BIDS │
│ Verify Phone    │    │ Dynamic Calc    │    │ Attach CAD/PDF  │    │ Side-by-Side    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             ▼
│ 8. GST INVOICE  │◄───│ 7. DIRECT PAY   │◄───│ 6. SIGN CONTRACT│◄───┌─────────────────┐
│ PDF Download    │    │ Milestone Track │    │ Instant Digital │    │ 5. IN-CHAT DEAL │
└─────────────────┘    └─────────────────┘    └─────────────────┘    │ Live Negotiate  │
                                                                     └─────────────────┘
```

---

### 1.1 OTP Login & Registration
* **Route**: `/auth`
* **Test Steps**:
  1. Open `http://localhost:3000/auth` in your browser.
  2. Select role **"Buyer"**.
  3. Enter test phone number `9991112223`. Click **"Send OTP"**.
  4. Enter the 6-digit OTP `123456`. Click **"Verify & Login"**.
* **Expected Result**:
  - JWT tokens stored in cookies/localStorage.
  - Redirected to the homepage (`/`) or buyer dashboard.
  - Top navigation bar updates to show the User Profile avatar and Cart/Inbox icons.

---

### 1.2 Multi-Address Management
* **Route**: `/profile` -> Addresses Tab
* **Test Steps**:
  1. Navigate to `/profile` and select the **"Addresses"** tab.
  2. Click **"Add New Address"**.
  3. Fill in:
     - Address Type: `WAREHOUSE`
     - Street: `Plot 42, GIDC Industrial Estate, Vatva`
     - City: `Ahmedabad`, State: `Gujarat`, Pincode: `382445`
     - Contact Person: `Mahesh Patel`, Phone: `9876543210`
  4. Check **"Set as Default Shipping Address"** and save.
* **Expected Result**:
  - Address card renders with the `WAREHOUSE` badge.
  - Form validation blocks invalid 6-digit Indian pincodes or blank street fields.

---

### 1.3 Catalog Discovery, Search & Volume Slabs
* **Route**: `/search`, `/categories`, `/listings/[id]`
* **Test Steps**:
  1. In the global search bar, type a typo query: `"dril pres"` or `"solr panl"`.
  2. Observe trigram fuzzy matching: *"Industrial Heavy Duty Drill Press"* appears.
  3. Filter by Category: **"Industrial Supplies"** and check **"Verified Suppliers Only"**.
  4. Click on a product to open its details page (`/listings/[id]`).
  5. Test the **Volume Price Slab Calculator**:
     - Change Quantity from `10` -> `50` -> `200`.
     - Observe unit price automatically adjusting (e.g. ₹45,000 -> ₹42,000 -> ₹38,500).
     - Live **"Total Savings"** badge recalculates in green.
* **Expected Result**:
  - Instant price slab updates with zero layout shifts.
  - MOQ (Minimum Order Quantity) prevents ordering below the manufacturer minimum.

---

### 1.4 Custom RFQ Creation (with Attachments)
* **Route**: `/rfq`
* **Test Steps**:
  1. Click **"Post RFQ"** in the top navigation or visit `/rfq`.
  2. Fill out the RFQ Builder:
     - RFQ Title: *"Custom 5-Ply Corrugated Shipping Boxes (10,000 units)"*
     - Category: `Industrial Supplies` -> `Packaging Materials`
     - Quantity: `10000`, Unit: `Pieces`
     - Target Budget: Min `₹15`, Max `₹22` per unit
     - Target Delivery Date: 20 days from today
     - Delivery Pincode: `380001`
     - Attachments: Upload sample drawing/PDF (e.g., `box_spec.pdf`).
  3. Click **"Submit RFQ"**.
* **Expected Result**:
  - RFQ created with status `OPEN`.
  - Notification alert dispatched to all verified suppliers in the Packaging category.
  - Redirected to `/rfq/[id]` tracking screen.

---

### 1.5 Side-by-Side Quote Comparison Console
* **Route**: `/rfq/[id]`
* **Test Steps**:
  1. Open the created RFQ page `/rfq/[id]`.
  2. Observe the **Quote Comparison Table** displaying competing supplier bids:
     - Supplier Name & Verified Badge
     - Unit Price & Total Bid Amount
     - Freight / Shipping Terms
     - Sample Availability (Yes/No)
     - Estimated Delivery Days
  3. Click **"Compare"** on 2 or 3 quotes to launch the side-by-side spec differential modal.
  4. Click **"Chat with Supplier"** on the most competitive quote.
* **Expected Result**:
  - Live comparison console opens a direct linked conversation in `/inbox`.

---

### 1.6 In-Chat Deal Negotiation & Digital Contract Signing
* **Route**: `/inbox`
* **Test Steps**:
  1. Inside the chat with the seller, observe the seller's proposed **"In-Chat Deal Card"**:
     - Order Title, Quantity, Agreed Unit Price, Milestone Stages.
     - Action Buttons: `[Review & Sign Contract]` and `[Reject / Counter]`.
  2. Click **"Review & Sign Contract"**.
  3. A full-screen Digital Contract modal opens detailing:
     - Buyer & Seller Legal Entities, GSTINs, Delivery Address, Milestone Schedule, Default Terms.
  4. Click **"Accept & Sign Digital Contract"**.
* **Expected Result**:
  - Contract status changes to `ACCEPTED` / `ACTIVE`.
  - Proposer is prevented from signing their own contract.
  - Header status badge updates to `CONTRACT SIGNED`.
  - Order is generated for tracking milestones and off-platform commercial fulfillment.

---

### 1.7 Off-Platform Payment Settlement & Milestone Deliverables
* **Important Business Policy**: JaxMart does **NOT** process commercial goods & service payments on-platform. High-value B2B purchase amounts (e.g. ₹2,00,000) are settled **directly off-platform** between Buyer and Seller (via direct NEFT/RTGS, Corporate Bank Transfer, Cheque, or Commercial Credit terms).
* **Route**: `/orders/[id]`
* **Test Steps**:
  1. Visit `/orders/[id]`.
  2. Observe the Direct Settlement & Milestone Console:
     - Payment Terms: *"Direct Bank Transfer / NEFT / RTGS (Settled Directly Between Parties)"*.
     - Seller Bank Details (Account Number & IFSC from verified KYC) are displayed for buyer transfer.
  3. Buyer clicks **"Mark Advance Paid / Confirm Direct Transfer"** (optional: enter bank UTR / reference number).
  4. Seller inspects direct bank receipt in their external corporate account and confirms receipt on the order dashboard.
  5. Seller uploads Milestone 1 proof (e.g. *Raw Material Batch Photos & Lab QA Certificate*).
  6. Buyer reviews proof and clicks **"Approve Milestone Deliverable"**.
* **Expected Result**:
  - Milestone progress ring advances from 30% -> 60% -> 100%.
  - Order status transitions to `COMPLETED` upon final milestone sign-off without any platform payment intermediary liability.

---

### 1.8 GST Tax Invoice Download & Dispute Filing
* **Route**: `/invoices`, `/orders/[id]`
* **Test Steps**:
  1. Visit `/invoices` to view all GST tax bills.
  2. Click **"Download Tax Invoice (PDF)"** on the completed order.
  3. Verify PDF contents:
     - Seller GSTIN & Buyer GSTIN, HSN Code, Tax split (CGST+SGST for intra-state or IGST for inter-state).
     - Digital QR Code and Invoice Serial Number.
  4. *(Optional Dispute Test)*: Go to `/orders/[id]`, click **"Raise Dispute"**, enter reason *"Defective batch goods"*, and upload photo evidence.
* **Expected Result**:
  - Dispute ticket created with status `OPEN`; flagged on Admin Dispute Desk.

---

## 3. Flow 2: Seller Journey End-to-End Testing

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. SELLER KYC   │───►│ 2. 6-STEP SKU   │───►│ 3. RFQ INBOX    │───►│ 4. UNLOCK LEAD  │
│ GSTIN & Bank    │    │ Catalog Wizard  │    │ Masked Contacts │    │ Quota or Wallet │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐             ▼
│ 8. DISPATCH &   │◄───│ 7. PROPOSE DEAL │◄───│ 6. SUBMIT QUOTE │◄───┌─────────────────┐
│ REVENUE STATS   │    │ In-Chat DealCard│    │ Itemized Bid    │    │ 5. OUTREACH     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    │ Phone/WhatsApp  │
                                                                     └─────────────────┘
```

---

### 2.1 Seller Login & Government KYC Check
* **Route**: `/auth`, `/profile` -> KYC Tab
* **Test Steps**:
  1. Login with Seller Phone `9998887776` and OTP `123456`.
  2. Navigate to `/profile` and open the **"KYC & Business Verification"** tab.
  3. Enter Business Details:
     - Legal Entity Name: `Global Exports Private Limited`
     - GSTIN: `24ABCDE1234F1Z5` -> Click **"Validate GSTIN"** (API Setu verification).
     - PAN: `ABCDE1234F`
     - Bank Account Number: `987654321012`, Bank IFSC: `HDFC0001234`.
  4. Upload GST Certificate PDF and Cancelled Cheque image.
  5. Click **"Submit for Verification"**.
* **Expected Result**:
  - GSTIN structure validated via regex and API Setu mock response.
  - Status updates to `UNDER_REVIEW`; verified badge appears once approved by Admin.

---

### 2.2 6-Step Product Cataloging Wizard
* **Route**: `/seller/listings` -> New Listing
* **Test Steps**:
  1. Visit `/seller/listings` and click **"Add New Product"**.
  2. Follow the 6-Step Wizard:
     - **Step 1: General Info**: Title (*"Industrial CNC Milling Machine"*), Category (*Industrial Supplies*), Brand name.
     - **Step 2: Pricing & Slabs**: Base Price `₹1,20,000`, Unit `UNIT`, MOQ `2`. Add Slabs:
       - *Slab 1*: 2–5 units @ ₹1,20,000
       - *Slab 2*: 6–15 units @ ₹1,12,000
       - *Slab 3*: 16+ units @ ₹1,05,000
     - **Step 3: Technical Specs**: Power `5.5 kW`, Table size `1200x500mm`, Weight `2200 kg`.
     - **Step 4: Media Upload**: Upload 3 high-res product photos + 1 PDF Brochure.
     - **Step 5: Inventory & Shipping**: Stock Available: `Yes`, Lead time: `14 days`, Ships from: `Ahmedabad`.
     - **Step 6: Review & Publish**: Click **"Publish Listing"**.
* **Expected Result**:
  - Listing created with status `ACTIVE`.
  - Immediately searchable on `/search` and listed under `/categories`.

---

### 2.3 RFQ Opportunity Lead Inbox & Lead Masking
* **Route**: `/seller/rfq-inbox`
* **Test Steps**:
  1. Navigate to `/seller/rfq-inbox`.
  2. Observe category-matched buyer RFQs.
  3. Verify **Lead Masking**:
     - Visible: Product Title, Quantity, Target Budget per Unit, Delivery Pincode, CAD Specs.
     - **Masked (Behind Lock Icon)**:
       - Buyer Name: `Raj*** Sh***`
       - Buyer Phone: `+91 98765 *****`
       - Buyer Email: `r***@company.com`
       - Company Name: `Tech*** Ind***`
* **Expected Result**:
  - Sensitive buyer contact details are strictly hidden until unlocked.

---

### 2.4 Unlocking Buyer Leads (Plan Quota vs. Credit Wallet)
* **Route**: `/seller/rfq-inbox`
* **Test Steps**:
  1. On any masked RFQ card, click **"Unlock Buyer Contact"**.
  2. An Unlock Modal appears displaying:
     - Method 1: **"Use Monthly Plan Quota"** (e.g. *8 of 25 leads remaining this month*).
     - Method 2: **"Deduct 1 Lead Credit"** (Current Wallet Balance: *15 credits*).
  3. Select **"Use Plan Quota"** and confirm.
* **Expected Result**:
  - 1 lead deducted from monthly quota.
  - RFQ card transitions from locked to **UNLOCKED**.
  - Buyer's full phone number (`+91 99911 12223`), email (`procurement@techpro.com`), and company name are revealed.

---

### 2.5 Direct Buyer Outreach (Phone / WhatsApp / Live Chat)
* **Route**: `/seller/rfq-inbox` (Unlocked Card)
* **Test Steps**:
  1. On the unlocked RFQ card, test the outreach buttons:
     - Click **"Call Buyer"**: Triggers `tel:+919991112223`.
     - Click **"Chat on WhatsApp"**: Launches `https://wa.me/919991112223?text=...`.
     - Click **"Open Live Chat"**: Opens direct chat session in `/inbox`.
* **Expected Result**:
  - Instant direct communication channels activated.

---

### 2.6 Submitting Itemized Price Bids on RFQs
* **Route**: `/seller/rfq-inbox` -> Submit Quote
* **Test Steps**:
  1. Click **"Submit Quote"** on the unlocked RFQ.
  2. Fill in the Quotation Form:
     - Unit Price: `₹18.50` per unit
     - Packaging & Forwarding: `₹1,500` lump sum
     - GST Tax Rate: `18%`
     - Delivery Lead Time: `12 Days`
     - Payment Terms: `30% Advance, 70% on Dispatch`
     - Notes: *"Includes wooden pallet packaging and transit insurance."*
  3. Click **"Send Official Quotation"**.
* **Expected Result**:
  - Quote created with status `SUBMITTED`.
  - Notification sent to the buyer. Quote appears in the buyer's `/rfq/[id]` comparison console.

---

### 2.7 Proposing In-Chat Deal Cards & Issuing Contracts
* **Route**: `/inbox`
* **Test Steps**:
  1. Open the conversation with the buyer in `/inbox`.
  2. Click **"Propose Deal / Contract"** at the bottom of the chat.
  3. Fill the Deal Proposal Form:
     - Total Order Value: `₹1,85,000`
     - Milestone 1: *Production Kickoff (30% - ₹55,500)*
     - Milestone 2: *Quality Inspection & Dispatch (70% - ₹1,29,500)*
     - Est. Delivery Date: 15 days from signing
  4. Click **"Propose Deal to Buyer"**.
* **Expected Result**:
  - An interactive Deal Card is posted into the chat.
  - Proposer sees status `"Waiting for Buyer's Digital Signature"`.

---

### 2.8 Milestone Submission & Order Fulfillment
* **Route**: `/seller/dashboard`, `/orders/[id]`
* **Test Steps**:
  1. Once the contract is accepted by the buyer, open `/orders/[id]`.
  2. On Milestone 1, click **"Submit Milestone Proof"**.
  3. Upload raw material batch photos and QA test certificate.
  4. Enter dispatch tracking details: Courier: `VRL Logistics`, Docket No: `VRL-89421-AHM`.
  5. Click **"Submit for Approval"**.
* **Expected Result**:
  - Milestone status updates to `SUBMITTED`.
  - Buyer is notified to inspect proof and release the milestone.

---

### 2.9 Credit Wallet Recharging & Subscription Upgrades
* **Route**: `/pricing`
* **Test Steps**:
  1. Navigate to `/pricing`.
  2. Test **Lead Credit Pack Purchase**:
     - Select **"Growth Pack (50 Credits - ₹1,999)"**.
     - Click **"Buy Credits Now"** -> Complete Razorpay test checkout.
     - Verify wallet balance increases by +50 credits instantly.
  3. Test **Subscription Plan Upgrade**:
     - Select **"Gold Enterprise Plan (₹3,999/month)"**.
     - Complete checkout.
* **Expected Result**:
  - Subscription tier changes to `GOLD`.
  - Monthly lead quota resets to 100 leads/month.
  - "Verified Gold Supplier" shield badge appears on all seller listings.

---

## 4. Flow 3: Field Operations Testing (`jaxmart-captain` App)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. GPS PUNCH-IN │───►│ 2. 7-STEP SHOP  │───►│ 3. 8-STEP SKU   │───►│ 4. OFFLINE SYNC │
│ Lock & Selfie   │    │ Onboard Wizard  │    │ Barcode Scanner │    │ Auto-Queue      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

### 3.1 Satellite GPS Shift Punch-In & Live Selfie
* **Screen**: Captain Dashboard -> Shift Attendance
* **Test Steps**:
  1. Open the Captain App and login with `9876543210` / `123456`.
  2. Tap **"Start Shift / Punch-In"**.
  3. App requests Location & Camera permissions.
  4. Observe:
     - Satellite GPS Lock: Accuracy `<= 15 meters` (Latitude / Longitude captured).
     - Reverse Geocoded Street Address: *"Kalupur Wholesale Market, Ahmedabad"*.
  5. Capture live shift selfie.
  6. Tap **"Confirm Punch-In"**.
* **Expected Result**:
  - Shift timer starts running.
  - Live breadcrumb tracking begins sending location pings to the Admin Live Map.

---

### 3.2 7-Step On-Site Merchant Onboarding Wizard
* **Screen**: Captain Dashboard -> Onboard Merchant
* **Test Steps**:
  1. Tap **"Onboard New Merchant"**.
  2. Execute the 7 steps:
     - **Step 1: Storefront Photo**: Snap photo of shop exterior with shop signboard visible.
     - **Step 2: Business Info**: Legal Business Name, Trade Name, Market Zone, Shop Number.
     - **Step 3: Owner Details**: Owner Name, Mobile Number, WhatsApp Number.
     - **Step 4: GPS Coordinates**: Auto-fetches current device location.
     - **Step 5: GSTIN & PAN**: Take photo of GST Certificate and auto-fill GSTIN.
     - **Step 6: Bank Account**: Capture photo of cancelled cheque / passbook.
     - **Step 7: Touchscreen Digital Finger Signature**: Merchant signs directly on the touchscreen canvas.
  3. Tap **"Submit Merchant Registration"**.
* **Expected Result**:
  - Merchant account created in `PENDING_AUDIT` state.
  - Uploaded documents routed to Admin Shop KYC Verification Desk.
  - Captain's Daily Onboarding counter increases (+1).

---

### 3.3 8-Step Barcode SKU Scanning & Cataloging
* **Screen**: Merchant Profile -> Catalog Products
* **Test Steps**:
  1. Under the newly onboarded merchant, tap **"Scan & Catalog SKU"**.
  2. Execute the 8 steps:
     - **Step 1: Barcode Scan**: Point camera at product EAN/UPC barcode (auto-detects code).
     - **Step 2: Product Name & Category**: Enter title and select category.
     - **Step 3: Wholesale Pricing**: Enter wholesale price and MOQ.
     - **Step 4: Volume Discount Slabs**: Add bulk tiered discounts (e.g. 50+ pcs, 100+ pcs).
     - **Step 5: Packaging & Weight**: Enter box dimensions (L x W x H in cm) and gross weight (kg).
     - **Step 6: Stock Availability**: Ready stock quantity available in shop/warehouse.
     - **Step 7: Product Photos**: Take 3 photos (front, back, spec label).
     - **Step 8: Final Review**: Tap **"Publish SKU to JaxMart"**.
* **Expected Result**:
  - SKU uploaded and queued for Admin Catalog Moderation.
  - Captain's Daily SKU counter increases (+1).

---

### 3.4 Offline Mode & Draft Queue Auto-Sync
* **Screen**: Offline Drafts Console
* **Test Steps**:
  1. Enable **Airplane Mode** on the mobile device (disconnect Wi-Fi and Mobile Data).
  2. Onboard a new merchant and catalog 1 SKU in offline mode.
  3. Observe:
     - Data is saved locally in SQLite / Async storage.
     - Status shows **"Saved in Offline Drafts (1 pending sync)"**.
  4. Turn Airplane Mode **OFF** (reconnect network).
  5. Open the Captain App.
* **Expected Result**:
  - App detects network reconnection and triggers background auto-sync.
  - Pending draft uploads to backend API; sync badge clears automatically.

---

### 3.5 Daily Target Rings & Shift Punch-Out
* **Screen**: Captain Dashboard
* **Test Steps**:
  1. Observe the **Target Progress Rings**:
     - *Shops Onboarded*: `1 / 3 target` (33% filled)
     - *SKUs Cataloged*: `1 / 10 target` (10% filled)
     - *Commission Earned Today*: `₹250`
  2. Tap **"End Shift / Punch-Out"**.
  3. Confirm shift summary (Total hours, shops visited, distance walked).
* **Expected Result**:
  - Shift ends cleanly; location tracking stops.

---

## 5. Flow 4: Admin & Super Admin Governance Testing (`/admin`)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. ADMIN LOGIN  │───►│ 2. LIVE GPS MAP │───►│ 3. KYC AUDIT    │───►│ 4. DISPUTES     │
│ RBAC Gate       │    │ Captain Walking │    │ 1-Click Approve │    │ Mediation Desk  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

### 4.1 Admin Authentication & Role Permissions
* **Route**: `/admin`, `/auth`
* **Test Steps**:
  1. Login with Admin Phone `9998882221` and OTP `123456`.
  2. Navigate to `/admin`.
  3. Verify Super Admin vs Territory Admin permissions:
     - Access to Live GPS Map, KYC Desk, Product Moderation, Disputes, Territory Setup, and Financial Analytics.
* **Expected Result**:
  - Non-admin users attempting to access `/admin` are redirected to `/` with a 403 Access Denied toast.

---

### 4.2 Live Satellite GPS Field Agent Map
* **Route**: `/admin` -> Live Map Tab
* **Test Steps**:
  1. Open the **"Live Captain Map"** tab.
  2. Observe:
     - Interactive map pins showing all on-duty Captains.
     - Green pins for active shifts, gray pins for clocked-out reps.
     - Click on Captain Rajesh: Displays walking breadcrumbs, current street address, battery percentage, and today's shops onboarded.
* **Expected Result**:
  - Real-time location updates refresh every 30 seconds via Socket.io.

---

### 4.3 Shop KYC Verification Desk
* **Route**: `/admin` -> KYC Queue Tab
* **Test Steps**:
  1. Open the **"KYC Verification Desk"**.
  2. Select the pending merchant submitted by the Captain.
  3. Use the **Side-by-Side Document Audit Tool**:
     - Left: Submitted Business details & GSTIN/PAN data.
     - Right: High-res document viewer for GST Certificate & Cancelled Cheque.
  4. Test Actions:
     - Click **"Approve KYC"**: Status becomes `VERIFIED`. Merchant receives SMS alert and "Verified Supplier" badge.
     - Click **"Reject KYC"**: Opens rejection reason modal (e.g. *"Blurry bank cheque photo"*). Status becomes `REJECTED`.
* **Expected Result**:
  - Audit logs record Admin ID, timestamp, and rejection reason.

---

### 4.4 Product Moderation & Quality Control
* **Route**: `/admin` -> Product Moderation Tab
* **Test Steps**:
  1. Review newly submitted SKUs from sellers and captains.
  2. Verify price sanity, high-res photos, and accurate category mapping.
  3. Click **"Approve SKU"** to make it publicly discoverable.
* **Expected Result**:
  - Approved SKU status changes from `DRAFT` / `PENDING_REVIEW` to `ACTIVE`.

---

### 4.5 Dispute Mediation & Resolution Console
* **Route**: `/admin` -> Disputes Tab
* **Test Steps**:
  1. Open the open dispute filed in Flow 1.8.
  2. Inspect:
     - Original In-Chat Deal Contract.
     - Buyer's evidence photos and claim.
     - Seller's dispatch proof and response.
  3. Select Resolution Outcome:
     - Option A: **"Resolve in Buyer's Favor (Issue Full/Partial Refund)"**
     - Option B: **"Resolve in Seller's Favor (Release Held Payment)"**
  4. Enter mediator notes and click **"Execute Resolution"**.
* **Expected Result**:
  - Dispute status updates to `RESOLVED`; notifications sent to both parties.

---

### 4.6 Territory, City & Market Zone Management
* **Route**: `/admin` -> Territories Tab
* **Test Steps**:
  1. Create a new geographical hierarchy:
     - State: `Gujarat`
     - City: `Ahmedabad`
     - Market Zone: `Kalupur Wholesale Cloth Market`
  2. Assign Captain Rajesh to this zone with a daily quota of 5 shops.
* **Expected Result**:
  - Zone appears in Captain app dropdowns for localized merchant onboarding.

---

## 6. Flow 5: Real-Time WebSockets & Notifications Testing

### 5.1 Live Chat & Instant Deal Updates
* **Setup**: Open two different browser windows side by side (Window 1: Buyer, Window 2: Seller).
* **Test Steps**:
  1. In Window 1 (Buyer), send a chat message: *"Can you deliver by the 15th?"*
  2. Observe Window 2 (Seller) in real time:
     - Message appears instantly without page refresh.
     - Green typing indicator displays when the other party types.
  3. In Window 2 (Seller), propose a Deal Card.
  4. Observe Window 1 (Buyer):
     - Interactive Deal Card renders immediately in chat with sound/vibration alert.
* **Expected Result**:
  - WebSocket latency under 100ms; zero message drops.

### 5.2 Notification Alert Modal & Deep Linking
* **Test Steps**:
  1. When a new RFQ quote or contract proposal is received while a user is offline, have the user log in.
  2. On login/page load, observe the **Real-Time Notification Alert Modal** popping up with unread items.
  3. Click on the notification item.
* **Expected Result**:
  - Directly navigates to the exact relevant contract `/orders/[id]` or RFQ `/rfq/[id]` context.
  - Notification mark-as-read updates badge counter in navigation bar.

---

## 7. Flow 6: Automated API cURL Test Suite

Run these commands in your terminal to test the backend REST API directly:

### 1. Health & Signal Check
```bash
curl -s http://localhost:4000/health | jq .
# Expected: {"status":"ok","services":{"database":"ok","cache":"ok"}}
```

### 2. Send Mobile OTP
```bash
curl -s -X POST http://localhost:4000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9991112223"}' | jq .
# Expected: {"success":true,"message":"OTP sent successfully"}
```

### 3. Verify OTP & Get JWT Token
```bash
BUYER_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9991112223", "otp": "123456"}' | jq -r '.accessToken')
echo "Buyer Access Token: $BUYER_TOKEN"
```

### 4. Fetch Active Categories
```bash
curl -s http://localhost:4000/api/categories | jq .
```

### 5. Search Listings (Trigram Fuzzy Search)
```bash
curl -s "http://localhost:4000/api/listings?search=drill&limit=5" | jq .
```

### 6. Create RFQ (Buyer)
```bash
curl -s -X POST http://localhost:4000/api/rfq \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need 5000 Industrial Packaging Boxes",
    "description": "5-Ply corrugated boxes with custom logo printing.",
    "categoryId": "industrial-supplies",
    "quantity": 5000,
    "budgetMin": 15,
    "budgetMax": 20,
    "pincode": "380001"
  }' | jq .
```

### 7. Check Seller Lead Balance & Unlock Lead
```bash
SELLER_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9998887776", "otp": "123456"}' | jq -r '.accessToken')

# Unlock RFQ Lead using Monthly Plan Quota:
curl -s -X POST http://localhost:4000/api/subscriptions/leads/unlock \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rfqId": "<TARGET_RFQ_ID>", "method": "PLAN_QUOTA"}' | jq .
```

---

## 8. Flow 7: Critical Edge Cases & Security Vulnerability Tests

| # | Edge Case / Vulnerability Test | How to Execute Test | Expected Safe Behavior | Pass/Fail |
|---|---|---|---|---|
| **1** | **Duplicate Credit Deduction Race Condition** | Send 2 simultaneous `POST /api/subscriptions/leads/unlock` requests for the same RFQ ID using `xargs -P 2`. | Atomic `prisma.$transaction` locks row; exactly 1 credit is deducted, second request returns already unlocked. | [ ] |
| **2** | **Self-Contract Signing Prevention** | Seller proposes deal, then attempts to call `POST /api/orders/:id/contract-sign` with their own seller token. | Backend blocks request with `403 Forbidden: Proposer cannot sign their own contract`. | [ ] |
| **3** | **Unauthenticated KYC Document Access** | Attempt to directly fetch private KYC bank cheque URL without an authorized admin session. | Blocked; access requires 15-minute expiring AWS S3 Presigned URL. | [ ] |
| **4** | **Negative / Zero Price Slabs** | Attempt to create product listing with price `0` or negative order quantity. | Zod / Joi validation rejects request with `400 Bad Request`. | [ ] |
| **5** | **Offline Draft Sync Conflict** | Edit an offline draft on the device while the merchant account was modified on the admin web portal. | Conflict resolution preserves the latest timestamp with merge alert. | [ ] |
| **6** | **Brute Force OTP Rate Limiting** | Send 10 consecutive `POST /api/auth/send-otp` requests within 1 minute from the same IP. | Rate limiter kicks in on request #4 with `429 Too Many Requests`. | [ ] |

---

## 9. Master QA Sign-Off Checklist

```markdown
### Final Release Sign-Off Matrix

#### Buyer Flow
- [ ] Mobile OTP Login & Registration
- [ ] Multi-Address creation (Shipping/Billing/Warehouse)
- [ ] Trigram search & Volume price slab live calculator
- [ ] RFQ creation with attachments & budget limits
- [ ] Side-by-side quote comparison table
- [ ] In-chat deal review & digital contract signing
- [ ] Off-platform direct payment settlement & milestone deliverable approval
- [ ] GST Tax Invoice PDF download

#### Seller Flow
- [ ] Government KYC verification (GSTIN/PAN/Bank IFSC)
- [ ] 6-Step product cataloging wizard with tiered slabs
- [ ] RFQ Lead Inbox with masked buyer contact info
- [ ] Unlocking leads via monthly plan quota & credit wallet
- [ ] Direct outreach via Phone, WhatsApp & Live Chat
- [ ] Itemized quotation submission on RFQs
- [ ] In-chat deal card proposing & contract issuance
- [ ] Milestone proof submission & order dispatch tracking
- [ ] Lead Credit pack recharge via Razorpay checkout

#### Captain Field Flow (`jaxmart-captain`)
- [ ] Satellite GPS shift punch-in with live selfie & address lookup
- [ ] 7-Step on-site merchant onboarding with digital signature
- [ ] 8-Step camera barcode scanning & SKU cataloging
- [ ] Offline mode draft queue & automatic online sync
- [ ] Daily target progress rings & shift punch-out

#### Admin Governance Flow (`/admin`)
- [ ] Role-based access control guarding `/admin`
- [ ] Live Satellite GPS Map with Captain walking breadcrumbs
- [ ] Side-by-side shop KYC document audit desk (1-click approve/reject)
- [ ] Product catalog quality moderation
- [ ] Dispute mediation console & arbitration
- [ ] Territory, City & Market Zone management

#### Real-Time & Security
- [ ] Multi-window live chat with typing indicators
- [ ] Pop-up notification alert modal on login & deep-linking
- [ ] Double-deduction wallet race condition protection verified
- [ ] Proposer self-signing prevention verified
```

---
*Testing guide ready for JaxMart Monorepo QA execution.*

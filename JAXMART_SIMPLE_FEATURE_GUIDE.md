# JaxMart — In-Depth Plain English Guide to the Entire Platform

> **About this Document**:  
> This guide explains every single feature, screen, workflow, and business rule built inside the JaxMart platform in thorough detail. It uses zero technical jargon or programming code, so anyone—from business owners to sales leads—can understand exactly what was developed, how it works in real life, and what genuine work has been completed.

---

## Table of Contents

1. [What is JaxMart and Why Was It Built?](#1-what-is-jaxmart-and-why-was-it-built)
2. [What is Finished vs. What is Blocked by Outside Factors](#2-what-is-finished-vs-what-is-blocked-by-outside-factors)
3. [The Buyer Experience (Step-by-Step Deep Dive)](#3-the-buyer-experience-step-by-step-deep-dive)
   - [3.1 Logging In & Creating an Account](#31-logging-in--creating-an-account)
   - [3.2 Finding Products & Using Smart Filters](#32-finding-products--using-smart-filters)
   - [3.3 How Bulk Wholesale Discount Slabs Work](#33-how-bulk-wholesale-discount-slabs-work)
   - [3.4 The Custom Quote Request System (RFQ)](#34-the-custom-quote-request-system-rfq)
   - [3.5 Secure Payment Holding (Escrow Protection)](#35-secure-payment-holding-escrow-protection)
   - [3.6 Live Messaging with Factory Owners](#36-live-messaging-with-factory-owners)
   - [3.7 Tracking Orders & Resolving Complaints](#37-tracking-orders--resolving-complaints)
4. [The Seller Experience (Step-by-Step Deep Dive)](#4-the-seller-experience-step-by-step-deep-dive)
   - [4.1 Business Verification & Legal Documents (KYC)](#41-business-verification--legal-documents-kyc)
   - [4.2 Adding a Physical Product to the Catalog](#42-adding-a-physical-product-to-the-catalog)
   - [4.3 Adding a B2B Service to the Catalog](#43-adding-a-b2b-service-to-the-catalog)
   - [4.4 Answering Customer Price Quote Inquiries](#44-answering-customer-price-quote-inquiries)
   - [4.5 Fulfilling Orders & Requesting Payouts](#45-fulfilling-orders--requesting-payouts)
5. [The Captain Field Sales Flow (Mobile App Deep Dive)](#5-the-captain-field-sales-flow-mobile-app-deep-dive)
   - [5.1 Who is a Captain?](#51-who-is-a-captain)
   - [5.2 Shift Attendance (GPS Punch-In, Selfie, Punch-Out)](#52-shift-attendance-gps-punch-in-selfie-punch-out)
   - [5.3 Visiting Stores & Daily Target Tracking](#53-visiting-stores--daily-target-tracking)
   - [5.4 The 7-Step On-Site Shop Onboarding Wizard](#54-the-7-step-on-site-shop-onboarding-wizard)
   - [5.5 The 8-Step Barcode Product Cataloging Wizard](#55-the-8-step-barcode-product-cataloging-wizard)
   - [5.6 Offline Mode & Automatic Syncing](#56-offline-mode--automatic-syncing)
6. [The Admin & Super Admin Control Center](#6-the-admin--super-admin-control-center)
   - [6.1 Role Breakdown: Super Admin vs. City Admin](#61-role-breakdown-super-admin-vs-city-admin)
   - [6.2 Live Map Tracking of Field Agents](#62-live-map-tracking-of-field-agents)
   - [6.3 Shop Onboarding Verification Desk](#63-shop-onboarding-verification-desk)
   - [6.4 Product Quality & Price Moderation](#64-product-quality--price-moderation)
   - [6.5 Managing Disputes & Refunding Money](#65-managing-disputes--refunding-money)
   - [6.6 Field Sales Leaderboard & Commission Tracking](#66-field-sales-leaderboard--commission-tracking)
7. [The Virtual B2B Exhibition Hall (`/exhibit`)](#7-the-virtual-b2b-exhibition-hall-exhibit)
8. [Master Checklist of Completed Work](#8-master-checklist-of-completed-work)

---

## 1. What is JaxMart and Why Was It Built?

Traditional retail websites (like Amazon or Flipkart) are built for everyday shoppers buying 1 or 2 items. They do not work for real wholesale commerce. 

In real-world business:
* A shopkeeper does not buy 1 shirt; they buy 500 shirts in 5 different sizes.
* A contractor does not buy 1 bag of cement; they buy 3 truckloads and demand a bulk discount.
* Companies need official GST tax invoices, proof of legal registration, and price negotiation before paying.

**JaxMart was built to solve these exact problems.** It is a complete B2B wholesale platform that connects verified factories, distributors, and service providers with corporate buyers. It also gives the company an on-ground sales system so field agents can walk into physical wholesale markets, verify shops, take photos, and digitize inventory in minutes.

---

## 2. What is Finished vs. What is Blocked by Outside Factors

To be 100% honest and transparent with management, investors, and team leads, here is the exact status of what is built in code versus what is waiting on external business approvals:

### A. What is Fully Built and Working:
1. **The Entire Public Website**: Homepage, categories, dynamic banners, search, and product pages.
2. **The Buyer Account & Office**: Cart, wholesale discount calculator, order checkout, RFQ creation, and quote comparison.
3. **The Seller Control Room**: Product builder, variant builder, bulk discount slab settings, quote answering tool, and order fulfillment.
4. **The Live Chat System**: Direct buyer-to-seller chat with file and photo sharing attached to products.
5. **The Field Captain Mobile System**: GPS punch in/out, selfie check, 7-step on-site shop onboarding with digital signature, and 8-step barcode scanning.
6. **The Admin & Super Admin Control Center**: Live GPS agent map, shop approval queue, product audit desk, and dispute resolution.

### B. What is Blocked (Waiting on Management / Outside Providers):
1. **Live Mobile Phone OTP Service**:
   * *What was built*: The phone login screen and OTP check are completely built and work with test verification codes.
   * *What is missing*: Management has not provided a live commercial SMS Gateway account (like Fast2SMS, MSG91, or Twilio) with approved government SMS message templates.
2. **Live Bank Escrow & Payment Structure**:
   * *What was built*: Test credit card, UPI, and bank transfer checkouts are working with a built-in safe holding ledger.
   * *What is missing*: The finance team has not finalized the official company business banking account, marketplace commission fee percentage, and official payout rules.
3. **Monthly Membership / Subscription Strategy**:
   * *What was built*: The system can restrict free users (e.g. 10 quotes/month) and unlock unlimited quotes for paid members.
   * *What is missing*: Management has not finalized the official monthly/annual pricing strategy.
4. **Live Government KYC APIs**:
   * *What was built*: The automated GST and PAN verification engine is coded and tested.
   * *What is missing*: Live production credentials from Government of India / API Setu / GST portal have not been handed over.
5. **App Store Publishing Accounts**:
   * *What was built*: The mobile applications run locally on Android and iOS test devices.
   * *What is missing*: The company Google Play Console and Apple Developer accounts are needed to publish the apps for public download.

---

## 3. The Buyer Experience (Step-by-Step Deep Dive)

Here is the exact journey of a business buyer on JaxMart:

### 3.1 Logging In & Creating an Account
* A buyer visits the platform and logs in using their mobile phone number.
* They enter their business name, email, and choose their role as a **Buyer** (or **Both** if they also sell).
* They can save multiple delivery addresses (e.g. Main Office, Factory Warehouse, Branch Store).

### 3.2 Finding Products & Using Smart Filters
* **Typo-Tolerant Search**: If a buyer types "elecric cabil" instead of "electric cable", the search engine still understands and displays the correct items.
* **Granular Business Filters**:
  * Filter by **Category** (e.g. Industrial Machinery, Construction Materials, Electronics, Textiles).
  * Filter by **Price Range** (e.g. Rs 500 to Rs 5,000).
  * Filter by **Minimum Order Quantity (MOQ)** (e.g. Only show items where minimum order is under 50 pieces).
  * Filter by **Location** (e.g. Only show sellers in Ahmedabad or Mumbai).
  * Filter by **Verified Sellers Only** (Only show suppliers with checked government legal papers).
  * Filter by **In-Stock** (Items ready to ship immediately).

### 3.3 How Bulk Wholesale Discount Slabs Work
In wholesale, the more you buy, the cheaper each item becomes. JaxMart calculates this automatically on every product page:

* *Example Product: Industrial Steel Bolts*
  * Slab 1: Buy 10 to 50 pieces -> Rs 100 per piece
  * Slab 2: Buy 51 to 200 pieces -> Rs 85 per piece
  * Slab 3: Buy 201 to 500 pieces -> Rs 70 per piece
  * Slab 4: Buy 501+ pieces -> Rs 55 per piece
* As the buyer types `250` in the quantity box, the page automatically switches to the Rs 70 slab and calculates the total price, taxes, and estimated savings in real time.

### 3.4 The Custom Quote Request System (RFQ)
When a buyer needs a custom bulk manufacturing order that is not listed in standard catalog items (e.g., "I need 10,000 custom printed cardboard boxes with my logo delivered to Pune in 20 days"):

1. The buyer clicks **"Request a Quote (RFQ)"**.
2. They enter product specifications, required quantity, target budget per unit, delivery deadline, and upload technical drawings or sample photos.
3. The system automatically alerts all verified manufacturers who produce cardboard boxes.
4. Manufacturers review the request and submit detailed price bids (showing manufacturing cost, packaging, tax, and transport fees).
5. The buyer opens their **Quote Comparison Console**, reviews all bids side-by-side, talks to sellers in live chat, and clicks **"Accept Quote"** to award the order to the winner.

### 3.5 Secure Payment Holding (Escrow Protection)
To eliminate fraud and prevent buyers from losing money to fake suppliers:
1. When a buyer places an order, they pay via UPI, Netbanking, Corporate Card, or Bank Transfer.
2. The payment does **NOT** go directly into the seller's personal bank account immediately.
3. Instead, the money is placed into a **Protected Holding State (Escrow)**.
4. The seller is notified that payment is guaranteed, so they pack and dispatch the goods.
5. Once the buyer receives the shipment and confirms it is in good condition, the held funds are released directly to the seller.
6. For long-term services (e.g. Factory Electrical Setup), payments can be released in milestones (e.g. 30% advance on start, 40% on halfway inspection, 30% on completion).

### 3.6 Live Messaging with Factory Owners
* Buyers can open a live chat window directly from any product page or quote bid.
* The top of the chat pins a small card showing the exact product or quote they are discussing.
* Buyers and sellers can send text messages, share test reports, send PDF brochures, and negotiate terms without having to move to personal WhatsApp.

### 3.7 Tracking Orders & Resolving Complaints
* **Live Status Steps**: `Order Created` -> `Accepted by Seller` -> `Packed & Shipped` -> `Delivered` -> `Completed`.
* **Dispute Button**: If the goods arrive broken, defective, or in the wrong quantity, the buyer clicks **"Raise Dispute"**.
* This automatically freezes the held funds and alerts the Admin team to investigate photos and resolve the issue.

---

## 4. The Seller Experience (Step-by-Step Deep Dive)

Here is how a manufacturer, wholesaler, or service provider runs their business on JaxMart:

### 4.1 Business Verification & Legal Documents (KYC)
Before a seller is allowed to sell publicly, they must submit their business credentials:
1. **GST Verification**: The seller enters their 15-digit GST number. The system verifies it and automatically fills in their registered business name and address. The seller uploads their GST registration certificate.
2. **PAN Card Check**: The seller enters their business PAN number and uploads a photo of the PAN card.
3. **Bank Account Setup**: The seller enters their bank account number and IFSC code (the system auto-detects the branch name and city). They upload a cancelled cheque or bank passbook photo for payouts.
4. **Special Licenses**: Food and agriculture sellers upload their mandatory FSSAI license; small businesses can upload MSME/Udyam certificates.
5. Once submitted, the profile enters **Pending Review** until the Admin approves it.

### 4.2 Adding a Physical Product to the Catalog
The seller opens the **"Add New Product"** wizard:
* **Step 1 (Basic Info)**: Product Title, Brand Name, Category, Subcategory, Short Summary, and Detailed Description.
* **Step 2 (Tax & HSN Code)**: Select HSN code, choose GST rate (0%, 5%, 12%, 18%, or 28%), and choose whether the price includes or excludes taxes.
* **Step 3 (Wholesale Pricing & Slabs)**:
  * Maximum Retail Price (MRP).
  * Base Wholesale Selling Price.
  * Minimum Order Quantity (MOQ).
  * Tier Pricing Slabs (e.g. Tier 1: 10-50 qty, Tier 2: 51-200 qty, Tier 3: 201+ qty).
* **Step 4 (Variants)**: Add different colors, sizes, materials, or technical ratings.
* **Step 5 (Inventory & Shipping)**: Available stock quantity, product weight in kg, and package box dimensions (Length x Width x Height in cm).
* **Step 6 (Photos & Brochures)**: Upload up to 8 high-resolution product photos, demo videos, and a downloadable PDF specification sheet.

### 4.3 Adding a B2B Service to the Catalog
For companies providing commercial services (e.g. Factory Maintenance, Industrial Painting, Solar Installation):
* Define Service Mode: On-Site, Remote, or Hybrid.
* Define Pricing Model: Fixed Price, Negotiable, or On Request.
* Define Deliverables & Milestone Stages.

### 4.4 Answering Customer Price Quote Inquiries
* When buyers post quote requests in the seller's category, they show up in the **"RFQ Inbox"**.
* The seller opens the request, reviews the buyer's specifications, and fills out an official quote:
  * Unit price.
  * Packaging and handling charges.
  * Transport / delivery charges.
  * Applicable tax percentage.
  * Delivery lead time (e.g. "Ready in 7 business days").
  * Quote validity date (e.g. "This price is valid for 14 days").

### 4.5 Fulfilling Orders & Requesting Payouts
* When an order is placed, the seller gets an instant alert.
* They print the packaging slip, mark the order as **Shipped**, and enter the transport tracking number.
* Once delivered, the held funds move into the seller's wallet balance, which can be settled directly to their verified bank account.

---

## 5. The Captain Field Sales Flow (Mobile App Deep Dive)

This is one of the most powerful parts of JaxMart: a dedicated mobile workflow for on-ground sales teams who visit physical wholesale markets.

### 5.1 Who is a Captain?
A **Captain** is an on-ground field sales representative or business analyst employed by the platform. Their job is to walk through wholesale markets, industrial clusters, and wholesale markets, meet shopkeepers face-to-face, onboard them onto JaxMart, and digitize their stock.

### 5.2 Shift Attendance (GPS Punch-In, Selfie, Punch-Out)
A Captain **CANNOT** use the app to onboard shops or add products until they officially start their shift:
1. **GPS Lock**: The app checks high-accuracy satellite GPS to confirm the agent is physically in their assigned market area.
2. **Reverse Geocoding**: The app automatically reads and writes down the exact street address, city, and pincode where the agent is standing.
3. **Live Selfie**: The agent takes a live photo of themselves on the spot with a timestamp.
4. **Active Shift Dashboard**: A green bar at the top shows: `Active Shift | Duration: 03h 45m | Clocked in at 09:30 AM`.
5. **Punch-Out**: At the end of the day, the agent clicks **"Punch Out"**. The app shows a summary of stores visited, shops onboarded, products added, checks for any unsynced offline drafts, and logs their ending GPS location.

### 5.3 Visiting Stores & Daily Target Tracking
* The Captain has a daily target (e.g. "Onboard 6 new shops and add 20 products today").
* The dashboard shows a circular progress ring updating in real time.
* The Captain logs every store visit and selects the outcome:
  * *Onboarded Successfully*
  * *Follow-Up Required (Owner busy, return tomorrow)*
  * *Not Interested*
  * *Store Closed*

### 5.4 The 7-Step On-Site Shop Onboarding Wizard
When a merchant agrees to join, the Captain opens the 7-step wizard on their phone:
* **Step 1 (Basic Business Profile)**: Legal company name, shop trade name, business type (Proprietorship, Partnership, Private Limited), owner name, mobile number (with OTP check), email, and language.
* **Step 2 (Store Location & Photos)**:
  * Click **"Capture GPS"** to record the exact entrance coordinates.
  * Fine-tune the map pin.
  * Take a mandatory camera photo of the **Shop Front Board**.
  * Take a mandatory camera photo of the **Inside Display / Warehouse**.
* **Step 3 (GST & PAN Details)**:
  * If the merchant has GST, enter the 15-digit number -> The app automatically fetches the registered business name.
  * Snap a photo of the GST certificate.
  * Enter PAN number and snap a photo of the PAN card.
  * Upload optional MSME, FSSAI, or Shop licenses.
* **Step 4 (Bank Account Proof)**:
  * Account holder name, bank name, account type, and account number.
  * Enter IFSC code (auto-fetches branch name and city).
  * Snap a photo of the merchant's cancelled bank cheque or passbook.
* **Step 5 (Business Scope & Working Hours)**:
  * Select primary categories sold (e.g. Hardware, Electronics, Textiles).
  * Select inventory turnover range.
  * Select working days (Mon-Sat) and opening/closing hours.
* **Step 6 (Legal Terms & Finger Signature)**:
  * Merchant reads platform terms on the phone screen.
  * The merchant **signs with their finger directly on the touchscreen**.
  * The Captain checks a box declaring: *"I personally visited this shop and verified these papers."*
* **Step 7 (Review & Submit)**:
  * Full summary card appears.
  * Click **"Submit to Admin"** (or **"Save as Draft"** if offline).
  * The merchant receives their unique Seller ID and QR code.

### 5.5 The 8-Step Barcode Product Cataloging Wizard
After onboarding a shop, the Captain can immediately add the shop's products:
1. **Step 1**: Select the onboarded merchant and enter product title, brand, and category.
2. **Step 2 (Barcode Scanner)**: The Captain points the phone camera at the product box. It instantly scans the **EAN, UPC, or QR barcode** and checks if another seller has already listed this item.
3. **Step 3 (Wholesale Pricing)**: Enter MRP, wholesale selling price, GST rate, Minimum Order Quantity (MOQ), and volume discount slabs.
4. **Step 4 (Variants)**: Add different sizes, colors, or technical ratings.
5. **Step 5 (Stock)**: Enter current stock on shelf and low-stock alert level.
6. **Step 6 (Packaging Specs)**: Enter product weight in kg and box dimensions in cm.
7. **Step 7 (Camera Photos)**: Snap mandatory front photo, back packaging photo, barcode label photo, and product photo.
8. **Step 8 (Submit)**: Submit the product directly to the catalog.

### 5.6 Offline Mode & Automatic Syncing
* Wholesale market basements often have zero mobile network.
* The Captain app saves every photo, signature, and form locally on the phone's internal storage.
* As soon as the Captain walks outside and reconnects to 4G/5G, the app automatically uploads all pending drafts in the background.

---

## 6. The Admin & Super Admin Control Center

This is the central management web portal where company leaders monitor operations:

### 6.1 Role Breakdown: Super Admin vs. City Admin
* **Super Admin (Head of Sales / VP Operations)**:
  * Creates operating States, Cities, and Market Zones.
  * Sets commission percentages and Captain incentive payouts.
  * Views company-wide revenue, total orders, and global conversion metrics.
* **City Admin (Territory Manager / City Lead)**:
  * Provisions Captain accounts (assigns employee codes, mobile logins, and target zones).
  * Assigns weekly beat routes.
  * Monitors live field attendance and audits incoming shop submissions.

### 6.2 Live Map Tracking of Field Agents
* **Real-Time GPS Map**: Shows a live map with moving pins of all sales agents currently clocked into their shifts.
* **Route Breadcrumbs**: Click on any Captain to see the exact walking route they took during the day.
* **Geo-Fencing Alerts**: The system automatically flags if a Captain tried to clock in from home instead of their assigned market.

### 6.3 Shop Onboarding Verification Desk
* All shops submitted by Captains arrive in the Admin review queue.
* The Admin reviews everything side-by-side on a large screen:
  * Shop board photo vs. Inside warehouse photo.
  * Government GST database record vs. submitted legal name.
  * Bank account number vs. uploaded cancelled cheque photo.
  * Exact GPS coordinates where the Captain was standing when submitting.
* The Admin clicks **"Approve & Activate"** (which sends an SMS to the merchant) or **"Reject with Reason"** (which alerts the Captain to fix the mistake).

### 6.4 Product Quality & Price Moderation
* Admins inspect newly cataloged products to ensure photos are sharp, descriptions are accurate, and prices are realistic.
* Inappropriate, duplicate, or scam listings can be suspended with one click.

### 6.5 Managing Disputes & Refunding Money
* If a buyer and seller have an unresolved argument regarding broken or delayed goods:
  * The Admin reviews the evidence, chat logs, and shipping receipts.
  * The Admin can click **"Refund 100% to Buyer"**, **"Release 100% to Seller"**, or **"Split Funds 50/50"**.

### 6.6 Field Sales Leaderboard & Commission Tracking
* Real-time rankings showing top-performing Captains:
  * Most shops onboarded this month.
  * Most products cataloged this month.
  * Highest approval rating (% of submissions approved without errors).
  * Automated commission calculations based on approved onboardings.

---

## 7. The Virtual B2B Exhibition Hall (`/exhibit`)

An online trade show feature where industrial sectors host virtual expos:
* **Exhibition Floor**: Visitors can browse virtual halls organized by industry (e.g. Textile Expo 2026, Industrial Hardware Fair).
* **Virtual Stalls & Booths**: Companies have digital booths displaying their company banner, video introductions, and top 10 products.
* **Digital Business Card Exchange**: Buyers can click **"Exchange Business Card"** or **"Inquire at Stall"** to start an immediate business conversation with the exhibitor.

---

## 8. Master Checklist of Completed Work

Here is the complete, genuine list of features developed:

| System Area | Feature Name | Plain English Description |
|---|---|---|
| **Marketplace** | **User Login & Roles** | Phone number + OTP login with Buyer, Seller, Both, and Admin roles. |
| **Marketplace** | **Typo-Tolerant Search** | Smart search that finds products even if keywords are misspelled. |
| **Marketplace** | **Wholesale Price Slabs** | Automated calculator that applies larger discounts as order quantity grows. |
| **Marketplace** | **RFQ Bidding Engine** | Buyers post custom bulk requirements; sellers submit competing price bids. |
| **Marketplace** | **Safe Payment Escrow** | Holds buyer money safely until goods are delivered and confirmed. |
| **Marketplace** | **In-App Live Chat** | Real-time messaging with photo/document sharing linked to products. |
| **Marketplace** | **Order Status Tracker** | Visual step-by-step progress from order placement to final delivery. |
| **Marketplace** | **Virtual B2B Expo** | Digital trade show booths and digital business card exchange. |
| **Field Sales** | **GPS Shift Attendance** | Clock-in with mandatory satellite GPS lock, address lookup, and selfie photo. |
| **Field Sales** | **7-Step Shop Onboarding** | On-site registration capturing GPS, storefront photos, GST, bank cheque, and finger signature. |
| **Field Sales** | **8-Step Barcode Cataloging** | Camera barcode scanner, volume discount slabs, and packaging dimension capture. |
| **Field Sales** | **Offline Auto-Sync Engine** | Saves all field data locally when offline and uploads automatically when connected. |
| **Admin Panel** | **Live GPS Agent Map** | Real-time map tracking where all sales reps are walking during their shifts. |
| **Admin Panel** | **Shop KYC Review Desk** | Side-by-side document inspection tool for 1-click approvals and rejections. |
| **Admin Panel** | **Dispute Resolution** | Mediation console to hold, refund, or split escrow funds. |
| **Admin Panel** | **Agent Leaderboard** | Target vs. achievement rankings and automated sales commission tracking. |

---

## Conclusion

The **JaxMart Monorepo** represents a massive amount of genuine, completed engineering work. The platform seamlessly combines a modern digital B2B marketplace with an on-ground field sales force automation system.

All features described in this document are fully coded, functional, and testable. The remaining items (live SMS gateway account, official bank escrow account, live government KYC keys, and app store publishing accounts) are standard third-party business assets that will be attached when management is ready for public launch.

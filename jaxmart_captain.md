# Master Prompt: Jaxmart Captains Mobile Application (React Native Expo Go)

> **Role & Goal**: You are an expert Principal Mobile Architect and Senior React Native / Expo Engineer. Your task is to build the complete, production-grade frontend for **Jaxmart Captains**, a standalone field-operations mobile app for Business Analysts and On-ground Sales Representatives ("Captains") to onboard B2B sellers and catalog detailed product SKUs on-site.
>
> **Design System Alignment**: **100% Identical to `web/design.md` ("Industrial Integrity System")**.
> **Backend Integration**: **100% Native Integration with `backend/` Express & Prisma API**.
> **Admin Compatibility**: Captain-submitted sellers and SKUs directly feed into the existing **Admin Panel (`/admin`) Review Queues**.
> **Tooling & Package Manager**: **YARN ALWAYS** (`yarn add`, `yarn start`, etc.).
> **Workflow**: **Expo Go (Managed Workflow)** with strict TypeScript.

---

## 1. Quickstart & Package Setup (Yarn Only)

### 1.1 Project Initialization
```bash
yarn create expo-app jaxmart-captain --template blank-typescript
cd jaxmart-captain
```

### 1.2 Core Dependencies Installation
```bash
# Navigation & UI Core
yarn add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @expo/vector-icons react-native-webview

# Expo Hardware & Device Modules (Expo Go Managed Workflow)
yarn add expo-location expo-camera expo-image-picker expo-secure-store expo-haptics expo-file-system expo-barcode-scanner @react-native-async-storage/async-storage @react-native-community/netinfo

# State, Validation & Networking
yarn add zustand immer react-hook-form zod @hookform/resolvers axios
```

### 1.3 Running the App
```bash
yarn start
# or:
yarn android
yarn ios
```

---

## 2. Design System: Industrial Integrity System (Matching `web/design.md`)

The Captain Mobile App adopts the exact brand identity, color tokens, typography hierarchy, elevation, and shape geometry established in the `web` workspace:

### 2.1 Color Tokens Palette (`src/theme/colors.ts`)
```typescript
export const colors = {
  // Brand Anchors (Navy & Steel Blue)
  primary: '#232F72',              // Deep Navy (Main brand & critical actions)
  primaryDark: '#121358',          // Container / Darkest Navy
  primaryGradientStart: '#232F72',
  primaryGradientEnd: '#2F578A',    // Steel Blue Gradient Partner
  tertiary: '#2F578A',             // Steel Blue (Borders, secondary accents)
  
  // High-Tech Accent & Verification (Teal)
  secondary: '#36ADA3',            // Teal (Active chips, success states, verified badges)
  secondaryContainer: '#E3F5F3',   // Soft Teal Tint
  onSecondaryContainer: '#165A54',
  
  // Surfaces & Backgrounds
  background: '#F6F8FB',           // Clean industrial off-white / light slate
  surface: '#FFFFFF',              // Pure White Card Surface
  surfaceContainerLow: '#F1F4F8',
  surfaceContainer: '#EBF0F6',
  surfaceContainerHigh: '#E1E8F1',
  
  // Outlines & Borders
  outline: '#7B8C9F',              // Medium Outline
  outlineVariant: '#D0D9E4',       // Low-contrast Card/Input Border
  border: '#E2E8F0',
  borderFocus: '#232F72',
  
  // Text Hierarchies
  textPrimary: '#121358',          // On-Surface Navy
  textSecondary: '#4E5D78',        // On-Surface-Variant Slate
  textPlaceholder: '#7B8C9F',
  textInverse: '#FFFFFF',
  
  // Feedback & Alerts
  error: '#ba1a1a',                // Industrial Error Red
  errorContainer: '#ffdad6',
  warning: '#F59E0B',
  success: '#36ADA3',              // Brand Emerald/Teal Success
};
```

### 2.2 Typography Hierarchy
- **Headers & Titles**: `Raleway` (Bold / SemiBold) — authoritative, architectural feel.
- **Body & Form Inputs**: `Source Sans 3` / `Inter` (Regular / Medium) — high legibility in data-dense forms.
- **SKU, Barcode, GSTIN, PAN & Currency**: `JetBrains Mono` / Monospace.

### 2.3 Shapes & Elevation
- **Input Fields & Buttons**: `8px` to `12px` border radius (`rounded-lg` / `rounded-xl`).
- **Cards & Modals**: `12px` radius with `1px` border of `#D0D9E4` / `#E2E8F0` and subtle tonal layering (no muddy drop shadows).
- **Status Chips & Badges**: `8px` radius with tinted backgrounds (e.g., `#E3F5F3` with `#165A54` text for Verified/Active).

---

## 3. Backend API Contract & Admin Compatibility (Matching `backend/`)

The mobile app connects directly to the existing Jaxmart backend API (`http://localhost:4000/api` or configured `EXPO_PUBLIC_API_URL`):

```
Jaxmart Captain Mobile App (React Native Expo)
      │
      ├── [JWT Auth & Tokens] ────────────► /api/auth (send-otp, verify-otp, refresh)
      ├── [Government KYC Verification] ──► /api/kyc (verify-gstin, verify-pan, verify-udyam)
      ├── [Image & Media Uploads] ────────► /api/upload/single, /api/upload/multiple
      ├── [Categories & Attributes] ──────► /api/categories, /api/categories/:id/attributes
      ├── [Seller & SKU Submissions] ─────► /api/listings, /api/users
      │
      ▼
Backend Database & Prisma Engine
      │
      ▼
Jaxmart Admin Panel (/admin)
      ├── [KYC Approval Queue] ───────────► /api/admin/kyc/queue & /api/admin/kyc/:id/approve
      └── [Listing Review Queue] ─────────► /api/admin/listings/queue & /api/admin/listings/:id/approve
```

### 3.1 API Client Implementation (`src/api/client.ts`)
- Axios client configured with base URL and automatic JWT bearer token injection via `expo-secure-store`.
- Response interceptor with silent 401 token refresh queue (`/api/auth/refresh`) identical to `web/src/lib/api.ts`.
- Multipart form-data support for camera photo uploads (`/api/upload/single` and `/api/upload/multiple`).

---

## 4. Complete Application Directory Layout

```text
jaxmart-captain/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── src/
    ├── api/                     # Backend Axios client & API endpoints
    │   ├── client.ts            # Base client with JWT interceptors & token refresh
    │   ├── authApi.ts           # /api/auth endpoints
    │   ├── kycApi.ts            # /api/kyc (GSTIN, PAN, Udyam)
    │   ├── listingApi.ts        # /api/listings (Create, search, update)
    │   ├── uploadApi.ts         # /api/upload (Single/Multiple image uploads)
    │   └── categoryApi.ts       # /api/categories & attributes
    ├── theme/                   # Industrial Integrity Design System tokens
    │   ├── colors.ts
    │   ├── typography.ts
    │   ├── spacing.ts
    │   └── ThemeProvider.tsx
    ├── components/              # Reusable UI components
    │   ├── common/              # AppButton, AppInput, AppDropdown, AppCard, StatusBadge
    │   ├── camera/              # ExpoCameraModal, MultiImageCaptureGrid
    │   ├── scanner/             # BarcodeScannerModal
    │   ├── signature/           # SignatureCanvasModal (WebView canvas)
    │   └── wizard/              # WizardStepHeader, WizardNavigationFooter
    ├── navigation/              # React Navigation Stacks & Tabs
    │   ├── RootNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   ├── MainTabNavigator.tsx
    │   ├── SellerWizardNavigator.tsx
    │   └── SkuWizardNavigator.tsx
    ├── screens/                 # All Screens
    │   ├── auth/                # LoginScreen, OtpVerificationScreen
    │   ├── dashboard/           # DashboardScreen, ShiftHistoryScreen
    │   ├── onboarding/          # Step 1 to Step 7 + SellerDraftsListScreen
    │   ├── cataloging/          # Step 1 to Step 8 + SkuDraftsListScreen
    │   ├── drafts/              # OfflineDraftsScreen, SyncManagerScreen
    │   └── profile/             # ProfileScreen, SettingsScreen
    ├── store/                   # Zustand State Stores
    │   ├── useAuthStore.ts
    │   ├── useShiftStore.ts
    │   ├── useSellerWizardStore.ts
    │   ├── useSkuWizardStore.ts
    │   └── useOfflineSyncStore.ts
    ├── schemas/                 # Zod Validation Schemas
    │   ├── authSchema.ts
    │   ├── sellerOnboardingSchema.ts
    │   └── skuCatalogingSchema.ts
    ├── hooks/                   # Custom Utility Hooks
    │   ├── useLocation.ts
    │   ├── useCameraPermissions.ts
    │   ├── useNetworkStatus.ts
    │   └── useDebounce.ts
    └── utils/                   # Helpers (GSTIN/PAN regex, volumetric math, file URIs)
```

---

## 5. Screen Navigation Hierarchy

```
Root App Navigator
├── Auth Stack
│   ├── Login Screen (Admin Provisioned Phone/Email + Password)
│   └── OTP Verification Screen (Calls /api/auth/verify-otp)
└── Main App Tab Navigator (Guarded by Active Shift Engine)
    ├── Dashboard Tab
    │   ├── Daily Shift Overview & Metrics
    │   ├── Clock-In / Clock-Out Dynamic Widget
    │   ├── Quick Action Cards (New Seller, New SKU, Sync Center)
    │   └── Recent Activities Feed
    ├── Seller Onboarding Stack (7-Step Wizard)
    │   ├── Onboarding Dashboard & Drafts List
    │   ├── Step 1: Basic Business Profile
    │   ├── Step 2: Store Geolocation & Physical Address
    │   ├── Step 3: GSTIN, PAN & Business Identity Verification (Live /api/kyc lookup)
    │   ├── Step 4: Bank Account & Settlement Details
    │   ├── Step 5: Operations & Category Selection
    │   ├── Step 6: Legal Agreement & Digital Signature Canvas
    │   └── Step 7: Final Review & Submission (Syncs to Admin KYC Queue)
    ├── SKU Cataloging Stack (8-Step Wizard)
    │   ├── Seller Selection Screen
    │   ├── SKU Catalog List & Drafts
    │   ├── Step 1: Basic Product Information
    │   ├── Step 2: Barcode & Identification Scanner
    │   ├── Step 3: Pricing, Taxes & B2B Slabs (bulkPriceSlabs)
    │   ├── Step 4: Variants & Custom Attributes (ProductVariant & ProductAttributeValue)
    │   ├── Step 5: Inventory & Warehouse Specs
    │   ├── Step 6: Packaging & Shipping Dimensions (Volumetric calculation)
    │   ├── Step 7: Multi-Angle Media Capture (/api/upload)
    │   └── Step 8: Compliance, Licensing & Review (Syncs to Admin Listing Queue)
    ├── Offline Drafts & Sync Queue Screen
    └── Captain Profile & Shift Attendance Screen
```

---

## 6. Comprehensive Feature Specifications

---

### FEATURE A: Clock-In / Clock-Out & Shift Tracking System

#### Business Logic & Rules
- Captains **MUST Clock-In** before creating any Seller Onboarding entry or SKU catalog record.
- If a Captain is Clocked Out, all "Create Onboarding" and "Add SKU" buttons display a prompt: *"You must Clock-In to start field operations."*

#### Screen UI & Flow:
1. **Clock-In Screen / Floating Widget**:
   - Fetches real-time high-accuracy GPS coordinates (`expo-location`).
   - Displays Date, Time, and Reverse-Geocoded Current Location (Street, City, Pincode).
   - Optional Selfie Verification photo trigger (`expo-camera`).
   - Action Button: `[ Clock In ]` -> Logs timestamp and coordinates.
2. **Active Shift Mode**:
   - Persistent banner at top of all screens in Navy/Teal styling: `🟢 Active Shift | Duration: HH:MM:SS | Location: [City]`.
3. **Clock-Out Action**:
   - Action Button: `[ Clock Out ]`.
   - Requires confirmation modal with shift summary preview:
     - Total Hours Clocked In
     - Sellers Onboarded Today
     - SKUs Cataloged Today
     - Pending Unsynced Drafts
   - Submits ending GPS coordinates + timestamp to backend.

---

### FEATURE B: Seller Onboarding Workflow (7-Step Wizard)

Multi-stage wizard with progress indicator, state preservation, auto-save drafts to `AsyncStorage`, and strict `zod` input validations.

#### Step 1: Basic Business Profile
- **Legal Business Name** (Text input, mandatory - matches GST/PAN).
- **Trade Name / Shop Name** (Text input, mandatory).
- **Entity Type Dropdown**: `[Sole Proprietorship, Partnership, Private Limited, Public Limited, LLP, OPC, Unregistered]`.
- **Primary Owner / Contact Person Name** (Text input, mandatory).
- **Primary Mobile Number** (Numeric, 10 digits + OTP Verification trigger).
- **Secondary / Landline Phone Number** (Numeric, optional).
- **Email Address** (Email format validation, mandatory).
- **Preferred Language for Communication** (Dropdown: English, Hindi, Regional).

#### Step 2: Geolocation & Physical Store Address
- **GPS Auto-Fetch Button**: Captures precise Latitude, Longitude, and Accuracy via `expo-location`.
- **Shop / Building Number & Floor** (Text input, mandatory).
- **Street Name & Area** (Text input, mandatory).
- **Landmark** (Text input, mandatory).
- **City / Town** (Text input, mandatory).
- **District & State** (Dropdown, mandatory).
- **Pincode** (6-digit numeric input, auto-populates City/State).
- **Storefront Photo Capture**: Camera trigger (`expo-camera` / `expo-image-picker`, mandatory).
- **Store Interior Photo Capture**: Camera trigger (Mandatory).

#### Step 3: Business Identity, GSTIN & PAN Verification
- **GST Registered?** Toggle switch (`Yes` / `No`).
  - *If Yes*:
    - **GSTIN Entry** (15-character Alphanumeric regex: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
    - **Verify GSTIN Button**: Calls `POST /api/kyc/verify-gstin` for live verification and auto-populates Trade Name, Legal Name, and Status.
    - **GST Registration Certificate Upload**: Camera / File Picker (Uploaded to `POST /api/upload/single`).
- **PAN Information**:
  - **Business / Proprietor PAN Number** (10-character regex: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).
  - **Verify PAN Button**: Calls `POST /api/kyc/verify-pan`.
  - **Name on PAN Card** (Text input).
  - **PAN Card Photo Upload**: Camera capture (Mandatory).
- **Additional Business Documents**:
  - Udhyam / MSME Registration (Calls `POST /api/kyc/verify-udyam`).
  - FSSAI License Number (Mandatory for food businesses) & Certificate Upload.

#### Step 4: Financial & Settlement Bank Details
- **Account Holder Name** (Must match Legal Name or PAN name).
- **Bank Name** (Auto-populated from IFSC Code or Dropdown).
- **Account Type**: Dropdown `[Current Account, Savings Account]`.
- **Account Number** (Numeric input, masked re-entry for confirmation).
- **IFSC Code** (11-character regex: `^[A-Z]{4}0[A-Z0-9]{6}$` with auto-lookup for Branch Name & City).
- **Cancelled Cheque / Bank Passbook Photo Upload** (Camera capture, mandatory).
- **Penny Drop Verification Action**: Button to trigger automated ₹1 test deposit verification to validate bank account active state.

#### Step 5: Operations & Business Category Selection
- **Primary Business Category** (Fetched from `GET /api/categories`).
- **Sub-Categories Multi-Select** (Chips / Tag selector).
- **Estimated Stock Value / Monthly Turnover** (Dropdown: `< ₹1L`, `₹1L - 5L`, `₹5L - 20L`, `> ₹20L`).
- **Store Operational Days** (Multi-select: Mon - Sun).
- **Store Opening & Closing Time** (TimePickers).
- **Delivery Capabilities**: Checkboxes `[Self Delivery, Pickup Only, Jaxmart Logistics Preferred]`.

#### Step 6: Legal Agreement & Digital Sign-Off
- **Jaxmart Seller Terms & Conditions Viewer**: Scrollable contract view with explicit *"I have read and agree"* checkbox.
- **Seller Digital Signature**: Canvas drawing area (`react-native-signature-canvas` via WebView) for seller signature capture on screen with Clear & Save options.
- **Captain Declaration**: Checkbox confirming *"I, [Captain Name], have physically visited the store and verified all submitted documents."*

#### Step 7: Review, Submission & Admin Queue Sync
- **Comprehensive Summary View**: Card-based overview of all 6 steps with direct "Edit" jump links.
- **Actions**:
  - `[ Save as Offline Draft ]`: Stores form locally in `AsyncStorage`.
  - `[ Submit Seller Onboarding ]`: Submits to backend, automatically creating user record and populating `KycDocument` entries in the **Admin KYC Queue (`/api/admin/kyc/queue`)** for admin approval.
- **Post-Submission Feedback**: Screen displaying generated **Seller ID**, **QR Code**, and **Status Badge**: `[ Pending Admin Approval ]`.

---

### FEATURE C: Granular SKU / Product Cataloging Workflow (8-Step Wizard)

Matches Prisma `Listing`, `ProductDetail`, and `ProductVariant` models in `backend/prisma/schema.prisma`:

#### Step 1: Basic Product Information
- **Select Onboarded Seller** (Searchable dropdown selector).
- **Product Title / Name** (Text input, max 150 chars -> `Listing.title`).
- **Brand Name** (Searchable dropdown -> `ProductDetail.brand`).
- **Product Category & Subcategory** (Cascading selectors from `GET /api/categories`).
- **HSN Code / SAC Code** (Numeric input -> `ProductDetail.hsnCode`).
- **Short Description** (`Listing.shortDesc`) & **Detailed Description** (`Listing.description`).

#### Step 2: Barcode & Identification Scanner
- **Barcode Scanner Modal**: Launches camera scanner (`expo-barcode-scanner` / `CameraView`) to scan EAN-13, UPC-A, Code-128, or QR codes off packaging with audio/haptic feedback.
- **Barcode / EAN Number** (Auto-populated from scanner or manual entry -> `ProductDetail.sku`).
- **Manufacturer SKU Code / Part Number** (Optional -> `ProductDetail.model`).
- **Jaxmart Auto SKU Identifier** (Read-only system auto-generated string).

#### Step 3: Commercial Pricing, Tax & B2B Tier Slabs
- **Maximum Retail Price (MRP)** (Numeric input in ₹).
- **Base Selling Price (B2B Price)** (`ProductDetail.pricePerUnit`, must be ≤ MRP).
- **GST Tax Percentage**: Dropdown `[0%, 5%, 12%, 18%, 28%]` -> `ProductDetail.gstRate`.
- **Minimum Order Quantity (MOQ)** -> `ProductDetail.minOrderQty`.
- **B2B Bulk Tier Pricing Matrix (`ProductDetail.bulkPriceSlabs`)**:
  - Dynamic Add/Remove Row Component storing `[{ minQty: 100, maxQty: 499, price: 45 }, ...]`.

#### Step 4: Variants & Custom Attributes Generator
- **Has Variants?** Toggle switch (`Yes` / `No`).
  - *If Yes*: Multi-select variant types `[Size, Color, Weight, Material]`. Generates combination matrix rows creating `ProductVariant` entries with individual SKU, price override, and stock quantity.
- **Custom Specifications (`ProductDetail.specifications`)**:
  - Dynamic pair adder: `[ Attribute Key (e.g. Voltage) ]` : `[ Attribute Value (e.g. 220V) ]`.

#### Step 5: Inventory & Warehouse Specs
- **Initial Available Stock Quantity** -> `ProductDetail.totalStock`.
- **Store Shelf / Bin Location ID** (Text input, e.g., `Aisle 3, Shelf B`).
- **Expiry Date Requirement**: Toggle (`Yes` / `No`) -> Expiry Date picker + Batch Number.
- **Is Returnable?** Toggle (`Yes` / `No`) + Return Window in Days -> `ProductDetail.returnPolicy`.

#### Step 6: Physical Packaging & Shipping Dimensions
- **Net Weight & Gross Packaging Weight** (in kg/grams).
- **Dimensions**: Length (cm), Width (cm), Height (cm).
- **Volumetric Weight (Auto-calculated)**: `(L x W x H) / 5000` kg.
- **Handling Flags**: `[ ] Fragile`, `[ ] Perishable`, `[ ] Hazardous / Liquid`.

#### Step 7: Multi-Angle Media Capture & Processing
- **Image Requirements**: Minimum 2 images, Maximum 8 images uploaded via `POST /api/upload/multiple` to populate `ListingMedia`.
- **Dedicated Capture Slots**:
  1. Front View (Primary / `isPrimary = true`)
  2. Back View / Barcode Tag
  3. Ingredient / Specification Label
  4. Unboxed / Open Product View
  5. Outer Packaging Box View

#### Step 8: Compliance, Licensing & Admin Queue Submission
- **Country of Origin** (`ProductDetail.countryOfOrigin`, default: India).
- **Certifications** (`ProductDetail.certifications`, e.g., FSSAI, BIS, ISI).
- **Warranty Info** (`ProductDetail.warranty`).
- **Submit Action**: Calls `POST /api/listings` with `status = 'DRAFT'`. Automatically registers in the **Admin Listing Review Queue (`/api/admin/listings/queue`)** for admin approval and publishing.

---

### FEATURE D: Offline Mode & Background Data Synchronization Engine

1. **Offline Draft Storage**:
   - Stores uncompleted forms and pending submissions locally into `AsyncStorage`.
   - Stores photos in the local app cache sandbox (`expo-file-system`) with file URIs.
2. **Sync Status Manager**:
   - Status indicators on Dashboard:
     - 🟢 `Synced` (All data sent to server)
     - 🟡 `Pending Sync (X items queued)`
     - 🔴 `Sync Error (Conflict / Validation issue)`
3. **Background Auto-Sync**:
   - Listens to network state transitions (`@react-native-community/netinfo`).
   - Automatically syncs pending payload and media uploads in sequential FIFO order when connection is restored.

---

## 7. Implementation Roadmap & Execution Phases (Yarn Only)

Execute the implementation in strict phases using **Yarn**:

1. **Phase 1: Project Setup & Design System**
   - Run `yarn create expo-app jaxmart-captain --template blank-typescript`
   - Run `yarn add ...` for all dependencies.
   - Configure the Industrial Integrity Design System (`colors.ts`, `typography.ts`, `spacing.ts`) matching `web/design.md`.

2. **Phase 2: Navigation & API Client**
   - Implement `api/client.ts` with JWT bearer authentication and auto-token refresh matching `web/src/lib/api.ts`.
   - Setup React Navigation stacks (`AuthNavigator`, `MainTabNavigator`, `SellerWizardNavigator`, `SkuWizardNavigator`).

3. **Phase 3: Auth & Shift Tracking Engine**
   - Implement Login with OTP (`POST /api/auth/send-otp`, `POST /api/auth/verify-otp`).
   - Implement Clock-In with high-accuracy GPS lock (`expo-location`) and active shift HUD timer banner.

4. **Phase 4: Reusable Hardware Components**
   - Build `ExpoCameraModal` using `expo-camera` for photo capture.
   - Build `BarcodeScannerModal` using `expo-camera` / `CameraView` with target crosshairs.
   - Build `SignatureCanvasModal` using WebView canvas for seller signatures.

5. **Phase 5: 7-Step Seller Onboarding Wizard**
   - Implement Step 1 through Step 7 with `react-hook-form` + `zod` validation.
   - Connect Step 3 to live `/api/kyc/verify-gstin` and `/api/kyc/verify-pan`.
   - Submit final payload to populate the Admin KYC Queue (`/api/admin/kyc/queue`).

6. **Phase 6: 8-Step SKU Cataloging Wizard**
   - Implement Step 1 through Step 8 with cascading category pickers (`/api/categories`), barcode scanner auto-fill, B2B slab pricing, and variant matrix generator.
   - Submit final payload to `POST /api/listings` to populate the Admin Listing Queue (`/api/admin/listings/queue`).

7. **Phase 7: Offline Persistence & Sync Queue**
   - Implement `useOfflineSyncStore` with NetInfo connectivity listener, draft management screen, and sequential upload retry engine.

8. **Phase 8: Polish, Verification & Testing**
   - Verify all Expo Go APIs run smoothly.
   - Ensure clean typography (`Raleway` & `Source Sans 3`), responsive layout under direct sunlight, and complete type safety.

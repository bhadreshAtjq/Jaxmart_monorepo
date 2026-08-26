--
-- PostgreSQL database dump
--

\restrict jfJWDDOGczfbEQgtv0ljkaFb265OcdrUVLtinqMfFRej4mTjAZ6XGUpe73pR3kj

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountType" AS ENUM (
    'INDIVIDUAL',
    'BUSINESS'
);


ALTER TYPE public."AccountType" OWNER TO postgres;

--
-- Name: AddressType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AddressType" AS ENUM (
    'PRIMARY',
    'BRANCH',
    'BILLING',
    'SHIPPING',
    'WAREHOUSE'
);


ALTER TYPE public."AddressType" OWNER TO postgres;

--
-- Name: AttributeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttributeType" AS ENUM (
    'TEXT',
    'NUMBER',
    'BOOLEAN',
    'SELECT',
    'MULTI_SELECT'
);


ALTER TYPE public."AttributeType" OWNER TO postgres;

--
-- Name: BillingCycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BillingCycle" AS ENUM (
    'MONTHLY',
    'YEARLY'
);


ALTER TYPE public."BillingCycle" OWNER TO postgres;

--
-- Name: ConversationContext; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ConversationContext" AS ENUM (
    'RFQ',
    'QUOTE',
    'ORDER',
    'LISTING',
    'GENERAL'
);


ALTER TYPE public."ConversationContext" OWNER TO postgres;

--
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."DepositStatus" OWNER TO postgres;

--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED_BUYER',
    'RESOLVED_SELLER',
    'RESOLVED_PARTIAL',
    'WITHDRAWN'
);


ALTER TYPE public."DisputeStatus" OWNER TO postgres;

--
-- Name: EmployeeRange; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EmployeeRange" AS ENUM (
    'ONE_TO_TEN',
    'ELEVEN_TO_FIFTY',
    'FIFTY_ONE_TO_TWO_HUNDRED',
    'TWO_HUNDRED_PLUS'
);


ALTER TYPE public."EmployeeRange" OWNER TO postgres;

--
-- Name: EscrowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EscrowStatus" AS ENUM (
    'HELD',
    'PARTIAL_RELEASED',
    'FULLY_RELEASED',
    'REFUNDED',
    'FROZEN'
);


ALTER TYPE public."EscrowStatus" OWNER TO postgres;

--
-- Name: InventoryTxType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InventoryTxType" AS ENUM (
    'STOCK_IN',
    'STOCK_OUT',
    'ADJUSTMENT',
    'RESERVED',
    'RELEASED'
);


ALTER TYPE public."InventoryTxType" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: KycStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KycStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'UNDER_REVIEW'
);


ALTER TYPE public."KycStatus" OWNER TO postgres;

--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'REJECTED',
    'ARCHIVED'
);


ALTER TYPE public."ListingStatus" OWNER TO postgres;

--
-- Name: ListingType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ListingType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."ListingType" OWNER TO postgres;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT',
    'BROCHURE'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'SUBMITTED',
    'APPROVED',
    'DISPUTED',
    'RELEASED',
    'CANCELLED'
);


ALTER TYPE public."MilestoneStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'RFQ_MATCH',
    'RFQ_INVITED',
    'RFQ_EXPIRED',
    'QUOTE_RECEIVED',
    'QUOTE_SHORTLISTED',
    'QUOTE_AWARDED',
    'QUOTE_EXPIRED',
    'ORDER_CREATED',
    'ORDER_ACCEPTED',
    'ORDER_SHIPPED',
    'ORDER_DELIVERED',
    'ORDER_COMPLETED',
    'MILESTONE_SUBMITTED',
    'MILESTONE_APPROVED',
    'MILESTONE_DISPUTED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'DISPUTE_OPENED',
    'DISPUTE_RESOLVED',
    'KYC_APPROVED',
    'KYC_REJECTED',
    'NEW_MESSAGE',
    'REVIEW_RECEIVED',
    'SYSTEM'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'CREATED',
    'ACCEPTED',
    'ACTIVE',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'DISPUTED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: OrderType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."OrderType" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PARTIALLY_PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PriceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PriceType" AS ENUM (
    'FIXED',
    'NEGOTIABLE',
    'ON_REQUEST',
    'RANGE'
);


ALTER TYPE public."PriceType" OWNER TO postgres;

--
-- Name: QuoteStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuoteStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'SHORTLISTED',
    'WON',
    'LOST',
    'WITHDRAWN',
    'EXPIRED'
);


ALTER TYPE public."QuoteStatus" OWNER TO postgres;

--
-- Name: ReviewType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewType" AS ENUM (
    'BUYER_TO_SELLER',
    'SELLER_TO_BUYER'
);


ALTER TYPE public."ReviewType" OWNER TO postgres;

--
-- Name: RfqStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RfqStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'AWARDED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."RfqStatus" OWNER TO postgres;

--
-- Name: RfqType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RfqType" AS ENUM (
    'PRODUCT',
    'SERVICE',
    'BOTH'
);


ALTER TYPE public."RfqType" OWNER TO postgres;

--
-- Name: RfqVisibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RfqVisibility" AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'TARGETED'
);


ALTER TYPE public."RfqVisibility" OWNER TO postgres;

--
-- Name: ServiceMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceMode" AS ENUM (
    'ONSITE',
    'REMOTE',
    'HYBRID'
);


ALTER TYPE public."ServiceMode" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'TRIALING',
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED',
    'PAUSED',
    'EXPIRED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: SubscriptionTier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionTier" AS ENUM (
    'BASIC',
    'VERIFIED',
    'GOLD',
    'ASSESSED'
);


ALTER TYPE public."SubscriptionTier" OWNER TO postgres;

--
-- Name: UserType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserType" AS ENUM (
    'BUYER',
    'SELLER',
    'BOTH'
);


ALTER TYPE public."UserType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "addressType" public."AddressType" DEFAULT 'PRIMARY'::public."AddressType" NOT NULL,
    label text,
    "contactName" text,
    "contactPhone" text,
    line1 text NOT NULL,
    line2 text,
    landmark text,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    country text DEFAULT 'India'::text NOT NULL,
    lat double precision,
    lng double precision,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_events (
    id text NOT NULL,
    "userId" text,
    "eventName" text NOT NULL,
    "entityType" text,
    "entityId" text,
    metadata jsonb,
    "sessionId" text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.analytics_events OWNER TO postgres;

--
-- Name: business_certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_certifications (
    id text NOT NULL,
    "businessProfileId" text NOT NULL,
    "certName" text NOT NULL,
    "certNumber" text,
    "issuingBody" text,
    "validFrom" timestamp(3) without time zone,
    "validUntil" timestamp(3) without time zone,
    "documentUrl" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.business_certifications OWNER TO postgres;

--
-- Name: business_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessName" text NOT NULL,
    gstin text,
    pan text,
    "mcaCin" text,
    "msmeNumber" text,
    "udyamNumber" text,
    "iecCode" text,
    "establishedYear" integer,
    "employeeRange" public."EmployeeRange",
    "annualTurnover" text,
    website text,
    "linkedinUrl" text,
    description text,
    "businessType" text,
    "exportCapable" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.business_profiles OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    "parentId" text,
    name text NOT NULL,
    slug text NOT NULL,
    "applicableType" public."ListingType",
    "depthLevel" integer DEFAULT 1 NOT NULL,
    "iconUrl" text,
    "bannerUrl" text,
    "metaTitle" text,
    "metaDescription" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: category_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category_attributes (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    unit text,
    "attributeType" public."AttributeType" DEFAULT 'TEXT'::public."AttributeType" NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isFilterable" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    options jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.category_attributes OWNER TO postgres;

--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation_participants (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "userId" text NOT NULL,
    "lastReadAt" timestamp(3) without time zone,
    "isMuted" boolean DEFAULT false NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversation_participants OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    context public."ConversationContext" DEFAULT 'GENERAL'::public."ConversationContext" NOT NULL,
    "rfqId" text,
    "orderId" text,
    "listingId" text,
    subject text,
    "isArchived" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: deposit_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deposit_receipts (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subscriptionId" text,
    amount double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "transactionReference" text NOT NULL,
    "transferDate" timestamp(3) without time zone NOT NULL,
    "receiptUrl" text NOT NULL,
    notes text,
    status public."DepositStatus" DEFAULT 'PENDING'::public."DepositStatus" NOT NULL,
    "rejectionReason" text,
    "verifiedByUserId" text,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.deposit_receipts OWNER TO postgres;

--
-- Name: dispute_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispute_events (
    id text NOT NULL,
    "disputeId" text NOT NULL,
    "actorId" text,
    "actorRole" text,
    "eventType" text NOT NULL,
    note text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dispute_events OWNER TO postgres;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disputes (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "milestoneId" text,
    "raisedById" text NOT NULL,
    "raisedAgainstId" text,
    reason text NOT NULL,
    description text NOT NULL,
    "buyerEvidence" jsonb[],
    "sellerEvidence" jsonb[],
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    "assignedToAdmin" text,
    "mediatorNote" text,
    "resolutionNote" text,
    "buyerRefund" double precision,
    "sellerPayout" double precision,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.disputes OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    location text,
    "mediaUrl" text,
    "ctaUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_logs (
    id text NOT NULL,
    "variantId" text NOT NULL,
    "txType" public."InventoryTxType" NOT NULL,
    "qtyChange" integer NOT NULL,
    "qtyBefore" integer NOT NULL,
    "qtyAfter" integer NOT NULL,
    reference text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_logs OWNER TO postgres;

--
-- Name: kyc_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kyc_documents (
    id text NOT NULL,
    "userId" text NOT NULL,
    "documentType" text NOT NULL,
    "documentNumber" text,
    "documentUrl" text NOT NULL,
    "backSideUrl" text,
    status public."KycStatus" DEFAULT 'PENDING'::public."KycStatus" NOT NULL,
    "verificationMethod" text DEFAULT 'API_SETU'::text,
    "txnId" text,
    metadata jsonb,
    "reviewNote" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kyc_documents OWNER TO postgres;

--
-- Name: listing_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing_media (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "variantId" text,
    url text NOT NULL,
    "thumbUrl" text,
    "mediaType" public."MediaType" DEFAULT 'IMAGE'::public."MediaType" NOT NULL,
    "altText" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.listing_media OWNER TO postgres;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "categoryId" text NOT NULL,
    "locationId" text,
    "listingType" public."ListingType" NOT NULL,
    title text NOT NULL,
    slug text DEFAULT gen_random_uuid() NOT NULL,
    description text NOT NULL,
    "shortDesc" text,
    status public."ListingStatus" DEFAULT 'DRAFT'::public."ListingStatus" NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "metaTitle" text,
    "metaKeywords" text[],
    "avgRating" double precision DEFAULT 0 NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "enquiryCount" integer DEFAULT 0 NOT NULL,
    "quoteCount" integer DEFAULT 0 NOT NULL,
    "saveCount" integer DEFAULT 0 NOT NULL,
    "searchVector" text,
    tags text[],
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    content text NOT NULL,
    "contentType" text DEFAULT 'TEXT'::text NOT NULL,
    attachments jsonb[],
    "replyToId" text,
    "isEdited" boolean DEFAULT false NOT NULL,
    "editedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.milestones (
    id text NOT NULL,
    "orderId" text NOT NULL,
    title text NOT NULL,
    description text,
    amount double precision NOT NULL,
    "percentOfTotal" double precision,
    "dueDate" timestamp(3) without time zone,
    status public."MilestoneStatus" DEFAULT 'PENDING'::public."MilestoneStatus" NOT NULL,
    "submissionNote" text,
    "submissionFiles" jsonb[],
    "submittedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "rejectionNote" text,
    "releasedAt" timestamp(3) without time zone,
    "payoutTxId" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.milestones OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    channels text[] DEFAULT ARRAY['IN_APP'::text],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "variantId" text,
    title text NOT NULL,
    sku text,
    quantity double precision NOT NULL,
    "unitPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    "gstRate" double precision,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    specifications jsonb
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text DEFAULT gen_random_uuid() NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "rfqQuoteId" text,
    "orderType" public."OrderType" NOT NULL,
    status public."OrderStatus" DEFAULT 'CREATED'::public."OrderStatus" NOT NULL,
    subtotal double precision DEFAULT 0 NOT NULL,
    "discountAmount" double precision DEFAULT 0 NOT NULL,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    "shippingAmount" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "platformFeeRate" double precision DEFAULT 0.02 NOT NULL,
    "platformFee" double precision DEFAULT 0 NOT NULL,
    "sellerPayout" double precision DEFAULT 0 NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "escrowStatus" public."EscrowStatus" DEFAULT 'HELD'::public."EscrowStatus" NOT NULL,
    "totalReleasedAmount" double precision DEFAULT 0 NOT NULL,
    "totalRefundedAmount" double precision DEFAULT 0 NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "razorpayOrderId" text,
    "razorpayPaymentId" text,
    "paidAt" timestamp(3) without time zone,
    "contractUrl" text,
    "contractSignedAt" timestamp(3) without time zone,
    "contractSignedByBuyer" boolean DEFAULT false NOT NULL,
    "contractSignedBySeller" boolean DEFAULT false NOT NULL,
    "shippingAddressId" text,
    "trackingNumber" text,
    "trackingUrl" text,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "expectedDeliveryAt" timestamp(3) without time zone,
    "cancelReason" text,
    "cancelledBy" text,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "milestoneId" text,
    amount double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "razorpayPaymentId" text,
    "razorpayOrderId" text,
    method text,
    "gatewayResponse" jsonb,
    "paidAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "failureReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: platform_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_config (
    id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.platform_config OWNER TO postgres;

--
-- Name: product_attribute_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attribute_values (
    id text NOT NULL,
    "variantId" text NOT NULL,
    "attributeId" text NOT NULL,
    value text NOT NULL,
    unit text
);


ALTER TABLE public.product_attribute_values OWNER TO postgres;

--
-- Name: product_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_details (
    id text NOT NULL,
    "listingId" text NOT NULL,
    brand text,
    model text,
    sku text,
    "unitOfMeasure" text NOT NULL,
    "minOrderQty" double precision DEFAULT 1 NOT NULL,
    "maxOrderQty" double precision,
    "priceType" public."PriceType" DEFAULT 'FIXED'::public."PriceType" NOT NULL,
    "pricePerUnit" double precision,
    "priceRangeMin" double precision,
    "priceRangeMax" double precision,
    currency text DEFAULT 'INR'::text NOT NULL,
    "bulkPriceSlabs" jsonb,
    "stockAvailable" boolean DEFAULT true NOT NULL,
    "totalStock" integer,
    "leadTimeDays" integer,
    "hsnCode" text,
    "gstRate" double precision,
    specifications jsonb,
    "countryOfOrigin" text,
    "supplyAbility" text,
    "deliveryTime" text,
    "packagingDetails" text,
    "packagingUnit" text,
    "paymentTerms" text,
    "fobPort" text,
    "sampleAvailable" boolean DEFAULT false NOT NULL,
    "samplePrice" double precision,
    warranty text,
    "returnPolicy" text,
    certifications text[]
);


ALTER TABLE public.product_details OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "productDetailId" text NOT NULL,
    "sellerId" text NOT NULL,
    sku text,
    title text NOT NULL,
    "priceOverride" double precision,
    "stockQty" integer DEFAULT 0 NOT NULL,
    "reservedQty" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "deviceInfo" text,
    "ipAddress" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "reviewerId" text NOT NULL,
    "revieweeId" text NOT NULL,
    "reviewType" public."ReviewType" NOT NULL,
    rating integer NOT NULL,
    comment text,
    "qualityRating" integer,
    "communicationRating" integer,
    "deliveryRating" integer,
    "valueRating" integer,
    "replyText" text,
    "repliedAt" timestamp(3) without time zone,
    "isVerified" boolean DEFAULT true NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: rfq_invites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfq_invites (
    id text NOT NULL,
    "rfqId" text NOT NULL,
    "sellerId" text NOT NULL,
    "invitedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "viewedAt" timestamp(3) without time zone,
    declined boolean DEFAULT false NOT NULL,
    "declineReason" text
);


ALTER TABLE public.rfq_invites OWNER TO postgres;

--
-- Name: rfq_quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfq_quotes (
    id text NOT NULL,
    "rfqId" text NOT NULL,
    "sellerId" text NOT NULL,
    "listingId" text,
    "variantId" text,
    "quotedAmount" double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "gstInclusive" boolean DEFAULT false NOT NULL,
    "gstRate" double precision,
    "totalWithGst" double precision,
    "proposalText" text NOT NULL,
    "coverNote" text,
    "milestonePlan" jsonb[],
    "timelineDays" integer NOT NULL,
    "validUntil" timestamp(3) without time zone,
    "paymentTerms" text,
    "warrantyTerms" text,
    "deliveryTerms" text,
    attachments jsonb[],
    status public."QuoteStatus" DEFAULT 'SUBMITTED'::public."QuoteStatus" NOT NULL,
    "rejectionNote" text,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rfq_quotes OWNER TO postgres;

--
-- Name: rfq_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfq_requests (
    id text NOT NULL,
    "buyerId" text NOT NULL,
    "categoryId" text NOT NULL,
    "locationId" text,
    "rfqType" public."RfqType" NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    quantity double precision,
    "unitOfMeasure" text,
    specifications jsonb,
    "budgetMin" double precision,
    "budgetMax" double precision,
    currency text DEFAULT 'INR'::text NOT NULL,
    "budgetFlexible" boolean DEFAULT false NOT NULL,
    deadline timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "preferredDeliveryDate" timestamp(3) without time zone,
    "locationPreference" text,
    "deliveryAddressId" text,
    "preferredProviderType" public."AccountType",
    "preferredServiceMode" public."ServiceMode",
    visibility public."RfqVisibility" DEFAULT 'PUBLIC'::public."RfqVisibility" NOT NULL,
    "maxQuotes" integer,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    status public."RfqStatus" DEFAULT 'OPEN'::public."RfqStatus" NOT NULL,
    "quotesCount" integer DEFAULT 0 NOT NULL,
    "shortlistedCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    attachments jsonb[],
    tags text[],
    source text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rfq_requests OWNER TO postgres;

--
-- Name: saved_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_listings (
    id text NOT NULL,
    "userId" text NOT NULL,
    "listingId" text NOT NULL,
    "savedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.saved_listings OWNER TO postgres;

--
-- Name: saved_rfqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_rfqs (
    id text NOT NULL,
    "userId" text NOT NULL,
    "rfqId" text NOT NULL,
    "savedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.saved_rfqs OWNER TO postgres;

--
-- Name: service_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_details (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "serviceMode" public."ServiceMode" DEFAULT 'REMOTE'::public."ServiceMode" NOT NULL,
    "providerType" public."AccountType" DEFAULT 'INDIVIDUAL'::public."AccountType" NOT NULL,
    "priceType" public."PriceType" DEFAULT 'ON_REQUEST'::public."PriceType" NOT NULL,
    "basePrice" double precision,
    "priceUnit" text,
    currency text DEFAULT 'INR'::text NOT NULL,
    "serviceArea" text[],
    "capacitySlots" integer DEFAULT 1 NOT NULL,
    "typicalDuration" text,
    "minEngagementDays" integer,
    "maxEngagementDays" integer,
    "portfolioItems" jsonb[],
    certifications jsonb[],
    "skillsTags" text[],
    "toolsTags" text[],
    languages text[],
    "avgResponseHrs" double precision,
    "teamSize" integer
);


ALTER TABLE public.service_details OWNER TO postgres;

--
-- Name: service_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_packages (
    id text NOT NULL,
    "serviceDetailId" text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "deliveryDays" integer NOT NULL,
    "revisionsCount" integer DEFAULT 1 NOT NULL,
    "includesItems" jsonb[],
    "isPopular" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.service_packages OWNER TO postgres;

--
-- Name: subscription_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "subscriptionId" text,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "billingPeriodStart" timestamp(3) without time zone NOT NULL,
    "billingPeriodEnd" timestamp(3) without time zone NOT NULL,
    "paymentMethod" text,
    "razorpayPaymentId" text,
    "stripePaymentIntentId" text,
    "pdfUrl" text,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscription_invoices OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "monthlyPrice" double precision NOT NULL,
    "yearlyPrice" double precision NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "maxProducts" integer DEFAULT 10 NOT NULL,
    "maxImagesPerProduct" integer DEFAULT 5 NOT NULL,
    "maxVideosPerProduct" integer DEFAULT 0 NOT NULL,
    "allowBulkUpload" boolean DEFAULT false NOT NULL,
    "allowApiAccess" boolean DEFAULT false NOT NULL,
    "verificationBadge" text DEFAULT 'NONE'::text NOT NULL,
    "featuredProductSlots" integer DEFAULT 0 NOT NULL,
    "hasAdvancedAnalytics" boolean DEFAULT false NOT NULL,
    "hasCompetitorBenchmarking" boolean DEFAULT false NOT NULL,
    "supportLevel" text DEFAULT 'EMAIL_ONLY'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "razorpayPlanIdMonthly" text,
    "razorpayPlanIdYearly" text,
    "stripePriceIdMonthly" text,
    "stripePriceIdYearly" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "planId" text NOT NULL,
    "billingCycle" public."BillingCycle" DEFAULT 'MONTHLY'::public."BillingCycle" NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "currentPeriodStart" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone NOT NULL,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "canceledAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    "razorpayCustomerId" text,
    "razorpaySubscriptionId" text,
    "stripeCustomerId" text,
    "stripeSubscriptionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text,
    phone text NOT NULL,
    "fullName" text NOT NULL,
    "userType" public."UserType" DEFAULT 'BUYER'::public."UserType" NOT NULL,
    "accountType" public."AccountType" DEFAULT 'INDIVIDUAL'::public."AccountType" NOT NULL,
    "kycStatus" public."KycStatus" DEFAULT 'PENDING'::public."KycStatus" NOT NULL,
    "trustScore" integer DEFAULT 0 NOT NULL,
    "sellerRating" double precision DEFAULT 0 NOT NULL,
    "buyerRating" double precision DEFAULT 0 NOT NULL,
    "totalOrdersPlaced" integer DEFAULT 0 NOT NULL,
    "totalOrdersFulfilled" integer DEFAULT 0 NOT NULL,
    "responseRatePercent" double precision DEFAULT 0 NOT NULL,
    "avgResponseHours" double precision DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "avatarUrl" text,
    "coverUrl" text,
    "fcmToken" text,
    "hasSeenTour" boolean DEFAULT false NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    "lastActiveAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "userId", "addressType", label, "contactName", "contactPhone", line1, line2, landmark, city, state, pincode, country, lat, lng, "isPrimary", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_events (id, "userId", "eventName", "entityType", "entityId", metadata, "sessionId", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: business_certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_certifications (id, "businessProfileId", "certName", "certNumber", "issuingBody", "validFrom", "validUntil", "documentUrl", "isVerified", "createdAt") FROM stdin;
\.


--
-- Data for Name: business_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_profiles (id, "userId", "businessName", gstin, pan, "mcaCin", "msmeNumber", "udyamNumber", "iecCode", "establishedYear", "employeeRange", "annualTurnover", website, "linkedinUrl", description, "businessType", "exportCapable", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
6c67827c-c113-497c-b0b6-07ae6f9b5a8d	ca63732b-3523-4106-9bda-6126ffea38a0	Global Exports Corp	29ABCDE1234F1Z5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Leading exporter of industrial grade machinery and components since 2010.	\N	f	\N	2026-08-07 09:58:33.983	2026-08-07 09:58:33.983
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, "parentId", name, slug, "applicableType", "depthLevel", "iconUrl", "bannerUrl", "metaTitle", "metaDescription", "sortOrder", "isActive", "createdAt") FROM stdin;
0bfec81a-7ab8-4b5a-a700-096d94c904d3	\N	Industrial Supplies	industrial-supplies	\N	1	Settings	\N	\N	\N	0	t	2026-08-07 09:58:33.932
63551676-27e8-4777-9f8c-0846e40e4a54	\N	Electronics	electronics	\N	1	Smartphone	\N	\N	\N	0	t	2026-08-07 09:58:33.957
c0acbd11-0e6c-4944-8132-dd919aa85f9a	\N	Construction	construction	\N	1	HardHat	\N	\N	\N	0	t	2026-08-07 09:58:33.965
b2290b51-bf31-473e-85ad-1e9c03372aba	\N	Textiles	textiles	\N	1	Shirt	\N	\N	\N	0	t	2026-08-07 09:58:33.97
99bae4b6-8da4-4b56-96d1-65590001d4db	\N	Services	services	\N	1	Briefcase	\N	\N	\N	0	t	2026-08-07 09:58:33.976
\.


--
-- Data for Name: category_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category_attributes (id, "categoryId", name, slug, unit, "attributeType", "isRequired", "isFilterable", "sortOrder", options, "createdAt") FROM stdin;
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation_participants (id, "conversationId", "userId", "lastReadAt", "isMuted", "joinedAt") FROM stdin;
cd95b1c9-d756-4eec-97ad-92c65cb43df0	21729623-fb24-485e-a570-f189fa59e0a3	358cc2b0-da65-4f33-8853-83c49343d797	\N	f	2026-08-14 05:36:45.18
1f21c400-053d-4326-9926-c5623ba9cca5	21729623-fb24-485e-a570-f189fa59e0a3	ca63732b-3523-4106-9bda-6126ffea38a0	\N	f	2026-08-14 05:36:45.18
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, context, "rfqId", "orderId", "listingId", subject, "isArchived", "createdAt", "updatedAt") FROM stdin;
21729623-fb24-485e-a570-f189fa59e0a3	GENERAL	\N	\N	\N	\N	f	2026-08-14 05:36:45.169	2026-08-14 05:36:45.169
\.


--
-- Data for Name: deposit_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deposit_receipts (id, "userId", "subscriptionId", amount, currency, "transactionReference", "transferDate", "receiptUrl", notes, status, "rejectionReason", "verifiedByUserId", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dispute_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispute_events (id, "disputeId", "actorId", "actorRole", "eventType", note, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disputes (id, "orderId", "milestoneId", "raisedById", "raisedAgainstId", reason, description, "buyerEvidence", "sellerEvidence", status, "assignedToAdmin", "mediatorNote", "resolutionNote", "buyerRefund", "sellerPayout", "resolvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, description, date, location, "mediaUrl", "ctaUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
dc6cf172-e5a3-4267-9e85-50a0d0e98a4d	Global Manufacturing Expo 2026	Connect with over 500+ verified industrial suppliers and factories showcasing the latest CNC machinery, automation equipment, and heavy industrial supplies.	2026-08-15 09:00:00	Pragati Maidan, New Delhi	https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800	\N	t	2026-08-07 09:58:34.078	2026-08-07 09:58:34.078
8a8173bd-7a5e-497a-a536-a8ad79962879	SustainB2B Green Technology Summit	Discover modern solar tech, energy-efficient manufacturing processes, and green logistics solutions for sustainable industrial growth.	2026-09-22 10:00:00	Virtual Event (Online)	https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&q=80&w=800	\N	t	2026-08-07 09:58:34.085	2026-08-07 09:58:34.085
2809ef9a-1169-4e45-99f3-c495ecc038d7	National Textile & Sourcing Fair	Meet premium manufacturers of organic yarn, finished fabrics, raw cotton, and apparel machinery under one roof with secure escrow matching.	2026-10-05 09:30:00	BIEC, Bengaluru	https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800	\N	t	2026-08-07 09:58:34.087	2026-08-07 09:58:34.087
\.


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_logs (id, "variantId", "txType", "qtyChange", "qtyBefore", "qtyAfter", reference, note, "createdAt") FROM stdin;
\.


--
-- Data for Name: kyc_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kyc_documents (id, "userId", "documentType", "documentNumber", "documentUrl", "backSideUrl", status, "verificationMethod", "txnId", metadata, "reviewNote", "reviewedBy", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: listing_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listing_media (id, "listingId", "variantId", url, "thumbUrl", "mediaType", "altText", "isPrimary", "sortOrder", "createdAt") FROM stdin;
4c8a73a3-2d8d-4da3-89b8-c130102849c5	bb7631ee-d143-481a-b20a-42d5c548c5df	\N	https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 10:00:17.212
23c10577-adaf-4d27-8503-eabb11810c09	81038a31-5048-4881-976c-4b7814f7f4f3	\N	https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 10:00:17.235
63957c66-4969-46ac-8b37-2f2f36c96245	e8ae5c95-b8b2-427c-ab42-5059c0a3f7a6	\N	https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 09:58:34.05
87372674-f4b2-49c8-a74e-4456f99ffd04	3387a06b-ad50-436b-8b65-7ffea87a983a	\N	https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 09:58:34.003
9981fee7-c05d-478d-9ff5-8c5b572ae20b	1dc8ec2a-7484-4a6b-b58f-b8588d2ccaba	\N	https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 10:00:17.275
020aa82b-49ae-4a87-8f48-f4aae1c1a60c	1d99207c-7bb4-4730-92cb-39e95611fd6c	\N	https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 10:00:17.261
42af631e-b111-49dc-a662-924beb165e64	5407c2ab-e456-49eb-b588-a89e741568bb	\N	https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 10:00:17.248
49f61985-8dd9-4486-99f3-54d60ede55aa	618eb293-7e3d-4f82-a5d2-a72641e95868	\N	https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 09:58:34.067
3eb2d837-afef-408d-9d39-429324c9ed81	3b488b8e-df10-4954-af69-7c9587dd10f7	\N	https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800	\N	IMAGE	\N	t	0	2026-08-07 09:58:34.058
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, "sellerId", "categoryId", "locationId", "listingType", title, slug, description, "shortDesc", status, "isFeatured", "isVerified", "metaTitle", "metaKeywords", "avgRating", "reviewCount", "viewCount", "enquiryCount", "quoteCount", "saveCount", "searchVector", tags, "publishedAt", "createdAt", "updatedAt") FROM stdin;
bb7631ee-d143-481a-b20a-42d5c548c5df	ca63732b-3523-4106-9bda-6126ffea38a0	c0acbd11-0e6c-4944-8132-dd919aa85f9a	\N	PRODUCT	Industrial Grade Steel Plate	f81c1a16-9fe7-48de-ba68-d12ed33d8899	Industrial Grade Steel Plate manufactured by Tata Steel. Premium quality industrial grade product.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 10:00:17.212	2026-08-07 10:00:17.212
81038a31-5048-4881-976c-4b7814f7f4f3	ca63732b-3523-4106-9bda-6126ffea38a0	63551676-27e8-4777-9f8c-0846e40e4a54	\N	PRODUCT	240W fast charging braided USB-C data cable	86b52eef-67cc-4f31-a0b3-a18f291b8e0d	Copper Wiring Kit (100m) manufactured by Havells. Premium quality industrial grade product.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 10:00:17.235	2026-08-10 05:25:55.765
e8ae5c95-b8b2-427c-ab42-5059c0a3f7a6	ca63732b-3523-4106-9bda-6126ffea38a0	63551676-27e8-4777-9f8c-0846e40e4a54	\N	PRODUCT	New Module Street Light Housing	20cf6385-48f2-459e-b26f-6718c8e48707	Monocrystalline solar panels for industrial setup. Grade A cells.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 09:58:34.05	2026-08-10 05:25:55.866
3387a06b-ad50-436b-8b65-7ffea87a983a	ca63732b-3523-4106-9bda-6126ffea38a0	0bfec81a-7ab8-4b5a-a700-096d94c904d3	\N	PRODUCT	Smartwatches with Advanced Features	17294f4e-0c29-4e9d-928c-89ba023bcbad	Precision engineering drill press for industrial manufacturing. 2.5HP Motor.	\N	ACTIVE	f	f	\N	\N	0	0	1	0	0	0	\N	\N	\N	2026-08-07 09:58:34.003	2026-08-10 05:25:56.003
1dc8ec2a-7484-4a6b-b58f-b8588d2ccaba	ca63732b-3523-4106-9bda-6126ffea38a0	99bae4b6-8da4-4b56-96d1-65590001d4db	\N	PRODUCT	USB humidifier, made of ABS, customized	11fc15e5-84fd-4713-8430-8a4bef3102c9	Refined Soy Oil (Bulk) manufactured by Fortune. Premium quality industrial grade product.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 10:00:17.275	2026-08-10 05:25:56.189
1d99207c-7bb4-4730-92cb-39e95611fd6c	ca63732b-3523-4106-9bda-6126ffea38a0	0bfec81a-7ab8-4b5a-a700-096d94c904d3	\N	PRODUCT	New Arrival Hotel Restaurant Food Delivery Robot	96c3bcd0-c933-4ab5-ba79-43d383a882c6	Precision Ball Bearings manufactured by SKF. Premium quality industrial grade product.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 10:00:17.261	2026-08-10 05:25:56.463
5407c2ab-e456-49eb-b588-a89e741568bb	ca63732b-3523-4106-9bda-6126ffea38a0	b2290b51-bf31-473e-85ad-1e9c03372aba	\N	PRODUCT	High drain power 3.7V lithium ion battery	4a7fda29-5419-4be7-a81e-5bd7aef1d829	Bulk Cotton Fabric - Unbleached manufactured by Vardhman. Premium quality industrial grade product.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 10:00:17.248	2026-08-10 05:25:56.814
618eb293-7e3d-4f82-a5d2-a72641e95868	ca63732b-3523-4106-9bda-6126ffea38a0	b2290b51-bf31-473e-85ad-1e9c03372aba	\N	PRODUCT	Transparent food grade silicone tube	af05efd0-b981-45ca-9299-5b434772c298	100% Organic combed cotton yarn. Available in bulk batches.	\N	ACTIVE	f	f	\N	\N	0	0	0	0	0	0	\N	\N	\N	2026-08-07 09:58:34.067	2026-08-10 05:25:57.064
3b488b8e-df10-4954-af69-7c9587dd10f7	ca63732b-3523-4106-9bda-6126ffea38a0	c0acbd11-0e6c-4944-8132-dd919aa85f9a	\N	PRODUCT	Autonomous Food Delivery Robot with LiDAR	28b49b2c-f883-4c08-bfa6-89d957262ed1	High tensile strength rebars for heavy construction. TMT 500D Grade.	\N	ACTIVE	f	f	\N	\N	0	0	2	0	0	0	\N	\N	\N	2026-08-07 09:58:34.058	2026-08-13 13:06:56.941
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, "conversationId", "senderId", content, "contentType", attachments, "replyToId", "isEdited", "editedAt", "isDeleted", "isRead", "createdAt") FROM stdin;
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.milestones (id, "orderId", title, description, amount, "percentOfTotal", "dueDate", status, "submissionNote", "submissionFiles", "submittedAt", "approvedAt", "approvedBy", "rejectionNote", "releasedAt", "payoutTxId", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", type, title, body, data, "isRead", "readAt", channels, "createdAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "variantId", title, sku, quantity, "unitPrice", "totalPrice", "gstRate", "taxAmount", specifications) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "buyerId", "sellerId", "rfqQuoteId", "orderType", status, subtotal, "discountAmount", "taxAmount", "shippingAmount", "totalAmount", "platformFeeRate", "platformFee", "sellerPayout", currency, "escrowStatus", "totalReleasedAmount", "totalRefundedAmount", "paymentStatus", "razorpayOrderId", "razorpayPaymentId", "paidAt", "contractUrl", "contractSignedAt", "contractSignedByBuyer", "contractSignedBySeller", "shippingAddressId", "trackingNumber", "trackingUrl", "shippedAt", "deliveredAt", "expectedDeliveryAt", "cancelReason", "cancelledBy", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "orderId", "milestoneId", amount, currency, status, "razorpayPaymentId", "razorpayOrderId", method, "gatewayResponse", "paidAt", "failedAt", "failureReason", "createdAt") FROM stdin;
\.


--
-- Data for Name: platform_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_config (id, key, value, "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_attribute_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attribute_values (id, "variantId", "attributeId", value, unit) FROM stdin;
\.


--
-- Data for Name: product_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_details (id, "listingId", brand, model, sku, "unitOfMeasure", "minOrderQty", "maxOrderQty", "priceType", "pricePerUnit", "priceRangeMin", "priceRangeMax", currency, "bulkPriceSlabs", "stockAvailable", "totalStock", "leadTimeDays", "hsnCode", "gstRate", specifications, "countryOfOrigin", "supplyAbility", "deliveryTime", "packagingDetails", "packagingUnit", "paymentTerms", "fobPort", "sampleAvailable", "samplePrice", warranty, "returnPolicy", certifications) FROM stdin;
c8c950fd-4904-47a5-b8f9-cd5f5ec0c4b6	bb7631ee-d143-481a-b20a-42d5c548c5df	Tata Steel	\N	\N	Metric Ton	5	\N	FIXED	45000	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
46a4da85-b982-400b-bb43-3774d65f9f34	81038a31-5048-4881-976c-4b7814f7f4f3	Havells	\N	\N	Pieces	100	\N	FIXED	180	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
b545f66b-0a8b-4a35-9ae2-25dfd418d482	e8ae5c95-b8b2-427c-ab42-5059c0a3f7a6	\N	\N	\N	Pieces	1000	\N	FIXED	5800	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
c10928a0-bc9f-41d2-aa15-d6f4164afb9b	3387a06b-ad50-436b-8b65-7ffea87a983a	\N	\N	\N	Pieces	1000	\N	FIXED	275	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
cd5776f8-a533-4be4-a36b-d2a9c9ed2ba3	1dc8ec2a-7484-4a6b-b58f-b8588d2ccaba	Fortune	\N	\N	Pieces	100	\N	FIXED	220	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
765cfb8b-6c01-4dda-bfed-e61ed522ae47	1d99207c-7bb4-4730-92cb-39e95611fd6c	SKF	\N	\N	Pieces	10	\N	FIXED	310000	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
8efff524-1aa9-4a80-9fed-9605585284f7	5407c2ab-e456-49eb-b588-a89e741568bb	Vardhman	\N	\N	Pieces	100	\N	FIXED	120	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
e5abe859-c1d2-4e25-9ac2-eaf004d06064	618eb293-7e3d-4f82-a5d2-a72641e95868	\N	\N	\N	Piece	1	\N	FIXED	140	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
40dc0c44-172c-4c43-9043-fcb595a54bf5	3b488b8e-df10-4954-af69-7c9587dd10f7	\N	\N	\N	Piece	1	\N	FIXED	210000	\N	\N	INR	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, "listingId", "productDetailId", "sellerId", sku, title, "priceOverride", "stockQty", "reservedQty", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, "userId", token, "deviceInfo", "ipAddress", "expiresAt", "createdAt") FROM stdin;
eebe66ee-0557-4ead-9251-ad6ed5386f3a	358cc2b0-da65-4f33-8853-83c49343d797	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNThjYzJiMC1kYTY1LTRmMzMtODg1My04M2M0OTM0M2Q3OTciLCJpYXQiOjE3ODcxMjUzODAsImV4cCI6MTc4OTcxNzM4MH0.cg27lN2-3TCysyL2Ms4wzPskQK4vHfKtFNZkGS8KFeA	\N	\N	2026-09-18 07:43:00.206	2026-08-19 07:43:00.208
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "orderId", "reviewerId", "revieweeId", "reviewType", rating, comment, "qualityRating", "communicationRating", "deliveryRating", "valueRating", "replyText", "repliedAt", "isVerified", "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rfq_invites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rfq_invites (id, "rfqId", "sellerId", "invitedAt", "viewedAt", declined, "declineReason") FROM stdin;
\.


--
-- Data for Name: rfq_quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rfq_quotes (id, "rfqId", "sellerId", "listingId", "variantId", "quotedAmount", currency, "gstInclusive", "gstRate", "totalWithGst", "proposalText", "coverNote", "milestonePlan", "timelineDays", "validUntil", "paymentTerms", "warrantyTerms", "deliveryTerms", attachments, status, "rejectionNote", "submittedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rfq_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rfq_requests (id, "buyerId", "categoryId", "locationId", "rfqType", title, description, quantity, "unitOfMeasure", specifications, "budgetMin", "budgetMax", currency, "budgetFlexible", deadline, "expiresAt", "preferredDeliveryDate", "locationPreference", "deliveryAddressId", "preferredProviderType", "preferredServiceMode", visibility, "maxQuotes", "isAnonymous", status, "quotesCount", "shortlistedCount", "viewCount", attachments, tags, source, "createdAt", "updatedAt") FROM stdin;
74afaa49-0b45-4b83-846d-8b758fd7cf73	3e78a63c-0d81-499e-9069-cfafea606df1	0bfec81a-7ab8-4b5a-a700-096d94c904d3	\N	PRODUCT	Heavy Duty Centrifugal Water Pumps (25 units)	Need industrial grade centrifugal water pumps for a chemical processing plant. Must support 500L/min flow rate, stainless steel impeller, and ATEX certification.	\N	\N	\N	80000	120000	INR	f	\N	2026-09-06 09:58:34.117	\N	\N	\N	\N	\N	PUBLIC	\N	f	OPEN	0	0	0	\N	\N	\N	2026-08-07 09:58:34.122	2026-08-07 09:58:34.122
5999b33e-2a17-4ce0-9cff-db31b27a8fb3	3e78a63c-0d81-499e-9069-cfafea606df1	63551676-27e8-4777-9f8c-0846e40e4a54	\N	PRODUCT	Monocrystalline Solar Cell Wiring Harnesses	Looking for bulk supply of customized wiring harnesses for 400W solar cell arrays. Daily demand is high. Require samples first.	\N	\N	\N	15000	25000	INR	f	\N	2026-09-06 09:58:34.126	\N	\N	\N	\N	\N	PUBLIC	\N	f	OPEN	0	0	0	\N	\N	\N	2026-08-07 09:58:34.13	2026-08-07 09:58:34.13
382b42f6-6775-4484-b0a5-eb13a26cac09	3e78a63c-0d81-499e-9069-cfafea606df1	c0acbd11-0e6c-4944-8132-dd919aa85f9a	\N	PRODUCT	Grade A TMT Steel Rebars (5 Tons)	Procurement of TMT steel rebars (Fe 500D) for a commercial building project in Mumbai. Immediate delivery required.	\N	\N	\N	200000	250000	INR	f	\N	2026-09-06 09:58:34.13	\N	\N	\N	\N	\N	PUBLIC	\N	f	OPEN	0	0	0	\N	\N	\N	2026-08-07 09:58:34.134	2026-08-07 09:58:34.134
\.


--
-- Data for Name: saved_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_listings (id, "userId", "listingId", "savedAt") FROM stdin;
\.


--
-- Data for Name: saved_rfqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_rfqs (id, "userId", "rfqId", "savedAt") FROM stdin;
\.


--
-- Data for Name: service_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_details (id, "listingId", "serviceMode", "providerType", "priceType", "basePrice", "priceUnit", currency, "serviceArea", "capacitySlots", "typicalDuration", "minEngagementDays", "maxEngagementDays", "portfolioItems", certifications, "skillsTags", "toolsTags", languages, "avgResponseHrs", "teamSize") FROM stdin;
\.


--
-- Data for Name: service_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_packages (id, "serviceDetailId", name, description, price, currency, "deliveryDays", "revisionsCount", "includesItems", "isPopular", "sortOrder") FROM stdin;
\.


--
-- Data for Name: subscription_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_invoices (id, "invoiceNumber", "subscriptionId", "userId", amount, currency, status, "billingPeriodStart", "billingPeriodEnd", "paymentMethod", "razorpayPaymentId", "stripePaymentIntentId", "pdfUrl", "paidAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, slug, description, "monthlyPrice", "yearlyPrice", currency, "maxProducts", "maxImagesPerProduct", "maxVideosPerProduct", "allowBulkUpload", "allowApiAccess", "verificationBadge", "featuredProductSlots", "hasAdvancedAnalytics", "hasCompetitorBenchmarking", "supportLevel", "isActive", "displayOrder", "razorpayPlanIdMonthly", "razorpayPlanIdYearly", "stripePriceIdMonthly", "stripePriceIdYearly", "createdAt", "updatedAt") FROM stdin;
e7cdd092-9231-4884-88ba-ae99dd994618	Basic	basic	Essential plan for new sellers to list basic products and receive RFQs.	0	0	INR	10	5	0	f	f	NONE	0	f	f	EMAIL_ONLY	t	1	\N	\N	\N	\N	2026-08-07 09:58:34.141	2026-08-07 09:58:34.141
90149ba3-825a-4f7d-8804-6f392460fbb9	Verified	verified	For growing suppliers seeking verified business badge and bulk upload capabilities.	7999	79990	INR	100	10	1	t	f	VERIFIED	1	f	f	EMAIL_CHAT	t	2	\N	\N	\N	\N	2026-08-07 09:58:34.155	2026-08-07 09:58:34.155
3f93b26b-5646-4814-a012-971fc3b0f7d0	Gold	gold	Gold badge tier with priority search placement, advanced analytics, and API access.	24999	249990	INR	500	20	3	t	t	GOLD	5	t	t	PRIORITY	t	3	\N	\N	\N	\N	2026-08-07 09:58:34.159	2026-08-07 09:58:34.159
e539b5de-d944-41b4-8b7a-c539910ab111	Assessed	assessed	Top-tier enterprise plan with unlimited product listings, maximum visibility, and dedicated support.	84999	849990	INR	-1	30	5	t	t	ASSESSED	20	t	t	DEDICATED	t	4	\N	\N	\N	\N	2026-08-07 09:58:34.165	2026-08-07 09:58:34.165
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, "userId", "planId", "billingCycle", status, "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "canceledAt", "endedAt", "razorpayCustomerId", "razorpaySubscriptionId", "stripeCustomerId", "stripeSubscriptionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, "fullName", "userType", "accountType", "kycStatus", "trustScore", "sellerRating", "buyerRating", "totalOrdersPlaced", "totalOrdersFulfilled", "responseRatePercent", "avgResponseHours", "isActive", "isAdmin", "avatarUrl", "coverUrl", "fcmToken", "hasSeenTour", language, timezone, currency, "lastActiveAt", "createdAt", "updatedAt") FROM stdin;
ca63732b-3523-4106-9bda-6126ffea38a0	sales@globalexports.com	919998887776	Global Exports Corp	SELLER	BUSINESS	VERIFIED	0	0	0	0	0	0	0	t	f	\N	\N	\N	f	en	Asia/Kolkata	INR	\N	2026-08-07 09:58:33.983	2026-08-07 09:58:33.983
3e78a63c-0d81-499e-9069-cfafea606df1	procurement@techpro.com	919991112223	TechPro Industries	BUYER	BUSINESS	VERIFIED	0	0	0	0	0	0	0	t	f	\N	\N	\N	f	en	Asia/Kolkata	INR	\N	2026-08-07 09:58:34.116	2026-08-07 09:58:34.116
358cc2b0-da65-4f33-8853-83c49343d797	admin@jaxmart.com	919998882221	System Admin	BOTH	INDIVIDUAL	VERIFIED	0	0	0	0	0	0	0	t	t	\N	\N	\N	t	en	Asia/Kolkata	INR	\N	2026-08-07 09:58:33.892	2026-08-10 09:06:34.452
\.


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: business_certifications business_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_certifications
    ADD CONSTRAINT business_certifications_pkey PRIMARY KEY (id);


--
-- Name: business_profiles business_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_profiles
    ADD CONSTRAINT business_profiles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_attributes category_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT category_attributes_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: deposit_receipts deposit_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposit_receipts
    ADD CONSTRAINT deposit_receipts_pkey PRIMARY KEY (id);


--
-- Name: dispute_events dispute_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_events
    ADD CONSTRAINT dispute_events_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- Name: kyc_documents kyc_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_documents
    ADD CONSTRAINT kyc_documents_pkey PRIMARY KEY (id);


--
-- Name: listing_media listing_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT listing_media_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_config platform_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_config
    ADD CONSTRAINT platform_config_pkey PRIMARY KEY (id);


--
-- Name: product_attribute_values product_attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_pkey PRIMARY KEY (id);


--
-- Name: product_details product_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT product_details_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rfq_invites rfq_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_invites
    ADD CONSTRAINT rfq_invites_pkey PRIMARY KEY (id);


--
-- Name: rfq_quotes rfq_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_quotes
    ADD CONSTRAINT rfq_quotes_pkey PRIMARY KEY (id);


--
-- Name: rfq_requests rfq_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_requests
    ADD CONSTRAINT rfq_requests_pkey PRIMARY KEY (id);


--
-- Name: saved_listings saved_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_pkey PRIMARY KEY (id);


--
-- Name: saved_rfqs saved_rfqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_rfqs
    ADD CONSTRAINT saved_rfqs_pkey PRIMARY KEY (id);


--
-- Name: service_details service_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_details
    ADD CONSTRAINT service_details_pkey PRIMARY KEY (id);


--
-- Name: service_packages service_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_pkey PRIMARY KEY (id);


--
-- Name: subscription_invoices subscription_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: addresses_city_state_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX addresses_city_state_idx ON public.addresses USING btree (city, state);


--
-- Name: addresses_pincode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX addresses_pincode_idx ON public.addresses USING btree (pincode);


--
-- Name: addresses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "addresses_userId_idx" ON public.addresses USING btree ("userId");


--
-- Name: analytics_events_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "analytics_events_createdAt_idx" ON public.analytics_events USING btree ("createdAt");


--
-- Name: analytics_events_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "analytics_events_entityType_entityId_idx" ON public.analytics_events USING btree ("entityType", "entityId");


--
-- Name: analytics_events_eventName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "analytics_events_eventName_idx" ON public.analytics_events USING btree ("eventName");


--
-- Name: analytics_events_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "analytics_events_userId_idx" ON public.analytics_events USING btree ("userId");


--
-- Name: business_profiles_gstin_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX business_profiles_gstin_key ON public.business_profiles USING btree (gstin);


--
-- Name: business_profiles_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "business_profiles_userId_key" ON public.business_profiles USING btree ("userId");


--
-- Name: categories_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "categories_parentId_idx" ON public.categories USING btree ("parentId");


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: category_attributes_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "category_attributes_categoryId_idx" ON public.category_attributes USING btree ("categoryId");


--
-- Name: category_attributes_categoryId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "category_attributes_categoryId_slug_key" ON public.category_attributes USING btree ("categoryId", slug);


--
-- Name: conversation_participants_conversationId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON public.conversation_participants USING btree ("conversationId", "userId");


--
-- Name: conversation_participants_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversation_participants_userId_idx" ON public.conversation_participants USING btree ("userId");


--
-- Name: conversations_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversations_orderId_idx" ON public.conversations USING btree ("orderId");


--
-- Name: conversations_rfqId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversations_rfqId_idx" ON public.conversations USING btree ("rfqId");


--
-- Name: deposit_receipts_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deposit_receipts_status_idx ON public.deposit_receipts USING btree (status);


--
-- Name: deposit_receipts_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deposit_receipts_userId_idx" ON public.deposit_receipts USING btree ("userId");


--
-- Name: dispute_events_disputeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dispute_events_disputeId_idx" ON public.dispute_events USING btree ("disputeId");


--
-- Name: disputes_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "disputes_orderId_idx" ON public.disputes USING btree ("orderId");


--
-- Name: disputes_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX disputes_status_idx ON public.disputes USING btree (status);


--
-- Name: inventory_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_logs_createdAt_idx" ON public.inventory_logs USING btree ("createdAt");


--
-- Name: inventory_logs_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_logs_variantId_idx" ON public.inventory_logs USING btree ("variantId");


--
-- Name: kyc_documents_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kyc_documents_status_idx ON public.kyc_documents USING btree (status);


--
-- Name: kyc_documents_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kyc_documents_userId_idx" ON public.kyc_documents USING btree ("userId");


--
-- Name: listing_media_listingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "listing_media_listingId_idx" ON public.listing_media USING btree ("listingId");


--
-- Name: listings_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "listings_categoryId_idx" ON public.listings USING btree ("categoryId");


--
-- Name: listings_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "listings_isFeatured_idx" ON public.listings USING btree ("isFeatured");


--
-- Name: listings_listingType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "listings_listingType_idx" ON public.listings USING btree ("listingType");


--
-- Name: listings_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "listings_sellerId_idx" ON public.listings USING btree ("sellerId");


--
-- Name: listings_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX listings_slug_key ON public.listings USING btree (slug);


--
-- Name: listings_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX listings_status_idx ON public.listings USING btree (status);


--
-- Name: listings_tags_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX listings_tags_idx ON public.listings USING btree (tags);


--
-- Name: messages_conversationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_conversationId_idx" ON public.messages USING btree ("conversationId");


--
-- Name: messages_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_createdAt_idx" ON public.messages USING btree ("createdAt");


--
-- Name: messages_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "messages_senderId_idx" ON public.messages USING btree ("senderId");


--
-- Name: milestones_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "milestones_orderId_idx" ON public.milestones USING btree ("orderId");


--
-- Name: milestones_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX milestones_status_idx ON public.milestones USING btree (status);


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: orders_buyerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_buyerId_idx" ON public.orders USING btree ("buyerId");


--
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- Name: orders_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_orderNumber_idx" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_rfqQuoteId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_rfqQuoteId_key" ON public.orders USING btree ("rfqQuoteId");


--
-- Name: orders_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_sellerId_idx" ON public.orders USING btree ("sellerId");


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- Name: platform_config_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX platform_config_key_key ON public.platform_config USING btree (key);


--
-- Name: product_attribute_values_attributeId_value_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_attribute_values_attributeId_value_idx" ON public.product_attribute_values USING btree ("attributeId", value);


--
-- Name: product_attribute_values_variantId_attributeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_attribute_values_variantId_attributeId_key" ON public.product_attribute_values USING btree ("variantId", "attributeId");


--
-- Name: product_details_listingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_details_listingId_key" ON public.product_details USING btree ("listingId");


--
-- Name: product_variants_listingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_variants_listingId_idx" ON public.product_variants USING btree ("listingId");


--
-- Name: product_variants_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_variants_sellerId_idx" ON public.product_variants USING btree ("sellerId");


--
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: reviews_orderId_reviewerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reviews_orderId_reviewerId_key" ON public.reviews USING btree ("orderId", "reviewerId");


--
-- Name: reviews_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_rating_idx ON public.reviews USING btree (rating);


--
-- Name: reviews_revieweeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_revieweeId_idx" ON public.reviews USING btree ("revieweeId");


--
-- Name: rfq_invites_rfqId_sellerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "rfq_invites_rfqId_sellerId_key" ON public.rfq_invites USING btree ("rfqId", "sellerId");


--
-- Name: rfq_invites_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_invites_sellerId_idx" ON public.rfq_invites USING btree ("sellerId");


--
-- Name: rfq_quotes_rfqId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_quotes_rfqId_idx" ON public.rfq_quotes USING btree ("rfqId");


--
-- Name: rfq_quotes_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_quotes_sellerId_idx" ON public.rfq_quotes USING btree ("sellerId");


--
-- Name: rfq_quotes_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rfq_quotes_status_idx ON public.rfq_quotes USING btree (status);


--
-- Name: rfq_quotes_submittedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_quotes_submittedAt_idx" ON public.rfq_quotes USING btree ("submittedAt");


--
-- Name: rfq_requests_buyerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_requests_buyerId_idx" ON public.rfq_requests USING btree ("buyerId");


--
-- Name: rfq_requests_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_requests_categoryId_idx" ON public.rfq_requests USING btree ("categoryId");


--
-- Name: rfq_requests_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_requests_createdAt_idx" ON public.rfq_requests USING btree ("createdAt");


--
-- Name: rfq_requests_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_requests_expiresAt_idx" ON public.rfq_requests USING btree ("expiresAt");


--
-- Name: rfq_requests_rfqType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rfq_requests_rfqType_idx" ON public.rfq_requests USING btree ("rfqType");


--
-- Name: rfq_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rfq_requests_status_idx ON public.rfq_requests USING btree (status);


--
-- Name: saved_listings_userId_listingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "saved_listings_userId_listingId_key" ON public.saved_listings USING btree ("userId", "listingId");


--
-- Name: saved_rfqs_userId_rfqId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "saved_rfqs_userId_rfqId_key" ON public.saved_rfqs USING btree ("userId", "rfqId");


--
-- Name: service_details_listingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "service_details_listingId_key" ON public.service_details USING btree ("listingId");


--
-- Name: service_packages_serviceDetailId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_packages_serviceDetailId_idx" ON public.service_packages USING btree ("serviceDetailId");


--
-- Name: subscription_invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscription_invoices_invoiceNumber_key" ON public.subscription_invoices USING btree ("invoiceNumber");


--
-- Name: subscription_invoices_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscription_invoices_status_idx ON public.subscription_invoices USING btree (status);


--
-- Name: subscription_invoices_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscription_invoices_userId_idx" ON public.subscription_invoices USING btree ("userId");


--
-- Name: subscription_plans_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscription_plans_name_key ON public.subscription_plans USING btree (name);


--
-- Name: subscription_plans_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscription_plans_slug_key ON public.subscription_plans USING btree (slug);


--
-- Name: subscriptions_planId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_planId_idx" ON public.subscriptions USING btree ("planId");


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: subscriptions_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscriptions_userId_key" ON public.subscriptions USING btree ("userId");


--
-- Name: users_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_createdAt_idx" ON public.users USING btree ("createdAt");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_kycStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_kycStatus_idx" ON public.users USING btree ("kycStatus");


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: users_userType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_userType_idx" ON public.users USING btree ("userType");


--
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_certifications business_certifications_businessProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_certifications
    ADD CONSTRAINT "business_certifications_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES public.business_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: business_profiles business_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_profiles
    ADD CONSTRAINT "business_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: category_attributes category_attributes_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category_attributes
    ADD CONSTRAINT "category_attributes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deposit_receipts deposit_receipts_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposit_receipts
    ADD CONSTRAINT "deposit_receipts_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deposit_receipts deposit_receipts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposit_receipts
    ADD CONSTRAINT "deposit_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dispute_events dispute_events_disputeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_events
    ADD CONSTRAINT "dispute_events_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES public.disputes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disputes disputes_milestoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.milestones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_logs inventory_logs_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT "inventory_logs_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kyc_documents kyc_documents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_documents
    ADD CONSTRAINT "kyc_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listing_media listing_media_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT "listing_media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listing_media listing_media_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT "listing_media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: listings listings_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: listings listings_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT "listings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: listings listings_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT "listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: messages messages_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: milestones milestones_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT "milestones_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_rfqQuoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_rfqQuoteId_fkey" FOREIGN KEY ("rfqQuoteId") REFERENCES public.rfq_quotes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_attribute_values product_attribute_values_attributeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT "product_attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES public.category_attributes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_attribute_values product_attribute_values_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT "product_attribute_values_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_details product_details_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT "product_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_productDetailId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productDetailId_fkey" FOREIGN KEY ("productDetailId") REFERENCES public.product_details(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_revieweeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_invites rfq_invites_rfqId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_invites
    ADD CONSTRAINT "rfq_invites_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES public.rfq_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rfq_invites rfq_invites_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_invites
    ADD CONSTRAINT "rfq_invites_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_quotes rfq_quotes_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_quotes
    ADD CONSTRAINT "rfq_quotes_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: rfq_quotes rfq_quotes_rfqId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_quotes
    ADD CONSTRAINT "rfq_quotes_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES public.rfq_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_quotes rfq_quotes_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_quotes
    ADD CONSTRAINT "rfq_quotes_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_requests rfq_requests_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_requests
    ADD CONSTRAINT "rfq_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_requests rfq_requests_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_requests
    ADD CONSTRAINT "rfq_requests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_requests rfq_requests_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq_requests
    ADD CONSTRAINT "rfq_requests_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: saved_listings saved_listings_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT "saved_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_listings saved_listings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT "saved_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_rfqs saved_rfqs_rfqId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_rfqs
    ADD CONSTRAINT "saved_rfqs_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES public.rfq_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: saved_rfqs saved_rfqs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_rfqs
    ADD CONSTRAINT "saved_rfqs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_details service_details_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_details
    ADD CONSTRAINT "service_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_packages service_packages_serviceDetailId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT "service_packages_serviceDetailId_fkey" FOREIGN KEY ("serviceDetailId") REFERENCES public.service_details(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscription_invoices subscription_invoices_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT "subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscription_invoices subscription_invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT "subscription_invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.subscription_plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jfJWDDOGczfbEQgtv0ljkaFb265OcdrUVLtinqMfFRej4mTjAZ6XGUpe73pR3kj


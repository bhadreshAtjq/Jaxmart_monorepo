const typeDefs = `#graphql
  # ─── Enums ─────────────────────────────────────────────────────────────────────

  enum UserType        { BUYER SELLER BOTH }
  enum AccountType     { INDIVIDUAL BUSINESS }
  enum KycStatus       { PENDING VERIFIED REJECTED UNDER_REVIEW }
  enum ListingType     { PRODUCT SERVICE }
  enum ListingStatus   { DRAFT ACTIVE PAUSED REJECTED ARCHIVED }
  enum ServiceMode     { ONSITE REMOTE HYBRID }
  enum RfqType         { PRODUCT SERVICE BOTH }
  enum RfqStatus       { OPEN CLOSED AWARDED EXPIRED CANCELLED }
  enum RfqVisibility   { PUBLIC PRIVATE TARGETED }
  enum QuoteStatus     { DRAFT SUBMITTED SHORTLISTED WON LOST WITHDRAWN EXPIRED }
  enum OrderType       { PRODUCT SERVICE }
  enum OrderStatus     { CREATED ACCEPTED ACTIVE SHIPPED DELIVERED COMPLETED DISPUTED CANCELLED REFUNDED }
  enum EscrowStatus    { HELD PARTIAL_RELEASED FULLY_RELEASED REFUNDED FROZEN }
  enum MilestoneStatus { PENDING IN_PROGRESS SUBMITTED APPROVED DISPUTED RELEASED CANCELLED }
  enum DisputeStatus   { OPEN UNDER_REVIEW RESOLVED_BUYER RESOLVED_SELLER RESOLVED_PARTIAL WITHDRAWN }
  enum AddressType     { PRIMARY BRANCH BILLING SHIPPING WAREHOUSE }
  enum EmployeeRange   { ONE_TO_TEN ELEVEN_TO_FIFTY FIFTY_ONE_TO_TWO_HUNDRED TWO_HUNDRED_PLUS }
  enum MediaType       { IMAGE VIDEO DOCUMENT BROCHURE }
  enum AttributeType   { TEXT NUMBER BOOLEAN SELECT MULTI_SELECT }
  enum PriceType       { FIXED NEGOTIABLE ON_REQUEST RANGE }
  enum PaymentStatus   { PENDING PAID PARTIALLY_PAID FAILED REFUNDED }
  enum ReviewType      { BUYER_TO_SELLER SELLER_TO_BUYER }
  enum ConversationContext { RFQ QUOTE ORDER LISTING GENERAL }

  # Custom Scalar
  scalar JSON

  # ─── USERS & IDENTITY ───────────────────────────────────────────────────────

  type User {
    id: ID!
    email: String
    phone: String!
    fullName: String!
    userType: UserType!
    accountType: AccountType!
    kycStatus: KycStatus!
    trustScore: Int!
    sellerRating: Float!
    buyerRating: Float!
    totalOrdersPlaced: Int!
    totalOrdersFulfilled: Int!
    responseRatePercent: Float!
    avgResponseHours: Float!
    isActive: Boolean!
    isAdmin: Boolean!
    avatarUrl: String
    coverUrl: String
    language: String!
    timezone: String!
    currency: String!
    lastActiveAt: String
    createdAt: String!
    updatedAt: String!

    businessProfile: BusinessProfile
    addresses: [Address!]!
    listings: [Listing!]!
    rfqRequests: [RfqRequest!]!
    rfqQuotes: [RfqQuote!]!
    buyerOrders: [Order!]!
    sellerOrders: [Order!]!
    reviewsGiven: [Review!]!
    reviewsReceived: [Review!]!
    savedListings: [SavedListing!]!
    savedRfqs: [SavedRfq!]!
  }

  type BusinessProfile {
    id: ID!
    userId: String!
    businessName: String!
    gstin: String
    pan: String
    mcaCin: String
    msmeNumber: String
    udyamNumber: String
    iecCode: String
    establishedYear: Int
    employeeRange: EmployeeRange
    annualTurnover: String
    website: String
    linkedinUrl: String
    description: String
    businessType: String
    exportCapable: Boolean!
    verifiedAt: String
    createdAt: String!
    updatedAt: String!

    certifications: [BusinessCertification!]!
  }

  type BusinessCertification {
    id: ID!
    businessProfileId: String!
    certName: String!
    certNumber: String
    issuingBody: String
    validFrom: String
    validUntil: String
    documentUrl: String
    isVerified: Boolean!
    createdAt: String!
  }

  type Address {
    id: ID!
    userId: String!
    addressType: AddressType!
    label: String
    contactName: String
    contactPhone: String
    line1: String!
    line2: String
    landmark: String
    city: String!
    state: String!
    pincode: String!
    country: String!
    lat: Float
    lng: Float
    isPrimary: Boolean!
    isActive: Boolean!
    createdAt: String!
  }

  # ─── CATEGORIES & TAXONOMY ──────────────────────────────────────────────────

  type Category {
    id: ID!
    parentId: String
    name: String!
    slug: String!
    applicableType: ListingType
    depthLevel: Int!
    iconUrl: String
    bannerUrl: String
    metaTitle: String
    metaDescription: String
    sortOrder: Int!
    isActive: Boolean!
    createdAt: String!

    parent: Category
    children: [Category!]!
    listings: [Listing!]!
    attributes: [CategoryAttribute!]!
  }

  type CategoryAttribute {
    id: ID!
    categoryId: String!
    name: String!
    slug: String!
    unit: String
    attributeType: AttributeType!
    isRequired: Boolean!
    isFilterable: Boolean!
    sortOrder: Int!
    options: JSON
    createdAt: String!
  }

  # ─── LISTINGS ───────────────────────────────────────────────────────────────

  type Listing {
    id: ID!
    sellerId: String!
    categoryId: String!
    locationId: String
    listingType: ListingType!
    title: String!
    slug: String
    description: String!
    shortDesc: String
    status: ListingStatus!
    isFeatured: Boolean!
    isVerified: Boolean!
    metaTitle: String
    metaKeywords: [String!]!
    avgRating: Float!
    reviewCount: Int!
    viewCount: Int!
    enquiryCount: Int!
    quoteCount: Int!
    saveCount: Int!
    tags: [String!]!
    publishedAt: String
    createdAt: String!
    updatedAt: String!

    seller: User!
    category: Category!
    location: Address
    productDetail: ProductDetail
    serviceDetail: ServiceDetail
    media: [ListingMedia!]!
    variants: [ProductVariant!]!
    rfqQuotes: [RfqQuote!]!
  }

  type ListingMedia {
    id: ID!
    listingId: String!
    variantId: String
    url: String!
    thumbUrl: String
    mediaType: MediaType!
    altText: String
    isPrimary: Boolean!
    sortOrder: Int!
    createdAt: String!
  }

  # ─── PRODUCT DETAIL + VARIANTS ─────────────────────────────────────────────

  type ProductDetail {
    id: ID!
    listingId: String!
    brand: String
    model: String
    sku: String
    unitOfMeasure: String!
    minOrderQty: Float!
    maxOrderQty: Float
    priceType: PriceType!
    pricePerUnit: Float
    priceRangeMin: Float
    priceRangeMax: Float
    currency: String!
    bulkPriceSlabs: JSON
    stockAvailable: Boolean!
    totalStock: Int
    leadTimeDays: Int
    hsnCode: String
    gstRate: Float
    specifications: JSON
    countryOfOrigin: String
    supplyAbility: String
    deliveryTime: String
    packagingDetails: String
    packagingUnit: String
    paymentTerms: String
    fobPort: String
    sampleAvailable: Boolean!
    samplePrice: Float
    warranty: String
    returnPolicy: String
    certifications: [String!]!
  }

  type ProductVariant {
    id: ID!
    listingId: String!
    productDetailId: String!
    sellerId: String!
    sku: String
    title: String!
    priceOverride: Float
    stockQty: Int!
    reservedQty: Int!
    isActive: Boolean!
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!

    attributeValues: [ProductAttributeValue!]!
    media: [ListingMedia!]!
  }

  type ProductAttributeValue {
    id: ID!
    variantId: String!
    attributeId: String!
    value: String!
    unit: String
    attribute: CategoryAttribute!
  }

  # ─── SERVICE DETAIL + PACKAGES ─────────────────────────────────────────────

  type ServiceDetail {
    id: ID!
    listingId: String!
    serviceMode: ServiceMode!
    providerType: AccountType!
    priceType: PriceType!
    basePrice: Float
    priceUnit: String
    currency: String!
    serviceArea: [String!]!
    capacitySlots: Int!
    typicalDuration: String
    minEngagementDays: Int
    maxEngagementDays: Int
    portfolioItems: [JSON!]!
    certifications: [JSON!]!
    skillsTags: [String!]!
    toolsTags: [String!]!
    languages: [String!]!
    avgResponseHrs: Float
    teamSize: Int

    packages: [ServicePackage!]!
  }

  type ServicePackage {
    id: ID!
    serviceDetailId: String!
    name: String!
    description: String
    price: Float!
    currency: String!
    deliveryDays: Int!
    revisionsCount: Int!
    includesItems: [JSON!]!
    isPopular: Boolean!
    sortOrder: Int!
  }

  # ─── RFQ SYSTEM ────────────────────────────────────────────────────────────

  type RfqRequest {
    id: ID!
    buyerId: String!
    categoryId: String!
    locationId: String
    rfqType: RfqType!
    title: String!
    description: String!
    quantity: Float
    unitOfMeasure: String
    specifications: JSON
    budgetMin: Float
    budgetMax: Float
    currency: String!
    budgetFlexible: Boolean!
    deadline: String
    expiresAt: String
    preferredDeliveryDate: String
    locationPreference: String
    preferredProviderType: AccountType
    preferredServiceMode: ServiceMode
    visibility: RfqVisibility!
    maxQuotes: Int
    isAnonymous: Boolean!
    status: RfqStatus!
    quotesCount: Int!
    shortlistedCount: Int!
    viewCount: Int!
    attachments: [JSON!]!
    tags: [String!]!
    source: String
    createdAt: String!
    updatedAt: String!

    buyer: User!
    category: Category!
    location: Address
    quotes: [RfqQuote!]!
    invites: [RfqInvite!]!
  }

  type RfqInvite {
    id: ID!
    rfqId: String!
    sellerId: String!
    invitedAt: String!
    viewedAt: String
    declined: Boolean!
    declineReason: String
  }

  type RfqQuote {
    id: ID!
    rfqId: String!
    sellerId: String!
    listingId: String
    variantId: String
    quotedAmount: Float!
    currency: String!
    gstInclusive: Boolean!
    gstRate: Float
    totalWithGst: Float
    proposalText: String!
    coverNote: String
    milestonePlan: [JSON!]!
    timelineDays: Int!
    validUntil: String
    paymentTerms: String
    warrantyTerms: String
    deliveryTerms: String
    attachments: [JSON!]!
    status: QuoteStatus!
    rejectionNote: String
    submittedAt: String!
    updatedAt: String!

    rfq: RfqRequest!
    seller: User!
    listing: Listing
    order: Order
  }

  # ─── ORDERS ────────────────────────────────────────────────────────────────

  type Order {
    id: ID!
    orderNumber: String!
    buyerId: String!
    sellerId: String!
    rfqQuoteId: String
    orderType: OrderType!
    status: OrderStatus!
    subtotal: Float!
    discountAmount: Float!
    taxAmount: Float!
    shippingAmount: Float!
    totalAmount: Float!
    platformFeeRate: Float!
    platformFee: Float!
    sellerPayout: Float!
    currency: String!
    escrowStatus: EscrowStatus!
    totalReleasedAmount: Float!
    totalRefundedAmount: Float!
    paymentStatus: PaymentStatus!
    razorpayOrderId: String
    razorpayPaymentId: String
    paidAt: String
    contractUrl: String
    contractSignedAt: String
    contractSignedByBuyer: Boolean!
    contractSignedBySeller: Boolean!
    shippingAddressId: String
    trackingNumber: String
    trackingUrl: String
    shippedAt: String
    deliveredAt: String
    expectedDeliveryAt: String
    cancelReason: String
    cancelledBy: String
    completedAt: String
    createdAt: String!
    updatedAt: String!

    buyer: User!
    seller: User!
    rfqQuote: RfqQuote
    items: [OrderItem!]!
    milestones: [Milestone!]!
    payments: [Payment!]!
    reviews: [Review!]!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    variantId: String
    title: String!
    sku: String
    quantity: Float!
    unitPrice: Float!
    totalPrice: Float!
    gstRate: Float
    taxAmount: Float!
    specifications: JSON
  }

  type Payment {
    id: ID!
    orderId: String!
    milestoneId: String
    amount: Float!
    currency: String!
    status: PaymentStatus!
    razorpayPaymentId: String
    razorpayOrderId: String
    method: String
    gatewayResponse: JSON
    paidAt: String
    failedAt: String
    failureReason: String
    createdAt: String!
  }

  # ─── MILESTONES ────────────────────────────────────────────────────────────

  type Milestone {
    id: ID!
    orderId: String!
    title: String!
    description: String
    amount: Float!
    percentOfTotal: Float
    dueDate: String
    status: MilestoneStatus!
    submissionNote: String
    submissionFiles: [JSON!]!
    submittedAt: String
    approvedAt: String
    approvedBy: String
    rejectionNote: String
    releasedAt: String
    payoutTxId: String
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!
  }

  # ─── REVIEWS ───────────────────────────────────────────────────────────────

  type Review {
    id: ID!
    orderId: String!
    reviewerId: String!
    revieweeId: String!
    reviewType: ReviewType!
    rating: Int!
    comment: String
    qualityRating: Int
    communicationRating: Int
    deliveryRating: Int
    valueRating: Int
    replyText: String
    repliedAt: String
    isVerified: Boolean!
    isPublic: Boolean!
    createdAt: String!
    updatedAt: String!

    order: Order!
    reviewer: User!
    reviewee: User!
  }

  # ─── SAVED / WISHLIST ──────────────────────────────────────────────────────

  type SavedListing {
    id: ID!
    userId: String!
    listingId: String!
    savedAt: String!
    listing: Listing!
  }

  type SavedRfq {
    id: ID!
    userId: String!
    rfqId: String!
    savedAt: String!
    rfq: RfqRequest!
  }

  # ─── QUERIES ───────────────────────────────────────────────────────────────

  type Query {
    # Users
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!

    # Categories
    categories(parentId: ID): [Category!]!
    category(id: ID!): Category
    categoryAttributes(categoryId: ID!): [CategoryAttribute!]!

    # Listings
    listings(
      categoryId: ID
      listingType: ListingType
      status: ListingStatus
      limit: Int
      offset: Int
      search: String
    ): [Listing!]!
    listing(id: ID!): Listing

    # Product Variants
    productVariants(listingId: ID!): [ProductVariant!]!

    # RFQs
    rfqRequests(status: RfqStatus, limit: Int, offset: Int): [RfqRequest!]!
    rfqRequest(id: ID!): RfqRequest

    # Quotes
    rfqQuotes(rfqId: ID!): [RfqQuote!]!
    rfqQuote(id: ID!): RfqQuote

    # Orders
    orders(role: String, limit: Int, offset: Int): [Order!]!
    order(id: ID!): Order

    # Saved
    mySavedListings: [SavedListing!]!
    mySavedRfqs: [SavedRfq!]!
  }

  # ─── INPUT TYPES ───────────────────────────────────────────────────────────

  input CreateListingInput {
    categoryId: String!
    listingType: ListingType!
    title: String!
    description: String!
    shortDesc: String
    status: ListingStatus
    tags: [String!]
    locationId: String
    productDetail: CreateProductDetailInput
    serviceDetail: CreateServiceDetailInput
    mediaUrls: [String!]
  }

  input CreateProductDetailInput {
    brand: String
    model: String
    sku: String
    unitOfMeasure: String!
    minOrderQty: Float
    maxOrderQty: Float
    priceType: PriceType
    pricePerUnit: Float
    priceRangeMin: Float
    priceRangeMax: Float
    currency: String
    bulkPriceSlabs: JSON
    stockAvailable: Boolean
    totalStock: Int
    leadTimeDays: Int
    hsnCode: String
    gstRate: Float
    specifications: JSON
    countryOfOrigin: String
    supplyAbility: String
    deliveryTime: String
    packagingDetails: String
    packagingUnit: String
    paymentTerms: String
    fobPort: String
    sampleAvailable: Boolean
    samplePrice: Float
    warranty: String
    returnPolicy: String
    certifications: [String!]
  }

  input CreateServiceDetailInput {
    serviceMode: ServiceMode
    providerType: AccountType
    priceType: PriceType
    basePrice: Float
    priceUnit: String
    currency: String
    serviceArea: [String!]
    capacitySlots: Int
    typicalDuration: String
    minEngagementDays: Int
    maxEngagementDays: Int
    portfolioItems: [JSON!]
    certifications: [JSON!]
    skillsTags: [String!]
    toolsTags: [String!]
    languages: [String!]
    avgResponseHrs: Float
    teamSize: Int
  }

  input CreateRfqRequestInput {
    categoryId: String!
    rfqType: RfqType!
    title: String!
    description: String!
    quantity: Float
    unitOfMeasure: String
    specifications: JSON
    budgetMin: Float
    budgetMax: Float
    currency: String
    budgetFlexible: Boolean
    deadline: String
    preferredDeliveryDate: String
    locationPreference: String
    preferredProviderType: AccountType
    preferredServiceMode: ServiceMode
    visibility: RfqVisibility
    maxQuotes: Int
    isAnonymous: Boolean
    isPublic: Boolean
    attachments: [JSON!]
    tags: [String!]
  }

  input SubmitQuoteInput {
    rfqId: String!
    listingId: String
    variantId: String
    quotedAmount: Float!
    currency: String
    gstInclusive: Boolean
    gstRate: Float
    totalWithGst: Float
    proposalText: String!
    coverNote: String
    milestonePlan: [JSON!]
    timelineDays: Int!
    validUntil: String
    paymentTerms: String
    warrantyTerms: String
    deliveryTerms: String
    attachments: [JSON!]
  }

  # ─── MUTATIONS ─────────────────────────────────────────────────────────────

  type Mutation {
    # Listings
    createListing(input: CreateListingInput!): Listing!
    updateListingStatus(id: ID!, status: ListingStatus!): Listing!
    deleteListing(id: ID!): Boolean!

    # RFQ
    createRfqRequest(input: CreateRfqRequestInput!): RfqRequest!
    closeRfqRequest(id: ID!): RfqRequest!

    # Quotes
    submitRfqQuote(input: SubmitQuoteInput!): RfqQuote!
    updateRfqQuoteStatus(id: ID!, status: QuoteStatus!): RfqQuote!

    # User
    updateProfile(fullName: String, email: String, avatarUrl: String, coverUrl: String, language: String, timezone: String, currency: String): User!

    # Saved / Wishlist
    saveListing(listingId: String!): SavedListing!
    unsaveListing(listingId: String!): Boolean!
    saveRfq(rfqId: String!): SavedRfq!
    unsaveRfq(rfqId: String!): Boolean!
  }
`;

module.exports = typeDefs;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');
  
  // 0. Create Admin User
  const adminPhone = '919998882221';
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { isAdmin: true },
    create: {
      phone: adminPhone,
      fullName: 'System Admin',
      email: 'admin@jaxmart.com',
      isAdmin: true,
      userType: 'BOTH',
      kycStatus: 'VERIFIED',
    }
  });
  console.log('✅ Admin user created/updated');

  // 1. Create Categories
  const categories = [
    { name: 'Industrial Supplies', slug: 'industrial-supplies', iconUrl: 'Settings' },
    { name: 'Electronics', slug: 'electronics', iconUrl: 'Smartphone' },
    { name: 'Construction', slug: 'construction', iconUrl: 'HardHat' },
    { name: 'Textiles', slug: 'textiles', iconUrl: 'Shirt' },
    { name: 'Services', slug: 'services', iconUrl: 'Briefcase' },
  ];

  const catRecords = [];
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    catRecords.push(record);
  }
  console.log('✅ Categories seeded');

  // 2. Create Mock Sellers
  const sellerPhone = '919998887776';
  const seller = await prisma.user.upsert({
    where: { phone: sellerPhone },
    update: {},
    create: {
      phone: sellerPhone,
      fullName: 'Global Exports Corp',
      email: 'sales@globalexports.com',
      userType: 'SELLER',
      accountType: 'BUSINESS',
      kycStatus: 'VERIFIED',
      businessProfile: {
        create: {
          businessName: 'Global Exports Corp',
          gstin: '29ABCDE1234F1Z5',
          description: 'Leading exporter of industrial grade machinery and components since 2010.',
        }
      }
    }
  });
  console.log('✅ Mock seller created');

  // 3. Create Mock Products
  const products = [
    {
      title: 'Industrial Heavy Duty Drill Press',
      description: 'Precision engineering drill press for industrial manufacturing. 2.5HP Motor.',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800',
      category: catRecords[0], // Industrial
    },
    {
      title: 'Bulk Solar Panels - 400W',
      description: 'Monocrystalline solar panels for industrial setup. Grade A cells.',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
      category: catRecords[1], // Electronics
    },
    {
      title: 'Reinforced Concrete Rebars',
      description: 'High tensile strength rebars for heavy construction. TMT 500D Grade.',
      price: 55,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      category: catRecords[2], // Construction
    },
    {
      title: 'Wholesale Cotton Yarn',
      description: '100% Organic combed cotton yarn. Available in bulk batches.',
      price: 250,
      image: 'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800',
      category: catRecords[3], // Textiles
    }
  ];

  for (const p of products) {
    await prisma.listing.create({
      data: {
        title: p.title,
        description: p.description,
        listingType: 'PRODUCT',
        status: 'ACTIVE',
        sellerId: seller.id,
        categoryId: p.category.id,
        media: {
          create: {
            url: p.image,
            isPrimary: true,
          }
        },
        productDetail: {
          create: {
            pricePerUnit: p.price,
            unitOfMeasure: 'UNIT',
            minOrderQty: 10,
            stockAvailable: true,
          }
        }
      }
    });
  }
  console.log('✅ Mock products seeded');

  // 4. Create Events
  const events = [
    {
      title: "Global Manufacturing Expo 2026",
      description: "Connect with over 500+ verified industrial suppliers and factories showcasing the latest CNC machinery, automation equipment, and heavy industrial supplies.",
      date: new Date("2026-08-15T09:00:00Z"),
      location: "Pragati Maidan, New Delhi",
      mediaUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
      isActive: true
    },
    {
      title: "SustainB2B Green Technology Summit",
      description: "Discover modern solar tech, energy-efficient manufacturing processes, and green logistics solutions for sustainable industrial growth.",
      date: new Date("2026-09-22T10:00:00Z"),
      location: "Virtual Event (Online)",
      mediaUrl: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&q=80&w=800",
      isActive: true
    },
    {
      title: "National Textile & Sourcing Fair",
      description: "Meet premium manufacturers of organic yarn, finished fabrics, raw cotton, and apparel machinery under one roof with secure escrow matching.",
      date: new Date("2026-10-05T09:30:00Z"),
      location: "BIEC, Bengaluru",
      mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
      isActive: true
    }
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event
    });
  }
  console.log('✅ Mock events seeded');

  // 5. Create Mock RFQs
  console.log('🌱 Seeding mock RFQs...');
  await prisma.rfqQuote.deleteMany();
  await prisma.rfqRequest.deleteMany();

  const mockBuyerPhone = '919991112223';
  const mockBuyer = await prisma.user.upsert({
    where: { phone: mockBuyerPhone },
    update: {},
    create: {
      phone: mockBuyerPhone,
      fullName: 'TechPro Industries',
      email: 'procurement@techpro.com',
      userType: 'BUYER',
      accountType: 'BUSINESS',
      kycStatus: 'VERIFIED',
    }
  });

  const rfqs = [
    {
      title: 'Heavy Duty Centrifugal Water Pumps (25 units)',
      description: 'Need industrial grade centrifugal water pumps for a chemical processing plant. Must support 500L/min flow rate, stainless steel impeller, and ATEX certification.',
      rfqType: 'PRODUCT',
      budgetMin: 80000,
      budgetMax: 120000,
      category: catRecords[0], // Industrial
      isPublic: true,
    },
    {
      title: 'Monocrystalline Solar Cell Wiring Harnesses',
      description: 'Looking for bulk supply of customized wiring harnesses for 400W solar cell arrays. Daily demand is high. Require samples first.',
      rfqType: 'PRODUCT',
      budgetMin: 15000,
      budgetMax: 25000,
      category: catRecords[1], // Electronics
      isPublic: true,
    },
    {
      title: 'Grade A TMT Steel Rebars (5 Tons)',
      description: 'Procurement of TMT steel rebars (Fe 500D) for a commercial building project in Mumbai. Immediate delivery required.',
      rfqType: 'PRODUCT',
      budgetMin: 200000,
      budgetMax: 250000,
      category: catRecords[2], // Construction
      isPublic: true,
    }
  ];

  for (const r of rfqs) {
    await prisma.rfqRequest.create({
      data: {
        buyerId: mockBuyer.id,
        categoryId: r.category.id,
        rfqType: r.rfqType,
        title: r.title,
        description: r.description,
        budgetMin: r.budgetMin,
        budgetMax: r.budgetMax,
        visibility: 'PUBLIC',
        status: 'OPEN',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });
  }
  console.log('✅ Mock RFQs seeded');

  // 6. Seed Subscription Plans
  console.log('🌱 Seeding Subscription Plans...');
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Essential free plan for new suppliers. Includes 5 listings and 10 lead notifications per month.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: 'INR',
      listingLimit: 5,
      leadQuotaPerCycle: 10,
      searchRankWeight: 0,
      hasVerifiedBadge: false,
      hasFeaturedPlacement: false,
      hasAnalytics: false,
      hasApiAccess: false,
      assuredDealFeeDiscountPct: 0,
      teamSeats: 1,
      maxProducts: 5,
      maxImagesPerProduct: 5,
      maxVideosPerProduct: 0,
      allowBulkUpload: false,
      verificationBadge: 'NONE',
      featuredProductSlots: 0,
      hasAdvancedAnalytics: false,
      hasCompetitorBenchmarking: false,
      supportLevel: 'EMAIL_ONLY',
      displayOrder: 1,
    },
    {
      name: 'Silver',
      slug: 'silver',
      description: 'For growing suppliers seeking verified business trust, 25 listings, and 50 unmasked lead unlocks.',
      monthlyPrice: 1499,
      yearlyPrice: 14990,
      currency: 'INR',
      listingLimit: 25,
      leadQuotaPerCycle: 50,
      searchRankWeight: 2,
      hasVerifiedBadge: true,
      hasFeaturedPlacement: false,
      hasAnalytics: false,
      hasApiAccess: false,
      assuredDealFeeDiscountPct: 10,
      teamSeats: 1,
      maxProducts: 25,
      maxImagesPerProduct: 10,
      maxVideosPerProduct: 1,
      allowBulkUpload: true,
      verificationBadge: 'VERIFIED',
      featuredProductSlots: 1,
      hasAdvancedAnalytics: false,
      hasCompetitorBenchmarking: false,
      supportLevel: 'EMAIL_CHAT',
      displayOrder: 2,
    },
    {
      name: 'Gold',
      slug: 'gold',
      description: 'Recommended for active manufacturers. 100 listings, 200 leads, priority category ranking, and 25% Assured Deal fee discount.',
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      currency: 'INR',
      listingLimit: 100,
      leadQuotaPerCycle: 200,
      searchRankWeight: 5,
      hasVerifiedBadge: true,
      hasFeaturedPlacement: true,
      hasAnalytics: true,
      hasApiAccess: false,
      assuredDealFeeDiscountPct: 25,
      teamSeats: 3,
      maxProducts: 100,
      maxImagesPerProduct: 20,
      maxVideosPerProduct: 3,
      allowBulkUpload: true,
      verificationBadge: 'GOLD',
      featuredProductSlots: 5,
      hasAdvancedAnalytics: true,
      hasCompetitorBenchmarking: true,
      supportLevel: 'PRIORITY',
      displayOrder: 3,
    },
    {
      name: 'Platinum',
      slug: 'platinum',
      description: 'Custom enterprise tier with unlimited listings & leads, top placement, 40% Assured Deal fee discount, and API access.',
      monthlyPrice: 9999,
      yearlyPrice: 99990,
      currency: 'INR',
      listingLimit: -1, // Unlimited
      leadQuotaPerCycle: -1, // Unlimited
      searchRankWeight: 10,
      hasVerifiedBadge: true,
      hasFeaturedPlacement: true,
      hasAnalytics: true,
      hasApiAccess: true,
      assuredDealFeeDiscountPct: 40,
      teamSeats: 10,
      maxProducts: -1,
      maxImagesPerProduct: 30,
      maxVideosPerProduct: 5,
      allowBulkUpload: true,
      verificationBadge: 'ASSESSED',
      featuredProductSlots: 20,
      hasAdvancedAnalytics: true,
      hasCompetitorBenchmarking: true,
      supportLevel: 'DEDICATED',
      displayOrder: 4,
    },
  ];

  for (const planData of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: planData.slug },
      update: planData,
      create: planData,
    });
  }
  console.log('✅ Subscription plans seeded');

  console.log('🏁 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

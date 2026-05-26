const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding for new schema...');

  // 1. Clear existing transactional / listing / user data to avoid constraints issues
  console.log('🧹 Clearing old tables...');
  await prisma.analyticsEvent.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversationParticipant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.savedListing.deleteMany({});
  await prisma.savedRfq.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.disputeEvent.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.rfqQuote.deleteMany({});
  await prisma.rfqInvite.deleteMany({});
  await prisma.rfqRequest.deleteMany({});
  await prisma.inventoryLog.deleteMany({});
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productDetail.deleteMany({});
  await prisma.servicePackage.deleteMany({});
  await prisma.serviceDetail.deleteMany({});
  await prisma.listingMedia.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.categoryAttribute.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.kycDocument.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.businessCertification.deleteMany({});
  await prisma.businessProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Tables cleared successfully!');

  // 2. Create Categories & Attributes
  console.log('🌱 Seeding Categories and Attributes...');
  const categoriesData = [
    { name: 'Industrial Supplies', slug: 'industrial-supplies', iconUrl: 'Settings', depthLevel: 1, applicableType: 'PRODUCT' },
    { name: 'Electronics', slug: 'electronics', iconUrl: 'Smartphone', depthLevel: 1, applicableType: 'PRODUCT' },
    { name: 'Construction', slug: 'construction', iconUrl: 'HardHat', depthLevel: 1, applicableType: 'PRODUCT' },
    { name: 'Textiles', slug: 'textiles', iconUrl: 'Shirt', depthLevel: 1, applicableType: 'PRODUCT' },
    { name: 'Services', slug: 'services', iconUrl: 'Briefcase', depthLevel: 1, applicableType: 'SERVICE' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.create({ data: cat });
    categories[cat.slug] = record;
  }

  // Create Category Attributes
  const attributes = {};

  // Industrial attributes
  attributes['industrial-supplies'] = [
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['industrial-supplies'].id,
        name: 'Material Grade',
        slug: 'material-grade',
        attributeType: 'SELECT',
        isFilterable: true,
        isRequired: true,
        options: ['SS304', 'SS316', 'Carbon Steel', 'Alloy Steel'],
      }
    }),
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['industrial-supplies'].id,
        name: 'Operating Pressure',
        slug: 'operating-pressure',
        attributeType: 'NUMBER',
        unit: 'bar',
        isFilterable: true,
      }
    })
  ];

  // Electronics attributes
  attributes['electronics'] = [
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['electronics'].id,
        name: 'Operating Voltage',
        slug: 'operating-voltage',
        attributeType: 'NUMBER',
        unit: 'V',
        isFilterable: true,
      }
    }),
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['electronics'].id,
        name: 'Power Output',
        slug: 'power-output',
        attributeType: 'NUMBER',
        unit: 'W',
        isFilterable: true,
      }
    })
  ];

  // Construction attributes
  attributes['construction'] = [
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['construction'].id,
        name: 'Thickness',
        slug: 'thickness',
        attributeType: 'NUMBER',
        unit: 'mm',
        isFilterable: true,
      }
    }),
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['construction'].id,
        name: 'Standards Complied',
        slug: 'standards',
        attributeType: 'SELECT',
        isFilterable: true,
        options: ['ASTM', 'DIN', 'IS 1786', 'BS'],
      }
    })
  ];

  // Textiles attributes
  attributes['textiles'] = [
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['textiles'].id,
        name: 'Fabric Weight',
        slug: 'fabric-weight',
        attributeType: 'NUMBER',
        unit: 'GSM',
        isFilterable: true,
      }
    }),
    await prisma.categoryAttribute.create({
      data: {
        categoryId: categories['textiles'].id,
        name: 'Color',
        slug: 'color',
        attributeType: 'SELECT',
        isFilterable: true,
        options: ['Bleached White', 'Indigo Blue', 'Charcoal Grey', 'Raw Beige'],
      }
    })
  ];

  console.log('✅ Categories & Attributes seeded!');

  // 3. Create Sellers & Business Profiles
  console.log('🌱 Seeding Sellers, Business Profiles and Certifications...');
  const companies = [
    {
      name: 'Apex Industrial Solutions',
      phone: '919876543210',
      email: 'sales@apexindustrial.com',
      established: 2012,
      employees: 'ELEVEN_TO_FIFTY',
      turnover: '₹5 Cr - ₹10 Cr',
      certs: [
        { name: 'ISO 9001:2015', number: 'ISO-9001-83921', body: 'TUV SUD', validFrom: '2023-01-10', validUntil: '2026-01-09' },
        { name: 'OHSAS 18001', number: 'OHSAS-18001-9213', body: 'Bureau Veritas', validFrom: '2024-05-12', validUntil: '2027-05-11' }
      ]
    },
    {
      name: 'Bharat Steel & Alloys',
      phone: '919876543211',
      email: 'procure@bharatsteel.com',
      established: 2005,
      employees: 'FIFTY_ONE_TO_TWO_HUNDRED',
      turnover: '₹25 Cr - ₹50 Cr',
      certs: [
        { name: 'ISO 14001:2015', number: 'ISO-14001-4829', body: 'SGS India', validFrom: '2022-11-20', validUntil: '2025-11-19' }
      ]
    },
    {
      name: 'Narmada Electronics Ltd',
      phone: '919876543212',
      email: 'wholesale@narmadaelec.in',
      established: 2018,
      employees: 'ONE_TO_TEN',
      turnover: '₹1 Cr - ₹5 Cr',
      certs: [
        { name: 'BIS Registration', number: 'R-41098273', body: 'Bureau of Indian Standards', validFrom: '2023-08-01', validUntil: '2025-07-31' }
      ]
    },
    {
      name: 'Deccan Textiles & Fibres',
      phone: '919876543213',
      email: 'orders@deccantextiles.co.in',
      established: 2010,
      employees: 'TWO_HUNDRED_PLUS',
      turnover: '₹50 Cr+',
      certs: [
        { name: 'GOTS Certified Organic', number: 'GOTS-9283-織', body: 'Control Union', validFrom: '2024-02-15', validUntil: '2025-02-14' }
      ]
    },
    {
      name: 'Zen B2B Services',
      phone: '919876543214',
      email: 'consulting@zenb2b.com',
      established: 2020,
      employees: 'ELEVEN_TO_FIFTY',
      turnover: '₹2 Cr - ₹5 Cr',
      certs: [
        { name: 'ISO 27001 (ISMS)', number: 'ISMS-27001-0982', body: 'Intertek', validFrom: '2023-12-01', validUntil: '2026-11-30' }
      ]
    }
  ];

  const sellers = [];
  for (const comp of companies) {
    const seller = await prisma.user.create({
      data: {
        phone: comp.phone,
        fullName: `${comp.name} Manager`,
        email: comp.email,
        userType: 'SELLER',
        accountType: 'BUSINESS',
        kycStatus: 'VERIFIED',
        trustScore: Math.floor(Math.random() * 15) + 80, // 80 - 95
        businessProfile: {
          create: {
            businessName: comp.name,
            gstin: `29${Math.random().toString(36).substring(2, 12).toUpperCase()}1Z5`,
            establishedYear: comp.established,
            employeeRange: comp.employees,
            annualTurnover: comp.turnover,
            description: `${comp.name} is a verified, certified, and trusted supplier on JaxMart. We specialize in B2B supply chains, bulk exports, and premium commercial order fulfillment.`,
            certifications: {
              create: comp.certs.map(c => ({
                certName: c.name,
                certNumber: c.number,
                issuingBody: c.body,
                validFrom: new Date(c.validFrom),
                validUntil: new Date(c.validUntil),
                isVerified: true
              }))
            }
          }
        },
        addresses: {
          create: {
            addressType: 'PRIMARY',
            line1: 'B-Block Industrial Estate',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            country: 'India',
            isPrimary: true
          }
        }
      },
      include: {
        businessProfile: {
          include: {
            certifications: true
          }
        }
      }
    });
    sellers.push(seller);
  }
  console.log(`✅ Seeded ${sellers.length} verified sellers with certifications!`);

  // 4. Seeding Products and Services
  console.log('🌱 Seeding listings, details, variants and packages...');

  // Unsplash images for products
  const images = {
    'industrial-supplies': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    'electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
    'textiles': 'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800',
    'services': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
  };

  const productTemplates = [
    // --- Industrial Supplies ---
    {
      title: 'Stainless Steel Hydraulic Control Valve',
      categorySlug: 'industrial-supplies',
      sellerIndex: 0,
      priceType: 'FIXED',
      pricePerUnit: 4800,
      unit: 'Piece',
      minOrder: 10,
      brand: 'Apex Valves',
      sku: 'APX-HYD-SS304',
      bulkPriceSlabs: [
        { minQty: 10, maxQty: 49, price: 4800 },
        { minQty: 50, maxQty: 199, price: 4400 },
        { minQty: 200, maxQty: null, price: 4000 }
      ],
      sampleAvailable: true,
      samplePrice: 5000,
      warranty: '2 Year Manufacturer Warranty',
      returnPolicy: '7 Days Returnable',
      certifications: ['CE Certified', 'ISI Approved'],
      variants: [
        { title: 'SS304 / 10 bar', sku: 'APX-HYD-SS304-10B', priceOverride: 4800, attributes: { 'material-grade': 'SS304', 'operating-pressure': '10' } },
        { title: 'SS316 / 25 bar', sku: 'APX-HYD-SS316-25B', priceOverride: 5900, attributes: { 'material-grade': 'SS316', 'operating-pressure': '25' } }
      ]
    },
    {
      title: 'High-Pressure Pneumatic Actuator',
      categorySlug: 'industrial-supplies',
      sellerIndex: 0,
      priceType: 'RANGE',
      priceRangeMin: 7200,
      priceRangeMax: 9500,
      unit: 'Piece',
      minOrder: 5,
      brand: 'PneumoTech',
      sku: 'PT-ACT-HP',
      bulkPriceSlabs: [],
      sampleAvailable: false,
      warranty: '1 Year Warranty',
      returnPolicy: 'Non-Returnable',
      certifications: ['ISO 9001'],
      variants: [
        { title: 'Carbon Steel / 15 bar', sku: 'PT-ACT-CS-15B', priceOverride: 7200, attributes: { 'material-grade': 'Carbon Steel', 'operating-pressure': '15' } },
        { title: 'Alloy Steel / 40 bar', sku: 'PT-ACT-AS-40B', priceOverride: 9500, attributes: { 'material-grade': 'Alloy Steel', 'operating-pressure': '40' } }
      ]
    },

    // --- Electronics ---
    {
      title: 'Monocrystalline Solar Panel 400W',
      categorySlug: 'electronics',
      sellerIndex: 2,
      priceType: 'FIXED',
      pricePerUnit: 11500,
      unit: 'Panel',
      minOrder: 25,
      brand: 'Narmada Energy',
      sku: 'NMD-SOL-400W',
      bulkPriceSlabs: [
        { minQty: 25, maxQty: 99, price: 11500 },
        { minQty: 100, maxQty: null, price: 10800 }
      ],
      sampleAvailable: true,
      samplePrice: 13000,
      warranty: '10 Years Performance Warranty',
      returnPolicy: 'Replacement Only',
      certifications: ['BIS Certified', 'IEC 61215', 'RoHS'],
      variants: [
        { title: '24V / 400W Panel', sku: 'NMD-SOL-24V-400W', priceOverride: 11500, attributes: { 'operating-voltage': '24', 'power-output': '400' } },
        { title: '36V / 450W Panel', sku: 'NMD-SOL-36V-450W', priceOverride: 13200, attributes: { 'operating-voltage': '36', 'power-output': '450' } }
      ]
    },
    {
      title: 'Industrial PCB Controller Box',
      categorySlug: 'electronics',
      sellerIndex: 2,
      priceType: 'NEGOTIABLE',
      pricePerUnit: 2500,
      unit: 'Piece',
      minOrder: 100,
      brand: 'Narmada PCB',
      sku: 'NMD-PCB-CTRL',
      bulkPriceSlabs: [],
      sampleAvailable: true,
      samplePrice: 3500,
      warranty: '1 Year Warranty',
      returnPolicy: '7 Days Returnable',
      certifications: ['CE Certified'],
      variants: [
        { title: '12V Controller', sku: 'NMD-PCB-12V', priceOverride: 2500, attributes: { 'operating-voltage': '12', 'power-output': '50' } },
        { title: '24V Controller', sku: 'NMD-PCB-24V', priceOverride: 2900, attributes: { 'operating-voltage': '24', 'power-output': '120' } }
      ]
    },

    // --- Construction ---
    {
      title: 'TMT Steel Rebars Fe 500D Grade',
      categorySlug: 'construction',
      sellerIndex: 1,
      priceType: 'RANGE',
      priceRangeMin: 55000,
      priceRangeMax: 59000,
      unit: 'Metric Ton',
      minOrder: 10,
      brand: 'Bharat Alloys',
      sku: 'BHT-REBAR-TMT',
      bulkPriceSlabs: [
        { minQty: 10, maxQty: 49, price: 59000 },
        { minQty: 50, maxQty: null, price: 55000 }
      ],
      sampleAvailable: false,
      warranty: 'Corrosion Resistance Guarantee',
      certifications: ['IS 1786', 'ISO 9001'],
      variants: [
        { title: '8mm Thickness Rebar', sku: 'BHT-REBAR-8MM', priceOverride: 59000, attributes: { 'thickness': '8', 'standards': 'IS 1786' } },
        { title: '12mm Thickness Rebar', sku: 'BHT-REBAR-12MM', priceOverride: 57500, attributes: { 'thickness': '12', 'standards': 'IS 1786' } },
        { title: '16mm Thickness Rebar', sku: 'BHT-REBAR-16MM', priceOverride: 55000, attributes: { 'thickness': '16', 'standards': 'IS 1786' } }
      ]
    },

    // --- Textiles ---
    {
      title: 'Organic Combed Cotton Fabric Roll',
      categorySlug: 'textiles',
      sellerIndex: 3,
      priceType: 'FIXED',
      pricePerUnit: 180,
      unit: 'Meter',
      minOrder: 500,
      brand: 'Deccan Fibres',
      sku: 'DEC-COT-GSM180',
      bulkPriceSlabs: [
        { minQty: 500, maxQty: 1999, price: 180 },
        { minQty: 2000, maxQty: null, price: 165 }
      ],
      sampleAvailable: true,
      samplePrice: 250,
      warranty: 'Color Fastness Certified',
      certifications: ['GOTS Organic', 'OEKO-TEX Standard 100'],
      variants: [
        { title: 'Bleached White / 180 GSM', sku: 'DEC-COT-W-180', priceOverride: 180, attributes: { 'color': 'Bleached White', 'fabric-weight': '180' } },
        { title: 'Indigo Blue / 240 GSM', sku: 'DEC-COT-B-240', priceOverride: 215, attributes: { 'color': 'Indigo Blue', 'fabric-weight': '240' } }
      ]
    }
  ];

  // Save references to listings so we can build quotes/orders later
  const createdListings = [];

  for (const prod of productTemplates) {
    const seller = sellers[prod.sellerIndex];
    const category = categories[prod.categorySlug];

    const slug = `${prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title: prod.title,
        description: `Premium B2B wholesale supply of ${prod.title}. Manufactured under strict ISO guidelines. Perfect for importers, stockists, and direct project requirements.\n\nCustom specifications, packing, and branding options are available upon query. Contact us today for samples and special container discounts.`,
        slug,
        listingType: 'PRODUCT',
        status: 'ACTIVE',
        sellerId: seller.id,
        categoryId: category.id,
        media: {
          create: {
            url: images[prod.categorySlug],
            isPrimary: true
          }
        },
        productDetail: {
          create: {
            brand: prod.brand,
            sku: prod.sku,
            unitOfMeasure: prod.unit,
            minOrderQty: prod.minOrder,
            priceType: prod.priceType,
            pricePerUnit: prod.pricePerUnit,
            priceRangeMin: prod.priceRangeMin,
            priceRangeMax: prod.priceRangeMax,
            bulkPriceSlabs: prod.bulkPriceSlabs,
            sampleAvailable: prod.sampleAvailable || false,
            samplePrice: prod.samplePrice,
            warranty: prod.warranty,
            returnPolicy: prod.returnPolicy,
            certifications: prod.certifications || [],
            stockAvailable: true,
          }
        }
      },
      include: {
        productDetail: true
      }
    });

    createdListings.push(listing);

    // Create Variants & attribute values
    for (const v of prod.variants) {
      const variantRecord = await prisma.productVariant.create({
        data: {
          listingId: listing.id,
          productDetailId: listing.productDetail.id,
          sellerId: seller.id,
          sku: v.sku,
          title: v.title,
          priceOverride: v.priceOverride,
          stockQty: 500,
          isActive: true
        }
      });

      // Link attribute values
      const catAttrs = attributes[prod.categorySlug] || [];
      for (const [attrSlug, val] of Object.entries(v.attributes)) {
        const matchingAttr = catAttrs.find(a => a.slug === attrSlug);
        if (matchingAttr) {
          await prisma.productAttributeValue.create({
            data: {
              variantId: variantRecord.id,
              attributeId: matchingAttr.id,
              value: val,
              unit: matchingAttr.unit
            }
          });
        }
      }
    }
    console.log(`📦 Seeded Product Listing + Variants: ${prod.title}`);
  }

  // --- Seeding Services ---
  const serviceTemplates = [
    {
      title: 'Enterprise Cyber Security Assessment Audit',
      categorySlug: 'services',
      sellerIndex: 4, // Zen B2B Services
      serviceMode: 'HYBRID',
      priceType: 'ON_REQUEST',
      skillsTags: ['Penetration Testing', 'ISO 27001 Audit', 'Vulnerability Assessment'],
      packages: [
        {
          name: 'Basic Vulnerability Scan',
          description: 'Automated scan of up to 5 external IP addresses with general recommendations report.',
          price: 45000,
          deliveryDays: 5,
          revisionsCount: 1,
          includesItems: ['Automated Scan PDF Report', 'Vulnerability List', '1 Hour Review Meeting'],
          isPopular: false
        },
        {
          name: 'Full Penetration Test',
          description: 'Comprehensive manual pen testing of web app and network with proof-of-concept exploits.',
          price: 180000,
          deliveryDays: 14,
          revisionsCount: 3,
          includesItems: ['Manual Pentest Report', 'Executive Briefing', '1-Month Re-scan Validation', 'Developer Q&A Session'],
          isPopular: true
        },
        {
          name: 'ISO 27001 Audit Readiness',
          description: 'Deep audit of security controls, logs, policies and GAP analysis for complete compliance certification.',
          price: 450000,
          deliveryDays: 45,
          revisionsCount: 5,
          includesItems: ['Security Gap Analysis', 'Policy Documentation Kit', 'Mock Internal Audit', 'Certification Consultation'],
          isPopular: false
        }
      ]
    },
    {
      title: 'Custom B2B E-commerce & Supply Chain ERP Build',
      categorySlug: 'services',
      sellerIndex: 4,
      serviceMode: 'REMOTE',
      priceType: 'RANGE',
      basePrice: 500000,
      skillsTags: ['ERP Integrations', 'Next.js', 'PostgreSQL', 'Supply Chain Tech'],
      packages: [
        {
          name: 'MVP Portal Launch',
          description: 'Build a Next.js order placement portal with basic inventory sync and Razorpay support.',
          price: 500000,
          deliveryDays: 30,
          revisionsCount: 2,
          includesItems: ['Frontend Portal Code', 'Basic Database Schema', 'Payment Integration', 'Cloud Deployment'],
          isPopular: false
        },
        {
          name: 'Professional Supplier ERP',
          description: 'Multi-tenant vendor portal with inventory forecasting, automated PO generation and analytics dashboards.',
          price: 1200000,
          deliveryDays: 60,
          revisionsCount: 5,
          includesItems: ['Custom Vendor Portals', 'Automated PO Dispatch', 'Custom Metabase Analytics', '3 Months Production SLA'],
          isPopular: true
        }
      ]
    }
  ];

  for (const s of serviceTemplates) {
    const seller = sellers[s.sellerIndex];
    const category = categories[s.categorySlug];

    const slug = `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    const listing = await prisma.listing.create({
      data: {
        title: s.title,
        description: `Professional B2B service offering for ${s.title}. Delivered by verified experts under clear SLAs. We support customized quotes based on custom scope documents.`,
        slug,
        listingType: 'SERVICE',
        status: 'ACTIVE',
        sellerId: seller.id,
        categoryId: category.id,
        media: {
          create: {
            url: images[s.categorySlug],
            isPrimary: true
          }
        },
        serviceDetail: {
          create: {
            serviceMode: s.serviceMode,
            providerType: 'BUSINESS',
            priceType: s.priceType,
            basePrice: s.basePrice,
            skillsTags: s.skillsTags,
            languages: ['English', 'Hindi'],
            teamSize: 15,
            packages: {
              create: s.packages.map(p => ({
                name: p.name,
                description: p.description,
                price: p.price,
                deliveryDays: p.deliveryDays,
                revisionsCount: p.revisionsCount,
                includesItems: p.includesItems,
                isPopular: p.isPopular
              }))
            }
          }
        }
      }
    });

    createdListings.push(listing);
    console.log(`🛠️ Seeded Service Listing + Packages: ${s.title}`);
  }

  // 5. Seeding Buyer
  console.log('🌱 Seeding Buyer User...');
  const buyerPhone = '919998887770';
  const buyer = await prisma.user.create({
    data: {
      phone: buyerPhone,
      fullName: 'Sunfield Constructions Procurement',
      email: 'sourcing@sunfieldbuilt.com',
      userType: 'BUYER',
      accountType: 'BUSINESS',
      kycStatus: 'VERIFIED',
      trustScore: 92,
      addresses: {
        create: {
          addressType: 'SHIPPING',
          line1: 'Plot 42, Bandra Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400051',
          country: 'India',
          isPrimary: true
        }
      }
    }
  });

  // 6. Seeding RFQs, Quotes, Orders, Milestones
  console.log('🌱 Seeding RFQs and RFQ Quotes...');

  const rfq = await prisma.rfqRequest.create({
    data: {
      buyerId: buyer.id,
      categoryId: categories['construction'].id,
      rfqType: 'PRODUCT',
      title: 'TMT Steel Rebars - Fe 500D (20 Metric Tons Needed)',
      description: 'Require high-quality corrosion resistant structural rebars for our hotel project in Bandra. Delivery expected in 2 parts. Must share mill test certificate with quote.',
      quantity: 20,
      unitOfMeasure: 'Metric Ton',
      budgetMin: 1000000,
      budgetMax: 1200000,
      status: 'OPEN',
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  });

  // Create Quotes
  const quote = await prisma.rfqQuote.create({
    data: {
      rfqId: rfq.id,
      sellerId: sellers[1].id, // Bharat Steel
      listingId: createdListings[4].id, // Rebars listing
      quotedAmount: 1120000,
      gstRate: 18,
      totalWithGst: 1321600,
      proposalText: 'We submit our lowest FOB price for Fe 500D rebars from our Jamshedpur plant. Certified by BIS with test reports attached.',
      timelineDays: 14,
      paymentTerms: '50% advance, 50% on delivery release',
      status: 'SHORTLISTED',
      milestonePlan: [
        { title: 'Advancement Payment', percentOfTotal: 50, amount: 660800 },
        { title: 'Material Handover & Dispatch', percentOfTotal: 50, amount: 660800 }
      ]
    }
  });

  // 7. Seed an active order with milestones
  console.log('🌱 Seeding Orders & Milestones...');
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      buyerId: buyer.id,
      sellerId: sellers[1].id,
      rfqQuoteId: quote.id,
      orderType: 'PRODUCT',
      status: 'ACTIVE',
      subtotal: 1120000,
      taxAmount: 201600,
      totalAmount: 1321600,
      platformFee: 26432, // 2% platform fee
      sellerPayout: 1295168,
      currency: 'INR',
      escrowStatus: 'HELD',
      paymentStatus: 'PAID',
      milestones: {
        create: [
          {
            title: 'Advance Setup Payment',
            description: '50% payment released to start rolling the steel billets.',
            amount: 660800,
            percentOfTotal: 50,
            status: 'RELEASED',
            sortOrder: 1,
            releasedAt: new Date()
          },
          {
            title: 'Delivery Verification Payment',
            description: 'Remaining 50% released after weighbridge slip upload.',
            amount: 660800,
            percentOfTotal: 50,
            status: 'PENDING',
            sortOrder: 2
          }
        ]
      }
    }
  });

  console.log('🏁 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

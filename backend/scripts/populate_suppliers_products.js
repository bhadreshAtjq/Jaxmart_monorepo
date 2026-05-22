const { PrismaClient, EmployeeRange, KycStatus, UserType, AccountType, ListingType } = require('@prisma/client');
const prisma = new PrismaClient();

const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { city: 'Surat', state: 'Gujarat', pincode: '395001' },
  { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
  { city: 'Vadodara', state: 'Gujarat', pincode: '390001' },
];

const COMPANY_PREFIXES = [
  'Aero', 'Apex', 'Bharat', 'Dynamic', 'Elite', 'Global', 'Hindustan', 'Indo', 'Karan', 'Max',
  'Omega', 'Pioneer', 'Rohan', 'Siddharth', 'Titan', 'United', 'Vardhman', 'Vertex', 'Zenith', 'Supreme',
  'Prime', 'Alpha', 'Delta', 'Sigma', 'Star', 'Vedic', 'Nutan', 'Super', 'Micro', 'Ultra',
  'Mega', 'Infinity', 'Matrix', 'Quantum', 'Optima', 'Precision', 'Navbharat', 'Swastik', 'Royal', 'Crown'
];

const COMPANY_TYPES = [
  'Industries', 'Enterprises', 'Logistics', 'Textiles', 'Electronics', 'Steel', 'Fabrics', 'Engineering',
  'Supplies', 'Machinery', 'Solutions', 'Metals', 'Hardware', 'Chemicals', 'Tools', 'Components', 'Synergy',
  'Products', 'Exports', 'Corporation'
];

const COMPANY_SUFFIXES = [
  'Ltd', 'Pvt Ltd', 'Corp', 'Group', 'Co.', 'Inc.'
];

const FIRST_NAMES = [
  'Amit', 'Rahul', 'Sanjay', 'Rajesh', 'Bhadresh', 'Bhavin', 'Vikram', 'Anil', 'Sunil', 'Vijay',
  'Deepak', 'Sandeep', 'Manoj', 'Karan', 'Arjun', 'Bimal', 'Gaurav', 'Rohan', 'Brijesh', 'Pankaj'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Joshi', 'Mehta', 'Shah', 'Gupta', 'Singh', 'Kumar', 'Verma', 'Mishra',
  'Giri', 'Desai', 'Trivedi', 'Yadav', 'Rao', 'Reddy', 'Nair', 'Pillai', 'Chawla', 'Soni'
];

// Product Templates with accurate high-quality Unsplash image associations
const INDUSTRIAL_PRODUCTS = [
  {
    baseTitle: 'CNC Carbide Milling Inserts',
    desc: 'High precision industrial grade carbide milling inserts for metalworking CNC machinery. Extreme heat resistance and durability.',
    brand: 'Sandvik',
    unit: 'Box',
    minQty: 50,
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Heavy Duty Centrifugal Water Pump',
    desc: 'Cast iron centrifugal water pump with 5HP induction motor. Designed for industrial fluid transfer and irrigation.',
    brand: 'Kirloskar',
    unit: 'Unit',
    minQty: 2,
    price: 28000,
    images: [
      'https://images.unsplash.com/photo-1605847440389-33f0b2f5c721?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Industrial Steel Toe Safety Boots',
    desc: 'CE certified heavy duty safety boots with steel toe cap, puncture resistant sole, and anti-static properties.',
    brand: 'Allen Cooper',
    unit: 'Pair',
    minQty: 100,
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Fiberglass Safety Hard Hat',
    desc: 'High impact resistance industrial safety helmet with adjustable suspension. Standard yellow colour.',
    brand: '3M',
    unit: 'Piece',
    minQty: 200,
    price: 350,
    images: [
      'https://images.unsplash.com/photo-1622743941458-f762c5c16ab6?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'High Pressure Hydraulic Gear Pump',
    desc: 'External gear hydraulic pump with displacement of 22cc/rev. Ideal for machinery and loaders.',
    brand: 'Dowty',
    unit: 'Unit',
    minQty: 5,
    price: 14500,
    images: [
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Stainless Steel Ball Valve (2 inch)',
    desc: 'Full port SS316 ball valve with Teflon seals. Rated for 1000 PSI WOG.',
    brand: 'L&T',
    unit: 'Piece',
    minQty: 20,
    price: 1850,
    images: [
      'https://images.unsplash.com/photo-1605847440389-33f0b2f5c721?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Digital Vernier Caliper (300mm)',
    desc: 'Stainless steel body digital caliper with LCD screen. Precision of 0.01mm.',
    brand: 'Mitutoyo',
    unit: 'Piece',
    minQty: 10,
    price: 8500,
    images: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

const ELECTRONICS_PRODUCTS = [
  {
    baseTitle: 'Monocrystalline Solar Panel 450W',
    desc: 'High efficiency A-grade monocrystalline PERC solar panels. Anti-reflective glass and robust anodized frame.',
    brand: 'Loom Solar',
    unit: 'Unit',
    minQty: 10,
    price: 14000,
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: '4-Core Copper Armoured Cable (100m)',
    desc: 'Heavy duty underground copper armoured power cable, size 16 sq. mm. Flame retardant PVC insulation.',
    brand: 'Polycab',
    unit: 'Roll',
    minQty: 5,
    price: 24500,
    images: [
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Industrial SMPS 24V 10A',
    desc: 'Din-rail mount switched-mode power supply. Short circuit and overload protection. Metal enclosure.',
    brand: 'Mean Well',
    unit: 'Piece',
    minQty: 25,
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Variable Frequency Drive (VFD) 5HP',
    desc: 'AC motor speed controller drive. 3-Phase input/output. Modbus communication enabled.',
    brand: 'Schneider Electric',
    unit: 'Unit',
    minQty: 3,
    price: 18900,
    images: [
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'FR4 Double Sided Copper Clad PCB',
    desc: 'Bulk pack of FR4 double sided printed circuit board base plates. Thickness 1.6mm.',
    brand: 'Generic',
    unit: 'Box',
    minQty: 100,
    price: 4500,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Industrial LED High Bay Light 150W',
    desc: 'IP65 waterproof warehouse LED lighting with 15000 Lumens output. Die-cast aluminium body.',
    brand: 'Syska',
    unit: 'Piece',
    minQty: 10,
    price: 4200,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

const CONSTRUCTION_PRODUCTS = [
  {
    baseTitle: 'TMT Steel Rebar (Fe 550D)',
    desc: 'High tensile strength reinforced steel bars for heavy industrial and commercial RCC construction.',
    brand: 'Tata Tiscon',
    unit: 'Metric Ton',
    minQty: 5,
    price: 64000,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'OPC 53 Grade Premium Cement',
    desc: 'Ordinary Portland Cement 53 grade for high strength structures, foundation concrete, and pre-cast blocks.',
    brand: 'UltraTech',
    unit: 'Bag',
    minQty: 100,
    price: 430,
    images: [
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Natural Granite Slabs (Polished)',
    desc: 'High-grade polished natural white and grey granite slabs for commercial kitchen countertops and tiling.',
    brand: 'Rajasthan Stone',
    unit: 'Square Feet',
    minQty: 500,
    price: 180,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Structural Mild Steel I-Beam (150x75)',
    desc: 'ISMB mild steel hot-rolled I-section beam for structural framework and building columns.',
    brand: 'Jindal Steel',
    unit: 'Piece',
    minQty: 10,
    price: 9800,
    images: [
      'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'AAC Concrete Blocks',
    desc: 'Autoclaved aerated concrete block pallets. Lightweight and excellent thermal insulation properties.',
    brand: 'Birla Aerocon',
    unit: 'Cubic Meter',
    minQty: 20,
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

const TEXTILES_PRODUCTS = [
  {
    baseTitle: 'Combed Cotton Yarn (30s Count)',
    desc: '100% Organic combed cotton yarn roll for weaving and circular knitting. Premium grade ring-spun yarn.',
    brand: 'Vardhman',
    unit: 'Kilogram',
    minQty: 500,
    price: 290,
    images: [
      'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Premium Viscose Fabric Roll (100m)',
    desc: 'Soft and breathable polyester-viscose blended fabric roll. Width 58 inches. Ideal for suiting garments.',
    brand: 'Arvind',
    unit: 'Roll',
    minQty: 10,
    price: 18500,
    images: [
      'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Heavy Duty Jute Gunny Bags',
    desc: 'Standard size 50kg capacity food grade jute sack bags. Durable and breathable for agricultural exports.',
    brand: 'Bengal Jute Mills',
    unit: 'Bundle',
    minQty: 50,
    price: 1500,
    images: [
      'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    baseTitle: 'Industrial PP Woven Sack Rolls',
    desc: 'Unlaminated white PP woven fabric roll. Excellent strength for fertilizer and grain packing.',
    brand: 'PolyPack',
    unit: 'Roll',
    minQty: 2,
    price: 12000,
    images: [
      'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

function generateGstin(pan) {
  const stateCode = '29'; // Karnataka code
  const entityType = '1';
  const checksum = 'Z3';
  return `${stateCode}${pan}${entityType}${checksum}`;
}

function generatePan() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  
  let pan = '';
  for (let i = 0; i < 5; i++) {
    pan += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 4; i++) {
    pan += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  pan += chars.charAt(Math.floor(Math.random() * chars.length));
  return pan;
}

function generatePhone(index) {
  // Generate unique number starting with country code 91
  return `919${String(index).padStart(9, '0')}`;
}

async function runInBatches(items, batchSize, iteratorFn) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(item => iteratorFn(item)));
  }
}

async function run() {
  console.log('🏁 Starting big B2B mock data population...');

  try {
    // 1. Fetch categories
    const industrialCat = await prisma.category.upsert({
      where: { slug: 'industrial-supplies' },
      update: {},
      create: { name: 'Industrial Supplies', slug: 'industrial-supplies', depthLevel: 1 }
    });

    const electronicsCat = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics', depthLevel: 1 }
    });

    const constructionCat = await prisma.category.upsert({
      where: { slug: 'construction' },
      update: {},
      create: { name: 'Construction', slug: 'construction', depthLevel: 1 }
    });

    const textilesCat = await prisma.category.upsert({
      where: { slug: 'textiles' },
      update: {},
      create: { name: 'Textiles', slug: 'textiles', depthLevel: 1 }
    });

    console.log('✅ Categories loaded/created');

    // 2. Clear existing listings and non-admin users to start fresh
    console.log('🗑 Cleaning up existing mock data...');
    // Delete in order of dependencies
    await prisma.review.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.milestone.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.rfqQuote.deleteMany({});
    await prisma.rfqRequest.deleteMany({});
    
    await prisma.listingMedia.deleteMany({});
    await prisma.productDetail.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.businessProfile.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({
      where: { isAdmin: false }
    });
    console.log('✅ Clean-up done');

    // 3. Create 100 suppliers
    console.log('🚀 Creating 100 suppliers in parallel batches...');
    const supplierInputs = Array.from({ length: 100 }, (_, index) => index + 1);
    const suppliers = [];
    
    await runInBatches(supplierInputs, 20, async (i) => {
      const prefix = COMPANY_PREFIXES[Math.floor(Math.random() * COMPANY_PREFIXES.length)];
      const type = COMPANY_TYPES[Math.floor(Math.random() * COMPANY_TYPES.length)];
      const suffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
      
      const pName = `${prefix} ${type} ${suffix}`;
      const businessName = `${pName} (Unit ${i})`;
      
      const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const fullName = `${first} ${last}`;
      
      const phone = generatePhone(i);
      const email = `sales@${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}${i}.com`;
      
      const pan = generatePan();
      const gstin = generateGstin(pan);
      
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const estYear = Math.floor(Math.random() * (2022 - 1995 + 1)) + 1995;
      const empRanges = [EmployeeRange.ONE_TO_TEN, EmployeeRange.ELEVEN_TO_FIFTY, EmployeeRange.FIFTY_ONE_TO_TWO_HUNDRED, EmployeeRange.TWO_HUNDRED_PLUS];
      const empRange = empRanges[Math.floor(Math.random() * empRanges.length)];

      const user = await prisma.user.create({
        data: {
          phone,
          fullName,
          email,
          userType: UserType.SELLER,
          accountType: AccountType.BUSINESS,
          kycStatus: KycStatus.VERIFIED,
          trustScore: Math.floor(Math.random() * (98 - 82 + 1)) + 82,
          businessProfile: {
            create: {
              businessName,
              gstin,
              pan,
              establishedYear: estYear,
              employeeRange: empRange,
              description: `Premium supplier and bulk manufacturer of ${type.toLowerCase()} and industrial-grade supplies. Serving global markets since ${estYear}.`
            }
          },
          addresses: {
            create: {
              line1: `Plot No. ${100 + i}, Industrial Area`,
              line2: `Phase ${Math.floor(Math.random() * 4) + 1}`,
              city: randomCity.city,
              state: randomCity.state,
              pincode: randomCity.pincode,
              country: 'India',
              isPrimary: true
            }
          }
        },
        include: {
          businessProfile: true,
          addresses: true
        }
      });
      
      suppliers.push(user);
    });
    
    console.log(`✅ Successfully created ${suppliers.length} verified B2B suppliers`);

    // 4. Create 300 product listings (split 75 per category)
    console.log('🚀 Creating 300 product listings in parallel batches...');
    const categoriesList = [
      { cat: industrialCat, templates: INDUSTRIAL_PRODUCTS, label: 'Industrial' },
      { cat: electronicsCat, templates: ELECTRONICS_PRODUCTS, label: 'Electronics' },
      { cat: constructionCat, templates: CONSTRUCTION_PRODUCTS, label: 'Construction' },
      { cat: textilesCat, templates: TEXTILES_PRODUCTS, label: 'Textiles' }
    ];

    const listingInputs = [];
    for (const catObj of categoriesList) {
      for (let j = 1; j <= 75; j++) {
        listingInputs.push({ catObj, j });
      }
    }

    let listingCount = 0;
    await runInBatches(listingInputs, 20, async ({ catObj, j }) => {
      const template = catObj.templates[Math.floor(Math.random() * catObj.templates.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      const variations = ['Heavy Duty', 'Premium', 'Special Grade', 'Standard', 'Custom Size', 'Export Quality'];
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const title = `${variation} ${template.baseTitle} - Batch #${1000 + j}`;
      
      const priceModifier = 0.85 + Math.random() * 0.3; // 85% to 115% of base price
      const pricePerUnit = Math.round(template.price * priceModifier);
      
      const imageUrl = template.images[Math.floor(Math.random() * template.images.length)];
      
      const specs = {
        Model: `JX-${catObj.label.substring(0,3).toUpperCase()}-${100 + j}`,
        Material: catObj.label === 'Textiles' ? 'Cotton / Blend' : 'Hardened Steel / Composite',
        Weight: `${Math.floor(Math.random() * 45) + 5} kg`,
        Dimensions: `${10 * (Math.floor(Math.random() * 5) + 1)}x${10 * (Math.floor(Math.random() * 5) + 1)}x${10 * (Math.floor(Math.random() * 5) + 1)} cm`
      };

      const address = supplier.addresses[0];

      await prisma.listing.create({
        data: {
          sellerId: supplier.id,
          categoryId: catObj.cat.id,
          locationId: address.id,
          listingType: ListingType.PRODUCT,
          title,
          description: `${template.desc} Manufactured with export-grade Quality Standards by ${supplier.businessProfile.businessName}. Includes 1 year manufacture warranty.`,
          status: 'ACTIVE',
          isFeatured: Math.random() > 0.85, // 15% are featured
          media: {
            create: {
              url: imageUrl,
              isPrimary: true
            }
          },
          productDetail: {
            create: {
              brand: template.brand,
              sku: `SKU-${catObj.label.substring(0,3).toUpperCase()}-${supplier.fullName.substring(0,3).toUpperCase()}-${j}`,
              unitOfMeasure: template.unit,
              minOrderQty: template.minQty,
              pricePerUnit,
              stockAvailable: true,
              hsnCode: String(Math.floor(Math.random() * (900000 - 100000 + 1)) + 100000),
              gstRate: Math.random() > 0.5 ? 18.0 : 12.0,
              specifications: specs,
              countryOfOrigin: 'India',
              supplyAbility: `50,000 ${template.unit} per Month`,
              deliveryTime: `${Math.random() > 0.5 ? 15 : 20} days after payment confirmed`,
              packagingDetails: 'Standard export carton / Custom packaging available',
              paymentTerms: 'T/T, L/C, Escrow via JaxMart',
              fobPort: Math.random() > 0.5 ? 'Mundra, India' : 'Nhava Sheva, India',
              smallOrders: 'Accepted'
            }
          }
        }
      });
      
      listingCount++;
    });

    console.log(`✅ Successfully created ${listingCount} product listings in database!`);
    console.log('🏁 Large B2B seed completed successfully.');

  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();

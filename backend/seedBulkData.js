const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting optimized bulk data seeding (300 products + 15 sellers)...');

  // 1. Fetch categories to link
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('❌ No categories found. Please run regular seeding first.');
    process.exit(1);
  }

  // 2. Define 15 premium mock sellers/companies
  const companyNames = [
    'Apex Industrial Solutions',
    'Bharat Steel & Alloys',
    'Deccan Textiles Ltd',
    'Gujarat Polymers & Chemicals',
    'Indo-Aryan Engineering',
    'Konkan Agro Processing',
    'Mundra Logistics & Sourcing',
    'Narmada Electronics',
    'Panipat Weavers Coop',
    'Sahyadri Hardware & Tools',
    'Vindhya Solar Tech',
    'Ganges Paper & Packaging',
    'Malabar Spices & Goods',
    'Yamuna Metal Castings',
    'Coromandel Marine Supplies'
  ];

  const sellers = [];
  for (let i = 0; i < companyNames.length; i++) {
    const name = companyNames[i];
    const phone = `91987654321${i.toString(16)}`; // Unique phone
    const email = `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    // Clean up existing listings for this seller if any to avoid duplicates
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      include: { listings: true }
    });

    if (existingUser) {
      console.log(`🧹 Cleaning old listings for ${name}...`);
      await prisma.listing.deleteMany({
        where: { sellerId: existingUser.id }
      });
    }

    const seller = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        fullName: `${name} Representative`,
        email,
        userType: 'SELLER',
        accountType: 'BUSINESS',
        kycStatus: 'VERIFIED',
        businessProfile: {
          create: {
            businessName: name,
            gstin: `29${Math.random().toString(36).substring(2, 12).toUpperCase()}1Z5`,
            description: `Leading supplier of premium B2B products. Specializing in ${name.split(' ')[1]} and bulk export operations across global markets.`,
          }
        }
      }
    });
    sellers.push(seller);
  }
  console.log(`✅ Seeded/Cleaned ${sellers.length} mock sellers/companies`);

  // 3. Define product templates and images by category
  const unsplashImages = {
    'industrial-supplies': [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800'
    ],
    'electronics': [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=800'
    ],
    'construction': [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=800'
    ],
    'textiles': [
      'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576016770956-debb63d900ce?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=800'
    ],
    'services': [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1521791136368-1a869372658b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
    ]
  };

  const productNamesByCategory = {
    'industrial-supplies': [
      'Hydraulic Control Valve', 'Pneumatic Actuator', 'Industrial Gearbox 5HP',
      'Stainless Steel Flange', 'Electric Induction Motor', 'High-Pressure Hose Reel',
      'Laser Alignment System', 'Heavy Duty Caster Wheels', 'CNC Milling Tool Holder',
      'Precision Pressure Gauge', 'Industrial Ventilation Fan', 'Automatic Lubrication Pump',
      'Tungsten Carbide Drill Bit', 'Welding Transformer 400A', 'Thermal Imaging Camera'
    ],
    'electronics': [
      'Monocrystalline Solar Panel 400W', 'Lithium LiFePO4 Battery Pack', 'Industrial PCB Controller',
      'Step-Down Voltage Regulator', 'LED Driver Waterproof 150W', 'Ethernet Switch Gigabit 24-Port',
      'Digital Signal Processor', 'AC-DC Power Supply 24V', 'Uninterruptible Power Supply (UPS)',
      'Solid State Relay 40A', 'Brushless DC Motor Controller', 'Modbus Gateway RTU',
      'Fiber Optic Transceiver', 'Flexible Flat Cable (FFC)', 'High-Frequency Inductor Coils'
    ],
    'construction': [
      'Reinforced Steel Rebar TMT 500D', 'Portland Cement Grade 53', 'Precast Concrete Blocks',
      'High-Tensile Structural Beams', 'Waterproof Membrane Rolls', 'Scaffolding Couplers Steel',
      'Acoustic Ceiling Tiles', 'Toughened Safety Glass Sheets', 'Geotextile Drainage Fabric',
      'Epoxy Floor Coating kit', 'Drywall Gypsum Boards', 'Asphalt Shingle Tiles',
      'PVC Conduit Pipe Bulk', 'Heavy Duty Expansion Bolts', 'Aluminum Window Extrusions'
    ],
    'textiles': [
      'Organic Combed Cotton Yarn', 'Polyester Spun Sewing Thread', 'Bleached Cotton Canvas Fabric',
      'Denim Fabric Roll 12oz', 'Rayon Viscose Filament Yarn', 'Nylon Taffeta Fabric',
      'Knitted Rib Fabric Spandex', 'Jacquard Weave Fabric', 'Recycled Polyester Fiber',
      'Woolen Felt Sheets', 'Embroidered Lace Border Rolls', 'Elastic Waistband Bands',
      'Pure Silk Yarn Skeins', 'Microfiber Towel Fabric', 'Linen Blend Fabric Weave'
    ],
    'services': [
      'ISO 9001 Auditing & Certification', 'Custom Software Development', 'Industrial Design & Prototyping',
      'Supply Chain Logistics Consulting', 'Corporate Tax Advisory Services', 'Environmental Impact Assessment',
      'B2B Digital Marketing Campaign', 'Translation & Localization Service', 'Warehouse Management Setup',
      'Patent Drafting & Filing Services', 'UI/UX Design Consultation', 'Corporate Team Building Events',
      'Customs Brokerage & Clearance', 'Renewable Energy Feasibility Study', 'Cybersecurity Vulnerability Audit'
    ]
  };

  // Build the list of all listings to create
  const listingsToCreate = [];

  for (let sIndex = 0; sIndex < sellers.length; sIndex++) {
    const seller = sellers[sIndex];

    for (let pIndex = 0; pIndex < 20; pIndex++) {
      const category = categories[pIndex % categories.length];
      const categorySlug = category.slug;

      const nameList = productNamesByCategory[categorySlug] || productNamesByCategory['industrial-supplies'];
      const baseName = nameList[pIndex % nameList.length];

      const title = `${baseName} - Batch #${sIndex * 20 + pIndex + 1}`;
      const imageList = unsplashImages[categorySlug] || unsplashImages['industrial-supplies'];
      const image = imageList[pIndex % imageList.length];

      const minQty = Math.floor(Math.random() * 50) + 10;
      const price = Math.floor(Math.random() * 1500) + 50;

      const modelNum = `JM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const description = `### Product Information
- **Brand Name**: OEM/ODM
- **Model Number**: ${modelNum}
- **Place of Origin**: India
- **Min. Order Quantity**: ${minQty} UNIT
- **Supply Ability**: 50,000 UNIT per Month
- **Delivery Time**: 15 days after payment confirmed
- **Packaging Details**: Standard export carton / Custom packaging available
- **Payment Terms**: T/T, L/C, Escrow via JaxMart
- **FOB Port**: Mundra / Nhava Sheva, India
- **Small Orders**: Accepted

### Key Specifications / Special Features
- **Material**: 100% Organic Cotton / Polyester blend / Industrial grade alloys
- **Weight**: 180-240 GSM / Standard Industrial Weight
- **Customization**: Custom dyeing, printing & labeling / Engineering customization
- **Packaging**: Standard roll packing / Box packing

### Product Description
Premium quality ${baseName.toLowerCase()} manufactured in state-of-the-art facilities in India. Perfect for wholesale procurement, factories, and global export buyers.

### Shipping Information
- **FOB Port**: Mundra / Nhava Sheva
- **Lead Time**: 15 days
- **Express**: Air freight available
- **Packaging**: Export carton + custom branding

### Main Export Markets
- **South & East Asia**: 65%
- **Middle East & Africa**: 15%
- **Western Europe**: 10%
- **North America**: 7%
- **Others**: 3%`;

      listingsToCreate.push({
        title,
        description,
        listingType: 'PRODUCT',
        status: 'ACTIVE',
        sellerId: seller.id,
        categoryId: category.id,
        image,
        productDetail: {
          brand: 'OEM/ODM',
          sku: `${modelNum}-${sIndex}-${pIndex}`,
          unitOfMeasure: 'UNIT',
          minOrderQty: minQty,
          pricePerUnit: price,
          stockAvailable: true,
        }
      });
    }
  }

  // Create listings concurrently in batches of 20 to avoid database connection exhaustion
  const batchSize = 25;
  console.log(`🚀 Bulk inserting ${listingsToCreate.length} listings in batches of ${batchSize}...`);

  for (let i = 0; i < listingsToCreate.length; i += batchSize) {
    const batch = listingsToCreate.slice(i, i + batchSize);
    console.log(`⚡ Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listingsToCreate.length / batchSize)}...`);

    await Promise.all(
      batch.map((p) =>
        prisma.listing.create({
          data: {
            title: p.title,
            description: p.description,
            listingType: p.listingType,
            status: p.status,
            sellerId: p.sellerId,
            categoryId: p.categoryId,
            media: {
              create: {
                url: p.image,
                isPrimary: true,
              }
            },
            productDetail: {
              create: p.productDetail
            }
          }
        })
      )
    );
  }

  console.log(`\n🎉 Successfully seeded ${listingsToCreate.length} B2B products across 15 bulk companies!`);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});

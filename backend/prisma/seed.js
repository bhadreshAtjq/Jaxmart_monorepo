const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

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
  const sellerPhone = '9998887776';
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

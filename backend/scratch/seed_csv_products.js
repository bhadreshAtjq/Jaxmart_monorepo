const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleImages = {
  'Industrial Heavy Duty Drill Press': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=800',
  'Bulk Solar Panels - 400W': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800',
  'Industrial Grade Steel Plate': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
  'Copper Wiring Kit (100m)': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
  'Bulk Cotton Fabric - Unbleached': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
  'Precision Ball Bearings': 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=800',
  'Refined Soy Oil (Bulk)': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
  'Reinforced Concrete Rebars': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
  'Wholesale Cotton Yarn': 'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800',
};

async function main() {
  const seller = await prisma.user.findFirst({ where: { userType: 'SELLER' } });
  if (!seller) {
    console.error('No seller found!');
    return;
  }

  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

  const defaultCatId = categories[0]?.id;

  const productsToSeed = [
    { title: 'Industrial Grade Steel Plate', brand: 'Tata Steel', price: 45000, unit: 'Metric Ton', moq: 5, category: 'construction', img: sampleImages['Industrial Grade Steel Plate'] },
    { title: 'Copper Wiring Kit (100m)', brand: 'Havells', price: 1200, unit: 'Roll', moq: 50, category: 'electronics', img: sampleImages['Copper Wiring Kit (100m)'] },
    { title: 'Bulk Cotton Fabric - Unbleached', brand: 'Vardhman', price: 85, unit: 'Meter', moq: 1000, category: 'textiles', img: sampleImages['Bulk Cotton Fabric - Unbleached'] },
    { title: 'Precision Ball Bearings', brand: 'SKF', price: 450, unit: 'Piece', moq: 100, category: 'industrial supplies', img: sampleImages['Precision Ball Bearings'] },
    { title: 'Refined Soy Oil (Bulk)', brand: 'Fortune', price: 110, unit: 'Litre', moq: 500, category: 'services', img: sampleImages['Refined Soy Oil (Bulk)'] },
  ];

  for (const p of productsToSeed) {
    const catId = catMap.get(p.category) || defaultCatId;
    
    // Check if exists
    const existing = await prisma.listing.findFirst({ where: { title: p.title } });
    if (!existing) {
      const listing = await prisma.listing.create({
        data: {
          title: p.title,
          description: `${p.title} manufactured by ${p.brand}. Premium quality industrial grade product.`,
          listingType: 'PRODUCT',
          status: 'ACTIVE',
          sellerId: seller.id,
          categoryId: catId,
          media: {
            create: {
              url: p.img,
              isPrimary: true,
            }
          },
          productDetail: {
            create: {
              brand: p.brand,
              pricePerUnit: p.price,
              unitOfMeasure: p.unit,
              minOrderQty: p.moq,
              stockAvailable: true,
            }
          }
        }
      });
      console.log(`Seeded: ${listing.title}`);
    } else {
      console.log(`Already exists: ${p.title}`);
    }
  }
}

main().finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updatedProducts = [
  {
    oldTitle: 'Copper Wiring Kit (100m)',
    newTitle: '240W fast charging braided USB-C data cable',
    price: 180,
    unit: 'Pieces',
    moq: 100,
    img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Bulk Solar Panels - 400W',
    newTitle: 'New Module Street Light Housing',
    price: 5800,
    unit: 'Pieces',
    moq: 1000,
    img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Industrial Heavy Duty Drill Press',
    newTitle: 'Smartwatches with Advanced Features',
    price: 275,
    unit: 'Pieces',
    moq: 1000,
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Refined Soy Oil (Bulk)',
    newTitle: 'USB humidifier, made of ABS, customized',
    price: 220,
    unit: 'Pieces',
    moq: 100,
    img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Precision Ball Bearings',
    newTitle: 'New Arrival Hotel Restaurant Food Delivery Robot',
    price: 310000,
    unit: 'Pieces',
    moq: 10,
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Bulk Cotton Fabric - Unbleached',
    newTitle: 'High drain power 3.7V lithium ion battery',
    price: 120,
    unit: 'Pieces',
    moq: 100,
    img: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Wholesale Cotton Yarn',
    newTitle: 'Transparent food grade silicone tube',
    price: 140,
    unit: 'Piece',
    moq: 1,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800'
  },
  {
    oldTitle: 'Reinforced Concrete Rebars',
    newTitle: 'Autonomous Food Delivery Robot with LiDAR',
    price: 210000,
    unit: 'Piece',
    moq: 1,
    img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800'
  }
];

async function main() {
  for (const item of updatedProducts) {
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [
          { title: { contains: item.oldTitle } },
          { title: { contains: item.newTitle } }
        ]
      },
      include: { media: true, productDetail: true }
    });

    if (listing) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          title: item.newTitle,
          productDetail: {
            update: {
              pricePerUnit: item.price,
              unitOfMeasure: item.unit,
              minOrderQty: item.moq
            }
          }
        }
      });

      if (listing.media.length > 0) {
        await prisma.listingMedia.update({
          where: { id: listing.media[0].id },
          data: { url: item.img }
        });
      } else {
        await prisma.listingMedia.create({
          data: {
            listingId: listing.id,
            url: item.img,
            isPrimary: true
          }
        });
      }
      console.log(`Updated listing: ${item.newTitle}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

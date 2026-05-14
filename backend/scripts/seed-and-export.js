
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function seedAndExport() {
  try {
    // 1. Get or Create Category
    let category = await prisma.category.findFirst({ where: { slug: 'electronics' } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Electronics', slug: 'electronics', depthLevel: 1 }
      });
    }

    // 2. Get Seller
    const seller = await prisma.user.findFirst({ where: { isAdmin: true } });
    if (!seller) {
      console.error("No admin user found to act as seller. Please create an admin first.");
      return;
    }

    // 3. Create Dummy Products
    const dummyProducts = [
      {
        title: "Industrial Grade Steel Plate",
        description: "High-strength structural steel plate for heavy construction and manufacturing.",
        brand: "Tata Steel",
        price: 45000,
        unit: "Metric Ton",
        minOrder: 5,
        categoryName: "Construction"
      },
      {
        title: "Copper Wiring Kit (100m)",
        description: "Standard industrial copper wiring for electrical installations.",
        brand: "Havells",
        price: 1200,
        unit: "Roll",
        minOrder: 50,
        categoryName: "Electronics"
      },
      {
        title: "Bulk Cotton Fabric - Unbleached",
        description: "Premium raw cotton fabric for textile manufacturing.",
        brand: "Vardhman",
        price: 85,
        unit: "Meter",
        minOrder: 1000,
        categoryName: "Textiles"
      },
      {
        title: "Precision Ball Bearings",
        description: "High-precision ball bearings for CNC machinery.",
        brand: "SKF",
        price: 450,
        unit: "Piece",
        minOrder: 100,
        categoryName: "Industrial"
      },
      {
        title: "Refined Soy Oil (Bulk)",
        description: "FSSAI certified refined soybean oil for food processing.",
        brand: "Fortune",
        price: 110,
        unit: "Litre",
        minOrder: 500,
        categoryName: "FMCG"
      }
    ];

    console.log("Creating dummy products in database...");

    for (const p of dummyProducts) {
      let cat = await prisma.category.findFirst({ where: { name: p.categoryName } });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: p.categoryName, slug: p.categoryName.toLowerCase(), depthLevel: 1 }
        });
      }

      await prisma.listing.create({
        data: {
          title: p.title,
          description: p.description,
          listingType: 'PRODUCT',
          status: 'ACTIVE',
          sellerId: seller.id,
          categoryId: cat.id,
          productDetail: {
            create: {
              brand: p.brand,
              pricePerUnit: p.price,
              unitOfMeasure: p.unit,
              minOrderQty: p.minOrder,
              stockAvailable: true
            }
          }
        }
      });
    }

    // 4. Export all products to CSV
    console.log("Exporting to CSV...");
    const listings = await prisma.listing.findMany({
      where: { listingType: 'PRODUCT' },
      include: {
        productDetail: true,
        seller: true,
        category: true
      }
    });

    const headers = [
      'ID', 'Title', 'Brand', 'Price', 'Unit', 'Min Order Qty', 
      'Category', 'Seller Name', 'Seller Phone', 'Status'
    ];

    const rows = listings.map(l => [
      l.id,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${(l.productDetail?.brand || '').replace(/"/g, '""')}"`,
      l.productDetail?.pricePerUnit || 'N/A',
      l.productDetail?.unitOfMeasure || 'N/A',
      l.productDetail?.minOrderQty || 1,
      `"${l.category.name.replace(/"/g, '""')}"`,
      `"${l.seller.fullName.replace(/"/g, '""')}"`,
      l.seller.phone,
      l.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const filePath = path.join(process.cwd(), 'products_export.csv');
    
    fs.writeFileSync(filePath, csvContent);
    console.log(`Successfully seeded products and exported to ${filePath}`);

  } catch (err) {
    console.error("Script failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAndExport();


const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportProductsToCsv() {
  try {
    const listings = await prisma.listing.findMany({
      where: { listingType: 'PRODUCT' },
      include: {
        productDetail: true,
        seller: true,
        category: true
      }
    });

    if (listings.length === 0) {
      console.log("No products found to export.");
      return;
    }

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
    console.log(`Successfully exported ${listings.length} products to ${filePath}`);
    
  } catch (error) {
    console.error("Export error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportProductsToCsv();

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to calculate a stable hash code for string mapping
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

// Track phone numbers and emails to avoid DB unique constraint failures
const companyPhoneMap = new Map();
const sellerPhoneIdMap = new Map(); // Global map of phone -> id
const companyEmailMap = new Map();

function getUniquePhoneForCompany(companyName, contact) {
  if (companyPhoneMap.has(companyName)) {
    return companyPhoneMap.get(companyName);
  }

  let basePhone = '';
  if (contact && contact !== 'NA' && contact !== '-' && contact.trim().length > 0) {
    const digits = contact.replace(/\D/g, '');
    if (digits.length >= 10) {
      basePhone = '91' + digits.slice(-10);
    }
  }

  if (!basePhone) {
    const hash = Math.abs(hashCode(companyName)).toString().padEnd(10, '0').slice(0, 10);
    basePhone = '91' + hash;
  }

  let finalPhone = basePhone;
  let attempt = 0;
  while (sellerPhoneIdMap.has(finalPhone)) {
    attempt++;
    const suffix = attempt.toString();
    finalPhone = basePhone.slice(0, -suffix.length) + suffix;
  }

  companyPhoneMap.set(companyName, finalPhone);
  return finalPhone;
}

function getUniqueEmailForCompany(companyName, emailField, phone) {
  if (companyEmailMap.has(companyName)) {
    return companyEmailMap.get(companyName);
  }

  let baseEmail = '';
  if (emailField && emailField !== 'NA' && emailField !== '-' && emailField.includes('@')) {
    baseEmail = emailField.trim().toLowerCase();
  } else {
    const cleanComp = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    baseEmail = `contact@${cleanComp || 'unknown'}.com`;
  }

  const parts = baseEmail.split('@');
  const cleanPhone = phone.replace(/\D/g, '').slice(-6);
  const finalEmail = `${parts[0]}_${cleanPhone}@${parts[1]}`;

  companyEmailMap.set(companyName, finalEmail);
  return finalEmail;
}

// Robust CSV Line parser to handle fields containing commas in quotes
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse Price string to decimal value
function parsePrice(priceStr) {
  if (!priceStr || priceStr.toLowerCase().includes('ask') || priceStr.includes('-') || priceStr.toLowerCase().includes('n/a')) {
    return { priceType: 'ON_REQUEST', pricePerUnit: null };
  }
  const digits = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(digits);
  if (!isNaN(parsed) && parsed > 0) {
    return { priceType: 'FIXED', pricePerUnit: parsed };
  }
  return { priceType: 'ON_REQUEST', pricePerUnit: null };
}

// Parse MOQ / Unit of measure
function parseUnitOfMeasure(moqStr) {
  if (!moqStr || moqStr === 'N/A' || moqStr === '-') {
    return 'Piece';
  }
  const cleanStr = moqStr.toLowerCase();
  if (cleanStr.includes('piece')) return 'Piece';
  if (cleanStr.includes('meter')) return 'Meter';
  if (cleanStr.includes('box')) return 'Box';
  if (cleanStr.includes('kg')) return 'Kg';
  return 'Piece';
}

async function main() {
  console.log('🌱 Starting optimized import of Textile CSV products...');

  const csvPath = path.join(__dirname, '..', 'textiles_products (2) - textiles_products (2).csv.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at path: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📖 Loading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length <= 1) {
    console.error('❌ Empty CSV file or header only.');
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]);
  console.log(`📊 Found ${lines.length - 1} rows with headers:`, headers.join(', '));

  // 1. Setup Category root ("Textiles")
  let rootTextiles = await prisma.category.findUnique({ where: { slug: 'textiles' } });
  if (!rootTextiles) {
    rootTextiles = await prisma.category.create({
      data: {
        name: 'Textiles',
        slug: 'textiles',
        applicableType: 'PRODUCT',
        depthLevel: 1,
        isActive: true
      }
    });
  }

  // 2. Pre-load all Categories and Sellers into memory to optimize round-trips
  console.log('🔍 Pre-loading categories and sellers for in-memory cache...');
  
  const categoryIdMap = new Map();
  const allCategories = await prisma.category.findMany({ select: { id: true, slug: true } });
  for (const c of allCategories) {
    categoryIdMap.set(c.slug, c.id);
  }

  const allUsers = await prisma.user.findMany({
    where: { userType: 'SELLER' },
    select: { id: true, phone: true }
  });
  for (const u of allUsers) {
    sellerPhoneIdMap.set(u.phone, u.id);
  }

  const sellerIdMap = new Map();
  const sellersWithProfiles = await prisma.user.findMany({
    where: { userType: 'SELLER' },
    include: { businessProfile: true }
  });
  for (const s of sellersWithProfiles) {
    if (s.businessProfile) {
      sellerIdMap.set(s.businessProfile.businessName, s.id);
    }
  }

  const listingsToCreate = [];
  const uniqueListingKeys = new Set();

  console.log('🔄 Parsing CSV rows & resolving relations in-memory...');
  for (let idx = 1; idx < lines.length; idx++) {
    const row = parseCSVLine(lines[idx]);
    if (row.length < 10) continue;

    const categoryName = row[0];
    const subcategoryName = row[1];
    const productName = row[3];
    const companyName = row[4];
    const priceStr = row[5];
    const moqStr = row[6];
    const contact = row[7];
    const emailField = row[8];
    const website = row[9];
    const location = row[10];
    const imageUrl = row[13];
    const productDesc = row[15] || productName;

    if (!productName || !companyName) continue;

    const listingKey = `${productName.toLowerCase()}_${companyName.toLowerCase()}`;
    if (uniqueListingKeys.has(listingKey)) continue;
    uniqueListingKeys.add(listingKey);

    // Resolve Category Level 2
    const subCatSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let subCatId = categoryIdMap.get(subCatSlug);
    if (!subCatId) {
      const subCat = await prisma.category.create({
        data: {
          name: categoryName,
          slug: subCatSlug,
          parentId: rootTextiles.id,
          applicableType: 'PRODUCT',
          depthLevel: 2,
          isActive: true
        }
      });
      subCatId = subCat.id;
      categoryIdMap.set(subCatSlug, subCatId);
    }

    // Resolve Category Level 3
    const leafCatSlug = subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let leafCatId = categoryIdMap.get(leafCatSlug);
    if (!leafCatId) {
      const leafCat = await prisma.category.create({
        data: {
          name: subcategoryName,
          slug: leafCatSlug,
          parentId: subCatId,
          applicableType: 'PRODUCT',
          depthLevel: 3,
          isActive: true
        }
      });
      leafCatId = leafCat.id;
      categoryIdMap.set(leafCatSlug, leafCatId);
    }

    // Resolve Seller
    let sellerId = sellerIdMap.get(companyName);
    if (!sellerId) {
      const phone = getUniquePhoneForCompany(companyName, contact);
      const email = getUniqueEmailForCompany(companyName, emailField, phone);

      if (!sellerPhoneIdMap.has(phone)) {
        const dbUser = await prisma.user.create({
          data: {
            phone,
            fullName: `${companyName} Representative`,
            email,
            userType: 'SELLER',
            accountType: 'BUSINESS',
            kycStatus: 'VERIFIED',
            businessProfile: {
              create: {
                businessName: companyName,
                website: website !== 'NA' ? website : null,
                description: `Verified wholesale B2B supplier of quality textile and apparel goods based in ${location}.`,
                gstin: `29${Math.random().toString(36).substring(2, 12).toUpperCase()}1Z5`,
              }
            },
            addresses: {
              create: {
                addressType: 'PRIMARY',
                line1: location || 'India',
                city: location || 'India',
                state: 'Gujarat',
                pincode: '360001',
                country: 'India',
                isPrimary: true
              }
            }
          }
        });
        sellerId = dbUser.id;
        sellerPhoneIdMap.set(phone, sellerId);
      } else {
        sellerId = sellerPhoneIdMap.get(phone);
      }
      sellerIdMap.set(companyName, sellerId);
    }

    const { priceType, pricePerUnit } = parsePrice(priceStr);
    const unitOfMeasure = parseUnitOfMeasure(moqStr);
    const modelNum = `JM-TXT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    listingsToCreate.push({
      title: productName,
      description: productDesc,
      listingType: 'PRODUCT',
      status: 'ACTIVE',
      sellerId,
      categoryId: leafCatId,
      image: imageUrl && imageUrl !== 'NA' ? imageUrl : 'https://images.unsplash.com/photo-1528476513691-07e6f563d97f?auto=format&fit=crop&q=80&w=800',
      productDetail: {
        brand: companyName,
        sku: `${modelNum}-${idx}`,
        unitOfMeasure,
        minOrderQty: 10,
        priceType,
        pricePerUnit,
        stockAvailable: true,
      }
    });
  }

  console.log(`✅ Loaded and parsed ${listingsToCreate.length} unique B2B textile products.`);

  // 3. Batch Create listings
  const batchSize = 30;
  console.log(`🚀 Inserting ${listingsToCreate.length} listings in database in batches of ${batchSize}...`);

  for (let i = 0; i < listingsToCreate.length; i += batchSize) {
    const batch = listingsToCreate.slice(i, i + batchSize);
    console.log(`⚡ Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listingsToCreate.length / batchSize)}...`);

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

  console.log(`\n🎉 Import completed successfully! Added ${listingsToCreate.length} textile products.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Importing failed:', e);
  process.exit(1);
});

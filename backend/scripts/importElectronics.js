const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to calculate stable hash code for string mapping
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
  if (contact && contact !== 'NA' && contact !== '-' && String(contact).trim().length > 0) {
    const digits = String(contact).replace(/\D/g, '');
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
  if (emailField && emailField !== 'NA' && emailField !== '-' && emailField !== 'CLOSE' && String(emailField).includes('@')) {
    baseEmail = String(emailField).trim().toLowerCase();
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

// Parse Price string to decimal value
function parsePrice(priceStr) {
  if (!priceStr) {
    return { priceType: 'ON_REQUEST', pricePerUnit: null };
  }
  const cleanPrice = String(priceStr).toLowerCase();
  if (cleanPrice.includes('ask') || cleanPrice.includes('-') || cleanPrice.includes('n/a')) {
    return { priceType: 'ON_REQUEST', pricePerUnit: null };
  }
  const digits = String(priceStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(digits);
  if (!isNaN(parsed) && parsed > 0) {
    return { priceType: 'FIXED', pricePerUnit: parsed };
  }
  return { priceType: 'ON_REQUEST', pricePerUnit: null };
}

// Parse MOQ / Unit of measure
function parseUnitOfMeasure(moqStr) {
  if (!moqStr) {
    return 'Piece';
  }
  const cleanStr = String(moqStr).toLowerCase();
  if (cleanStr.includes('piece')) return 'Piece';
  if (cleanStr.includes('meter')) return 'Meter';
  if (cleanStr.includes('box')) return 'Box';
  if (cleanStr.includes('kg')) return 'Kg';
  return 'Piece';
}

async function main() {
  console.log('🌱 Starting optimized import of Electronics Excel products...');

  const excelPath = path.join(__dirname, '..', '..', 'electronics_READY (2) (1) (Recovered).xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel File not found at path: ${excelPath}`);
    process.exit(1);
  }

  console.log(`📖 Loading Excel from: ${excelPath}`);
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`📊 Found ${rows.length} rows in sheet: ${sheetName}`);

  // 1. Setup Category root ("Electronics")
  let rootElectronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  if (!rootElectronics) {
    rootElectronics = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
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

  console.log('🔄 Parsing Excel rows & resolving relations in-memory...');
  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];

    const categoryName = row['Category'];
    const subcategoryName = row['Subcategory'];
    const productName = row['Product Name'];
    const companyName = row['Company Name'];
    const priceStr = row['Price'];
    const moqStr = row['MOQ'];
    const contact = row['Phone Number '];
    const emailField = row['email'];
    const website = row['website'];
    const location = row['Location'];
    const imageUrl = row['Image URL'];

    if (!productName || !companyName || !categoryName || !subcategoryName) {
      continue;
    }

    const listingKey = `${String(productName).toLowerCase()}_${String(companyName).toLowerCase()}`;
    if (uniqueListingKeys.has(listingKey)) continue;
    uniqueListingKeys.add(listingKey);

    // Resolve Category Level 2
    const subCatSlug = String(categoryName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let subCatId = categoryIdMap.get(subCatSlug);
    if (!subCatId) {
      const subCat = await prisma.category.create({
        data: {
          name: String(categoryName),
          slug: subCatSlug,
          parentId: rootElectronics.id,
          applicableType: 'PRODUCT',
          depthLevel: 2,
          isActive: true
        }
      });
      subCatId = subCat.id;
      categoryIdMap.set(subCatSlug, subCatId);
    }

    // Resolve Category Level 3
    const leafCatSlug = String(subcategoryName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let leafCatId = categoryIdMap.get(leafCatSlug);
    if (!leafCatId) {
      const leafCat = await prisma.category.create({
        data: {
          name: String(subcategoryName),
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
                website: website !== 'NA' && website !== 'Close' ? String(website) : null,
                description: `Verified B2B wholesale distributor of quality electronics, networking, and technology goods based in ${location}.`,
                gstin: `29${Math.random().toString(36).substring(2, 12).toUpperCase()}1Z5`,
              }
            },
            addresses: {
              create: {
                addressType: 'PRIMARY',
                line1: location !== 'N/A' ? String(location) : 'India',
                city: location !== 'N/A' ? String(location) : 'India',
                state: 'Gujarat',
                pincode: '380001',
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
    const modelNum = `JM-ELC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    listingsToCreate.push({
      title: String(productName),
      description: String(productName),
      listingType: 'PRODUCT',
      status: 'ACTIVE',
      sellerId,
      categoryId: leafCatId,
      image: imageUrl && imageUrl !== 'NA' ? String(imageUrl) : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
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

  console.log(`✅ Loaded and parsed ${listingsToCreate.length} unique B2B electronics products.`);

  // 3. Batch Create listings
  const batchSize = 30;
  console.log(`🚀 Inserting ${listingsToCreate.length} listings in database in batches of ${batchSize}...`);

  for (let i = 0; i < listingsToCreate.length; i += batchSize) {
    const batch = listingsToCreate.slice(i, i + batchSize);
    console.log('⚡ Inserting batch ' + (Math.floor(i / batchSize) + 1) + '/' + Math.ceil(listingsToCreate.length / batchSize) + '...');

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

  console.log(`\n🎉 Import completed successfully! Added ${listingsToCreate.length} electronics products.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Importing failed:', e);
  process.exit(1);
});

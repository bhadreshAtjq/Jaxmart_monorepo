const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { signListingMedia } = require('../utils/s3');

// Common English conversational stop words & B2B procurement filler words
const B2B_STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'he', 'him', 'she', 'her', 'it', 'they',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and',
  'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now',
  // B2B intent filler phrases
  'want', 'need', 'needs', 'needed', 'looking', 'look', 'seeking', 'seek', 'require', 'required', 'requirements',
  'requirement', 'find', 'searching', 'search', 'get', 'give', 'buy', 'purchase', 'sourcing', 'source', 'procure',
  'procurement', 'please', 'can', 'cheap', 'best', 'good', 'quality', 'rate', 'rates', 'price', 'prices',
  'wholesale', 'bulk', 'supplier', 'suppliers', 'vendor', 'vendors', 'manufacturer', 'manufacturers', 'factory',
  'factories', 'dealer', 'dealers', 'distributor', 'distributors', 'exporter', 'exporters', 'trader', 'traders',
  'available', 'ready', 'stock', 'urgent', 'urgently', 'lot', 'lots', 'order', 'orders', 'men', 'mens', 'women', 'womens',
  'item', 'items', 'product', 'products', 'material', 'materials', 'type', 'types', 'grade'
]);

// Well-known Indian manufacturing cities & hubs
const INDIAN_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'ahmedabad', 'chennai', 'kolkata', 'surat',
  'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'vadodara',
  'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'varanasi', 'srinagar',
  'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore',
  'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'chandigarh', 'guwahati',
  'solapur', 'hubballi', 'tiruchirappalli', 'bareilly', 'mysore', 'tirupur', 'morbi', 'panipat', 'vapi',
  'ankleshwar', 'bhiwandi', 'noida', 'gurgaon', 'gurugram'
];

/**
 * Parse human language B2B query into structured semantic intent
 */
async function parseNaturalLanguageQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return {
      rawQuery: '',
      cleanKeywords: [],
      cleanQuery: '',
      detectedCategory: null,
      matchedCategoryIds: [],
      detectedLocation: null,
    };
  }

  const cleanRaw = rawQuery.trim().toLowerCase();
  
  // 1. Check for location mention
  let detectedLocation = null;
  for (const city of INDIAN_CITIES) {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(cleanRaw)) {
      detectedLocation = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // 2. Tokenize, remove standalone numbers and filter stop words
  const rawTokens = cleanRaw
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w)); // Remove standalone digits like '100', '50'

  const cleanKeywords = rawTokens.filter((token) => {
    if (B2B_STOP_WORDS.has(token)) return false;
    if (detectedLocation && token.toLowerCase() === detectedLocation.toLowerCase()) return false;
    return true;
  });

  // If all words were stop words, fallback to non-stop raw tokens
  const finalKeywords = cleanKeywords.length > 0 ? cleanKeywords : rawTokens;

  // 3. Search category taxonomy for semantic match
  let detectedCategory = null;
  let matchedCategoryIds = [];

  if (finalKeywords.length > 0) {
    // Check all keywords against categories
    const allCatMatches = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: finalKeywords.map((kw) => ({
          name: { contains: kw, mode: 'insensitive' },
        })),
      },
      include: {
        parent: { select: { id: true, name: true, parent: { select: { id: true, name: true } } } },
      },
    });

    if (allCatMatches.length > 0) {
      // Score each category by how many keywords it matches and depth
      const scoredCats = allCatMatches.map((cat) => {
        let catScore = 0;
        const nameLower = cat.name.toLowerCase();
        for (const kw of finalKeywords) {
          if (nameLower.includes(kw.toLowerCase())) {
            catScore += 20;
          }
        }
        // Prefer leaf categories over root
        if (cat.parentId) catScore += 10;
        return { cat, catScore };
      }).sort((a, b) => b.catScore - a.catScore);

      const bestCat = scoredCats[0].cat;
      detectedCategory = {
        id: bestCat.id,
        name: bestCat.name,
        slug: bestCat.slug,
        breadcrumb: (bestCat.parent?.parent ? bestCat.parent.parent.name + ' → ' : '') +
                    (bestCat.parent ? bestCat.parent.name + ' → ' : '') +
                    bestCat.name,
      };
      matchedCategoryIds = scoredCats.slice(0, 5).map(c => c.cat.id);
    }
  }

  return {
    rawQuery,
    cleanQuery: finalKeywords.join(' '),
    cleanKeywords: finalKeywords,
    detectedCategory,
    matchedCategoryIds,
    detectedLocation,
  };
}

/**
 * Score and sort listings by relevance to the parsed intent
 */
function scoreAndSortListings(listings, cleanKeywords, matchedCategoryIds) {
  const fullPhrase = cleanKeywords.join(' ').toLowerCase();

  return listings
    .map((listing) => {
      let score = 0;
      const titleLower = listing.title?.toLowerCase() || '';
      const descLower = listing.description?.toLowerCase() || '';
      const catNameLower = listing.category?.name?.toLowerCase() || '';
      const brandLower = listing.productDetail?.brand?.toLowerCase() || '';

      // Exact full phrase in title: +100
      if (fullPhrase && titleLower.includes(fullPhrase)) {
        score += 100;
      }

      // Keyword occurrences in title: +30 each
      for (const kw of cleanKeywords) {
        if (titleLower.includes(kw.toLowerCase())) {
          score += 30;
        }
      }

      // Matched category: +50
      if (matchedCategoryIds.includes(listing.categoryId)) {
        score += 50;
      }

      // Keyword in category name: +25
      for (const kw of cleanKeywords) {
        if (catNameLower.includes(kw.toLowerCase())) {
          score += 25;
        }
      }

      // Keyword in brand: +15
      for (const kw of cleanKeywords) {
        if (brandLower.includes(kw.toLowerCase())) {
          score += 15;
        }
      }

      // Keyword in description: +10
      for (const kw of cleanKeywords) {
        if (descLower.includes(kw.toLowerCase())) {
          score += 10;
        }
      }

      // Quality bonuses
      if (listing.isFeatured) score += 10;
      if (listing.seller?.kycStatus === 'VERIFIED') score += 5;
      if (listing.avgRating) score += Math.round(listing.avgRating * 2);

      return { listing, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.listing);
}

/**
 * Execute Enhanced Hybrid Semantic Search across Listings
 */
async function executeSemanticSearch({
  q,
  categoryId,
  type,
  city,
  isVerified,
  minTrust,
  minRating,
  page = 1,
  limit = 20,
  sortBy = 'relevance',
}) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = Math.min(parseInt(limit), 100);

  const parsedIntent = await parseNaturalLanguageQuery(q);
  const { cleanKeywords, detectedCategory, matchedCategoryIds, detectedLocation } = parsedIntent;

  // Build search conditions
  const searchOrConditions = [];

  if (cleanKeywords.length > 0) {
    const fullPhrase = cleanKeywords.join(' ');
    searchOrConditions.push(
      { title: { contains: fullPhrase, mode: 'insensitive' } },
      { description: { contains: fullPhrase, mode: 'insensitive' } },
      { productDetail: { brand: { contains: fullPhrase, mode: 'insensitive' } } },
      { tags: { has: fullPhrase.toLowerCase() } }
    );

    for (const kw of cleanKeywords) {
      searchOrConditions.push(
        { title: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
        { category: { name: { contains: kw, mode: 'insensitive' } } },
        { category: { parent: { name: { contains: kw, mode: 'insensitive' } } } },
        { productDetail: { brand: { contains: kw, mode: 'insensitive' } } },
        { tags: { has: kw.toLowerCase() } }
      );
    }
  }

  if (matchedCategoryIds.length > 0) {
    searchOrConditions.push({
      categoryId: { in: matchedCategoryIds }
    });
  }

  const effectiveCategoryId = categoryId || (matchedCategoryIds.length === 1 ? matchedCategoryIds[0] : undefined);
  const effectiveCity = city || detectedLocation;

  const where = {
    status: 'ACTIVE',
    ...(type && { listingType: type.toUpperCase() }),
    ...(effectiveCategoryId && {
      category: {
        OR: [
          { id: effectiveCategoryId },
          { parentId: effectiveCategoryId },
          { parent: { parentId: effectiveCategoryId } }
        ]
      }
    }),
    ...(minRating && { avgRating: { gte: parseFloat(minRating) } }),
    ...(searchOrConditions.length > 0 && { OR: searchOrConditions }),
    seller: {
      isActive: true,
      ...(isVerified === 'true' && { kycStatus: 'VERIFIED' }),
      ...(minTrust && { trustScore: { gte: parseInt(minTrust) } }),
    },
    ...(effectiveCity && {
      location: {
        OR: [
          { city: { contains: effectiveCity, mode: 'insensitive' } },
          { state: { contains: effectiveCity, mode: 'insensitive' } },
        ]
      }
    }),
  };

  let [rawListings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      take: Math.min(take * 3, 150),
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            trustScore: true,
            kycStatus: true,
            businessProfile: { select: { businessName: true, businessType: true, gstin: true } },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: { select: { id: true, name: true } },
          },
        },
        location: { select: { city: true, state: true } },
        productDetail: true,
        serviceDetail: true,
        variants: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          take: 4,
        },
        _count: { select: { rfqQuotes: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  // If filtered by city but found 0 results, fallback to Pan-India
  let locationFallback = false;
  if (total === 0 && effectiveCity) {
    const fallbackWhere = { ...where };
    delete fallbackWhere.location;
    const [fallbackListings, fallbackTotal] = await Promise.all([
      prisma.listing.findMany({
        where: fallbackWhere,
        take: Math.min(take * 3, 150),
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              trustScore: true,
              kycStatus: true,
              businessProfile: { select: { businessName: true, businessType: true, gstin: true } },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              parent: { select: { id: true, name: true } },
            },
          },
          location: { select: { city: true, state: true } },
          productDetail: true,
          serviceDetail: true,
          variants: true,
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 4,
          },
          _count: { select: { rfqQuotes: true } },
        },
      }),
      prisma.listing.count({ where: fallbackWhere }),
    ]);

    if (fallbackTotal > 0) {
      rawListings = fallbackListings;
      total = fallbackTotal;
      locationFallback = true;
    }
  }

  // Apply semantic relevance scoring
  const rankedListings = sortBy === 'relevance' && cleanKeywords.length > 0
    ? scoreAndSortListings(rawListings, cleanKeywords, matchedCategoryIds).slice(skip, skip + take)
    : rawListings.slice(skip, skip + take);

  const signedListings = await Promise.all(rankedListings.map(l => signListingMedia(l)));
  parsedIntent.locationFallback = locationFallback;

  return {
    listings: signedListings,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
    parsedIntent,
  };
}

module.exports = {
  parseNaturalLanguageQuery,
  executeSemanticSearch,
};

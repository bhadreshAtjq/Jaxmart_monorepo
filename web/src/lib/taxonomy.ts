export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  listingsCount?: number;
}

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  color: string;
  bg: string;
  border: string;
  children: SubcategoryItem[];
  _count?: {
    listings: number;
    rfqRequests: number;
  };
}

export const DEFAULT_CATEGORIES: CategoryTreeItem[] = [
  {
    id: 'cat-industrial',
    name: 'Industrial Supplies & Machinery',
    slug: 'industrial-supplies',
    description: 'CNC Machines, Industrial Pumps, Fasteners, Hydraulic Systems, Cutting Tools & Workshop Equipment',
    iconName: 'FaIndustry',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-300',
    _count: { listings: 1240, rfqRequests: 320 },
    children: [
      { id: 'sub-cnc', name: 'CNC & Lathe Machines', slug: 'cnc-lathe-machines', listingsCount: 145 },
      { id: 'sub-fasteners', name: 'Industrial Fasteners & Bolts', slug: 'fasteners-bolts', listingsCount: 220 },
      { id: 'sub-pumps', name: 'Hydraulic & Industrial Pumps', slug: 'industrial-pumps', listingsCount: 98 },
      { id: 'sub-valves', name: 'Pipes, Valves & Flanges', slug: 'pipes-valves-flanges', listingsCount: 180 },
      { id: 'sub-welding', name: 'Welding Machines & Rods', slug: 'welding-equipment', listingsCount: 112 },
      { id: 'sub-bearings', name: 'Industrial Bearings & Bushings', slug: 'bearings-bushings', listingsCount: 160 },
      { id: 'sub-compressors', name: 'Air Compressors & Blowers', slug: 'air-compressors', listingsCount: 78 },
      { id: 'sub-safety', name: 'Industrial Safety PPE & Gloves', slug: 'industrial-safety-ppe', listingsCount: 250 },
    ],
  },
  {
    id: 'cat-construction',
    name: 'Building & Construction',
    slug: 'construction',
    description: 'TMT Rebars, Structural Steel, Ready Mix Concrete, Ceramic Tiles, Plywood & Sanitaryware',
    iconName: 'FaBuilding',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-300',
    _count: { listings: 980, rfqRequests: 410 },
    children: [
      { id: 'sub-tmt', name: 'TMT Steel Rebars Fe 500D', slug: 'tmt-steel-rebars', listingsCount: 310 },
      { id: 'sub-cement', name: 'Cement & Ready-Mix Concrete', slug: 'cement-concrete', listingsCount: 190 },
      { id: 'sub-tiles', name: 'Vitrified & Ceramic Tiles', slug: 'ceramic-tiles', listingsCount: 240 },
      { id: 'sub-plywood', name: 'Plywood, MDF & Timber', slug: 'plywood-timber', listingsCount: 165 },
      { id: 'sub-sanitary', name: 'Sanitaryware & Bath Fittings', slug: 'sanitaryware-fittings', listingsCount: 130 },
      { id: 'sub-bricks', name: 'AAC Blocks & Red Bricks', slug: 'aac-blocks-bricks', listingsCount: 95 },
      { id: 'sub-paints', name: 'Industrial & Architectural Paints', slug: 'paints-coatings', listingsCount: 110 },
      { id: 'sub-glass', name: 'Architectural & Toughened Glass', slug: 'architectural-glass', listingsCount: 85 },
    ],
  },
  {
    id: 'cat-textiles',
    name: 'Textiles & Garments',
    slug: 'textiles',
    description: 'Cotton Fabrics, Raw Yarns, Uniforms, Denims, Knitted Garments, Technical Textiles & Home Linen',
    iconName: 'FaBoxesStacked',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'hover:border-rose-300',
    _count: { listings: 1450, rfqRequests: 580 },
    children: [
      { id: 'sub-cotton-yarn', name: 'Cotton Yarns & Raw Cotton', slug: 'cotton-yarns', listingsCount: 280 },
      { id: 'sub-fabrics', name: 'Grey & Dyed Woven Fabrics', slug: 'woven-fabrics', listingsCount: 340 },
      { id: 'sub-apparel-mfg', name: 'Apparel & Ready-Made Garments', slug: 'readymade-garments', listingsCount: 420 },
      { id: 'sub-uniforms', name: 'Corporate & School Uniforms', slug: 'corporate-uniforms', listingsCount: 190 },
      { id: 'sub-denim', name: 'Denim Fabrics & Jeans', slug: 'denim-fabrics', listingsCount: 115 },
      { id: 'sub-home-textiles', name: 'Bed Linen & Home Furnishings', slug: 'home-textiles', listingsCount: 160 },
      { id: 'sub-technical-tex', name: 'Technical & Geotextiles', slug: 'technical-textiles', listingsCount: 75 },
      { id: 'sub-hosiery', name: 'Knitted Hosiery & Innerwear', slug: 'knitted-hosiery', listingsCount: 140 },
    ],
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Electricals',
    slug: 'electronics',
    description: 'Circuit Boards, Transformers, Switchgear, Copper Cables, LED Lighting, Solar PV Panels & Sensors',
    iconName: 'FaBolt',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'hover:border-purple-300',
    _count: { listings: 890, rfqRequests: 270 },
    children: [
      { id: 'sub-solar', name: 'Solar PV Panels & Inverters', slug: 'solar-panels-inverters', listingsCount: 180 },
      { id: 'sub-cables', name: 'Copper Wires & Armoured Cables', slug: 'copper-wires-cables', listingsCount: 220 },
      { id: 'sub-switchgear', name: 'Industrial Switchgear & MCBs', slug: 'industrial-switchgear', listingsCount: 140 },
      { id: 'sub-transformers', name: 'Distribution Transformers', slug: 'transformers', listingsCount: 65 },
      { id: 'sub-led', name: 'Commercial LED Lighting Fixtures', slug: 'commercial-led-lighting', listingsCount: 195 },
      { id: 'sub-pcb', name: 'PCB Assembly & Electronic Components', slug: 'pcb-components', listingsCount: 130 },
      { id: 'sub-batteries', name: 'Lithium & Industrial Batteries', slug: 'industrial-batteries', listingsCount: 90 },
      { id: 'sub-sensors', name: 'Automation Sensors & PLCs', slug: 'automation-sensors', listingsCount: 110 },
    ],
  },
  {
    id: 'cat-chemicals',
    name: 'Chemicals & Polymers',
    slug: 'chemicals',
    description: 'Basic Organic Chemicals, Specialty Polymers, Industrial Solvents, Masterbatches, Dyes & Fertilizers',
    iconName: 'FaFlask',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-300',
    _count: { listings: 760, rfqRequests: 210 },
    children: [
      { id: 'sub-solvents', name: 'Industrial Solvents & Alcohols', slug: 'industrial-solvents', listingsCount: 160 },
      { id: 'sub-polymers', name: 'Polymer Granules (PP, HDPE, PVC)', slug: 'polymer-granules', listingsCount: 210 },
      { id: 'sub-dyes', name: 'Textile Dyes & Pigments', slug: 'textile-dyes-pigments', listingsCount: 130 },
      { id: 'sub-specialty-chem', name: 'Specialty & Water Treatment Chemicals', slug: 'specialty-chemicals', listingsCount: 95 },
      { id: 'sub-fertilizers', name: 'Agrochemicals & Bio-Fertilizers', slug: 'agrochemicals-fertilizers', listingsCount: 140 },
      { id: 'sub-resins', name: 'Epoxy Resins & Adhesives', slug: 'epoxy-resins-adhesives', listingsCount: 115 },
      { id: 'sub-lubricants', name: 'Industrial Lubricants & Greases', slug: 'industrial-lubricants', listingsCount: 125 },
      { id: 'sub-surfactants', name: 'Surfactants & Detergent Raw Materials', slug: 'surfactants-raw-materials', listingsCount: 85 },
    ],
  },
  {
    id: 'cat-packaging',
    name: 'Packaging & Printing',
    slug: 'packaging',
    description: 'Corrugated Cartons, BOPP Tape, Stretch Films, Tin Cans, Glass Bottles, Biodegradable Bags & Labels',
    iconName: 'FaBoxOpen',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'hover:border-orange-300',
    _count: { listings: 1120, rfqRequests: 390 },
    children: [
      { id: 'sub-cartons', name: 'Corrugated 3-Ply & 5-Ply Cartons', slug: 'corrugated-cartons', listingsCount: 320 },
      { id: 'sub-films', name: 'Stretch Films & Shrink Wraps', slug: 'stretch-films', listingsCount: 180 },
      { id: 'sub-tapes', name: 'BOPP Packaging Tapes', slug: 'bopp-packaging-tapes', listingsCount: 140 },
      { id: 'sub-bottles', name: 'HDPE & Glass Bottles', slug: 'hdpe-glass-bottles', listingsCount: 165 },
      { id: 'sub-pouches', name: 'Stand-Up Pouches & Laminated Foil', slug: 'standup-pouches', listingsCount: 210 },
      { id: 'sub-wooden-pallets', name: 'Wooden & Plastic Pallets', slug: 'pallets-crates', listingsCount: 95 },
      { id: 'sub-labels', name: 'Barcode & Custom Product Labels', slug: 'product-labels', listingsCount: 130 },
      { id: 'sub-biodegradable', name: 'Biodegradable Paper Bags', slug: 'paper-bags', listingsCount: 110 },
    ],
  },
  {
    id: 'cat-agriculture',
    name: 'Agriculture & Commodities',
    slug: 'agriculture',
    description: 'Spices, Basmati Rice, Wheat Grains, Pulses, Tea, Coffee, Edible Oils, Seeds & Cold Storage Goods',
    iconName: 'FaWheatAwn',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'hover:border-green-300',
    _count: { listings: 850, rfqRequests: 340 },
    children: [
      { id: 'sub-rice', name: 'Basmati & Non-Basmati Rice', slug: 'basmati-rice', listingsCount: 240 },
      { id: 'sub-spices', name: 'Indian Spices & Condiments', slug: 'spices-condiments', listingsCount: 310 },
      { id: 'sub-pulses', name: 'Pulses, Lentils & Chickpeas', slug: 'pulses-lentils', listingsCount: 175 },
      { id: 'sub-grains', name: 'Wheat, Maize & Grain Flours', slug: 'grains-flours', listingsCount: 190 },
      { id: 'sub-oilseeds', name: 'Mustard, Soybean & Edible Oils', slug: 'edible-oils', listingsCount: 145 },
      { id: 'sub-tea-coffee', name: 'Assam Tea & Green Coffee Beans', slug: 'tea-coffee', listingsCount: 110 },
      { id: 'sub-sugar', name: 'Refined & Organic Raw Sugar', slug: 'sugar-jaggery', listingsCount: 95 },
      { id: 'sub-dry-fruits', name: 'Cashews, Almonds & Dry Fruits', slug: 'dry-fruits', listingsCount: 130 },
    ],
  },
  {
    id: 'cat-services',
    name: 'Technical & Professional Services',
    slug: 'services',
    description: 'Plant Fabrication, Third-Party Logistics (3PL), Calibration, Industrial Auditing & Engineering CAD',
    iconName: 'FaBriefcase',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'hover:border-teal-300',
    _count: { listings: 620, rfqRequests: 180 },
    children: [
      { id: 'sub-fabrication', name: 'Custom Metal Fabrication & Job Work', slug: 'metal-fabrication', listingsCount: 180 },
      { id: 'sub-logistics', name: '3PL Warehousing & Freight Transport', slug: 'freight-logistics', listingsCount: 150 },
      { id: 'sub-quality-audit', name: 'Quality Inspection & ISO Audits', slug: 'quality-audits', listingsCount: 85 },
      { id: 'sub-engineering-cad', name: 'CAD 3D Modeling & Mold Design', slug: 'cad-mold-design', listingsCount: 95 },
      { id: 'sub-equipment-rental', name: 'Heavy Crane & Generator Rentals', slug: 'equipment-rentals', listingsCount: 70 },
      { id: 'sub-epc-contractors', name: 'Solar & Factory EPC Contracting', slug: 'epc-contractors', listingsCount: 65 },
      { id: 'sub-lab-testing', name: 'Chemical & Material Testing Labs', slug: 'material-testing-labs', listingsCount: 90 },
      { id: 'sub-maintenance', name: 'Plant AMC & Preventive Maintenance', slug: 'plant-maintenance', listingsCount: 110 },
    ],
  },
];

export const TRENDING_DEALS_FALLBACK = [
  {
    id: 'deal-1',
    title: 'Premium Combed Cotton 30s Count Knitted Fabric',
    listingType: 'PRODUCT',
    category: { name: 'Textiles & Garments' },
    productDetail: { pricePerUnit: 240, unitOfMeasure: 'kg', minOrderQty: 200, brand: 'Vardhman' },
    seller: { fullName: 'Surat Weaving Mills Ltd', trustScore: 94, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Surat Weaving Mills Ltd' } },
    location: { city: 'Surat', state: 'Gujarat' },
    media: [{ url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'Trending Factory Rate',
  },
  {
    id: 'deal-2',
    title: 'Primary TMT Steel Bars Fe 500D (12mm / 16mm)',
    listingType: 'PRODUCT',
    category: { name: 'Building & Construction' },
    productDetail: { pricePerUnit: 52000, unitOfMeasure: 'Metric Ton', minOrderQty: 10, brand: 'Jindal Steel' },
    seller: { fullName: 'Raipur Steels & Ispat', trustScore: 98, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Raipur Steels & Ispat' } },
    location: { city: 'Raipur', state: 'Chhattisgarh' },
    media: [{ url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'BIS Certified',
  },
  {
    id: 'deal-3',
    title: 'Corrugated Shipping Cartons 5-Ply Heavy Duty',
    listingType: 'PRODUCT',
    category: { name: 'Packaging & Printing' },
    productDetail: { pricePerUnit: 18.5, unitOfMeasure: 'Box', minOrderQty: 1000, brand: 'BoxCraft' },
    seller: { fullName: 'Apex Corrugators Pvt Ltd', trustScore: 91, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Apex Corrugators Pvt Ltd' } },
    location: { city: 'Bhiwandi', state: 'Maharashtra' },
    media: [{ url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'Export Grade',
  },
  {
    id: 'deal-4',
    title: 'High-Purity Industrial Isopropyl Alcohol 99.8% (IPA)',
    listingType: 'PRODUCT',
    category: { name: 'Chemicals & Polymers' },
    productDetail: { pricePerUnit: 105, unitOfMeasure: 'Litre', minOrderQty: 500, brand: 'Deepak Fertilisers' },
    seller: { fullName: 'Gujarat Chemical Hub', trustScore: 96, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Gujarat Chemical Hub' } },
    location: { city: 'Dahej', state: 'Gujarat' },
    media: [{ url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'Pharma / Technical Grade',
  },
  {
    id: 'deal-5',
    title: 'Stainless Steel SS 304 Hex Bolts & Nuts M8-M24',
    listingType: 'PRODUCT',
    category: { name: 'Industrial Supplies & Machinery' },
    productDetail: { pricePerUnit: 4.8, unitOfMeasure: 'Piece', minOrderQty: 5000, brand: 'Unbrako' },
    seller: { fullName: 'Ludhiana Fasteners Ltd', trustScore: 92, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Ludhiana Fasteners Ltd' } },
    location: { city: 'Ludhiana', state: 'Punjab' },
    media: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'ISO 9001:2015',
  },
  {
    id: 'deal-6',
    title: 'Bifacial Solar PV Panels 550W Mono PERC Tier 1',
    listingType: 'PRODUCT',
    category: { name: 'Electronics & Electricals' },
    productDetail: { pricePerUnit: 11500, unitOfMeasure: 'Module', minOrderQty: 50, brand: 'Waaree Solar' },
    seller: { fullName: 'SunPower Renewable Systems', trustScore: 97, kycStatus: 'VERIFIED', businessProfile: { businessName: 'SunPower Renewable Systems' } },
    location: { city: 'Ahmedabad', state: 'Gujarat' },
    media: [{ url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'ALMM Approved',
  },
  {
    id: 'deal-7',
    title: '1121 Raw Basmati Rice Sortex Cleaned Double Polished',
    listingType: 'PRODUCT',
    category: { name: 'Agriculture & Commodities' },
    productDetail: { pricePerUnit: 82, unitOfMeasure: 'kg', minOrderQty: 2500, brand: 'Kohinoor Exim' },
    seller: { fullName: 'Karnal Rice Exporters', trustScore: 95, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Karnal Rice Exporters' } },
    location: { city: 'Karnal', state: 'Haryana' },
    media: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: 'APEDA Certified',
  },
  {
    id: 'deal-8',
    title: 'Custom Precision Sheet Metal Laser Cutting & Bending',
    listingType: 'SERVICE',
    category: { name: 'Technical & Professional Services' },
    productDetail: { pricePerUnit: 450, unitOfMeasure: 'Hour / Job', minOrderQty: 1, brand: 'FabriTech' },
    seller: { fullName: 'Pune Precision Engineers', trustScore: 93, kycStatus: 'VERIFIED', businessProfile: { businessName: 'Pune Precision Engineers' } },
    location: { city: 'Pune', state: 'Maharashtra' },
    media: [{ url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    badge: '0.05mm Tolerance',
  },
];

export interface MatchedCategoryResult {
  id: string;
  name: string;
  slug: string;
  parentName?: string;
  parentSlug?: string;
  rootName?: string;
  rootSlug?: string;
  suggestedUnit?: string;
  score: number;
}

export function searchTaxonomy(query: string): MatchedCategoryResult[] {
  if (!query || query.trim().length === 0) {
    const results: MatchedCategoryResult[] = [];
    DEFAULT_CATEGORIES.forEach((root) => {
      root.children.forEach((sub) => {
        results.push({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          parentName: root.name,
          parentSlug: root.slug,
          rootName: root.name,
          rootSlug: root.slug,
          score: 1,
        });
      });
    });
    return results;
  }

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  const results: MatchedCategoryResult[] = [];

  DEFAULT_CATEGORIES.forEach((root) => {
    const rootMatches = words.some(
      (w) =>
        root.name.toLowerCase().includes(w) ||
        root.description.toLowerCase().includes(w) ||
        root.slug.includes(w)
    );

    root.children.forEach((sub) => {
      const subNameLower = sub.name.toLowerCase();
      const subSlugLower = sub.slug.toLowerCase();
      let score = 0;

      if (subNameLower.includes(q)) score += 50;
      if (subSlugLower.includes(q)) score += 30;

      words.forEach((w) => {
        if (subNameLower.includes(w)) score += 15;
        if (subSlugLower.includes(w)) score += 10;
        if (root.name.toLowerCase().includes(w)) score += 5;
        if (root.description.toLowerCase().includes(w)) score += 3;
      });

      // Special acronyms and synonyms
      if (q.includes('tmt') && (subSlugLower.includes('tmt') || subNameLower.includes('tmt'))) score += 100;
      if (q.includes('rebar') && (subSlugLower.includes('tmt') || subNameLower.includes('tmt'))) score += 80;
      if (q.includes('saria') && (subSlugLower.includes('tmt') || subNameLower.includes('tmt'))) score += 100;
      if (q.includes('steel') && (subSlugLower.includes('tmt') || root.slug === 'construction')) score += 35;
      if (q.includes('cotton') && (subSlugLower.includes('cotton') || root.slug === 'textiles')) score += 60;
      if (q.includes('shirt') && (subSlugLower.includes('garments') || subSlugLower.includes('apparel') || root.slug === 'textiles')) score += 80;
      if (q.includes('fabric') && (subSlugLower.includes('fabric') || root.slug === 'textiles')) score += 80;
      if (q.includes('yarn') && (subSlugLower.includes('yarn') || root.slug === 'textiles')) score += 80;
      if (q.includes('cnc') && subSlugLower.includes('cnc')) score += 80;
      if (q.includes('lathe') && subSlugLower.includes('cnc')) score += 80;
      if (q.includes('pump') && subSlugLower.includes('pump')) score += 80;
      if (q.includes('valve') && subSlugLower.includes('valve')) score += 80;
      if (q.includes('box') && subSlugLower.includes('carton')) score += 80;
      if (q.includes('carton') && subSlugLower.includes('carton')) score += 80;
      if (q.includes('packaging') && root.slug === 'packaging') score += 40;
      if (q.includes('solar') && subSlugLower.includes('solar')) score += 80;
      if (q.includes('panel') && (subSlugLower.includes('solar') || root.slug === 'electronics')) score += 40;
      if (q.includes('rice') && subSlugLower.includes('rice')) score += 80;
      if (q.includes('spice') && subSlugLower.includes('spice')) score += 80;
      if (q.includes('cement') && subSlugLower.includes('cement')) score += 80;
      if (q.includes('chemical') && root.slug === 'chemicals') score += 40;
      if (q.includes('solvent') && subSlugLower.includes('solvent')) score += 80;
      if (q.includes('pipe') && (subSlugLower.includes('valves') || subSlugLower.includes('pipes'))) score += 70;
      if (q.includes('fastener') && subSlugLower.includes('fastener')) score += 80;
      if (q.includes('bolt') && subSlugLower.includes('fastener')) score += 80;

      if (score > 0) {
        results.push({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          parentName: root.name,
          parentSlug: root.slug,
          rootName: root.name,
          rootSlug: root.slug,
          score,
        });
      }
    });

    if (rootMatches) {
      let rootScore = 10;
      if (root.name.toLowerCase().includes(q)) rootScore += 40;
      results.push({
        id: root.id,
        name: root.name,
        slug: root.slug,
        parentName: '',
        parentSlug: '',
        rootName: root.name,
        rootSlug: root.slug,
        score: rootScore,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

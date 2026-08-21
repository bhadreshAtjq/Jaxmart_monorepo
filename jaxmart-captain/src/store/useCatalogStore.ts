// src/store/useCatalogStore.ts
import { create } from 'zustand';
import { asyncStorage, ASYNC_KEYS } from '../utils/storage';

export interface CatalogItem {
  id: string;
  sku: string;
  companyId: string;
  companyName: string;
  title: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  hsnCode: string;
  mrp: number;
  b2bPrice: number;
  minOrderQty: number;
  unitOfMeasure: string;
  stockQuantity: number;
  bulkPriceSlabs?: Array<{ minQty: number; maxQty?: number; price: number }>;
  status: 'PENDING' | 'ACTIVE' | 'DRAFT';
  images?: string[];
  createdAt: string;
}

const INITIAL_DEMO_CATALOG: CatalogItem[] = [
  {
    id: 'sku_1',
    sku: 'JAX-SKU-94021',
    companyId: 'comp_1',
    companyName: 'Apex Industrial Fasteners Pvt Ltd',
    title: 'High Tensile Hex Bolt Grade 8.8 (M12 x 50mm)',
    brand: 'Apex Fasteners',
    categoryId: '7314cf57-3d90-4b10-afd6-cfa1fba585cc',
    categoryName: 'Industrial Supplies',
    hsnCode: '73181500',
    mrp: 25.00,
    b2bPrice: 18.50,
    minOrderQty: 100,
    unitOfMeasure: 'Pieces (pcs)',
    stockQuantity: 5000,
    bulkPriceSlabs: [
      { minQty: 100, maxQty: 499, price: 18.50 },
      { minQty: 500, maxQty: 1999, price: 16.00 },
      { minQty: 2000, price: 14.50 },
    ],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sku_1_b',
    sku: 'JAX-SKU-94022',
    companyId: 'comp_1',
    companyName: 'Apex Industrial Fasteners Pvt Ltd',
    title: 'Stainless Steel SS 304 Self Tapping Screws (4.2 x 25mm)',
    brand: 'Apex Fasteners',
    categoryId: '7314cf57-3d90-4b10-afd6-cfa1fba585cc',
    categoryName: 'Industrial Supplies',
    hsnCode: '73181400',
    mrp: 8.50,
    b2bPrice: 5.20,
    minOrderQty: 500,
    unitOfMeasure: 'Pieces (pcs)',
    stockQuantity: 12000,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sku_1_c',
    sku: 'JAX-SKU-94023',
    companyId: 'comp_1',
    companyName: 'Apex Industrial Fasteners Pvt Ltd',
    title: 'Heavy Duty Galvanized Threaded Rod (M16 x 1 Meter)',
    brand: 'Apex Fasteners',
    categoryId: '7314cf57-3d90-4b10-afd6-cfa1fba585cc',
    categoryName: 'Industrial Supplies',
    hsnCode: '73181900',
    mrp: 240.00,
    b2bPrice: 175.00,
    minOrderQty: 50,
    unitOfMeasure: 'Pieces (pcs)',
    stockQuantity: 800,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sku_2',
    sku: 'JAX-SKU-88120',
    companyId: 'comp_2',
    companyName: 'Shree Radhe Textiles & Garments LLP',
    title: '100% Combed Cotton Yarn (40s Count Bulk Roll)',
    brand: 'Radhe Fabrics',
    categoryId: '0610bbdb-d157-4ba7-99ac-feacca755d16',
    categoryName: 'Textiles',
    hsnCode: '52051200',
    mrp: 320.00,
    b2bPrice: 265.00,
    minOrderQty: 25,
    unitOfMeasure: 'Kilograms (kg)',
    stockQuantity: 1200,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sku_2_b',
    sku: 'JAX-SKU-88121',
    companyId: 'comp_2',
    companyName: 'Shree Radhe Textiles & Garments LLP',
    title: 'Heavy Duty Organic Indigo Denim Fabric (14 oz Roll)',
    brand: 'Radhe Fabrics',
    categoryId: '0610bbdb-d157-4ba7-99ac-feacca755d16',
    categoryName: 'Textiles',
    hsnCode: '52094200',
    mrp: 450.00,
    b2bPrice: 340.00,
    minOrderQty: 50,
    unitOfMeasure: 'Meters (m)',
    stockQuantity: 3500,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sku_3',
    sku: 'JAX-SKU-77291',
    companyId: 'comp_3',
    companyName: 'Bharat Solar Energy Solutions',
    title: 'Monocrystalline Solar Panel 540W Mono-PERC',
    brand: 'Bharat Green',
    categoryId: '46726386-4741-467c-a47b-b25d132ddef8',
    categoryName: 'Electronics',
    hsnCode: '85414011',
    mrp: 18500.00,
    b2bPrice: 14200.00,
    minOrderQty: 5,
    unitOfMeasure: 'Pieces (pcs)',
    stockQuantity: 150,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
];

const CATALOG_STORAGE_KEY = '@jaxmart_catalog_items';

interface CatalogState {
  catalog: CatalogItem[];
  isLoading: boolean;

  // Actions
  initializeCatalog: () => Promise<void>;
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'createdAt'>) => Promise<CatalogItem>;
  getCatalogByCompany: (companyId: string) => CatalogItem[];
  getCatalogByCategory: (categoryNameOrId: string) => CatalogItem[];
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  catalog: INITIAL_DEMO_CATALOG,
  isLoading: false,

  initializeCatalog: async () => {
    try {
      set({ isLoading: true });
      const stored = await asyncStorage.getJSON<CatalogItem[]>(CATALOG_STORAGE_KEY, []);
      const combined = [...stored, ...INITIAL_DEMO_CATALOG];

      const uniqueMap = new Map<string, CatalogItem>();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      const list = Array.from(uniqueMap.values());
      set({ catalog: list, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  addCatalogItem: async (itemData) => {
    const newItem: CatalogItem = {
      ...itemData,
      id: 'sku_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...get().catalog];
    set({ catalog: updated });
    await asyncStorage.setJSON(CATALOG_STORAGE_KEY, updated);
    return newItem;
  },

  getCatalogByCompany: (companyId: string) => {
    return get().catalog.filter((item) => item.companyId === companyId);
  },

  getCatalogByCategory: (categoryNameOrId: string) => {
    const query = categoryNameOrId.toLowerCase();
    return get().catalog.filter(
      (item) =>
        item.categoryId.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
    );
  },
}));

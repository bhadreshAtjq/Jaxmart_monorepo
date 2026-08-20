// src/schemas/skuCatalogingSchema.ts
import { z } from 'zod';

// Bulk Price Slab Schema
export const bulkPriceSlabSchema = z.object({
  id: z.string(),
  minQty: z.number().min(1, 'Min Qty must be >= 1'),
  maxQty: z.number().optional(),
  price: z.number().min(0, 'Price must be >= 0'),
});

// Variant Attribute Item Schema
export const variantItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Variant title is required'),
  sku: z.string().min(1, 'Variant SKU is required'),
  priceOverride: z.number().min(0, 'Price must be >= 0'),
  stockQty: z.number().min(0, 'Stock must be >= 0'),
  attributes: z.record(z.string(), z.string()), // e.g. { Size: 'XL', Color: 'Red' }
});

// Custom Spec Key-Value Schema
export const customSpecSchema = z.object({
  id: z.string(),
  key: z.string().min(1, 'Attribute key is required'),
  value: z.string().min(1, 'Attribute value is required'),
});

// Step 1: Basic Product Information (Scoped to Company)
export const skuStep1Schema = z.object({
  companyId: z.string().min(1, 'Target company / seller is required'),
  companyName: z.string().min(1, 'Target company name is required'),
  title: z.string().min(3, 'Product title must be at least 3 characters').max(150, 'Max 150 characters'),
  brand: z.string().min(1, 'Brand name is required'),
  categoryId: z.string().min(1, 'Primary category is required'),
  categoryName: z.string().min(1, 'Category name is required'),
  subCategoryId: z.string().optional(),
  subCategoryName: z.string().optional(),
  hsnCode: z.string().min(2, 'HSN / SAC code is required'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300, 'Max 300 characters'),
  detailedDescription: z.string().min(20, 'Detailed description must be at least 20 characters'),
});

// Step 2: Barcode & Identification Scanner
export const skuStep2Schema = z.object({
  barcode: z.string().min(3, 'Barcode / EAN is required'),
  barcodeFormat: z.string().optional(),
  manufacturerSku: z.string().optional(),
  jaxmartAutoSku: z.string().min(1, 'Auto-generated SKU identifier is required'),
});

// Step 3: Pricing, Taxes & B2B Slabs
export const skuStep3Schema = z.object({
  mrp: z.number().min(0.01, 'MRP must be > 0'),
  b2bPrice: z.number().min(0.01, 'B2B price must be > 0'),
  gstRate: z.number().min(0, 'Select GST percentage'),
  minOrderQty: z.number().min(1, 'MOQ must be >= 1'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  bulkPriceSlabs: z.array(bulkPriceSlabSchema),
}).refine((data) => data.b2bPrice <= data.mrp, {
  message: 'B2B price cannot exceed MRP',
  path: ['b2bPrice'],
});

// Step 4: Variants & Custom Attributes
export const skuStep4Schema = z.object({
  hasVariants: z.boolean(),
  variantOptions: z.array(z.object({ name: z.string(), values: z.array(z.string()) })).optional(),
  variantMatrix: z.array(variantItemSchema).optional(),
  variantTypes: z.array(z.string()).optional(),
  variants: z.array(variantItemSchema).optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
  customSpecs: z.array(customSpecSchema).optional(),
});

// Step 5: Inventory & Warehouse Specs
export const skuStep5Schema = z.object({
  stockQuantity: z.number().min(0, 'Stock quantity must be >= 0').optional(),
  totalStock: z.number().min(0, 'Stock quantity must be >= 0').optional(),
  warehouseShelfLocation: z.string().optional(),
  shelfBinLocation: z.string().optional(),
  hasExpiryDate: z.boolean().optional(),
  hasExpiry: z.boolean().optional(),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  returnPolicy: z.string().optional(),
  isReturnable: z.boolean().optional(),
  returnWindowDays: z.number().min(0).optional(),
});

// Step 6: Packaging & Shipping Dimensions
export const skuStep6Schema = z.object({
  netWeightKg: z.number().min(0.01, 'Net weight must be > 0'),
  grossWeightKg: z.number().min(0.01, 'Gross packaging weight must be > 0'),
  packagingLengthCm: z.number().min(0.1, 'Length must be > 0').optional(),
  packagingWidthCm: z.number().min(0.1, 'Width must be > 0').optional(),
  packagingHeightCm: z.number().min(0.1, 'Height must be > 0').optional(),
  lengthCm: z.number().min(0.1, 'Length must be > 0').optional(),
  widthCm: z.number().min(0.1, 'Width must be > 0').optional(),
  heightCm: z.number().min(0.1, 'Height must be > 0').optional(),
  volumetricWeightKg: z.number().optional(),
  isFragile: z.boolean().optional(),
  isHazardous: z.boolean().optional(),
  isLiquid: z.boolean().optional(),
  isPerishable: z.boolean().optional(),
});

// Step 7: Media Capture
export const skuStep7Schema = z.object({
  photos: z.record(z.string(), z.string()).optional(),
  frontImage: z.string().optional(),
  backImage: z.string().optional(),
  labelImage: z.string().optional(),
  unboxedImage: z.string().optional(),
  packagingBoxImage: z.string().optional(),
  additionalImages: z.array(z.string()).optional(),
});

// Step 8: Compliance, Licensing & Review
export const skuStep8Schema = z.object({
  countryOfOrigin: z.string().min(2, 'Country of origin is required'),
  certifications: z.string().optional(),
  warrantyDetails: z.string().optional(),
  returnPolicyDetails: z.string().optional(),
  leadTimeDays: z.number().optional(),
});

// Full Combined Schema
export const skuCatalogingSchema = z.object({
  step1: skuStep1Schema,
  step2: skuStep2Schema,
  step3: skuStep3Schema,
  step4: skuStep4Schema,
  step5: skuStep5Schema,
  step6: skuStep6Schema,
  step7: skuStep7Schema,
  step8: skuStep8Schema,
});

export type BulkPriceSlab = z.infer<typeof bulkPriceSlabSchema>;
export type VariantItem = z.infer<typeof variantItemSchema>;
export type CustomSpec = z.infer<typeof customSpecSchema>;

export type SkuStep1FormValues = z.infer<typeof skuStep1Schema>;
export type SkuStep2FormValues = z.infer<typeof skuStep2Schema>;
export type SkuStep3FormValues = z.infer<typeof skuStep3Schema>;
export type SkuStep4FormValues = z.infer<typeof skuStep4Schema>;
export type SkuStep5FormValues = z.infer<typeof skuStep5Schema>;
export type SkuStep6FormValues = z.infer<typeof skuStep6Schema>;
export type SkuStep7FormValues = z.infer<typeof skuStep7Schema>;
export type SkuStep8FormValues = z.infer<typeof skuStep8Schema>;
export type SkuCatalogingFormValues = z.infer<typeof skuCatalogingSchema>;

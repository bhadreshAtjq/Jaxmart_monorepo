// src/schemas/sellerOnboardingSchema.ts
import { z } from 'zod';
import { GSTIN_REGEX, PAN_REGEX, IFSC_REGEX, PHONE_REGEX, PINCODE_REGEX } from '../utils/validators';

// Step 1: Basic Business Profile
export const step1Schema = z.object({
  legalBusinessName: z.string().min(3, 'Legal business name must be at least 3 characters'),
  tradeName: z.string().min(2, 'Trade / Shop display name is required'),
  entityType: z.enum([
    'Sole Proprietorship',
    'Partnership',
    'Private Limited',
    'Public Limited',
    'LLP',
    'OPC',
    'Unregistered',
  ]),
  primaryOwnerName: z.string().min(2, 'Owner / Contact person name is required'),
  primaryMobile: z.string().regex(PHONE_REGEX, 'Enter valid 10-digit Indian mobile number'),
  secondaryPhone: z.string().optional(),
  email: z.string().email('Enter valid business email address'),
  preferredLanguage: z.enum(['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Other']),
});

// Step 2: Store Geolocation & Physical Address
export const step2Schema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  locationAccuracy: z.number().optional(),
  buildingNoFloor: z.string().min(1, 'Shop / Building number & floor is required'),
  streetArea: z.string().min(2, 'Street name and area is required'),
  landmark: z.string().min(2, 'Landmark is required'),
  city: z.string().min(2, 'City / Town is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(PINCODE_REGEX, 'Enter valid 6-digit pincode'),
  storefrontPhoto: z.string().min(1, 'Storefront photo is required'),
  storeInteriorPhoto: z.string().min(1, 'Store interior photo is required'),
});

// Step 3: Business Identity, GSTIN & PAN Verification
export const step3Schema = z.object({
  isGstRegistered: z.boolean(),
  gstin: z.string().optional(),
  gstCertPhoto: z.string().optional(),
  panNumber: z.string().regex(PAN_REGEX, 'Enter valid 10-digit PAN number (e.g. ABCDE1234F)'),
  panName: z.string().min(2, 'Name on PAN card is required'),
  panCardPhoto: z.string().min(1, 'PAN card photo is required'),
  udyamNumber: z.string().optional(),
  fssaiNumber: z.string().optional(),
  fssaiCertPhoto: z.string().optional(),
  isGstinVerified: z.boolean().optional(),
  isPanVerified: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.isGstRegistered) {
      return Boolean(data.gstin && GSTIN_REGEX.test(data.gstin.trim().toUpperCase()));
    }
    return true;
  },
  { message: 'Valid 15-character GSTIN is required when GST registered', path: ['gstin'] }
);

// Step 4: Financial & Settlement Bank Details
export const step4Schema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountType: z.enum(['Current Account', 'Savings Account']),
  accountNumber: z.string().min(8, 'Enter valid account number (min 8 digits)'),
  confirmAccountNumber: z.string().min(8, 'Confirm account number is required'),
  ifscCode: z.string().regex(IFSC_REGEX, 'Enter valid 11-digit IFSC code (e.g. HDFC0001234)'),
  bankBranch: z.string().optional(),
  chequePhoto: z.string().min(1, 'Cancelled cheque or passbook photo is required'),
  isPennyDropVerified: z.boolean().optional(),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: 'Account numbers do not match',
  path: ['confirmAccountNumber'],
});

// Step 5: Operations & Business Category Selection
export const step5Schema = z.object({
  primaryCategoryId: z.string().min(1, 'Primary category is required'),
  primaryCategoryName: z.string().min(1, 'Primary category name is required'),
  subCategories: z.array(z.string()).min(1, 'Select at least one sub-category'),
  monthlyTurnover: z.enum(['< ₹1L', '₹1L - 5L', '₹5L - 20L', '> ₹20L']),
  operatingDays: z.array(z.string()).min(1, 'Select at least one operating day'),
  openingTime: z.string().min(1, 'Opening time is required'),
  closingTime: z.string().min(1, 'Closing time is required'),
  deliveryCapabilities: z.array(z.enum(['Self Delivery', 'Pickup Only', 'Jaxmart Logistics Preferred'])).min(1, 'Select delivery capability'),
});

// Step 6: Legal Agreement & Digital Sign-Off
export const step6Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'Seller must agree to Jaxmart Terms & Conditions',
  }),
  sellerSignatureUri: z.string().min(1, 'Seller digital signature is required'),
  captainDeclaration: z.boolean().refine((val) => val === true, {
    message: 'Captain must verify physical visit declaration',
  }),
});

// Complete Form Schema
export const sellerOnboardingSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
});

export type Step1FormValues = z.infer<typeof step1Schema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
export type Step3FormValues = z.infer<typeof step3Schema>;
export type Step4FormValues = z.infer<typeof step4Schema>;
export type Step5FormValues = z.infer<typeof step5Schema>;
export type Step6FormValues = z.infer<typeof step6Schema>;
export type SellerOnboardingFormValues = z.infer<typeof sellerOnboardingSchema>;
